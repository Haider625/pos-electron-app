import { ipcRenderer } from 'electron'

export const productsApi = {
  getAll: () => ipcRenderer.invoke('products:getAll'),
  create: (data: { name: string; price: number }) => ipcRenderer.invoke('products:create', data),
  delete: (id: number) => ipcRenderer.invoke('products:delete', id),
  update: (data: any) => ipcRenderer.invoke('products:update', data),
  getStockHistory: (productId: number) => ipcRenderer.invoke('products:getStockHistory', productId),
  getNextSku: () => ipcRenderer.invoke('products:getNextSku')
}
