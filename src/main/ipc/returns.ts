import { ipcMain } from 'electron';
import { db } from '../db';
import * as schema from '../database/schema';
import { eq, sql, desc, and } from 'drizzle-orm';

export function registerReturnsIpc() {
  // Create a new sales return
  ipcMain.handle('returns:create', async (_event, payload: { 
    invoiceId: number; 
    items: { 
      invoiceItemId: number; 
      productId: number; 
      quantity: number; 
      unitPrice: number;
    }[];
    reason?: string;
    notes?: string;
    userId?: number;
    customerId?: number;
  }) => {
    return db.transaction((tx) => {
      const now = new Date().toISOString();
      const dateStr = now.split('T')[0].replace(/-/g, '');
      
      // 1. Generate Return Number (SR-YYYYMMDD-SEQ)
      const lastReturn = tx.select()
        .from(schema.salesReturns)
        .where(sql`date(date) = date(${now})`)
        .orderBy(desc(schema.salesReturns.id))
        .limit(1)
        .all();
      
      const sequence = lastReturn.length > 0 
        ? (parseInt(lastReturn[0].returnNumber.split('-').pop() || '0') + 1).toString().padStart(3, '0')
        : '001';
      const returnNumber = `SR-${dateStr}-${sequence}`;

      // 2. Calculate Total Refund
      const totalRefund = payload.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

      // 3. Create Sales Return Header
      const returnResult = tx.insert(schema.salesReturns).values({
        returnNumber,
        invoiceId: payload.invoiceId,
        customerId: payload.customerId,
        totalRefunded: totalRefund,
        reason: payload.reason,
        notes: payload.notes,
        userId: payload.userId,
        status: 'completed',
        date: now,
      }).run();

      const returnId = Number(returnResult.lastInsertRowid);

      // 4. Process Return Items
      for (const item of payload.items) {
        // Fetch invoice item to validate quantity (Critical Guard)
        const invItemResults = tx.select()
          .from(schema.invoiceItems)
          .where(eq(schema.invoiceItems.id, item.invoiceItemId))
          .all();
        
        const invItem = invItemResults[0];
        
        if (!invItem) {
          throw new Error(`لم يتم العثور على بند الفاتورة #${item.invoiceItemId}`);
        }

        if (invItem.returnableQuantity < item.quantity) {
          throw new Error(`الكمية المرتجعة (${item.quantity}) أكبر من الكمية المتاحة للإرجاع (${invItem.returnableQuantity}) للمنتج: ${invItem.productName}`);
        }

        const lineTotal = item.unitPrice * item.quantity;

        // Create return item record
        tx.insert(schema.salesReturnItems).values({
          salesReturnId: returnId,
          invoiceItemId: item.invoiceItemId,
          productId: item.productId,
          quantity: item.quantity,
          unitPriceAtSale: item.unitPrice,
          lineTotal: lineTotal,
        }).run();

        // Update returnable quantity on original invoice item
        tx.update(schema.invoiceItems)
          .set({ 
            returnableQuantity: invItem.returnableQuantity - item.quantity 
          })
          .where(eq(schema.invoiceItems.id, item.invoiceItemId))
          .run();

        // Update stock movement (Inbound) - Ledger Style
        tx.insert(schema.stockMovements).values({
          productId: item.productId,
          type: 'return',
          quantity: item.quantity,
          direction: 'in',
          sourceType: 'return',
          sourceId: returnId,
          invoiceId: payload.invoiceId,
          reason: `إرجاع من فاتورة #${payload.invoiceId} (مرتجع #${returnNumber})`,
          createdBy: payload.userId,
          date: now,
        }).run();


        // Compatibility Update: stockHistory
        tx.insert(schema.stockHistory).values({
          productId: item.productId,
          change: item.quantity,
          reason: `مرتجع مبيعات #${returnNumber}`,
        }).run();

        // Update product stock
        tx.update(schema.products)
          .set({ 
            stock: sql`${schema.products.stock} + ${item.quantity}`,
            updatedAt: now
          })
          .where(eq(schema.products.id, item.productId))
          .run();
      }

      // 5. Update Invoice Status based on Aggregate Remaining Quantity
      const aggResults = tx.select({
        totalReturnable: sql<number>`SUM(${schema.invoiceItems.returnableQuantity})`
      })
      .from(schema.invoiceItems)
      .where(eq(schema.invoiceItems.invoiceId, payload.invoiceId))
      .all();

      const remainingItems = aggResults[0];

      const newStatus = Number(remainingItems.totalReturnable) === 0 ? 'returned' : 'partially_returned';

      tx.update(schema.invoices)
        .set({ 
          status: newStatus,
          updatedAt: now 
        })
        .where(eq(schema.invoices.id, payload.invoiceId))
        .run();

      return { id: returnId, returnNumber };
    });
  });

  // Get all returns with basic info
  ipcMain.handle('returns:getAll', async (_event, filters?: { 
    startDate?: string; 
    endDate?: string; 
    status?: string;
    customerId?: number;
  }) => {
    let query = db.select({
      id: schema.salesReturns.id,
      returnNumber: schema.salesReturns.returnNumber,
      invoiceId: schema.salesReturns.invoiceId,
      invoiceNumber: schema.invoices.invoiceNumber,
      customerName: schema.customers.name,
      totalRefunded: schema.salesReturns.totalRefunded,
      status: schema.salesReturns.status,
      date: schema.salesReturns.date,
      reason: schema.salesReturns.reason,
    })
    .from(schema.salesReturns)
    .leftJoin(schema.invoices, eq(schema.salesReturns.invoiceId, schema.invoices.id))
    .leftJoin(schema.customers, eq(schema.salesReturns.customerId, schema.customers.id));

    // Apply filters if needed (simple implementation)
    const results = await query.orderBy(desc(schema.salesReturns.date)).all();
    return results;
  });

  // Get a single return with items
  ipcMain.handle('returns:getOne', async (_event, id: number) => {
    const returnData = await db.select()
      .from(schema.salesReturns)
      .where(eq(schema.salesReturns.id, id))
      .all()[0];
    
    if (!returnData) return null;

    const items = await db.select({
      id: schema.salesReturnItems.id,
      productId: schema.salesReturnItems.productId,
      productName: schema.products.name,
      quantity: schema.salesReturnItems.quantity,
      unitPrice: schema.salesReturnItems.unitPriceAtSale,
      lineTotal: schema.salesReturnItems.lineTotal,
    })
    .from(schema.salesReturnItems)
    .leftJoin(schema.products, eq(schema.salesReturnItems.productId, schema.products.id))
    .where(eq(schema.salesReturnItems.salesReturnId, id))
    .all();

    return { ...returnData, items };
  });

  // Get items of an invoice that are eligible for return
  ipcMain.handle('returns:getReturnableInvoiceItems', async (_event, invoiceId: number) => {
    return await db.select({
      id: schema.invoiceItems.id,
      productId: schema.invoiceItems.productId,
      productName: schema.invoiceItems.productName,
      quantity: schema.invoiceItems.quantity,
      returnableQuantity: schema.invoiceItems.returnableQuantity,
      price: schema.invoiceItems.price,
    })
    .from(schema.invoiceItems)
    .where(and(
      eq(schema.invoiceItems.invoiceId, invoiceId),
      sql`${schema.invoiceItems.returnableQuantity} > 0`
    ))
    .all();
  });
}
