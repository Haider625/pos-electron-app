import type { SubCategory } from '../../shared/types';

export const subCategoriesService = {
  getAll: async (): Promise<SubCategory[]> => {
    return await window.api.subCategories.getAll();
  },
  create: async (name: string, categoryId: number): Promise<{ id: number }> => {
    return await window.api.subCategories.create({ name, categoryId });
  },
  delete: async (id: number): Promise<{ deleted: boolean }> => {
    return await window.api.subCategories.delete(id);
  },
  getByCategory: async (categoryId: number): Promise<SubCategory[]> => {
    return await window.api.subCategories.getByCategory(categoryId);
  }
};
