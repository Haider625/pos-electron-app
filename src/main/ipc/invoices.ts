import { ipcMain } from 'electron';
import { db } from '../db';
import * as schema from '../database/schema';
import { desc, eq, sql } from 'drizzle-orm';

// Helper for generating unique invoice numbers
async function generateInvoiceNumber(): Promise<string> {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Get latest invoice for today
  const latest = await db.select({ num: schema.invoices.invoiceNumber })
    .from(schema.invoices)
    .where(sql`SUBSTR(${schema.invoices.invoiceNumber}, 5, 8) = ${dateStr}`)
    .orderBy(desc(schema.invoices.id))
    .limit(1)
    .all();

  let count = '0001';
  if (latest.length > 0 && latest[0].num) {
    const lastNum = parseInt(latest[0].num.slice(-4));
    count = (lastNum + 1).toString().padStart(4, '0');
  }

  return `INV-${dateStr}-${count}`;
}

export function registerInvoicesIpc() {
  ipcMain.handle('invoices:create', async (_event, payload: { 
    total: number; 
    items: any[]; 
    customerName?: string; 
    customerId?: number;
    totalDiscount?: number;
    totalTax?: number;
    paidAmount?: number;
    changeAmount?: number;
    paymentMethod?: string;
    userId?: number;
    cashShiftId?: number;
  }) => {
    try {
      const invNumber = await generateInvoiceNumber();
      const now = new Date().toISOString();

      // 1. Create Invoice Record
      const invoiceResult = await db.insert(schema.invoices).values({
        invoiceNumber: invNumber,
        total: payload.total,
        totalDiscount: payload.totalDiscount || 0,
        totalTax: payload.totalTax || 0,
        paidAmount: payload.paidAmount || payload.total,
        changeAmount: payload.changeAmount || 0,
        paymentStatus: (payload.paidAmount || payload.total) >= payload.total ? 'paid' : 'partially_paid',
        status: 'active',
        date: now,
        customerName: payload.customerName || 'عام',
        customerId: payload.customerId,
        userId: payload.userId,
        cashShiftId: payload.cashShiftId,
        createdAt: now,
        updatedAt: now,
      }).run();

      const invoiceId = Number(invoiceResult.lastInsertRowid);

      // 2. Create Payment Record
      if (payload.paidAmount && payload.paidAmount > 0) {
        await db.insert(schema.payments).values({
          invoiceId: invoiceId,
          amount: payload.paidAmount,
          method: (payload.paymentMethod as any) || 'cash',
          date: now,
        }).run();
      }

      // 3. Process Each Item
      for (const item of payload.items) {
        const productId = item.id || item.product_id;

        // Fetch product snapshot
        const productRows = await db.select().from(schema.products).where(eq(schema.products.id, productId)).all();
        const product = productRows[0];

        // Insert invoice item
        await db.insert(schema.invoiceItems).values({
          invoiceId: invoiceId,
          productId: productId,
          productName: product?.name || item.name,
          quantity: item.quantity,
          returnableQuantity: item.quantity,
          price: item.price,
          costPrice: product?.costPrice || 0,
          discount: item.discount || 0,
          taxRate: product?.taxRate || 0,
          lineTotal: (item.price * item.quantity) - (item.discount || 0),
        }).run();

        // Deduct stock
        await db.update(schema.products)
          .set({
            stock: sql`${schema.products.stock} - ${item.quantity}`,
            updatedAt: now,
          })
          .where(eq(schema.products.id, productId))
          .run();

        // Log stock movement - Refined Ledger Style
        await db.insert(schema.stockMovements).values({
          productId: productId,
          type: 'out',
          quantity: item.quantity,
          direction: 'out',
          sourceType: 'sale',
          sourceId: invoiceId,
          invoiceId: invoiceId,
          reason: `بيع بالفاتورة #${invNumber}`,
          createdBy: payload.userId,
          date: now,
        }).run();
      }

      return { id: invoiceId, invoiceNumber: invNumber };
    } catch (err) {
      console.error('[Invoice Create Error]:', err);
      throw err;
    }
  });

  ipcMain.handle('invoices:getByNumber', async (_event, invoiceNumber: string) => {
    const rows = await db.select().from(schema.invoices).where(eq(schema.invoices.invoiceNumber, invoiceNumber)).all();
    return rows[0] || null;
  });

  ipcMain.handle('invoices:getAll', async () => {
    return await db.select().from(schema.invoices).where(eq(schema.invoices.isDeleted, 0)).orderBy(desc(schema.invoices.id)).all();
  });

  ipcMain.handle('invoices:getById', async (_event, id: number) => {
    const invoiceRows = await db.select().from(schema.invoices).where(eq(schema.invoices.id, id)).all();
    const invoice = invoiceRows[0];
    const items = await db.select().from(schema.invoiceItems).where(eq(schema.invoiceItems.invoiceId, id)).all();
    const paymentsArr = await db.select().from(schema.payments).where(eq(schema.payments.invoiceId, id)).all();
    return { ...invoice, items, payments: paymentsArr };
  });
}
