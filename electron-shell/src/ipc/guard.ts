import { IpcMainInvokeEvent } from 'electron';
import { ShellConfig } from '../types';

// The browser stopped trusting the page, so the shell has to do that checking
// itself. Every IPC handler calls assertSender first. A page from anywhere
// else, an injected iframe, or a page that got compromised gets nothing.

function originOf(url: string | undefined) {
  try {
    return new URL(url ?? '').origin;
  } catch {
    return null;
  }
}

export function isAllowedOrigin(url: string | undefined, allowed: string[]) {
  const origin = originOf(url);
  return origin !== null && allowed.some((a) => originOf(a) === origin);
}

export function assertSender(event: IpcMainInvokeEvent, config: ShellConfig) {
  const url = event.senderFrame?.url;
  if (!isAllowedOrigin(url, config.allowedOrigins)) throw new Error(`origin not allowed: ${url}`);
}

const PRIVATE_RANGES = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^localhost$/i,
  /^\[?::1\]?$/,
  /\.local$/i,
];

export function isAllowedPrinterHost(host: string, config: ShellConfig) {
  if (config.printers.hosts.includes(host)) return true;
  return config.printers.allowPrivateRanges && PRIVATE_RANGES.some((range) => range.test(host));
}

export function isAllowedProxyTarget(url: string, config: ShellConfig) {
  return isAllowedOrigin(url, config.proxyAllowlist);
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
