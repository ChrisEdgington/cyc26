import { contextBridge, ipcRenderer } from 'electron';
import { BridgeApi, PrintJob, ProxyRequest } from './types';

// The whole surface the web app gets. Nothing else from Node reaches the page.
const bridge: BridgeApi = {
  version: '0.1.0',
  appUrl: () => ipcRenderer.invoke('appUrl'),
  print: (job: PrintJob) => ipcRenderer.invoke('print', job),
  proxy: (req: ProxyRequest) => ipcRenderer.invoke('proxy', req),
  usb: {
    list: () => ipcRenderer.invoke('usb:list'),
    subscribe: (vendorId: number, productId: number) => ipcRenderer.invoke('usb:subscribe', vendorId, productId),
    read: () => ipcRenderer.invoke('usb:read'),
  },
};

contextBridge.exposeInMainWorld('deviceBridge', bridge);
