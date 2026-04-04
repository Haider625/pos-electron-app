import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  totalDebt: real('total_debt').default(0),
  loyaltyPoints: integer('loyalty_points').default(0),
  isDeleted: integer('is_deleted').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  phoneIdx: index('customer_phone_idx').on(table.phone),
}));
