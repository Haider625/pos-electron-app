import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { products } from './products';

export const inventoryAdjustments = sqliteTable('inventory_adjustments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => products.id),
  type: text('type', { enum: ['addition', 'reduction', 'set'] }).notNull(),
  quantity: integer('quantity').notNull(),
  reason: text('reason'),
  date: text('date').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const inventoryAudit = sqliteTable('inventory_audit', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => products.id),
  oldStock: integer('old_stock').notNull(),
  newStock: integer('new_stock').notNull(),
  reason: text('reason'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const stockMovements = sqliteTable('stock_movements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => products.id),
  type: text('type', { enum: ['in', 'out', 'adjustment', 'return', 'sale', 'purchase', 'transfer'] }).notNull(),
  quantity: integer('quantity').notNull(),
  direction: text('direction', { enum: ['in', 'out'] }).notNull(),
  sourceType: text('source_type').notNull(),
  sourceId: integer('source_id'),
  invoiceId: integer('invoice_id'),
  reason: text('reason'),
  locationId: integer('location_id').default(1),
  createdBy: integer('created_by'),
  date: text('date').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});


