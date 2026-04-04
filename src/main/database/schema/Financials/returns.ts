import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from '../System/users';
import { products } from '../Inventory/products';
import { invoices } from './invoices';
import { invoiceItems } from './invoiceItems';
import { customers } from '../CRM/customers';

export const salesReturns = sqliteTable('sales_returns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  returnNumber: text('return_number').unique().notNull(),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id),
  customerId: integer('customer_id').references(() => customers.id),
  totalRefunded: real('total_refunded').notNull(),
  status: text('status', { enum: ['draft', 'completed', 'cancelled'] }).default('completed'),
  reason: text('reason'),
  notes: text('notes'),
  date: text('date').notNull(),
  userId: integer('user_id').references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const salesReturnItems = sqliteTable('sales_return_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  salesReturnId: integer('sales_return_id').notNull().references(() => salesReturns.id, { onDelete: 'cascade' }),
  invoiceItemId: integer('invoice_item_id').notNull().references(() => invoiceItems.id),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPriceAtSale: real('unit_price_at_sale').notNull(),
  lineTotal: real('line_total').notNull(),
});

