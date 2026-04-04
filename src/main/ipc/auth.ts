import { ipcMain } from 'electron';
import { db } from '../db';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export function registerAuthIpc() {
  ipcMain.handle('auth:login', async (_event, { username, password }) => {
    const results = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .all();
    
    if (results.length === 0) {
      throw new Error('بيانات الدخول غير صحيحة');
    }

    const user = results[0];
    const isPasswordMatch = bcrypt.compareSync(password, user.password);

    if (!isPasswordMatch) {
      throw new Error('بيانات الدخول غير صحيحة');
    }

    const { password: _, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  });
}
