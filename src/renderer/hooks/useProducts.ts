import { useState, useEffect, useCallback } from 'react'
import type { Product } from '../../shared/types'
import { productsService } from '../services/products.service'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await productsService.getAll()
      setProducts(data)
    } catch (err) {
      setError('Failed to load products')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const createProduct = async (payload: Partial<Product>) => {
    try {
      await productsService.create(payload)
      await loadProducts()
    } catch (err) {
      setError('Failed to create product')
      throw err
    }
  }

  const updateProduct = async (id: number, payload: Partial<Product>) => {
    try {
      await productsService.update(id, payload)
      await loadProducts()
    } catch (err) {
      setError('Failed to update product')
      throw err
    }
  }

  const deleteProduct = async (id: number) => {
    try {
      await productsService.delete(id)
      await loadProducts()
    } catch (err) {
      setError('Failed to delete product')
      throw err
    }
  }

  return {
    products,
    loading,
    error,
    refresh: loadProducts,
    createProduct,
    updateProduct,
    deleteProduct
  }
}
