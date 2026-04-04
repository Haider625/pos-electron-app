import { ipcMain } from 'electron';
import { db } from '../db';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';

export function registerUnitsIpc() {
  ipcMain.handle('units:getAll', async () => {
    return await db.select().from(schema.units).where(eq(schema.units.isDeleted, 0));
  });

  ipcMain.handle('units:create', async (_, data: { name: string; shortName?: string }) => {
    const [result] = await db.insert(schema.units).values(data).returning({ id: schema.units.id });
    return result;
  });

  ipcMain.handle('units:delete', async (_, id: number) => {
    await db.update(schema.units).set({ isDeleted: 1 }).where(eq(schema.units.id, id));
    return { deleted: true };
  });
}
