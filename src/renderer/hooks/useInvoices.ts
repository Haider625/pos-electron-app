import { useState, useEffect, useCallback } from 'react'
import type { Invoice } from '../../shared/types'
import { invoicesService } from '../services/invoices.service'

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadInvoices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await invoicesService.getAll()
      setInvoices(data)
    } catch (err) {
      setError('Failed to load invoices')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInvoices()
  }, [loadInvoices])

  const createInvoice = async (payload: {
    total: number;
    items: any[];
    customerName?: string;
    customerId?: number;
    totalDiscount?: number;
    totalTax?: number;
    paidAmount?: number;
    changeAmount?: number;
    paymentMethod?: string;
    userId?: number;
    cashShiftId?: number;
  }) => {
    try {
      const result = await invoicesService.create(payload)
      await loadInvoices()
      return result
    } catch (err) {
      setError('Failed to create invoice')
      throw err
    }
  }

  const getInvoiceDetails = async (id: number) => {
    try {
      return await invoicesService.getById(id)
    } catch (err) {
      setError('Failed to load invoice details')
      throw err
    }
  }

  const getInvoiceByNumber = async (invoiceNumber: string) => {
    try {
      return await invoicesService.getByNumber(invoiceNumber)
    } catch (err) {
      setError('Failed to find invoice')
      throw err
    }
  }

  return {
    invoices,
    loading,
    error,
    refresh: loadInvoices,
    createInvoice,
    getInvoiceDetails,
    getInvoiceByNumber
  }
}
