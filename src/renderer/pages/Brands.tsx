import { useState } from 'react'
import { useBrands } from '../hooks/useBrands'

export default function Brands() {
  const { brands, createBrand, updateBrand, deleteBrand, loading } = useBrands()
  const [newBrandName, setNewBrandName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  async function handleAddBrand(e: React.FormEvent) {
    e.preventDefault()
    if (!newBrandName) return
    try {
      await createBrand(newBrandName)
      setNewBrandName('')
    } catch (err) {
      alert('فشل في إضافة الماركة')
    }
  }

  async function handleUpdateBrand(e: React.FormEvent) {
    e.preventDefault()
    if (!editName || editingId === null) return
    try {
      await updateBrand(editingId, editName)
      setEditingId(null)
    } catch (err) {
      alert('فشل في تحديث الماركة')
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }} dir="rtl">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a202c', margin: 0 }}>إدارة الماركات</h2>
        <div style={{ fontSize: '14px', color: '#718096' }}>{brands.length} ماركة تجارية</div>
      </div>

      <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', marginBottom: '32px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#4a5568' }}>إضافة ماركة جديدة</h3>
        <form onSubmit={handleAddBrand} style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            value={newBrandName} 
            onChange={(e) => setNewBrandName(e.target.value)}
            placeholder="مثال: آبل، سامسونج، إلخ..."
            style={{ 
              flex: 1, 
              padding: '10px 16px', 
              borderRadius: '8px', 
              border: '1px solid #cbd5e1',
              fontSize: '15px'
            }}
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              background: '#3b82f6', 
              color: 'white', 
              padding: '10px 24px', 
              borderRadius: '8px', 
              border: 'none', 
              fontWeight: '600', 
              cursor: 'pointer',
              transition: 'background 0.2s',
              opacity: loading ? 0.7 : 1
            }}
          >
            إضافة
          </button>
        </form>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 20px', fontSize: '14px', color: '#475569', fontWeight: '600' }}>اسم الماركة</th>
              <th style={{ padding: '12px 20px', fontSize: '14px', color: '#475569', fontWeight: '600', textAlign: 'left' }}>العمليات</th>
            </tr>
          </thead>
          <tbody>
            {brands.map(brand => (
              <tr key={brand.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                <td style={{ padding: '16px 20px' }}>
                  {editingId === brand.id ? (
                    <form onSubmit={handleUpdateBrand} style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid #3b82f6' }}
                        autoFocus
                      />
                      <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer' }}>حفظ</button>
                      <button type="button" onClick={() => setEditingId(null)} style={{ background: '#94a3b8', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer' }}>إلغاء</button>
                    </form>
                  ) : (
                    <span style={{ fontWeight: '500', color: '#1e293b' }}>{brand.name}</span>
                  )}
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => { setEditingId(brand.id); setEditName(brand.name); }} 
                      style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                    >
                      تعديل
                    </button>
                    <button 
                      onClick={() => { if(confirm('هل أنت متأكد من حذف هذه الماركة؟')) deleteBrand(brand.id) }} 
                      style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr>
                <td colSpan={2} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>لا توجد ماركات بعد</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
