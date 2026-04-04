import { ipcRenderer } from 'electron';
import type { Category } from '../../shared/types';

export const categoriesApi = {
  getAll: (): Promise<Category[]> => ipcRenderer.invoke('categories:getAll'),
  create: (data: { name: string }): Promise<{ id: number }> => ipcRenderer.invoke('categories:create', data),
  update: (data: { id: number; name: string }): Promise<{ updated: boolean }> => ipcRenderer.invoke('categories:update', data),
  delete: (id: number): Promise<{ deleted: boolean }> => ipcRenderer.invoke('categories:delete', id)
};
