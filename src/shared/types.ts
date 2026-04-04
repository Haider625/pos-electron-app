export interface Unit {
  id: number;
  name: string;
  shortName?: string;
  isDeleted?: number;
  createdAt?: string;
}

export interface Brand {
  id: number;
  name: string;
  isDeleted?: number;
  createdAt?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  costPrice?: number;
  taxRate?: number;
  discount?: number;
  stock: number;
  reorderLevel?: number;
  unit?: string;
  unitId?: number;
  status?: 'active' | 'inactive';
  categoryId?: number;
  subCategoryId?: number;
  brandId?: number;
  imageUrl?: string;
  isDeleted?: number;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}


export type Category = {
  id: number
  name: string
  isDeleted?: number
  createdAt?: string
}

export type SubCategory = {
  id: number
  name: string
  categoryId: number
  isDeleted?: number
  createdAt?: string
}

export type User = {
  id: number
  username: string
  email?: string
  role: 'admin' | 'user'
  isDeleted?: number
  createdAt?: string
}

export type AuthUser = User

export type CashShift = {
  id: number
  userId: number
  startTime: string
  endTime?: string
  startingCash: number
  endingCash?: number
  actualCash?: number
  status: 'open' | 'closed'
}

export type Invoice = {
  id: number
  invoiceNumber: string
  total: number
  totalDiscount: number
  totalTax: number
  paidAmount: number
  changeAmount: number
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid' | 'refunded'
  status: 'active' | 'cancelled' | 'returned' | 'partially_returned'
  saleType: 'retail' | 'wholesale'
  date: string
  customerId?: number
  customerName?: string
  userId?: number
  cashShiftId?: number
  isDeleted?: number
  deletedAt?: string
  createdAt?: string
  updatedAt?: string
}

export type InvoiceItem = {
  id: number
  invoiceId: number
  productId?: number
  productName?: string
  quantity: number
  returnableQuantity: number
  price: number
  costPrice?: number
  discount: number
  taxRate: number
  lineTotal: number
}

export type StockMovement = {
  id: number;
  productId: number;
  type: 'sale' | 'return' | 'purchase' | 'adjustment' | 'transfer';
  quantity: number;
  direction: 'in' | 'out';
  sourceType: string;
  sourceId: number;
  invoiceId?: number;
  reason?: string;
  locationId?: number;
  createdBy?: number;
  createdAt: string;
}

export type Customer = {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  totalDebt?: number;
  loyaltyPoints?: number;
  isDeleted?: number;
  createdAt?: string;
}

export type Supplier = {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  isDeleted?: number;
  createdAt?: string;
}

export type PurchaseOrder = {
  id: number;
  supplierId: number;
  totalAmount: number;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  date: string;
  userId?: number;
  createdAt?: string;
}

export type PurchaseOrderItem = {
  id: number;
  purchaseOrderId: number;
  productId: number;
  quantity: number;
  costPrice: number;
}

export type Payment = {
  id: number;
  invoiceId?: number;
  purchaseOrderId?: number;
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'credit';
  date: string;
  referenceNumber?: string;
  notes?: string;
}

export type SalesReturn = {
  id: number;
  returnNumber: string;
  invoiceId: number;
  customerId?: number;
  totalRefunded: number;
  status: 'draft' | 'completed' | 'cancelled';
  reason?: string;
  notes?: string;
  date: string;
  userId?: number;
  createdAt?: string;
}

export type SalesReturnItem = {
  id: number;
  salesReturnId: number;
  invoiceItemId: number;
  productId: number;
  quantity: number;
  unitPriceAtSale: number;
  lineTotal: number;
}

export type AuditLog = {
  id: number;
  userId?: number;
  action: string;
  targetTable: string;
  targetId?: number;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}
