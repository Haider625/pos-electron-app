import { ipcMain } from 'electron';
import { db } from '../db';
import * as schema from '../database/schema';
import { desc, eq } from 'drizzle-orm';
import type { Product } from '../../shared/types';

export function registerProductsIpc() {
  ipcMain.handle('products:getAll', async () => {
    return await db.select()
      .from(schema.products)
      .where(eq(schema.products.isDeleted, 0))
      .orderBy(desc(schema.products.id))
      .all();
  });

  ipcMain.handle('products:getNextSku', async () => {
    try {
      const products = await db.select({ sku: schema.products.sku })
        .from(schema.products)
        .orderBy(desc(schema.products.id))
        .limit(1)
        .all();

      const lastProduct = products[0];

      if (!lastProduct || !lastProduct.sku) {
        return 'SKU-1001';
      }

      const match = lastProduct.sku.match(/SKU-(\d+)/);
      if (match) {
        const nextNumber = parseInt(match[1]) + 1;
        return `SKU-${nextNumber}`;
      }

      return 'SKU-1001';
    } catch (err) {
      console.error('Error in products:getNextSku:', err);
      return 'SKU-1001';
    }
  });

  ipcMain.handle('products:create', async (_event, payload: Partial<Product>) => {
    try {
      const now = new Date().toISOString();
      const result = await db.insert(schema.products).values({
        ...(payload as any),
        isDeleted: 0,
        createdAt: now,
        updatedAt: now,
      }).run();
      
      const productId = Number(result.lastInsertRowid);
      
      if (payload.stock && payload.stock > 0) {
        await db.insert(schema.stockMovements).values({
          productId,
          type: 'adjustment',
          direction: 'in',
          quantity: payload.stock,
          reason: 'رصيد أول المدة (إضافة منتج جديد)',
          sourceType: 'manual',
          createdAt: now,
          date: now,
        }).run();
      }
      
      return { id: productId };
    } catch (err: any) {
      console.error('Error in products:create:', err);
      throw new Error(err.message || 'حدث خطأ أثناء إنشاء المنتج');
    }
  });

  ipcMain.handle('products:delete', async (_event, id: number) => {
    try {
      const now = new Date().toISOString();
      await db.update(schema.products)
        .set({ 
          isDeleted: 1,
          deletedAt: now,
          updatedAt: now 
        })
        .where(eq(schema.products.id, id))
        .run();
      return { deleted: true };
    } catch (err) {
      console.error('Error in products:delete:', err);
      throw err;
    }
  });

  ipcMain.handle('products:update', async (_event, payload: Partial<Product> & { id: number }) => {
    try {
      const { id, ...data } = payload;
      const now = new Date().toISOString();
      
      if (data.stock !== undefined) {
        const existing = await db.select().from(schema.products).where(eq(schema.products.id, id)).all()[0];
        if (existing && existing.stock !== data.stock) {
          const diff = data.stock - existing.stock;
          await db.insert(schema.stockMovements).values({
            productId: id,
            type: 'adjustment',
            direction: diff > 0 ? 'in' : 'out',
            quantity: Math.abs(diff),
            reason: 'تعديل يدوي من صفحة المنتجات',
            sourceType: 'adjustment',
            createdAt: now,
            date: now,
          }).run();
        }
      }

      await db.update(schema.products)
        .set({
          ...(data as any),
          updatedAt: now
        })
        .where(eq(schema.products.id, id))
        .run();
      return { updated: true };
    } catch (err) {
      console.error('Error in products:update:', err);
      throw err;
    }
  });

  ipcMain.handle('products:getStockHistory', async (_event, productId: number) => {
    try {
      return await db.select()
        .from(schema.stockMovements)
        .where(eq(schema.stockMovements.productId, productId))
        .orderBy(desc(schema.stockMovements.createdAt))
        .all();
    } catch (err) {
      console.error('Error in products:getStockHistory:', err);
      throw err;
    }
  });
}
