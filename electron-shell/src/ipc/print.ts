import { ipcMain } from 'electron';
import { once } from 'node:events';
import net from 'node:net';
import { PrintJob, Result, ShellConfig } from '../types';
import { assertSender, errorMessage, isAllowedPrinterHost } from './guard';

// We were just using fetch, but it turns out the zebra printers are very
// timing sensitive with regards to when they receive a print job and when
// they receive the data for the print job. Using the http module directly
// instead of fetch (which combines the write of the data and the request)
// seems to fix the issue.
//
// That comment shipped in the original app. What stuck was this: open a
// socket to port 9100, write the job, close the socket. Every Zebra with a
// network port listens on 9100.
async function sendRawOverSocket(host: string, port: number, data: string | Buffer) {
  const socket = net.createConnection({ host, port, timeout: 5000 });
  socket.on('timeout', () => socket.destroy(new Error(`timed out talking to ${host}:${port}`)));
  await once(socket, 'connect');
  socket.end(data);
  await once(socket, 'close');
  return socket.bytesWritten;
}

export function registerPrint(config: ShellConfig) {
  ipcMain.handle('print', async (event, job: PrintJob): Promise<Result<{ bytes: number }>> => {
    const port = job.port ?? 9100;
    console.log(`/print ${job.host}:${port}`);
    try {
      assertSender(event, config);
      if (!isAllowedPrinterHost(job.host, config)) throw new Error(`printer not allowed: ${job.host}`);

      // The caller can send us the ZPL, or a URL to fetch it from
      let content: string | Buffer = job.data;
      if (content.startsWith('http')) {
        const response = await fetch(content, { signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error(`fetching ${content} answered ${response.status}`);
        content = Buffer.from(await response.arrayBuffer());
      }

      const bytes = await sendRawOverSocket(job.host, port, content);
      return { ok: true, bytes };
    } catch (error) {
      console.error('/print', errorMessage(error));
      return { ok: false, error: errorMessage(error) };
    }
  });
}
