import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { join } from 'path';
import * as schema from './database/schema';
import bcrypt from 'bcryptjs';

const dbPath = join(process.cwd(), 'app.db');
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

export function initDb() {
  console.log('--- DATABASE INITIALIZATION (v1.0.1) ---');

  // Schema Fix: Drop old returns tables if they use the previous column names (total_amount vs total_refunded)
  try {
    const columns = sqlite.prepare("PRAGMA table_info(sales_returns)").all() as any[];
    if (columns.length > 0 && columns.some(c => c.name === 'total_amount')) {
      sqlite.exec("DROP TABLE IF EXISTS sales_return_items;");
      sqlite.exec("DROP TABLE IF EXISTS sales_returns;");
      console.log('Cleaned up legacy return tables for schema upgrade.');
    }
  } catch (e) {
    // Table might not exist yet, which is fine
  }

  // 1. Create Tables (New and Missing)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      is_deleted INTEGER DEFAULT 0,
      deleted_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      is_deleted INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sub_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      is_deleted INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      is_deleted INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      sku TEXT,
      barcode TEXT,
      price REAL NOT NULL,
      cost_price REAL,
      tax_rate REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      reorder_level INTEGER DEFAULT 5,
      unit_id INTEGER REFERENCES units(id),
      status TEXT DEFAULT 'active',
      category_id INTEGER REFERENCES categories(id),
      sub_category_id INTEGER REFERENCES sub_categories(id),
      brand_id INTEGER REFERENCES brands(id),
      image_url TEXT,
      is_deleted INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cash_shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      start_time TEXT NOT NULL,
      end_time TEXT,
      starting_cash REAL NOT NULL,
      ending_cash REAL,
      actual_cash REAL,
      status TEXT DEFAULT 'open'
    );
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      total_debt REAL DEFAULT 0,
      loyalty_points INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      is_deleted INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE NOT NULL,
      total REAL NOT NULL,
      total_discount REAL DEFAULT 0,
      total_tax REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      change_amount REAL DEFAULT 0,
      payment_status TEXT DEFAULT 'unpaid',
      status TEXT DEFAULT 'active',
      sale_type TEXT DEFAULT 'retail',
      date TEXT NOT NULL,
      customer_id INTEGER REFERENCES customers(id),
      customer_name TEXT,
      user_id INTEGER REFERENCES users(id),
      cash_shift_id INTEGER REFERENCES cash_shifts(id),
      is_deleted INTEGER DEFAULT 0,
      deleted_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      product_name TEXT,
      quantity INTEGER NOT NULL,
      returnable_quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      cost_price REAL,
      discount REAL DEFAULT 0,
      tax_rate REAL DEFAULT 0,
      line_total REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER REFERENCES invoices(id),
      purchase_order_id INTEGER REFERENCES purchase_orders(id),
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      date TEXT NOT NULL,
      reference_number TEXT,
      notes TEXT
    );
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id),
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      direction TEXT NOT NULL,
      reason TEXT,
      source_type TEXT,
      source_id INTEGER,
      invoice_id INTEGER,
      location_id INTEGER DEFAULT 1,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'draft',
      date TEXT NOT NULL,
      user_id INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      cost_price REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sales_returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_number TEXT UNIQUE NOT NULL,
      invoice_id INTEGER NOT NULL REFERENCES invoices(id),
      customer_id INTEGER REFERENCES customers(id),
      total_refunded REAL NOT NULL,
      status TEXT DEFAULT 'completed',
      reason TEXT,
      notes TEXT,
      date TEXT NOT NULL,
      user_id INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sales_return_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sales_return_id INTEGER NOT NULL REFERENCES sales_returns(id) ON DELETE CASCADE,
      invoice_item_id INTEGER NOT NULL REFERENCES invoice_items(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      unit_price_at_sale REAL NOT NULL,
      line_total REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      short_name TEXT,
      is_deleted INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS stock_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id),
      change_amount INTEGER NOT NULL,
      reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      action TEXT NOT NULL,
      target_table TEXT NOT NULL,
      target_id INTEGER,
      old_value TEXT,
      new_value TEXT,
      timestamp TEXT NOT NULL
    );
  `);

  // 2. Migration Helper
  const addColumn = (table: string, column: string, type: string) => {
    try {
      const info = sqlite.prepare(`PRAGMA table_info(${table})`).all();
      const exists = (info as any[]).some((c: any) => c.name === column);
      if (!exists) {
        sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type};`);
        console.log(`Added column ${column} to table ${table}`);
      }
    } catch (e) {
      console.error(`Error adding column ${column} to ${table}:`, e);
    }
  };

  // 3. Apply Migrations to Existing Tables
  const metadata = [
    ['is_deleted', 'INTEGER DEFAULT 0'],
    ['deleted_at', 'TEXT'],
    ['created_at', 'TEXT'],
    ['updated_at', 'TEXT']
  ];

  ['users', 'products', 'invoices'].forEach(t => metadata.forEach(m => addColumn(t, m[0], m[1])));
  ['categories', 'sub_categories', 'brands', 'customers', 'suppliers', 'purchase_orders', 'units'].forEach(t => {
    addColumn(t, 'is_deleted', 'INTEGER DEFAULT 0');
    addColumn(t, 'created_at', 'TEXT');
  });


  // Specific Columns
  addColumn('products', 'cost_price', 'REAL');
  addColumn('products', 'tax_rate', 'REAL DEFAULT 0');
  addColumn('products', 'discount', 'REAL DEFAULT 0');
  addColumn('products', 'reorder_level', 'INTEGER DEFAULT 5');
  addColumn('products', 'sub_category_id', 'INTEGER');
  addColumn('products', 'brand_id', 'INTEGER');
  addColumn('products', 'unit_id', 'INTEGER');
  
  addColumn('invoices', 'invoice_number', 'TEXT');
  addColumn('invoices', 'total', 'REAL NOT NULL DEFAULT 0');
  addColumn('invoices', 'date', 'TEXT');
  addColumn('invoices', 'customer_id', 'INTEGER');
  addColumn('invoices', 'customer_name', 'TEXT');


  addColumn('invoices', 'total_discount', 'REAL DEFAULT 0');
  addColumn('invoices', 'total_tax', 'REAL DEFAULT 0');
  addColumn('invoices', 'paid_amount', 'REAL DEFAULT 0');
  addColumn('invoices', 'change_amount', 'REAL DEFAULT 0');
  addColumn('invoices', 'payment_status', 'TEXT DEFAULT "unpaid"');
  addColumn('invoices', 'status', 'TEXT DEFAULT "active"');
  addColumn('invoices', 'sale_type', 'TEXT DEFAULT "retail"');
  addColumn('invoices', 'user_id', 'INTEGER');
  addColumn('invoices', 'cash_shift_id', 'INTEGER');

  addColumn('invoice_items', 'product_name', 'TEXT');
  addColumn('invoice_items', 'returnable_quantity', 'INTEGER DEFAULT 0');
  addColumn('invoice_items', 'cost_price', 'REAL');
  addColumn('invoice_items', 'discount', 'REAL DEFAULT 0');
  addColumn('invoice_items', 'tax_rate', 'REAL DEFAULT 0');
  addColumn('invoice_items', 'line_total', 'REAL DEFAULT 0');

  addColumn('sales_returns', 'return_number', 'TEXT');
  addColumn('sales_returns', 'total_refunded', 'REAL DEFAULT 0');
  addColumn('sales_returns', 'status', 'TEXT DEFAULT "completed"');
  addColumn('sales_returns', 'notes', 'TEXT');
  addColumn('sales_returns', 'customer_id', 'INTEGER');
  addColumn('sales_returns', 'created_at', 'TEXT');

  addColumn('sales_return_items', 'sales_return_id', 'INTEGER');
  addColumn('sales_return_items', 'unit_price_at_sale', 'REAL DEFAULT 0');
  addColumn('sales_return_items', 'line_total', 'REAL DEFAULT 0');

  addColumn('payments', 'reference_number', 'TEXT');
  addColumn('payments', 'notes', 'TEXT');

  addColumn('stock_movements', 'source_type', 'TEXT');
  addColumn('stock_movements', 'source_id', 'INTEGER');
  addColumn('stock_movements', 'invoice_id', 'INTEGER');
  addColumn('stock_movements', 'direction', 'TEXT');
  addColumn('stock_movements', 'location_id', 'INTEGER DEFAULT 1');
  addColumn('stock_movements', 'created_by', 'INTEGER');
  addColumn('stock_movements', 'created_at', 'TEXT');




  // 4. Indices
  const tryExec = (cmd: string) => { try { sqlite.exec(cmd); } catch (e) {} };
  tryExec("CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku);");
  tryExec("CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);");
  tryExec("CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);");
  tryExec("CREATE INDEX IF NOT EXISTS idx_customer_phone ON customers(phone);");
  tryExec("CREATE UNIQUE INDEX IF NOT EXISTS idx_invoice_number ON invoices(invoice_number);");
  tryExec("CREATE INDEX IF NOT EXISTS idx_invoice_date ON invoices(date);");
  tryExec("CREATE INDEX IF NOT EXISTS idx_stock_prod_id ON stock_movements(product_id);");
  tryExec("CREATE INDEX IF NOT EXISTS idx_stock_date ON stock_movements(date);");

  // 5. Seed default admin if no users exist
  const existingAdmin = sqlite.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('admin', 10);
    sqlite.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hashedPassword, 'admin');
    console.log('Seeded default admin user');
  }
}

export function saveDb() {}
