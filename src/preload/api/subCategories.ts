import { ipcRenderer } from 'electron';
import type { SubCategory } from '../../shared/types';

export const subCategoriesApi = {
  getAll: (): Promise<SubCategory[]> => ipcRenderer.invoke('subCategories:getAll'),
  create: (data: { name: string; categoryId: number }): Promise<{ id: number }> => ipcRenderer.invoke('subCategories:create', data),
  delete: (id: number): Promise<{ deleted: boolean }> => ipcRenderer.invoke('subCategories:delete', id),
  getByCategory: (categoryId: number): Promise<SubCategory[]> => ipcRenderer.invoke('subCategories:getByCategory', categoryId)
};
