import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { invoices } from './invoices';
import { purchaseOrders } from './purchaseOrders';

export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoiceId: integer('invoice_id').references(() => invoices.id),
  purchaseOrderId: integer('purchase_order_id').references(() => purchaseOrders.id),
  amount: real('amount').notNull(),
  method: text('method', { enum: ['cash', 'card', 'transfer', 'credit'] }).notNull(),
  date: text('date').notNull(),
  referenceNumber: text('reference_number'),
  notes: text('notes'),
});
