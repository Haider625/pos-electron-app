import { ipcRenderer } from 'electron';
import type { Supplier } from '../../shared/types';

export const suppliersApi = {
  getAll: () => ipcRenderer.invoke('suppliers:getAll'),
  create: (payload: Partial<Supplier>) => ipcRenderer.invoke('suppliers:create', payload),
  update: (payload: Partial<Supplier> & { id: number }) => ipcRenderer.invoke('suppliers:update', payload),
  delete: (id: number) => ipcRenderer.invoke('suppliers:delete', id),
};
