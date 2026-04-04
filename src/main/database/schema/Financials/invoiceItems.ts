import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { invoices } from './invoices';
import { products } from '../Inventory/products';

export const invoiceItems = sqliteTable('invoice_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id),
  productName: text('product_name'),
  quantity: integer('quantity').notNull(),
  returnableQuantity: integer('returnable_quantity').notNull(),
  price: real('price').notNull(),
  costPrice: real('cost_price'),
  discount: real('discount').default(0),
  taxRate: real('tax_rate').default(0),
  lineTotal: real('line_total').notNull(),
});
