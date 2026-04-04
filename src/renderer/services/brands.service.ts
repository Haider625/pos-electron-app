import type { Brand } from '../../shared/types';

export const brandsService = {
  getAll: async (): Promise<Brand[]> => {
    return await window.api.brands.getAll();
  },
  create: async (name: string): Promise<{ id: number }> => {
    return await window.api.brands.create(name);
  },
  update: async (id: number, name: string): Promise<{ updated: boolean }> => {
    return await window.api.brands.update({ id, name });
  },
  delete: async (id: number): Promise<{ deleted: boolean }> => {
    return await window.api.brands.delete(id);
  }
};
