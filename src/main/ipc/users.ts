import { ipcMain } from 'electron';
import { db } from '../db';
import * as schema from '../database/schema';
import { desc, eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export function registerUsersIpc() {
  ipcMain.handle('users:getAll', async () => {
    return await db.select().from(schema.users).orderBy(desc(schema.users.id)).all();
  });

  ipcMain.handle('users:create', async (_event, payload: { username: string; password?: string; role?: 'admin' | 'user' }) => {
    const passwordToHash = payload.password || '123456'; // Default password if none provided
    const hashedPassword = bcrypt.hashSync(passwordToHash, 10);
    
    const result = await db.insert(schema.users).values({
      username: payload.username,
      password: hashedPassword,
      role: payload.role || 'user'
    }).run();
    
    return { id: result.lastInsertRowid };
  });

  ipcMain.handle('users:delete', async (_event, id: number) => {
    await db.delete(schema.users).where(eq(schema.users.id, id)).run();
    return { deleted: true };
  });
}
