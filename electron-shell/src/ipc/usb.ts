import { app, ipcMain } from 'electron';
import * as HID from 'node-hid';
import { HidDeviceInfo, Result, ShellConfig } from '../types';
import { assertSender, errorMessage } from './guard';

// USB HID from the main process. This is the device the browser will only
// hand you inside a click, through a chooser, in Chromium. Here IT installed
// the shell, so the shell may open the device on its own.
//
// The example parser is a USB postal scale: 6-byte reports, the weight as a
// little-endian uint16 at byte 4. Swap parseReport for your device.

let device: HID.HIDAsync | null = null;
let latest = { weight: 0, updatedAt: 0 };

function parseReport(data: Buffer) {
  if (data.length >= 6) latest = { weight: data.readUInt16LE(4), updatedAt: Date.now() };
}

async function closeDevice() {
  if (!device) return;
  const open = device;
  device = null;
  try {
    await open.close();
  } catch (error) {
    console.log('/usb close failed:', errorMessage(error));
  }
}

export function registerUsb(config: ShellConfig) {
  ipcMain.handle('usb:list', async (event): Promise<Result<{ devices: HidDeviceInfo[] }>> => {
    try {
      assertSender(event, config);
      const devices = await HID.devicesAsync();
      return {
        ok: true,
        devices: devices.map(({ vendorId, productId, path, manufacturer, product, serialNumber }) => ({
          vendorId,
          productId,
          path,
          manufacturer,
          product,
          serialNumber,
        })),
      };
    } catch (error) {
      return { ok: false, error: errorMessage(error) };
    }
  });

  ipcMain.handle('usb:subscribe', async (event, vendorId: number, productId: number): Promise<Result> => {
    try {
      assertSender(event, config);
      await closeDevice();
      device = await HID.HIDAsync.open(vendorId, productId);
      device.on('data', parseReport);
      device.on('error', (error: unknown) => console.error('/usb', errorMessage(error)));
      console.log(`/usb opened ${vendorId.toString(16)}:${productId.toString(16)}`);
      return { ok: true };
    } catch (error) {
      console.error('/usb', errorMessage(error));
      return { ok: false, error: errorMessage(error) };
    }
  });

  ipcMain.handle('usb:read', async (event): Promise<Result<{ weight: number; updatedAt: number }>> => {
    try {
      assertSender(event, config);
      return { ok: true, ...latest };
    } catch (error) {
      return { ok: false, error: errorMessage(error) };
    }
  });

  // The original app hit this in production: a HID device left open can
  // hang shutdown. Close it, but never wait more than 3 seconds.
  app.on('will-quit', async (event) => {
    if (!device) return;
    event.preventDefault();
    const forceExit = setTimeout(() => process.exit(0), 3000);
    await closeDevice();
    clearTimeout(forceExit);
    app.quit();
  });
}
