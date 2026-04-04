import { ipcRenderer } from 'electron'

export const authApi = {
  login: (credentials: any) => ipcRenderer.invoke('auth:login', credentials)
}
