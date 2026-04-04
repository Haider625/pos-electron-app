import { ipcMain } from 'electron';
import { db } from '../db';
import * as schema from '../database/schema';
import { eq, and } from 'drizzle-orm';

export function registerSubCategoriesIpc() {
  // SubCategory Handlers
  ipcMain.handle('subCategories:getAll', async () => {
    return await db.select()
      .from(schema.subCategories)
      .where(eq(schema.subCategories.isDeleted, 0))
      .all();
  });

  ipcMain.handle('subCategories:create', async (_event, data: { name: string; categoryId: number }) => {
    const now = new Date().toISOString();
    const result = await db.insert(schema.subCategories).values({ 
      name: data.name, 
      categoryId: data.categoryId,
      isDeleted: 0,
      createdAt: now,
    }).run();
    return { id: Number(result.lastInsertRowid) };
  });

  ipcMain.handle('subCategories:delete', async (_event, id: number) => {
    await db.update(schema.subCategories)
      .set({ isDeleted: 1 })
      .where(eq(schema.subCategories.id, id))
      .run();
    return { deleted: true };
  });

  ipcMain.handle('subCategories:getByCategory', async (_event, categoryId: number) => {
    return await db.select()
      .from(schema.subCategories)
      .where(and(
        eq(schema.subCategories.categoryId, categoryId),
        eq(schema.subCategories.isDeleted, 0)
      ))
      .all();
  });
}
