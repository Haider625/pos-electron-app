import { ipcRenderer } from 'electron';

export const unitsApi = {
  getAll: (): Promise<any[]> => ipcRenderer.invoke('units:getAll'),
  create: (data: { name: string; shortName?: string }): Promise<{ id: number }> => ipcRenderer.invoke('units:create', data),
  delete: (id: number): Promise<{ deleted: boolean }> => ipcRenderer.invoke('units:delete', id)
};
