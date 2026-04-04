import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const units = sqliteTable('units', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  shortName: text('short_name'),
  isDeleted: integer('is_deleted').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
