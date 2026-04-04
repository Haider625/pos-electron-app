import type { Invoice, InvoiceItem, Payment } from '../../shared/types'

export const invoicesService = {
  getAll: async (): Promise<Invoice[]> => {
    return await window.api.invoices.getAll()
  },
  getById: async (id: number): Promise<Invoice & { items: InvoiceItem[]; payments: Payment[] }> => {
    return await window.api.invoices.getById(id)
  },
  getByNumber: async (invoiceNumber: string): Promise<Invoice | null> => {
    return await window.api.invoices.getByNumber(invoiceNumber)
  },
  create: async (payload: {
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
  }): Promise<{ id: number; invoiceNumber: string }> => {
    return await window.api.invoices.create(payload)
  }
}
