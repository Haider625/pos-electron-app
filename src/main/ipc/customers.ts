import { ipcMain } from 'electron';
import { db } from '../db';
import * as schema from '../database/schema';
import { desc, eq } from 'drizzle-orm';
import type { Customer } from '../../shared/types';

export function registerCustomersIpc() {
  ipcMain.handle('customers:getAll', async () => {
    try {
      return await db.select()
        .from(schema.customers)
        .where(eq(schema.customers.isDeleted, 0))
        .orderBy(desc(schema.customers.id))
        .all();
    } catch (err) {
      console.error('Error in customers:getAll:', err);
      throw err;
    }
  });

  ipcMain.handle('customers:create', async (_event, payload: Partial<Customer>) => {
    try {
      const now = new Date().toISOString();
      const result = await db.insert(schema.customers).values({
        ...(payload as any),
        isDeleted: 0,
        createdAt: now,
      }).run();
      return { id: Number(result.lastInsertRowid) };
    } catch (err) {
      console.error('Error in customers:create:', err);
      throw err;
    }
  });

  ipcMain.handle('customers:update', async (_event, payload: Partial<Customer> & { id: number }) => {
    try {
      const { id, ...data } = payload;
      await db.update(schema.customers)
        .set(data as any)
        .where(eq(schema.customers.id, id))
        .run();
      return { updated: true };
    } catch (err) {
      console.error('Error in customers:update:', err);
      throw err;
    }
  });

  ipcMain.handle('customers:delete', async (_event, id: number) => {
    try {
      await db.update(schema.customers)
        .set({ 
          isDeleted: 1,
        })
        .where(eq(schema.customers.id, id))
        .run();
      // Actually, my metadata fields are: isDeleted, createdAt.
      // Wait, customers doesn't have deletedAt in schema.ts (Step 2215).
      // Let me check schema.ts again (Step 2215).
      // customers: isDeleted: integer, createdAt: text.
      // Correct.
      return { deleted: true };
    } catch (err) {
      console.error('Error in customers:delete:', err);
      throw err;
    }
  });
}
