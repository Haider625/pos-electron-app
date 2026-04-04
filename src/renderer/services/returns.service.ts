export const returnsService = {
  create: async (payload: {
    invoiceId: number;
    items: { 
      invoiceItemId: number; 
      productId: number; 
      quantity: number; 
      unitPrice: number;
    }[];
    reason?: string;
    notes?: string;
    userId?: number;
    customerId?: number;
  }): Promise<{ id: number; returnNumber: string }> => {
    return await window.api.returns.create(payload)
  },
  getAll: async (filters?: any) => {
    return await window.api.returns.getAll(filters)
  },
  getOne: async (id: number) => {
    return await window.api.returns.getOne(id)
  },
  getByInvoiceId: async (invoiceId: number) => {
    return await window.api.returns.getByInvoiceId(invoiceId)
  },
  getReturnableInvoiceItems: async (invoiceId: number) => {
    return await window.api.returns.getReturnableInvoiceItems(invoiceId)
  }
}
