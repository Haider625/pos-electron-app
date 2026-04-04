import { Routes, Route } from 'react-router-dom'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Brands from './pages/Brands'
import Users from './pages/Users'
import POS from './pages/POS'
import Login from './pages/Login'
import Customers from './pages/Customers'
import Suppliers from './pages/Suppliers'
import Invoices from './pages/Invoices'
import ReturnsPage from './pages/Invoices/ReturnsPage'
import Sidebar from './components/Sidebar'
import { useAuth } from './hooks/useAuth'
import ComingSoon from './pages/ComingSoon'

import InventoryPage from './pages/Inventory/InventoryPage'
import PartiesPage from './pages/Parties/PartiesPage'
import InvoicesPage from './pages/Invoices/InvoicesPage'
import AdminPage from './pages/Admin/AdminPage'
import SettingsPage from './pages/Admin/SettingsPage'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '20px'
    }}>جاري التحميل...</div>
  }

  if (!user) {
    return <Login />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', direction: 'rtl', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px', overflow: 'hidden', background: '#f8fafc' }}>
        <Routes>
          <Route path="/" element={<POS />} />
          <Route path="/dashboard" element={<ComingSoon title="الرئيسية" />} />
          
          {/* Inventory Section */}
          <Route path="/inventory" element={<InventoryPage />}>
            <Route index element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="brands" element={<Brands />} />
            <Route path="purchases" element={<ComingSoon title="المشتريات" />} />
            <Route path="audit" element={<ComingSoon title="الجرد" />} />
            <Route path="movements" element={<ComingSoon title="حركات المخزون" />} />
          </Route>

          {/* Invoices Section */}
          <Route path="/invoices" element={<InvoicesPage />}>
            <Route index element={<Invoices />} />
            <Route path="returns" element={<ReturnsPage />} />
            <Route path="pending" element={<ComingSoon title="الفواتير المعلقة" />} />
          </Route>

          {/* Parties Section */}
          <Route path="/parties" element={<PartiesPage />}>
            <Route index element={<Customers />} />
            <Route path="suppliers" element={<Suppliers />} />
          </Route>

          {/* Administration Section */}
          <Route path="/admin" element={<AdminPage />}>
            <Route index element={<Users />} />
            <Route path="permissions" element={<ComingSoon title="الصلاحيات" />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          <Route path="/reports" element={<ComingSoon title="التقارير" />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  )
}
