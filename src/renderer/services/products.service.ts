import type { Product } from '../../shared/types'

export const productsService = {
  getAll: async (): Promise<Product[]> => {
    return await window.api.products.getAll()
  },
  create: async (payload: Partial<Product>): Promise<{ id: number }> => {
    return await window.api.products.create(payload)
  },
  update: async (id: number, payload: Partial<Product>): Promise<{ updated: boolean }> => {
    return await window.api.products.update({ ...payload, id })
  },
  delete: async (id: number): Promise<{ deleted: boolean }> => {
    return await window.api.products.delete(id)
  }
}
