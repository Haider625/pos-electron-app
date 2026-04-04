import type { Category } from '../../shared/types';

export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    return await window.api.categories.getAll();
  },
  create: async (name: string): Promise<{ id: number }> => {
    return await window.api.categories.create({ name });
  },
  update: async (id: number, name: string): Promise<{ updated: boolean }> => {
    return await window.api.categories.update({ id, name });
  },
  delete: async (id: number): Promise<{ deleted: boolean }> => {
    return await window.api.categories.delete(id);
  }
};
