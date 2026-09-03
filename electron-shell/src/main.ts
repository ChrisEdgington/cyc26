import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'node:path';
import { loadConfig } from './config';
import { isAllowedOrigin } from './ipc/guard';
import { registerPrint } from './ipc/print';
import { registerProxy } from './ipc/proxy';
import { registerUsb } from './ipc/usb';

// Local Network Access. Electron already disables Chromium's LNA check
// (shell/browser/feature_list.cc, "until we rework some of our logic"), so
// this switch is redundant today. It is here so the intent is explicit and
// so the shell keeps working on the day Electron stops doing it by default.
app.commandLine.appendSwitch('disable-features', 'LocalNetworkAccessChecks');

// Permissions the shell grants without asking, for allowed origins only.
// These are the ones Chromium would otherwise put a prompt in front of.
const GRANTED = ['local-network', 'local-network-access', 'loopback-network'];

const config = loadConfig();

function isGranted(permission: string, origin: string | undefined) {
  return GRANTED.includes(permission) && isAllowedOrigin(origin, config.allowedOrigins);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 1200,
    fullscreen: config.fullscreen ?? false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // The renderer is a real remote website. Treat it like one.
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  // Only the configured app may live in this window. Everything else is denied.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    if (isAllowedOrigin(url, config.allowedOrigins)) return;
    console.warn(`blocked navigation to ${url}`);
    event.preventDefault();
  });

  console.log(`loading ${config.appUrl}`);
  win.loadURL(config.appUrl, { extraHeaders: 'pragma: no-cache\n' });
}

app.on('ready', () => {
  const ses = session.defaultSession;
  ses.setPermissionRequestHandler((_contents, permission, callback, details) => {
    callback(isGranted(permission, details.requestingUrl));
  });
  ses.setPermissionCheckHandler((_contents, permission, requestingOrigin) => {
    return isGranted(permission, requestingOrigin);
  });

  ipcMain.handle('appUrl', () => config.appUrl);
  registerPrint(config);
  registerProxy(config);
  registerUsb(config);
  createWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
