import { ipcRenderer } from 'electron';

export const returnsApi = {
  create: (payload: any) => ipcRenderer.invoke('returns:create', payload),
  getAll: (filters?: any) => ipcRenderer.invoke('returns:getAll', filters),
  getOne: (id: number) => ipcRenderer.invoke('returns:getOne', id),
  getByInvoiceId: (invoiceId: number) => ipcRenderer.invoke('returns:getByInvoiceId', invoiceId),
  getReturnableInvoiceItems: (invoiceId: number) => ipcRenderer.invoke('returns:getReturnableInvoiceItems', invoiceId),
};
