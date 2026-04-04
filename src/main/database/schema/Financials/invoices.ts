import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from '../System/users';
import { customers } from '../CRM/customers';
import { cashShifts } from './cashShifts';

export const invoices = sqliteTable('invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoiceNumber: text('invoice_number').unique().notNull(),
  total: real('total_amount').notNull(),
  totalDiscount: real('total_discount').default(0),
  totalTax: real('total_tax').default(0),
  paidAmount: real('paid_amount').default(0),
  changeAmount: real('change_amount').default(0),
  paymentStatus: text('payment_status', { enum: ['unpaid', 'partially_paid', 'paid', 'refunded'] }).default('unpaid'),
  status: text('status', { enum: ['active', 'cancelled', 'returned', 'partially_returned'] }).default('active'),

  saleType: text('sale_type', { enum: ['retail', 'wholesale'] }).default('retail'),
  date: text('date').notNull(),
  customerId: integer('customer_id').references(() => customers.id),
  customerName: text('customer_name'),
  userId: integer('user_id').references(() => users.id),
  cashShiftId: integer('cash_shift_id').references(() => cashShifts.id),
  isDeleted: integer('is_deleted').default(0),
  deletedAt: text('deleted_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  invNumIdx: uniqueIndex('invoice_num_idx').on(table.invoiceNumber),
  dateIdx: index('invoice_date_idx').on(table.date),
}));
