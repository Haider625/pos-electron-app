import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { categories } from './categories';

export const subCategories = sqliteTable('sub_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  isDeleted: integer('is_deleted').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
