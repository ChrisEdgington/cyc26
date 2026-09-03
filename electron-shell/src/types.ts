// The IPC contract between the web app (renderer) and Node (main).
// The web app sees this as `window.deviceBridge`. Keep it small; add a channel by
// adding a type here, a handler in src/ipc/, and one line in preload.ts.

export type Ok<T> = { ok: true } & T
export type Err = { ok: false; error: string }
export type Result<T = {}> = Ok<T> | Err

/** A raw print job, written to a TCP socket byte-for-byte (ZPL, ESC/POS, PCL, whatever the device speaks). */
export type PrintJob = {
  host: string
  /** Defaults to 9100, the raw port on every networked Zebra and most label printers. */
  port?: number
  /** The bytes to send, or an http(s) URL to fetch them from first (e.g. a label from your shipping provider). */
  data: string
}

export type ProxyRequest = {
  url: string
  method?: string
  headers?: Record<string, string>
  /** Sent as JSON unless `raw` is true, in which case it is sent as-is with application/octet-stream. */
  body?: unknown
  raw?: boolean
}

export type ProxyResponse = {
  status: number
  headers: Record<string, string>
  /** JSON when the response is JSON, otherwise text. */
  body: unknown
}

export type HidDeviceInfo = {
  vendorId: number
  productId: number
  path?: string
  manufacturer?: string
  product?: string
  serialNumber?: string
}

export type BridgeApi = {
  version: string
  appUrl: () => Promise<string>
  print: (job: PrintJob) => Promise<Result<{ bytes: number }>>
  proxy: (req: ProxyRequest) => Promise<Result<ProxyResponse>>
  usb: {
    list: () => Promise<Result<{ devices: HidDeviceInfo[] }>>
    /** Open a HID device and start reading reports. See src/ipc/usb.ts for the report parser. */
    subscribe: (vendorId: number, productId: number) => Promise<Result>
    read: () => Promise<Result<{ weight: number; updatedAt: number }>>
  }
}

export type ShellConfig = {
  appUrl: string
  devUrl?: string
  fullscreen?: boolean
  allowedOrigins: string[]
  proxyAllowlist: string[]
  printers: {
    allowPrivateRanges: boolean
    hosts: string[]
  }
}

declare global {
  interface Window {
    deviceBridge?: BridgeApi
  }
}
