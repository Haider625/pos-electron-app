import { useState, useCallback } from 'react'
import { returnsService } from '../services/returns.service'

export function useReturns() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createReturn = useCallback(async (payload: any) => {
    setLoading(true)
    setError(null)
    try {
      const result = await returnsService.create(payload)
      return result
    } catch (err: any) {
      const msg = err.message || 'Failed to process return'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getAllReturns = useCallback(async (filters?: any) => {
    setLoading(true)
    setError(null)
    try {
      return await returnsService.getAll(filters)
    } catch (err: any) {
      setError(err.message || 'Failed to load returns')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getReturnDetails = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      return await returnsService.getOne(id)
    } catch (err: any) {
      setError(err.message || 'Failed to load return details')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getReturnableItems = useCallback(async (invoiceId: number) => {
    setLoading(true)
    setError(null)
    try {
      return await returnsService.getReturnableInvoiceItems(invoiceId)
    } catch (err: any) {
      setError(err.message || 'Failed to load returnable items')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createReturn,
    getAllReturns,
    getReturnDetails,
    getReturnableItems
  }
}
