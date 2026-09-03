# Device Bridge

An Electron app that loads your web app, at its real HTTPS address, and lets the page do three things a browser tab will not let it do: send raw bytes to a network printer, make an HTTP request the browser would block, and read a USB HID device.

Your web app does not change. It gets one new object, `window.deviceBridge`, and checks whether it is there.

This is the app I built overnight for a customer's shipping station, with the customer-specific parts taken out and the checks the browser used to do put back in.

## Use it for your app

1. **Point it at your app.** In `shell.config.json`, set `appUrl` (and `devUrl` for local development) and add that origin to `allowedOrigins`. Only those origins can be loaded in the window or call the bridge.
2. **Say what the bridge is allowed to reach.** `proxyAllowlist` is the list of sites the `proxy` call may request. `printers.hosts` (or `printers.allowPrivateRanges: true`) is where `print` may send bytes.
3. **Call it from your page.**

```ts
if (window.deviceBridge) {
  const r = await window.deviceBridge.print({ host: '192.168.1.50', data: zpl })    // raw TCP to port 9100
  // or: { host, transport: 'http', path: '/pstprnt', data: zpl }                    // HTTP POST, Zebra Link-OS printers
  // or: data: 'https://labels.example.com/abc.zpl'                                  // fetch the file first, then print it
}
```

The types for everything the page can call are in `src/types.ts`. Copy them into your app.

## Run it

```sh
pnpm install
pnpm start        # build, then launch
pnpm make         # installers: .dmg and .zip on a Mac, a Squirrel .exe on Windows
```

Whoever installs it can change `appUrl` without rebuilding by putting a `shell.config.json` in the app's userData folder. The path is printed when the app starts.

## Files

| File | What it does |
|---|---|
| `src/main.ts` | Creates the window, loads the URL, blocks navigation anywhere else, sets the permission handlers, registers the IPC handlers |
| `src/preload.ts` | Creates `window.deviceBridge`. This is everything the page can see. |
| `src/ipc/guard.ts` | `assertSender`: every handler checks which page is calling before it does anything |
| `src/ipc/print.ts` | Writes to port 9100 over a raw socket, or POSTs over HTTP. The comment about Zebra printers being timing-sensitive is from the version that shipped. |
| `src/ipc/proxy.ts` | Makes an HTTP request from Node, to sites on the allowlist. This is how you get around CORS. |
| `src/ipc/usb.ts` | node-hid: list devices, open one, read from it. The example parser is a USB postal scale. Closes the device on quit, with a 3 second limit, because a device left open used to hang shutdown. |
| `src/config.ts` | Reads `shell.config.json`, then the optional override in userData |

## What the app checks, since the browser no longer does

When the browser loads a page, it refuses to trust it. When this app loads a page, the app has to do the checking instead. Here is what it does:

- `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`, `webSecurity: true`. The page is still a remote website and is treated like one.
- `setWindowOpenHandler` denies every popup. `will-navigate` blocks any address that is not in `allowedOrigins`.
- Every IPC handler calls `assertSender(event)` before it touches the network or a device, so a page from anywhere else cannot use the bridge.
- The `proxy` targets and `print` hosts come from the config file, not from the page.
- Local Network Access. Electron turns Chromium's check off by default ([feature_list.cc](https://github.com/electron/electron/blob/main/shell/browser/feature_list.cc), [electron#48655](https://github.com/electron/electron/issues/48655)). `main.ts` passes `--disable-features=LocalNetworkAccessChecks` anyway so the intent is written down, and registers permission handlers that grant `local-network` and `loopback-network` only to your allowed origins. When Electron does turn the check on, the decision is already in your code, and nobody gets a prompt.

One thing still applies inside the app: mixed content. An HTTPS page cannot fetch `http://<printer>` directly, even here. That is what the `print` call is for.

## Adding another call

1. Add the request and response types to `src/types.ts` and a method to `BridgeApi`.
2. Create `src/ipc/<name>.ts` with an `ipcMain.handle('<name>', …)` that calls `assertSender` first. Register it in `main.ts`.
3. Add one line to `src/preload.ts`.

MIT.
