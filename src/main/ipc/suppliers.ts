import { ipcMain } from 'electron';
import { db } from '../db';
import * as schema from '../database/schema';
import { desc, eq } from 'drizzle-orm';
import type { Supplier } from '../../shared/types';

export function registerSuppliersIpc() {
  ipcMain.handle('suppliers:getAll', async () => {
    try {
      return await db.select()
        .from(schema.suppliers)
        .where(eq(schema.suppliers.isDeleted, 0))
        .orderBy(desc(schema.suppliers.id))
        .all();
    } catch (err) {
      console.error('Error in suppliers:getAll:', err);
      throw err;
    }
  });

  ipcMain.handle('suppliers:create', async (_event, payload: Partial<Supplier>) => {
    try {
      const now = new Date().toISOString();
      const result = await db.insert(schema.suppliers).values({
        ...(payload as any),
        isDeleted: 0,
        createdAt: now,
      }).run();
      return { id: Number(result.lastInsertRowid) };
    } catch (err) {
      console.error('Error in suppliers:create:', err);
      throw err;
    }
  });

  ipcMain.handle('suppliers:update', async (_event, payload: Partial<Supplier> & { id: number }) => {
    try {
      const { id, ...data } = payload;
      await db.update(schema.suppliers)
        .set(data as any)
        .where(eq(schema.suppliers.id, id))
        .run();
      return { updated: true };
    } catch (err) {
      console.error('Error in suppliers:update:', err);
      throw err;
    }
  });

  ipcMain.handle('suppliers:delete', async (_event, id: number) => {
    try {
      await db.update(schema.suppliers)
        .set({ isDeleted: 1 })
        .where(eq(schema.suppliers.id, id))
        .run();
      return { deleted: true };
    } catch (err) {
      console.error('Error in suppliers:delete:', err);
      throw err;
    }
  });
}
