import { ipcMain } from 'electron';
import { ProxyRequest, ProxyResponse, Result, ShellConfig } from '../types';
import { assertSender, errorMessage, isAllowedProxyTarget } from './guard';

// HTTP from Node. This is how you get around CORS: the page asks the shell to
// make a request the browser would block. The shell is making the request
// with its own network access, so the list of allowed sites lives in
// shell.config.json, not in whatever the page asks for.
export function registerProxy(config: ShellConfig) {
  ipcMain.handle('proxy', async (event, req: ProxyRequest): Promise<Result<ProxyResponse>> => {
    console.log(`/proxy ${req.method ?? 'GET'} ${req.url}`);
    try {
      assertSender(event, config);
      if (!isAllowedProxyTarget(req.url, config)) throw new Error(`target not allowed: ${req.url}`);

      const headers: Record<string, string> = { ...req.headers };
      let body: BodyInit | undefined;
      if (req.body !== undefined) {
        if (req.raw) {
          headers['Content-Type'] ??= 'application/octet-stream';
          body = typeof req.body === 'string' ? req.body : new Uint8Array(req.body as ArrayBuffer);
        } else {
          headers['Content-Type'] ??= 'application/json';
          body = JSON.stringify(req.body);
        }
      }

      const response = await fetch(req.url, {
        method: req.method ?? (body ? 'POST' : 'GET'),
        headers,
        body,
        signal: AbortSignal.timeout(15000),
      });

      const responseHeaders = Object.fromEntries(response.headers);
      const isJson = (response.headers.get('content-type') ?? '').includes('json');
      const responseBody = isJson ? await response.json() : await response.text();
      return { ok: true, status: response.status, headers: responseHeaders, body: responseBody };
    } catch (error) {
      console.error('/proxy', errorMessage(error));
      return { ok: false, error: errorMessage(error) };
    }
  });
}
