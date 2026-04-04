import { ipcRenderer } from 'electron';

export const brandsApi = {
  getAll: () => ipcRenderer.invoke('brands:getAll'),
  create: (name: string) => ipcRenderer.invoke('brands:create', name),
  update: (data: { id: number, name: string }) => ipcRenderer.invoke('brands:update', data),
  delete: (id: number) => ipcRenderer.invoke('brands:delete', id),
};
