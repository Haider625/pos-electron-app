import { ipcRenderer } from 'electron';
import type { Customer } from '../../shared/types';

export const customersApi = {
  getAll: () => ipcRenderer.invoke('customers:getAll'),
  create: (payload: Partial<Customer>) => ipcRenderer.invoke('customers:create', payload),
  update: (payload: Partial<Customer> & { id: number }) => ipcRenderer.invoke('customers:update', payload),
  delete: (id: number) => ipcRenderer.invoke('customers:delete', id),
};
