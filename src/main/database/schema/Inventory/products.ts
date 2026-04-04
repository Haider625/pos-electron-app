import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { categories } from './categories';
import { subCategories } from './subCategories';
import { brands } from './brands';
import { units } from './units';

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  sku: text('sku'),
  barcode: text('barcode'),
  price: real('price').notNull(),
  costPrice: real('cost_price'),
  taxRate: real('tax_rate').default(0),
  discount: real('discount').default(0),
  stock: integer('stock').notNull().default(0),
  reorderLevel: integer('reorder_level').default(5),
  unitId: integer('unit_id').references(() => units.id), // Updated from text to references in previous session
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  categoryId: integer('category_id').references(() => categories.id),
  subCategoryId: integer('sub_category_id').references(() => subCategories.id),
  brandId: integer('brand_id').references(() => brands.id),
  imageUrl: text('image_url'),
  isDeleted: integer('is_deleted').default(0),
  deletedAt: text('deleted_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  skuIdx: uniqueIndex('sku_idx').on(table.sku),
  barcodeIdx: index('barcode_idx').on(table.barcode),
  nameIdx: index('product_name_idx').on(table.name),
}));

export const stockHistory = sqliteTable('stock_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => products.id),
  change: integer('change_amount').notNull(),
  reason: text('reason'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
