import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { users } from '../System/users';

export const cashShifts = sqliteTable('cash_shifts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  startingCash: real('starting_cash').notNull(),
  endingCash: real('ending_cash'),
  actualCash: real('actual_cash'),
  status: text('status', { enum: ['open', 'closed'] }).default('open'),
});
