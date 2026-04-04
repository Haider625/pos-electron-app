import { ipcRenderer } from 'electron'

export const usersApi = {
  getAll: () => ipcRenderer.invoke('users:getAll'),
  create: (data: { username: string; email: string }) => ipcRenderer.invoke('users:create', data),
  delete: (id: number) => ipcRenderer.invoke('users:delete', id)
}
