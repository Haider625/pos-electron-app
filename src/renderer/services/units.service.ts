export const unitsService = {
  getAll: async (): Promise<any[]> => {
    return await window.api.units.getAll();
  },
  create: async (name: string, shortName?: string): Promise<{ id: number }> => {
    return await window.api.units.create({ name, shortName });
  },
  delete: async (id: number): Promise<{ deleted: boolean }> => {
    return await window.api.units.delete(id);
  }
};
