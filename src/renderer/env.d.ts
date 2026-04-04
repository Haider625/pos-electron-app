import { Product, User, Invoice, Category, SubCategory, Brand, Customer, Supplier, Return, SalesReturn } from '../shared/types';

declare global {
  interface Window {
    api: {
      products: {
        getAll: () => Promise<Product[]>;
        create: (payload: Partial<Product>) => Promise<{ id: number }>;
        update: (payload: Partial<Product> & { id: number }) => Promise<{ updated: boolean }>;
        delete: (id: number) => Promise<{ deleted: boolean }>;
        getStockHistory: (productId: number) => Promise<any[]>;
      };
      users: {
        getAll: () => Promise<User[]>;
        create: (payload: any) => Promise<{ id: number }>;
        update: (payload: any) => Promise<{ updated: boolean }>;
        delete: (id: number) => Promise<{ deleted: boolean }>;
      };
      invoices: {
        create: (payload: any) => Promise<{ id: number; invoiceNumber: string }>;
        getAll: () => Promise<Invoice[]>;
        getById: (id: number) => Promise<Invoice & { items: any[]; payments: any[] }>;
        getByNumber: (invoiceNumber: string) => Promise<Invoice | null>;
      };
      auth: {
        login: (credentials: any) => Promise<any>;
      };
      categories: {
        getAll: () => Promise<Category[]>;
        create: (data: { name: string }) => Promise<{ id: number }>;
        update: (data: { id: number; name: string }) => Promise<{ updated: boolean }>;
        delete: (id: number) => Promise<{ deleted: boolean }>;
      };
      subCategories: {
        getAll: () => Promise<SubCategory[]>;
        create: (data: { name: string; categoryId: number }) => Promise<{ id: number }>;
        delete: (id: number) => Promise<{ deleted: boolean }>;
        getByCategory: (categoryId: number) => Promise<SubCategory[]>;
      };
      brands: {
        getAll: () => Promise<Brand[]>;
        create: (name: string) => Promise<{ id: number }>;
        update: (data: { id: number; name: string }) => Promise<{ updated: boolean }>;
        delete: (id: number) => Promise<{ deleted: boolean }>;
      };
      customers: {
        getAll: () => Promise<Customer[]>;
        create: (payload: Partial<Customer>) => Promise<{ id: number }>;
        update: (payload: Partial<Customer> & { id: number }) => Promise<{ updated: boolean }>;
        delete: (id: number) => Promise<{ deleted: boolean }>;
      };
      suppliers: {
        getAll: () => Promise<Supplier[]>;
        create: (payload: Partial<Supplier>) => Promise<{ id: number }>;
        update: (payload: Partial<Supplier> & { id: number }) => Promise<{ updated: boolean }>;
        delete: (id: number) => Promise<{ deleted: boolean }>;
      };
      returns: {
        create: (payload: any) => Promise<{ id: number; returnNumber: string }>;
        getAll: (filters?: any) => Promise<any[]>;
        getOne: (id: number) => Promise<any>;
        getByInvoiceId: (invoiceId: number) => Promise<any[]>;
        getReturnableInvoiceItems: (invoiceId: number) => Promise<any[]>;
      };

      units: {
        getAll: () => Promise<any[]>;
        create: (data: { name: string; shortName?: string }) => Promise<{ id: number }>;
        delete: (id: number) => Promise<{ deleted: boolean }>;
      };
    };
  }
}
