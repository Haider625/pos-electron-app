import { ipcMain } from 'electron';
import { db } from '../db';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';
 
export function registerCategoriesIpc() {
  // Category Handlers
  ipcMain.handle('categories:getAll', async () => {
    return await db.select()
      .from(schema.categories)
      .where(eq(schema.categories.isDeleted, 0))
      .all();
  });

  ipcMain.handle('categories:create', async (_event, data: { name: string }) => {
    const now = new Date().toISOString();
    const result = await db.insert(schema.categories).values({ 
      name: data.name,
      isDeleted: 0,
      createdAt: now,
    }).run();
    return { id: Number(result.lastInsertRowid) };
  });

  ipcMain.handle('categories:delete', async (_event, id: number) => {
    await db.update(schema.categories)
      .set({ isDeleted: 1 })
      .where(eq(schema.categories.id, id))
      .run();
    return { deleted: true };
  });

  ipcMain.handle('categories:update', async (_event, data: { id: number; name: string }) => {
    await db.update(schema.categories)
      .set({ name: data.name })
      .where(eq(schema.categories.id, data.id))
      .run();
    return { updated: true };
  });
}
