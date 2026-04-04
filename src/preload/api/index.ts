import { productsApi } from './products'
import { usersApi } from './users'
import { invoicesApi } from './invoices'
import { authApi } from './auth'
import { categoriesApi } from './categories'
import { subCategoriesApi } from './subCategories'
import { brandsApi } from './brands'
import { customersApi } from './customers'
import { suppliersApi } from './suppliers'
import { returnsApi } from './returns'
import { unitsApi } from './units'

export const api = {
  products: productsApi,
  users: usersApi,
  invoices: invoicesApi,
  auth: authApi,
  categories: categoriesApi,
  subCategories: subCategoriesApi,
  brands: brandsApi,
  customers: customersApi,
  suppliers: suppliersApi,
  returns: returnsApi,
  units: unitsApi
}
