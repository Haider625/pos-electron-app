import { useState, useEffect, useCallback } from 'react'
import type { User } from '../../shared/types'
import { usersService } from '../services/users.service'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await usersService.getAll()
      setUsers(data)
    } catch (err) {
      setError('Failed to load users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const createUser = async (username: string, password?: string, role?: string) => {
    try {
      await usersService.create(username, password, role)
      await loadUsers()
    } catch (err) {
      setError('Failed to create user')
      throw err
    }
  }

  const deleteUser = async (id: number) => {
    try {
      await usersService.delete(id)
      await loadUsers()
    } catch (err) {
      setError('Failed to delete user')
      throw err
    }
  }

  return {
    users,
    loading,
    error,
    refresh: loadUsers,
    createUser,
    deleteUser
  }
}
