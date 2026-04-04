import type { Product, StockMovement } from '../../../shared/types'

interface StockHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  movements: StockMovement[]
}

export default function StockHistoryModal({ isOpen, onClose, product, movements }: StockHistoryModalProps) {
  if (!isOpen || !product) return null

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }} dir="rtl">
      <div style={{ background: 'white', width: '90%', maxWidth: '800px', borderRadius: '16px', padding: '24px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f7fafc', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#2d3748', fontSize: '20px' }}>سجل حركة المخزون</h2>
            <div style={{ color: '#718096', fontSize: '14px' }}>{product.name} ({product.sku || 'بدون رمز'})</div>
          </div>
          <button onClick={onClose} style={{ background: '#edf2f7', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>إغلاق</button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ background: '#f7fafc', color: '#4a5568', fontSize: '14px', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>التاريخ</th>
              <th style={{ padding: '12px' }}>النوع</th>
              <th style={{ padding: '12px' }}>الكمية</th>
              <th style={{ padding: '12px' }}>السبب</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#a0aec0' }}>لا توجد حركات مسجلة لهذا المنتج</td></tr>
            ) : movements.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                <td style={{ padding: '12px', fontSize: '13px' }}>{new Date(m.date).toLocaleString('ar-EG')}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    background: m.type === 'in' ? '#c6f6d5' : m.type === 'out' ? '#fed7d7' : '#ebf8ff',
                    color: m.type === 'in' ? '#22543d' : m.type === 'out' ? '#822727' : '#2c5282'
                  }}>
                    {m.type === 'in' ? 'دخول' : m.type === 'out' ? 'خروج' : m.type === 'adjustment' ? 'تعديل' : 'مرتجع'}
                  </span>
                </td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>
                  {m.type === 'in' ? '+' : '-'}{m.quantity}
                </td>
                <td style={{ padding: '12px', fontSize: '13px', color: '#4a5568' }}>{m.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
