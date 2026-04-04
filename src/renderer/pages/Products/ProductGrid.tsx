import { useState, useMemo } from 'react'
import type { Product } from '../../../shared/types'

interface ProductGridProps {
  products: Product[]
  loading: boolean
  selectedId?: number
  onSelect: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
  onShowHistory: (product: Product) => void
}

type SortKey = 'name' | 'stock' | 'price'

export default function ProductGrid({ products, loading, selectedId, onSelect, onEdit, onDelete, onShowHistory }: ProductGridProps) {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'asc' | 'desc' } | null>(null)

  const sortedProducts = useMemo(() => {
    let sortableItems = [...products]
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    return sortableItems
  }, [products, sortConfig])

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  if (loading && products.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>
        جاري تحميل المنتجات...
      </div>
    )
  }

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th 
              onClick={() => requestSort('name')} 
              style={{ padding: '10px 16px', fontWeight: 'bold', color: '#475569', fontSize: '14px', cursor: 'pointer', userSelect: 'none' }}
            >
              المنتج {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th style={{ padding: '10px 16px', fontWeight: 'bold', color: '#475569', fontSize: '14px' }} title="رمز المنتج">
              SKU
            </th>
            <th 
              onClick={() => requestSort('price')} 
              style={{ padding: '10px 16px', fontWeight: 'bold', color: '#475569', fontSize: '14px', cursor: 'pointer', userSelect: 'none' }}
            >
              السعر {sortConfig?.key === 'price' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th 
              onClick={() => requestSort('stock')} 
              style={{ padding: '10px 16px', fontWeight: 'bold', color: '#475569', fontSize: '14px', cursor: 'pointer', userSelect: 'none' }}
            >
              المخزون {sortConfig?.key === 'stock' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th style={{ padding: '10px 16px', fontWeight: 'bold', color: '#475569', fontSize: '14px', textAlign: 'center' }}>
              الحالة
            </th>
            <th style={{ padding: '10px 16px' }}></th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map((p) => {
            const isSelected = selectedId === p.id

            return (
              <tr 
                key={p.id} 
                onClick={() => onSelect(p)}
                style={{ 
                  borderBottom: '1px solid #f1f5f9', 
                  cursor: 'pointer',
                  background: isSelected ? '#eff6ff' : (p.status === 'inactive' ? '#f8fafc' : 'white'),
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => !isSelected && (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseOut={(e) => !isSelected && (e.currentTarget.style.backgroundColor = p.status === 'inactive' ? '#f8fafc' : 'white')}
              >
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>{p.name}</div>
                </td>
                <td style={{ padding: '10px 16px', fontSize: '13px' }}>
                  <div style={{ color: '#475569', fontWeight: '500' }}>{p.sku || '---'}</div>
                </td>
                <td style={{ padding: '10px 16px', fontWeight: '700', color: '#0f172a' }}>
                  ${p.price.toFixed(2)}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: '600', color: '#334155', fontSize: '15px' }}>{p.stock}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{p.unit === 'piece' ? 'حبة' : p.unit}</span>
                  </div>
                </td>
                <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                  {p.stock === 0 ? (
                    <span style={{ display: 'inline-block', padding: '4px 12px', background: '#fef2f2', color: '#ef4444', borderRadius: '12px', fontSize: '12px', fontWeight: '600', border: '1px solid #fca5a5' }}>نافد</span>
                  ) : p.stock <= (p.reorderLevel || 5) ? (
                    <span style={{ display: 'inline-block', padding: '4px 12px', background: '#fef9c3', color: '#d97706', borderRadius: '12px', fontSize: '12px', fontWeight: '600', border: '1px solid #fcd34d' }}>منخفض</span>
                  ) : (
                    <span style={{ display: 'inline-block', padding: '4px 12px', background: '#dcfce3', color: '#16a34a', borderRadius: '12px', fontSize: '12px', fontWeight: '600', border: '1px solid #86efac' }}>متوفر</span>
                  )}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onShowHistory(p); }} 
                      title="سجل المخزون"
                      style={{ padding: '6px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#3b82f6'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                    >🕒</button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEdit(p); }} 
                      style={{ padding: '6px 12px', background: 'transparent', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#93c5fd'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                    >تعديل</button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(p.id); }} 
                      style={{ padding: '6px 12px', background: 'transparent', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#f87171'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#fecaca'; }}
                    >حذف</button>
                  </div>
                </td>
              </tr>
            )
          })}
          {sortedProducts.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                لا توجد منتجات تطابق البحث والفلاتر
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
