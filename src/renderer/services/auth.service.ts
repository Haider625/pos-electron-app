import type { AuthUser } from '../../shared/types'

export const authService = {
  login: async (credentials: any): Promise<AuthUser> => {
    return window.api.auth.login(credentials)
  }
}
