import { ipcMain } from 'electron';
import { db } from '../db';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';

export function registerBrandsIpc() {
  // Brands IPC
  ipcMain.handle('brands:getAll', async () => {
    return await db.select().from(schema.brands).where(eq(schema.brands.isDeleted, 0)).all();
  });

  ipcMain.handle('brands:create', async (_event, name: string) => {
    try {
      const now = new Date().toISOString();
      const result = await db.insert(schema.brands).values({ 
        name,
        isDeleted: 0,
        createdAt: now 
      }).run();
      return { id: Number(result.lastInsertRowid) };
    } catch (err) {
      console.error('Error in brands:create:', err);
      throw err;
    }
  });
  
  ipcMain.handle('brands:delete', async (_event, id: number) => {
    try {
      await db.update(schema.brands)
        .set({ isDeleted: 1 })
        .where(eq(schema.brands.id, id))
        .run();
      return { deleted: true };
    } catch (err) {
      console.error('Error in brands:delete:', err);
      throw err;
    }
  });

  ipcMain.handle('brands:update', async (_event, { id, name }: { id: number, name: string }) => {
    try {
      await db.update(schema.brands)
        .set({ name })
        .where(eq(schema.brands.id, id))
        .run();
      return { updated: true };
    } catch (err) {
      console.error('Error in brands:update:', err);
      throw err;
    }
  });
}
