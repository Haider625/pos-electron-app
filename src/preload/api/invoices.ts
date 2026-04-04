import { ipcRenderer } from 'electron'

export const invoicesApi = {
  create: (data: any) => ipcRenderer.invoke('invoices:create', data),
  getAll: () => ipcRenderer.invoke('invoices:getAll'),
  getById: (id: number) => ipcRenderer.invoke('invoices:getById', id),
  getByNumber: (invoiceNumber: string) => ipcRenderer.invoke('invoices:getByNumber', invoiceNumber),
}
