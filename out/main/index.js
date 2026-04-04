import { BrowserWindow, app, ipcMain, session, shell } from "electron";
import { join } from "path";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { and, desc, eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
// -- CommonJS Shims --
import __cjs_mod__ from "node:module";
import.meta.filename;
const __dirname = import.meta.dirname;
__cjs_mod__.createRequire(import.meta.url);
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region node_modules/@electron-toolkit/utils/dist/index.mjs
var is = { dev: !app.isPackaged };
var platform = {
	isWindows: process.platform === "win32",
	isMacOS: process.platform === "darwin",
	isLinux: process.platform === "linux"
};
var electronApp = {
	setAppUserModelId(id) {
		if (platform.isWindows) app.setAppUserModelId(is.dev ? process.execPath : id);
	},
	setAutoLaunch(auto) {
		if (platform.isLinux) return false;
		const isOpenAtLogin = () => {
			return app.getLoginItemSettings().openAtLogin;
		};
		if (isOpenAtLogin() !== auto) {
			app.setLoginItemSettings({ openAtLogin: auto });
			return isOpenAtLogin() === auto;
		} else return true;
	},
	skipProxy() {
		return session.defaultSession.setProxy({ mode: "direct" });
	}
};
var optimizer = {
	watchWindowShortcuts(window, shortcutOptions) {
		if (!window) return;
		const { webContents } = window;
		const { escToCloseWindow = false, zoom = false } = shortcutOptions || {};
		webContents.on("before-input-event", (event, input) => {
			if (input.type === "keyDown") {
				if (!is.dev) {
					if (input.code === "KeyR" && (input.control || input.meta)) event.preventDefault();
					if (input.code === "KeyI" && (input.alt && input.meta || input.control && input.shift)) event.preventDefault();
				} else if (input.code === "F12") if (webContents.isDevToolsOpened()) webContents.closeDevTools();
				else {
					webContents.openDevTools({ mode: "undocked" });
					console.log("Open dev tool...");
				}
				if (escToCloseWindow) {
					if (input.code === "Escape" && input.key !== "Process") {
						window.close();
						event.preventDefault();
					}
				}
				if (!zoom) {
					if (input.code === "Minus" && (input.control || input.meta)) event.preventDefault();
					if (input.code === "Equal" && input.shift && (input.control || input.meta)) event.preventDefault();
				}
			}
		});
	},
	registerFramelessWindowIpc() {
		ipcMain.on("win:invoke", (event, action) => {
			const win = BrowserWindow.fromWebContents(event.sender);
			if (win) {
				if (action === "show") win.show();
				else if (action === "showInactive") win.showInactive();
				else if (action === "min") win.minimize();
				else if (action === "max") if (win.isMaximized()) win.unmaximize();
				else win.maximize();
				else if (action === "close") win.close();
			}
		});
	}
};
//#endregion
//#region src/main/database/schema/System/users.ts
var users = sqliteTable("users", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	username: text("username").notNull().unique(),
	password: text("password").notNull(),
	role: text("role", { enum: ["admin", "user"] }).default("user"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
//#endregion
//#region src/main/database/schema/System/audit.ts
var auditLogs = sqliteTable("audit_logs", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	userId: integer("user_id").references(() => users.id),
	action: text("action").notNull(),
	entityType: text("entity_type").notNull(),
	entityId: integer("entity_id"),
	oldValue: text("old_value"),
	newValue: text("new_value"),
	timestamp: text("timestamp").default(sql`CURRENT_TIMESTAMP`)
});
//#endregion
//#region src/main/database/schema/Inventory/categories.ts
var categories = sqliteTable("categories", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull().unique(),
	isDeleted: integer("is_deleted").default(0),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
//#endregion
//#region src/main/database/schema/Inventory/subCategories.ts
var subCategories = sqliteTable("sub_categories", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	categoryId: integer("category_id").notNull().references(() => categories.id),
	isDeleted: integer("is_deleted").default(0),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
//#endregion
//#region src/main/database/schema/Inventory/brands.ts
var brands = sqliteTable("brands", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull().unique(),
	isDeleted: integer("is_deleted").default(0),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
//#endregion
//#region src/main/database/schema/Inventory/units.ts
var units = sqliteTable("units", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull().unique(),
	shortName: text("short_name"),
	isDeleted: integer("is_deleted").default(0),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
//#endregion
//#region src/main/database/schema/Inventory/products.ts
var products = sqliteTable("products", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	description: text("description"),
	sku: text("sku"),
	barcode: text("barcode"),
	price: real("price").notNull(),
	costPrice: real("cost_price"),
	taxRate: real("tax_rate").default(0),
	discount: real("discount").default(0),
	stock: integer("stock").notNull().default(0),
	reorderLevel: integer("reorder_level").default(5),
	unitId: integer("unit_id").references(() => units.id),
	status: text("status", { enum: ["active", "inactive"] }).default("active"),
	categoryId: integer("category_id").references(() => categories.id),
	subCategoryId: integer("sub_category_id").references(() => subCategories.id),
	brandId: integer("brand_id").references(() => brands.id),
	imageUrl: text("image_url"),
	isDeleted: integer("is_deleted").default(0),
	deletedAt: text("deleted_at"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
	skuIdx: uniqueIndex("sku_idx").on(table.sku),
	barcodeIdx: index("barcode_idx").on(table.barcode),
	nameIdx: index("product_name_idx").on(table.name)
}));
var stockHistory = sqliteTable("stock_history", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	productId: integer("product_id").notNull().references(() => products.id),
	change: integer("change_amount").notNull(),
	reason: text("reason"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
//#endregion
//#region src/main/database/schema/Inventory/inventory.ts
var inventoryAdjustments = sqliteTable("inventory_adjustments", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	productId: integer("product_id").notNull().references(() => products.id),
	type: text("type", { enum: [
		"addition",
		"reduction",
		"set"
	] }).notNull(),
	quantity: integer("quantity").notNull(),
	reason: text("reason"),
	date: text("date").notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var inventoryAudit = sqliteTable("inventory_audit", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	productId: integer("product_id").notNull().references(() => products.id),
	oldStock: integer("old_stock").notNull(),
	newStock: integer("new_stock").notNull(),
	reason: text("reason"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var stockMovements = sqliteTable("stock_movements", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	productId: integer("product_id").notNull().references(() => products.id),
	type: text("type", { enum: [
		"in",
		"out",
		"adjustment",
		"return",
		"sale",
		"purchase",
		"transfer"
	] }).notNull(),
	quantity: integer("quantity").notNull(),
	direction: text("direction", { enum: ["in", "out"] }).notNull(),
	sourceType: text("source_type").notNull(),
	sourceId: integer("source_id"),
	invoiceId: integer("invoice_id"),
	reason: text("reason"),
	locationId: integer("location_id").default(1),
	createdBy: integer("created_by"),
	date: text("date").notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
//#endregion
//#region src/main/database/schema/CRM/customers.ts
var customers = sqliteTable("customers", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	phone: text("phone"),
	email: text("email"),
	address: text("address"),
	totalDebt: real("total_debt").default(0),
	loyaltyPoints: integer("loyalty_points").default(0),
	isDeleted: integer("is_deleted").default(0),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({ phoneIdx: index("customer_phone_idx").on(table.phone) }));
//#endregion
//#region src/main/database/schema/CRM/suppliers.ts
var suppliers = sqliteTable("suppliers", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	contactPerson: text("contact_person"),
	phone: text("phone"),
	email: text("email"),
	address: text("address"),
	isDeleted: integer("is_deleted").default(0),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
//#endregion
//#region src/main/database/schema/Financials/cashShifts.ts
var cashShifts = sqliteTable("cash_shifts", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	userId: integer("user_id").notNull().references(() => users.id),
	startTime: text("start_time").notNull(),
	endTime: text("end_time"),
	startingCash: real("starting_cash").notNull(),
	endingCash: real("ending_cash"),
	actualCash: real("actual_cash"),
	status: text("status", { enum: ["open", "closed"] }).default("open")
});
//#endregion
//#region src/main/database/schema/Financials/invoices.ts
var invoices = sqliteTable("invoices", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	invoiceNumber: text("invoice_number").unique().notNull(),
	total: real("total_amount").notNull(),
	totalDiscount: real("total_discount").default(0),
	totalTax: real("total_tax").default(0),
	paidAmount: real("paid_amount").default(0),
	changeAmount: real("change_amount").default(0),
	paymentStatus: text("payment_status", { enum: [
		"unpaid",
		"partially_paid",
		"paid",
		"refunded"
	] }).default("unpaid"),
	status: text("status", { enum: [
		"active",
		"cancelled",
		"returned",
		"partially_returned"
	] }).default("active"),
	saleType: text("sale_type", { enum: ["retail", "wholesale"] }).default("retail"),
	date: text("date").notNull(),
	customerId: integer("customer_id").references(() => customers.id),
	customerName: text("customer_name"),
	userId: integer("user_id").references(() => users.id),
	cashShiftId: integer("cash_shift_id").references(() => cashShifts.id),
	isDeleted: integer("is_deleted").default(0),
	deletedAt: text("deleted_at"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
	invNumIdx: uniqueIndex("invoice_num_idx").on(table.invoiceNumber),
	dateIdx: index("invoice_date_idx").on(table.date)
}));
//#endregion
//#region src/main/database/schema/Financials/invoiceItems.ts
var invoiceItems = sqliteTable("invoice_items", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	invoiceId: integer("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
	productId: integer("product_id").references(() => products.id),
	productName: text("product_name"),
	quantity: integer("quantity").notNull(),
	returnableQuantity: integer("returnable_quantity").notNull(),
	price: real("price").notNull(),
	costPrice: real("cost_price"),
	discount: real("discount").default(0),
	taxRate: real("tax_rate").default(0),
	lineTotal: real("line_total").notNull()
});
//#endregion
//#region src/main/database/schema/Financials/purchaseOrders.ts
var purchaseOrders = sqliteTable("purchase_orders", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
	totalAmount: real("total_amount").notNull(),
	status: text("status", { enum: [
		"draft",
		"ordered",
		"received",
		"cancelled"
	] }).default("draft"),
	date: text("date").notNull(),
	userId: integer("user_id").references(() => users.id),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
//#endregion
//#region src/main/database/schema/Financials/purchaseOrderItems.ts
var purchaseOrderItems = sqliteTable("purchase_order_items", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	purchaseOrderId: integer("purchase_order_id").notNull().references(() => purchaseOrders.id, { onDelete: "cascade" }),
	productId: integer("product_id").notNull().references(() => products.id),
	quantity: integer("quantity").notNull(),
	costPrice: real("cost_price").notNull()
});
//#endregion
//#region src/main/database/schema/Financials/payments.ts
var payments = sqliteTable("payments", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	invoiceId: integer("invoice_id").references(() => invoices.id),
	purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id),
	amount: real("amount").notNull(),
	method: text("method", { enum: [
		"cash",
		"card",
		"transfer",
		"credit"
	] }).notNull(),
	date: text("date").notNull(),
	referenceNumber: text("reference_number"),
	notes: text("notes")
});
//#endregion
//#region src/main/database/schema/Financials/returns.ts
var salesReturns = sqliteTable("sales_returns", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	returnNumber: text("return_number").unique().notNull(),
	invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
	customerId: integer("customer_id").references(() => customers.id),
	totalRefunded: real("total_refunded").notNull(),
	status: text("status", { enum: [
		"draft",
		"completed",
		"cancelled"
	] }).default("completed"),
	reason: text("reason"),
	notes: text("notes"),
	date: text("date").notNull(),
	userId: integer("user_id").references(() => users.id),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var salesReturnItems = sqliteTable("sales_return_items", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	salesReturnId: integer("sales_return_id").notNull().references(() => salesReturns.id, { onDelete: "cascade" }),
	invoiceItemId: integer("invoice_item_id").notNull().references(() => invoiceItems.id),
	productId: integer("product_id").notNull().references(() => products.id),
	quantity: integer("quantity").notNull(),
	unitPriceAtSale: real("unit_price_at_sale").notNull(),
	lineTotal: real("line_total").notNull()
});
//#endregion
//#region src/main/database/schema.ts
var schema_exports = /* @__PURE__ */ __exportAll({
	auditLogs: () => auditLogs,
	brands: () => brands,
	cashShifts: () => cashShifts,
	categories: () => categories,
	customers: () => customers,
	inventoryAdjustments: () => inventoryAdjustments,
	inventoryAudit: () => inventoryAudit,
	invoiceItems: () => invoiceItems,
	invoices: () => invoices,
	payments: () => payments,
	products: () => products,
	purchaseOrderItems: () => purchaseOrderItems,
	purchaseOrders: () => purchaseOrders,
	salesReturnItems: () => salesReturnItems,
	salesReturns: () => salesReturns,
	stockHistory: () => stockHistory,
	stockMovements: () => stockMovements,
	subCategories: () => subCategories,
	suppliers: () => suppliers,
	units: () => units,
	users: () => users
});
//#endregion
//#region src/main/db.ts
var sqlite = new Database(join(process.cwd(), "app.db"));
var db = drizzle(sqlite, { schema: schema_exports });
function initDb() {
	console.log("--- DATABASE INITIALIZATION (v1.0.1) ---");
	try {
		const columns = sqlite.prepare("PRAGMA table_info(sales_returns)").all();
		if (columns.length > 0 && columns.some((c) => c.name === "total_amount")) {
			sqlite.exec("DROP TABLE IF EXISTS sales_return_items;");
			sqlite.exec("DROP TABLE IF EXISTS sales_returns;");
			console.log("Cleaned up legacy return tables for schema upgrade.");
		}
	} catch (e) {}
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
	const addColumn = (table, column, type) => {
		try {
			if (!sqlite.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === column)) {
				sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type};`);
				console.log(`Added column ${column} to table ${table}`);
			}
		} catch (e) {
			console.error(`Error adding column ${column} to ${table}:`, e);
		}
	};
	const metadata = [
		["is_deleted", "INTEGER DEFAULT 0"],
		["deleted_at", "TEXT"],
		["created_at", "TEXT"],
		["updated_at", "TEXT"]
	];
	[
		"users",
		"products",
		"invoices"
	].forEach((t) => metadata.forEach((m) => addColumn(t, m[0], m[1])));
	[
		"categories",
		"sub_categories",
		"brands",
		"customers",
		"suppliers",
		"purchase_orders",
		"units"
	].forEach((t) => {
		addColumn(t, "is_deleted", "INTEGER DEFAULT 0");
		addColumn(t, "created_at", "TEXT");
	});
	addColumn("products", "cost_price", "REAL");
	addColumn("products", "tax_rate", "REAL DEFAULT 0");
	addColumn("products", "discount", "REAL DEFAULT 0");
	addColumn("products", "reorder_level", "INTEGER DEFAULT 5");
	addColumn("products", "sub_category_id", "INTEGER");
	addColumn("products", "brand_id", "INTEGER");
	addColumn("products", "unit_id", "INTEGER");
	addColumn("invoices", "invoice_number", "TEXT");
	addColumn("invoices", "total", "REAL NOT NULL DEFAULT 0");
	addColumn("invoices", "date", "TEXT");
	addColumn("invoices", "customer_id", "INTEGER");
	addColumn("invoices", "customer_name", "TEXT");
	addColumn("invoices", "total_discount", "REAL DEFAULT 0");
	addColumn("invoices", "total_tax", "REAL DEFAULT 0");
	addColumn("invoices", "paid_amount", "REAL DEFAULT 0");
	addColumn("invoices", "change_amount", "REAL DEFAULT 0");
	addColumn("invoices", "payment_status", "TEXT DEFAULT \"unpaid\"");
	addColumn("invoices", "status", "TEXT DEFAULT \"active\"");
	addColumn("invoices", "sale_type", "TEXT DEFAULT \"retail\"");
	addColumn("invoices", "user_id", "INTEGER");
	addColumn("invoices", "cash_shift_id", "INTEGER");
	addColumn("invoice_items", "product_name", "TEXT");
	addColumn("invoice_items", "returnable_quantity", "INTEGER DEFAULT 0");
	addColumn("invoice_items", "cost_price", "REAL");
	addColumn("invoice_items", "discount", "REAL DEFAULT 0");
	addColumn("invoice_items", "tax_rate", "REAL DEFAULT 0");
	addColumn("invoice_items", "line_total", "REAL DEFAULT 0");
	addColumn("sales_returns", "return_number", "TEXT");
	addColumn("sales_returns", "total_refunded", "REAL DEFAULT 0");
	addColumn("sales_returns", "status", "TEXT DEFAULT \"completed\"");
	addColumn("sales_returns", "notes", "TEXT");
	addColumn("sales_returns", "customer_id", "INTEGER");
	addColumn("sales_returns", "created_at", "TEXT");
	addColumn("sales_return_items", "sales_return_id", "INTEGER");
	addColumn("sales_return_items", "unit_price_at_sale", "REAL DEFAULT 0");
	addColumn("sales_return_items", "line_total", "REAL DEFAULT 0");
	addColumn("payments", "reference_number", "TEXT");
	addColumn("payments", "notes", "TEXT");
	addColumn("stock_movements", "source_type", "TEXT");
	addColumn("stock_movements", "source_id", "INTEGER");
	addColumn("stock_movements", "invoice_id", "INTEGER");
	addColumn("stock_movements", "direction", "TEXT");
	addColumn("stock_movements", "location_id", "INTEGER DEFAULT 1");
	addColumn("stock_movements", "created_by", "INTEGER");
	addColumn("stock_movements", "created_at", "TEXT");
	const tryExec = (cmd) => {
		try {
			sqlite.exec(cmd);
		} catch (e) {}
	};
	tryExec("CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku);");
	tryExec("CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);");
	tryExec("CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);");
	tryExec("CREATE INDEX IF NOT EXISTS idx_customer_phone ON customers(phone);");
	tryExec("CREATE UNIQUE INDEX IF NOT EXISTS idx_invoice_number ON invoices(invoice_number);");
	tryExec("CREATE INDEX IF NOT EXISTS idx_invoice_date ON invoices(date);");
	tryExec("CREATE INDEX IF NOT EXISTS idx_stock_prod_id ON stock_movements(product_id);");
	tryExec("CREATE INDEX IF NOT EXISTS idx_stock_date ON stock_movements(date);");
	if (!sqlite.prepare("SELECT id FROM users WHERE username = ?").get("admin")) {
		const hashedPassword = bcrypt.hashSync("admin", 10);
		sqlite.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", hashedPassword, "admin");
		console.log("Seeded default admin user");
	}
}
//#endregion
//#region src/main/ipc/products.ts
function registerProductsIpc() {
	ipcMain.handle("products:getAll", async () => {
		return await db.select().from(products).where(eq(products.isDeleted, 0)).orderBy(desc(products.id)).all();
	});
	ipcMain.handle("products:getNextSku", async () => {
		try {
			const lastProduct = (await db.select({ sku: products.sku }).from(products).orderBy(desc(products.id)).limit(1).all())[0];
			if (!lastProduct || !lastProduct.sku) return "SKU-1001";
			const match = lastProduct.sku.match(/SKU-(\d+)/);
			if (match) return `SKU-${parseInt(match[1]) + 1}`;
			return "SKU-1001";
		} catch (err) {
			console.error("Error in products:getNextSku:", err);
			return "SKU-1001";
		}
	});
	ipcMain.handle("products:create", async (_event, payload) => {
		try {
			const now = (/* @__PURE__ */ new Date()).toISOString();
			const result = await db.insert(products).values({
				...payload,
				isDeleted: 0,
				createdAt: now,
				updatedAt: now
			}).run();
			const productId = Number(result.lastInsertRowid);
			if (payload.stock && payload.stock > 0) await db.insert(stockMovements).values({
				productId,
				type: "adjustment",
				direction: "in",
				quantity: payload.stock,
				reason: "رصيد أول المدة (إضافة منتج جديد)",
				sourceType: "manual",
				createdAt: now,
				date: now
			}).run();
			return { id: productId };
		} catch (err) {
			console.error("Error in products:create:", err);
			throw new Error(err.message || "حدث خطأ أثناء إنشاء المنتج");
		}
	});
	ipcMain.handle("products:delete", async (_event, id) => {
		try {
			const now = (/* @__PURE__ */ new Date()).toISOString();
			await db.update(products).set({
				isDeleted: 1,
				deletedAt: now,
				updatedAt: now
			}).where(eq(products.id, id)).run();
			return { deleted: true };
		} catch (err) {
			console.error("Error in products:delete:", err);
			throw err;
		}
	});
	ipcMain.handle("products:update", async (_event, payload) => {
		try {
			const { id, ...data } = payload;
			const now = (/* @__PURE__ */ new Date()).toISOString();
			if (data.stock !== void 0) {
				const existing = await db.select().from(products).where(eq(products.id, id)).all()[0];
				if (existing && existing.stock !== data.stock) {
					const diff = data.stock - existing.stock;
					await db.insert(stockMovements).values({
						productId: id,
						type: "adjustment",
						direction: diff > 0 ? "in" : "out",
						quantity: Math.abs(diff),
						reason: "تعديل يدوي من صفحة المنتجات",
						sourceType: "adjustment",
						createdAt: now,
						date: now
					}).run();
				}
			}
			await db.update(products).set({
				...data,
				updatedAt: now
			}).where(eq(products.id, id)).run();
			return { updated: true };
		} catch (err) {
			console.error("Error in products:update:", err);
			throw err;
		}
	});
	ipcMain.handle("products:getStockHistory", async (_event, productId) => {
		try {
			return await db.select().from(stockMovements).where(eq(stockMovements.productId, productId)).orderBy(desc(stockMovements.createdAt)).all();
		} catch (err) {
			console.error("Error in products:getStockHistory:", err);
			throw err;
		}
	});
}
//#endregion
//#region src/main/ipc/users.ts
function registerUsersIpc() {
	ipcMain.handle("users:getAll", async () => {
		return await db.select().from(users).orderBy(desc(users.id)).all();
	});
	ipcMain.handle("users:create", async (_event, payload) => {
		const passwordToHash = payload.password || "123456";
		const hashedPassword = bcrypt.hashSync(passwordToHash, 10);
		return { id: (await db.insert(users).values({
			username: payload.username,
			password: hashedPassword,
			role: payload.role || "user"
		}).run()).lastInsertRowid };
	});
	ipcMain.handle("users:delete", async (_event, id) => {
		await db.delete(users).where(eq(users.id, id)).run();
		return { deleted: true };
	});
}
//#endregion
//#region src/main/ipc/invoices.ts
async function generateInvoiceNumber() {
	const dateStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
	const latest = await db.select({ num: invoices.invoiceNumber }).from(invoices).where(sql`SUBSTR(${invoices.invoiceNumber}, 5, 8) = ${dateStr}`).orderBy(desc(invoices.id)).limit(1).all();
	let count = "0001";
	if (latest.length > 0 && latest[0].num) count = (parseInt(latest[0].num.slice(-4)) + 1).toString().padStart(4, "0");
	return `INV-${dateStr}-${count}`;
}
function registerInvoicesIpc() {
	ipcMain.handle("invoices:create", async (_event, payload) => {
		try {
			const invNumber = await generateInvoiceNumber();
			const now = (/* @__PURE__ */ new Date()).toISOString();
			const invoiceResult = await db.insert(invoices).values({
				invoiceNumber: invNumber,
				total: payload.total,
				totalDiscount: payload.totalDiscount || 0,
				totalTax: payload.totalTax || 0,
				paidAmount: payload.paidAmount || payload.total,
				changeAmount: payload.changeAmount || 0,
				paymentStatus: (payload.paidAmount || payload.total) >= payload.total ? "paid" : "partially_paid",
				status: "active",
				date: now,
				customerName: payload.customerName || "عام",
				customerId: payload.customerId,
				userId: payload.userId,
				cashShiftId: payload.cashShiftId,
				createdAt: now,
				updatedAt: now
			}).run();
			const invoiceId = Number(invoiceResult.lastInsertRowid);
			if (payload.paidAmount && payload.paidAmount > 0) await db.insert(payments).values({
				invoiceId,
				amount: payload.paidAmount,
				method: payload.paymentMethod || "cash",
				date: now
			}).run();
			for (const item of payload.items) {
				const productId = item.id || item.product_id;
				const product = (await db.select().from(products).where(eq(products.id, productId)).all())[0];
				await db.insert(invoiceItems).values({
					invoiceId,
					productId,
					productName: product?.name || item.name,
					quantity: item.quantity,
					returnableQuantity: item.quantity,
					price: item.price,
					costPrice: product?.costPrice || 0,
					discount: item.discount || 0,
					taxRate: product?.taxRate || 0,
					lineTotal: item.price * item.quantity - (item.discount || 0)
				}).run();
				await db.update(products).set({
					stock: sql`${products.stock} - ${item.quantity}`,
					updatedAt: now
				}).where(eq(products.id, productId)).run();
				await db.insert(stockMovements).values({
					productId,
					type: "out",
					quantity: item.quantity,
					direction: "out",
					sourceType: "sale",
					sourceId: invoiceId,
					invoiceId,
					reason: `بيع بالفاتورة #${invNumber}`,
					createdBy: payload.userId,
					date: now
				}).run();
			}
			return {
				id: invoiceId,
				invoiceNumber: invNumber
			};
		} catch (err) {
			console.error("[Invoice Create Error]:", err);
			throw err;
		}
	});
	ipcMain.handle("invoices:getByNumber", async (_event, invoiceNumber) => {
		return (await db.select().from(invoices).where(eq(invoices.invoiceNumber, invoiceNumber)).all())[0] || null;
	});
	ipcMain.handle("invoices:getAll", async () => {
		return await db.select().from(invoices).where(eq(invoices.isDeleted, 0)).orderBy(desc(invoices.id)).all();
	});
	ipcMain.handle("invoices:getById", async (_event, id) => {
		const invoice = (await db.select().from(invoices).where(eq(invoices.id, id)).all())[0];
		const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id)).all();
		const paymentsArr = await db.select().from(payments).where(eq(payments.invoiceId, id)).all();
		return {
			...invoice,
			items,
			payments: paymentsArr
		};
	});
}
//#endregion
//#region src/main/ipc/auth.ts
function registerAuthIpc() {
	ipcMain.handle("auth:login", async (_event, { username, password }) => {
		const results = await db.select().from(users).where(eq(users.username, username)).all();
		if (results.length === 0) throw new Error("بيانات الدخول غير صحيحة");
		const user = results[0];
		if (!bcrypt.compareSync(password, user.password)) throw new Error("بيانات الدخول غير صحيحة");
		const { password: _, ...userWithoutPassword } = user;
		return userWithoutPassword;
	});
}
//#endregion
//#region src/main/ipc/categories.ts
function registerCategoriesIpc() {
	ipcMain.handle("categories:getAll", async () => {
		return await db.select().from(categories).where(eq(categories.isDeleted, 0)).all();
	});
	ipcMain.handle("categories:create", async (_event, data) => {
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const result = await db.insert(categories).values({
			name: data.name,
			isDeleted: 0,
			createdAt: now
		}).run();
		return { id: Number(result.lastInsertRowid) };
	});
	ipcMain.handle("categories:delete", async (_event, id) => {
		await db.update(categories).set({ isDeleted: 1 }).where(eq(categories.id, id)).run();
		return { deleted: true };
	});
	ipcMain.handle("categories:update", async (_event, data) => {
		await db.update(categories).set({ name: data.name }).where(eq(categories.id, data.id)).run();
		return { updated: true };
	});
}
//#endregion
//#region src/main/ipc/subCategories.ts
function registerSubCategoriesIpc() {
	ipcMain.handle("subCategories:getAll", async () => {
		return await db.select().from(subCategories).where(eq(subCategories.isDeleted, 0)).all();
	});
	ipcMain.handle("subCategories:create", async (_event, data) => {
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const result = await db.insert(subCategories).values({
			name: data.name,
			categoryId: data.categoryId,
			isDeleted: 0,
			createdAt: now
		}).run();
		return { id: Number(result.lastInsertRowid) };
	});
	ipcMain.handle("subCategories:delete", async (_event, id) => {
		await db.update(subCategories).set({ isDeleted: 1 }).where(eq(subCategories.id, id)).run();
		return { deleted: true };
	});
	ipcMain.handle("subCategories:getByCategory", async (_event, categoryId) => {
		return await db.select().from(subCategories).where(and(eq(subCategories.categoryId, categoryId), eq(subCategories.isDeleted, 0))).all();
	});
}
//#endregion
//#region src/main/ipc/brands.ts
function registerBrandsIpc() {
	ipcMain.handle("brands:getAll", async () => {
		return await db.select().from(brands).where(eq(brands.isDeleted, 0)).all();
	});
	ipcMain.handle("brands:create", async (_event, name) => {
		try {
			const now = (/* @__PURE__ */ new Date()).toISOString();
			const result = await db.insert(brands).values({
				name,
				isDeleted: 0,
				createdAt: now
			}).run();
			return { id: Number(result.lastInsertRowid) };
		} catch (err) {
			console.error("Error in brands:create:", err);
			throw err;
		}
	});
	ipcMain.handle("brands:delete", async (_event, id) => {
		try {
			await db.update(brands).set({ isDeleted: 1 }).where(eq(brands.id, id)).run();
			return { deleted: true };
		} catch (err) {
			console.error("Error in brands:delete:", err);
			throw err;
		}
	});
	ipcMain.handle("brands:update", async (_event, { id, name }) => {
		try {
			await db.update(brands).set({ name }).where(eq(brands.id, id)).run();
			return { updated: true };
		} catch (err) {
			console.error("Error in brands:update:", err);
			throw err;
		}
	});
}
//#endregion
//#region src/main/ipc/units.ts
function registerUnitsIpc() {
	ipcMain.handle("units:getAll", async () => {
		return await db.select().from(units).where(eq(units.isDeleted, 0));
	});
	ipcMain.handle("units:create", async (_, data) => {
		const [result] = await db.insert(units).values(data).returning({ id: units.id });
		return result;
	});
	ipcMain.handle("units:delete", async (_, id) => {
		await db.update(units).set({ isDeleted: 1 }).where(eq(units.id, id));
		return { deleted: true };
	});
}
//#endregion
//#region src/main/ipc/customers.ts
function registerCustomersIpc() {
	ipcMain.handle("customers:getAll", async () => {
		try {
			return await db.select().from(customers).where(eq(customers.isDeleted, 0)).orderBy(desc(customers.id)).all();
		} catch (err) {
			console.error("Error in customers:getAll:", err);
			throw err;
		}
	});
	ipcMain.handle("customers:create", async (_event, payload) => {
		try {
			const now = (/* @__PURE__ */ new Date()).toISOString();
			const result = await db.insert(customers).values({
				...payload,
				isDeleted: 0,
				createdAt: now
			}).run();
			return { id: Number(result.lastInsertRowid) };
		} catch (err) {
			console.error("Error in customers:create:", err);
			throw err;
		}
	});
	ipcMain.handle("customers:update", async (_event, payload) => {
		try {
			const { id, ...data } = payload;
			await db.update(customers).set(data).where(eq(customers.id, id)).run();
			return { updated: true };
		} catch (err) {
			console.error("Error in customers:update:", err);
			throw err;
		}
	});
	ipcMain.handle("customers:delete", async (_event, id) => {
		try {
			await db.update(customers).set({ isDeleted: 1 }).where(eq(customers.id, id)).run();
			return { deleted: true };
		} catch (err) {
			console.error("Error in customers:delete:", err);
			throw err;
		}
	});
}
//#endregion
//#region src/main/ipc/suppliers.ts
function registerSuppliersIpc() {
	ipcMain.handle("suppliers:getAll", async () => {
		try {
			return await db.select().from(suppliers).where(eq(suppliers.isDeleted, 0)).orderBy(desc(suppliers.id)).all();
		} catch (err) {
			console.error("Error in suppliers:getAll:", err);
			throw err;
		}
	});
	ipcMain.handle("suppliers:create", async (_event, payload) => {
		try {
			const now = (/* @__PURE__ */ new Date()).toISOString();
			const result = await db.insert(suppliers).values({
				...payload,
				isDeleted: 0,
				createdAt: now
			}).run();
			return { id: Number(result.lastInsertRowid) };
		} catch (err) {
			console.error("Error in suppliers:create:", err);
			throw err;
		}
	});
	ipcMain.handle("suppliers:update", async (_event, payload) => {
		try {
			const { id, ...data } = payload;
			await db.update(suppliers).set(data).where(eq(suppliers.id, id)).run();
			return { updated: true };
		} catch (err) {
			console.error("Error in suppliers:update:", err);
			throw err;
		}
	});
	ipcMain.handle("suppliers:delete", async (_event, id) => {
		try {
			await db.update(suppliers).set({ isDeleted: 1 }).where(eq(suppliers.id, id)).run();
			return { deleted: true };
		} catch (err) {
			console.error("Error in suppliers:delete:", err);
			throw err;
		}
	});
}
//#endregion
//#region src/main/ipc/returns.ts
function registerReturnsIpc() {
	ipcMain.handle("returns:create", async (_event, payload) => {
		return db.transaction((tx) => {
			const now = (/* @__PURE__ */ new Date()).toISOString();
			const dateStr = now.split("T")[0].replace(/-/g, "");
			const lastReturn = tx.select().from(salesReturns).where(sql`date(date) = date(${now})`).orderBy(desc(salesReturns.id)).limit(1).all();
			const returnNumber = `SR-${dateStr}-${lastReturn.length > 0 ? (parseInt(lastReturn[0].returnNumber.split("-").pop() || "0") + 1).toString().padStart(3, "0") : "001"}`;
			const totalRefund = payload.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
			const returnResult = tx.insert(salesReturns).values({
				returnNumber,
				invoiceId: payload.invoiceId,
				customerId: payload.customerId,
				totalRefunded: totalRefund,
				reason: payload.reason,
				notes: payload.notes,
				userId: payload.userId,
				status: "completed",
				date: now
			}).run();
			const returnId = Number(returnResult.lastInsertRowid);
			for (const item of payload.items) {
				const invItem = tx.select().from(invoiceItems).where(eq(invoiceItems.id, item.invoiceItemId)).all()[0];
				if (!invItem) throw new Error(`لم يتم العثور على بند الفاتورة #${item.invoiceItemId}`);
				if (invItem.returnableQuantity < item.quantity) throw new Error(`الكمية المرتجعة (${item.quantity}) أكبر من الكمية المتاحة للإرجاع (${invItem.returnableQuantity}) للمنتج: ${invItem.productName}`);
				const lineTotal = item.unitPrice * item.quantity;
				tx.insert(salesReturnItems).values({
					salesReturnId: returnId,
					invoiceItemId: item.invoiceItemId,
					productId: item.productId,
					quantity: item.quantity,
					unitPriceAtSale: item.unitPrice,
					lineTotal
				}).run();
				tx.update(invoiceItems).set({ returnableQuantity: invItem.returnableQuantity - item.quantity }).where(eq(invoiceItems.id, item.invoiceItemId)).run();
				tx.insert(stockMovements).values({
					productId: item.productId,
					type: "return",
					quantity: item.quantity,
					direction: "in",
					sourceType: "return",
					sourceId: returnId,
					invoiceId: payload.invoiceId,
					reason: `إرجاع من فاتورة #${payload.invoiceId} (مرتجع #${returnNumber})`,
					createdBy: payload.userId,
					date: now
				}).run();
				tx.insert(stockHistory).values({
					productId: item.productId,
					change: item.quantity,
					reason: `مرتجع مبيعات #${returnNumber}`
				}).run();
				tx.update(products).set({
					stock: sql`${products.stock} + ${item.quantity}`,
					updatedAt: now
				}).where(eq(products.id, item.productId)).run();
			}
			const remainingItems = tx.select({ totalReturnable: sql`SUM(${invoiceItems.returnableQuantity})` }).from(invoiceItems).where(eq(invoiceItems.invoiceId, payload.invoiceId)).all()[0];
			const newStatus = Number(remainingItems.totalReturnable) === 0 ? "returned" : "partially_returned";
			tx.update(invoices).set({
				status: newStatus,
				updatedAt: now
			}).where(eq(invoices.id, payload.invoiceId)).run();
			return {
				id: returnId,
				returnNumber
			};
		});
	});
	ipcMain.handle("returns:getAll", async (_event, filters) => {
		return await db.select({
			id: salesReturns.id,
			returnNumber: salesReturns.returnNumber,
			invoiceId: salesReturns.invoiceId,
			invoiceNumber: invoices.invoiceNumber,
			customerName: customers.name,
			totalRefunded: salesReturns.totalRefunded,
			status: salesReturns.status,
			date: salesReturns.date,
			reason: salesReturns.reason
		}).from(salesReturns).leftJoin(invoices, eq(salesReturns.invoiceId, invoices.id)).leftJoin(customers, eq(salesReturns.customerId, customers.id)).orderBy(desc(salesReturns.date)).all();
	});
	ipcMain.handle("returns:getOne", async (_event, id) => {
		const returnData = await db.select().from(salesReturns).where(eq(salesReturns.id, id)).all()[0];
		if (!returnData) return null;
		const items = await db.select({
			id: salesReturnItems.id,
			productId: salesReturnItems.productId,
			productName: products.name,
			quantity: salesReturnItems.quantity,
			unitPrice: salesReturnItems.unitPriceAtSale,
			lineTotal: salesReturnItems.lineTotal
		}).from(salesReturnItems).leftJoin(products, eq(salesReturnItems.productId, products.id)).where(eq(salesReturnItems.salesReturnId, id)).all();
		return {
			...returnData,
			items
		};
	});
	ipcMain.handle("returns:getReturnableInvoiceItems", async (_event, invoiceId) => {
		return await db.select({
			id: invoiceItems.id,
			productId: invoiceItems.productId,
			productName: invoiceItems.productName,
			quantity: invoiceItems.quantity,
			returnableQuantity: invoiceItems.returnableQuantity,
			price: invoiceItems.price
		}).from(invoiceItems).where(and(eq(invoiceItems.invoiceId, invoiceId), sql`${invoiceItems.returnableQuantity} > 0`)).all();
	});
}
//#endregion
//#region src/main/index.ts
function initializeIpc() {
	registerProductsIpc();
	registerUsersIpc();
	registerInvoicesIpc();
	registerCategoriesIpc();
	registerSubCategoriesIpc();
	registerBrandsIpc();
	registerUnitsIpc();
	registerSuppliersIpc();
	registerReturnsIpc();
	registerCustomersIpc();
	registerAuthIpc();
}
async function createWindow() {
	await initDb();
	const mainWindow = new BrowserWindow({
		width: 1920,
		height: 1080,
		show: false,
		autoHideMenuBar: true,
		webPreferences: {
			preload: join(__dirname, "../preload/index.mjs"),
			sandbox: false,
			contextIsolation: true
		}
	});
	mainWindow.on("ready-to-show", () => {
		mainWindow.show();
	});
	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});
	if (is.dev && process.env["ELECTRON_RENDERER_URL"]) mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
	else mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
	initializeIpc();
}
app.whenReady().then(() => {
	electronApp.setAppUserModelId("com.electron");
	app.on("browser-window-created", (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});
	createWindow();
	app.on("activate", function() {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
//#endregion
export {};
