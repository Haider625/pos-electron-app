import React from 'react'
import type { Product } from '../../../shared/types'

interface DetailsPanelProps {
  product: Product
  onClose: () => void
  onEdit: () => void
}

export default function DetailsPanel({ product, onClose, onEdit }: DetailsPanelProps) {
  const profitMargin = product.price && product.costPrice 
    ? ((product.price - product.costPrice) / product.price) * 100 
    : 0

  return (
    <div style={{ 
      width: '400px', 
      background: 'white', 
      borderRight: '1px solid #e2e8f0', 
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-4px 0 15px -3px rgba(0, 0, 0, 0.1)',
      zIndex: 5,
      animation: 'slideIn 0.3s ease-out'
    }}>
      {/* Header */}
      <div style={{ padding: '24px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#2d3748' }}>تفاصيل المنتج</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#a0aec0' }}>×</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {/* Basic Info Secion */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ width: '120px', height: '120px', background: '#f7fafc', borderRadius: '16px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', border: '1px dashed #e2e8f0' }}>
            📦
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px', color: '#1a202c' }}>{product.name}</h3>
          <p style={{ fontSize: '14px', color: '#718096' }}>{product.sku || 'N/A'}</p>
        </div>

        {/* Pricing Insight */}
        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #edf2f7' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#4a5568', margin: '0 0 16px' }}>نظرة مالية</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#718096' }}>سعر البيع:</span>
              <span style={{ fontWeight: 'bold' }}>${product.price.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#718096' }}>التكلفة:</span>
              <span style={{ fontWeight: 'bold' }}>${(product.costPrice || 0).toFixed(2)}</span>
            </div>
            <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#718096' }}>هامش الربح:</span>
              <span style={{ fontWeight: 'bold', color: profitMargin > 15 ? '#38a169' : '#d69e2e' }}>
                {profitMargin.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Info */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#4a5568', margin: '0 0 16px' }}>المخزون والوحدة</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>الكمية</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: product.stock > 0 ? '#1a202c' : '#e53e3e' }}>{product.stock}</div>
            </div>
            <div style={{ padding: '12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>الوحدة</div>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>{product.unit === 'piece' ? 'حبة' : product.unit}</div>
            </div>
          </div>
        </div>

        {/* Status & Category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f0fff4', borderRadius: '8px', border: '1px solid #c6f6d5' }}>
            <span style={{ fontSize: '14px', color: '#276749' }}>تاريخ آخر تحديث:</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#276749' }}>
              {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('ar-EG') : '---'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#ebf8ff', borderRadius: '8px', border: '1px solid #bee3f8' }}>
            <span style={{ fontSize: '14px', color: '#2b6cb0' }}>حالة المنتج:</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#2b6cb0' }}>
              {product.status === 'active' ? 'نشط في البيع' : 'متوقف'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{ padding: '24px', borderTop: '1px solid #edf2f7', display: 'flex', gap: '12px' }}>
        <button 
          onClick={onEdit}
          style={{ 
            flex: 1, 
            padding: '12px', 
            background: '#3182ce', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          تعديل البيانات ✏️
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
