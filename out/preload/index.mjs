import { contextBridge, ipcRenderer } from "electron";
//#endregion
//#region src/preload/index.ts
contextBridge.exposeInMainWorld("api", {
	products: {
		getAll: () => ipcRenderer.invoke("products:getAll"),
		create: (data) => ipcRenderer.invoke("products:create", data),
		delete: (id) => ipcRenderer.invoke("products:delete", id),
		update: (data) => ipcRenderer.invoke("products:update", data),
		getStockHistory: (productId) => ipcRenderer.invoke("products:getStockHistory", productId),
		getNextSku: () => ipcRenderer.invoke("products:getNextSku")
	},
	users: {
		getAll: () => ipcRenderer.invoke("users:getAll"),
		create: (data) => ipcRenderer.invoke("users:create", data),
		delete: (id) => ipcRenderer.invoke("users:delete", id)
	},
	invoices: {
		create: (data) => ipcRenderer.invoke("invoices:create", data),
		getAll: () => ipcRenderer.invoke("invoices:getAll"),
		getById: (id) => ipcRenderer.invoke("invoices:getById", id),
		getByNumber: (invoiceNumber) => ipcRenderer.invoke("invoices:getByNumber", invoiceNumber)
	},
	auth: { login: (credentials) => ipcRenderer.invoke("auth:login", credentials) },
	categories: {
		getAll: () => ipcRenderer.invoke("categories:getAll"),
		create: (data) => ipcRenderer.invoke("categories:create", data),
		update: (data) => ipcRenderer.invoke("categories:update", data),
		delete: (id) => ipcRenderer.invoke("categories:delete", id)
	},
	subCategories: {
		getAll: () => ipcRenderer.invoke("subCategories:getAll"),
		create: (data) => ipcRenderer.invoke("subCategories:create", data),
		delete: (id) => ipcRenderer.invoke("subCategories:delete", id),
		getByCategory: (categoryId) => ipcRenderer.invoke("subCategories:getByCategory", categoryId)
	},
	brands: {
		getAll: () => ipcRenderer.invoke("brands:getAll"),
		create: (name) => ipcRenderer.invoke("brands:create", name),
		update: (data) => ipcRenderer.invoke("brands:update", data),
		delete: (id) => ipcRenderer.invoke("brands:delete", id)
	},
	customers: {
		getAll: () => ipcRenderer.invoke("customers:getAll"),
		create: (payload) => ipcRenderer.invoke("customers:create", payload),
		update: (payload) => ipcRenderer.invoke("customers:update", payload),
		delete: (id) => ipcRenderer.invoke("customers:delete", id)
	},
	suppliers: {
		getAll: () => ipcRenderer.invoke("suppliers:getAll"),
		create: (payload) => ipcRenderer.invoke("suppliers:create", payload),
		update: (payload) => ipcRenderer.invoke("suppliers:update", payload),
		delete: (id) => ipcRenderer.invoke("suppliers:delete", id)
	},
	returns: {
		create: (payload) => ipcRenderer.invoke("returns:create", payload),
		getAll: (filters) => ipcRenderer.invoke("returns:getAll", filters),
		getOne: (id) => ipcRenderer.invoke("returns:getOne", id),
		getByInvoiceId: (invoiceId) => ipcRenderer.invoke("returns:getByInvoiceId", invoiceId),
		getReturnableInvoiceItems: (invoiceId) => ipcRenderer.invoke("returns:getReturnableInvoiceItems", invoiceId)
	},
	units: {
		getAll: () => ipcRenderer.invoke("units:getAll"),
		create: (data) => ipcRenderer.invoke("units:create", data),
		delete: (id) => ipcRenderer.invoke("units:delete", id)
	}
});
//#endregion
export {};
