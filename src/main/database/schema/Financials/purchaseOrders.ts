import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { suppliers } from '../CRM/suppliers';
import { users } from '../System/users';

export const purchaseOrders = sqliteTable('purchase_orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  supplierId: integer('supplier_id').notNull().references(() => suppliers.id),
  totalAmount: real('total_amount').notNull(),
  status: text('status', { enum: ['draft', 'ordered', 'received', 'cancelled'] }).default('draft'),
  date: text('date').notNull(),
  userId: integer('user_id').references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
