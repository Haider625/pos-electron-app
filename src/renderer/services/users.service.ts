import type { User } from '../../shared/types'

export const usersService = {
  getAll: async (): Promise<User[]> => {
    return await window.api.users.getAll()
  },
  create: async (username: string, password?: string, role?: string): Promise<{ id: number }> => {
    return await window.api.users.create({ username, password, role })
  },
  delete: async (id: number): Promise<{ deleted: boolean }> => {
    return await window.api.users.delete(id)
  }
}
