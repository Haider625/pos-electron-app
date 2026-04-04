import { sqliteTable, integer, real } from 'drizzle-orm/sqlite-core';
import { purchaseOrders } from './purchaseOrders';
import { products } from '../Inventory/products';

export const purchaseOrderItems = sqliteTable('purchase_order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  purchaseOrderId: integer('purchase_order_id').notNull().references(() => purchaseOrders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  costPrice: real('cost_price').notNull(),
});
