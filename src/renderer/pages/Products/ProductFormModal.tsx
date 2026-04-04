import React, { useState, useEffect } from 'react'
import type { Product, Category, SubCategory, Brand } from '../../../shared/types'
import { useUnits } from '../../hooks/useUnits'

interface ProductFormModalProps {
  product: Product | null
  categories: Category[]
  subCategories: SubCategory[]
  brands: Brand[]
  onClose: () => void
  onSubmit: (id: any, payload: any) => Promise<void>
}

export default function ProductFormModal({ product, categories, subCategories, brands, onClose, onSubmit }: ProductFormModalProps) {
  const { units } = useUnits()
  const initialData: Partial<Product> = {
    name: '',
    description: '',
    sku: '',
    barcode: '',
    price: 0,
    costPrice: 0,
    taxRate: 0,
    discount: 0,
    stock: 0,
    reorderLevel: 5,
    unitId: undefined,
    status: 'active',
    categoryId: undefined,
    subCategoryId: undefined,
  }

  const [formData, setFormData] = useState<Partial<Product>>(initialData)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({ ...product })
    } else {
      setFormData(initialData)
      // Fetch next SKU for new product
      const fetchNextSku = async () => {
        try {
          const nextSku = await (window as any).api.products.getNextSku()
          setFormData(prev => ({ ...prev, sku: nextSku }))
        } catch (err) {
          console.error('Failed to fetch next SKU:', err)
        }
      }
      fetchNextSku()
    }
  }, [product])

  const isDirty = JSON.stringify(formData) !== JSON.stringify(product || initialData)

  const updateField = (field: keyof Product, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      // Reset sub-category if category changes
      if (field === 'categoryId') {
        newData.subCategoryId = undefined
      }
      return newData
    })
  }

  const handleSave = async (e: React.FormEvent, addNew = false) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (product) {
        await onSubmit(product.id, formData)
      } else {
        await (onSubmit as any)(formData)
      }
      
      if (addNew) {
        setFormData(initialData)
        try {
          const nextSku = await (window as any).api.products.getNextSku()
          setFormData(prev => ({ ...prev, sku: nextSku }))
        } catch (err) {
          console.error('Failed to fetch next SKU after adding:', err)
        }
        // Optionally show a success toast here
      } else {
        onClose()
      }
    } catch (err: any) {
      alert(`حدث خطأ أثناء الحفظ: ${err.message || 'خطأ غير معروف'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (isDirty) {
      if (window.confirm('لديك تغييرات غير محفوظة، هل أنت متأكد من الإغلاق؟')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  const profit = (formData.price || 0) - (formData.costPrice || 0)
  const margin = formData.price ? ((profit / formData.price) * 100).toFixed(1) : 0

  // Filter sub-categories based on selected category
  const filteredSubCategories = formData.categoryId 
    ? subCategories.filter(sc => sc.categoryId === formData.categoryId)
    : []

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '4px',
    fontWeight: '600',
    color: '#4a5568',
    fontSize: '12px'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '13px',
    background: '#f8fafc',
    color: '#1a202c',
    outline: 'none',
    transition: 'border-color 0.2s'
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0 0 8px',
    color: '#2d3748',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }} dir="rtl">
      <div style={{ background: 'white', width: '900px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1a202c' }}>
              {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#718096' }}>أدخل تفاصيل المنتج بدقة لإضافته إلى المخزون</p>
          </div>
          <button onClick={handleClose} style={{ background: '#edf2f7', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', color: '#718096', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <form onSubmit={(e) => handleSave(e)} style={{ padding: '24px' }}>
          
          {/* Row 1: Definition */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={sectionTitleStyle}><span style={{ color: '#3182ce' }}>🏷️</span> تعريف المنتج</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 2fr) 1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>اسم المنتج <span style={{ color: '#e53e3e' }}>*</span></label>
                <input 
                  type="text" 
                  value={formData.name || ''} 
                  onChange={e => updateField('name', e.target.value)} 
                  style={{ ...inputStyle, background: '#ffffff', color: '#1a202c' }} 
                  placeholder="أدخل اسم المنتج" 
                  required 
                />
              </div>
              <div>
                <label style={labelStyle}>التصنيف</label>
                <select value={formData.categoryId || ''} onChange={e => updateField('categoryId', e.target.value ? Number(e.target.value) : null)} style={{ ...inputStyle, background: 'white', color: '#1a202c' }}>
                  <option value="" style={{ color: '#4a5568' }}>-- اختر --</option>
                  {categories.map(c => <option key={c.id} value={c.id} style={{ color: '#1a202c' }}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>التصنيف الفرعي</label>
                <select 
                  value={formData.subCategoryId || ''} 
                  onChange={e => updateField('subCategoryId', e.target.value ? Number(e.target.value) : null)} 
                  style={{ ...inputStyle, background: 'white', color: '#1a202c' }}
                  disabled={!formData.categoryId}
                >
                  <option value="" style={{ color: '#4a5568' }}>-- اختر --</option>
                  {filteredSubCategories.map(sc => <option key={sc.id} value={sc.id} style={{ color: '#1a202c' }}>{sc.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>العلامة التجارية</label>
                <select value={formData.brandId || ''} onChange={e => updateField('brandId', e.target.value ? Number(e.target.value) : null)} style={{ ...inputStyle, background: 'white', color: '#1a202c' }}>
                  <option value="" style={{ color: '#4a5568' }}>-- اختر --</option>
                  {brands.map(b => <option key={b.id} value={b.id} style={{ color: '#1a202c' }}>{b.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Commercial */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={sectionTitleStyle}><span style={{ color: '#38a169' }}>💰</span> البيانات التجارية</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'start' }}>
              <div>
                <label style={labelStyle}>سعر البيع <span style={{ color: '#e53e3e' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <input type="number" step="0.01" value={formData.price || ''} onChange={e => updateField('price', Number(e.target.value))} style={{ ...inputStyle, background: '#ebf8ff', fontWeight: 'bold', color: '#1a202c' }} required />
                  {profit !== 0 && (
                    <div style={{ position: 'absolute', left: 0, top: '40px', fontSize: '11px', color: profit > 0 ? '#38a169' : '#e53e3e', fontWeight: '600' }}>
                      الربح المتوقع: {profit.toFixed(2)} ({margin}%)
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label style={labelStyle}>التكلفة</label>
                <input type="number" step="0.01" value={formData.costPrice || ''} onChange={e => updateField('costPrice', Number(e.target.value))} style={{ ...inputStyle, color: '#1a202c' }} />
              </div>
              <div>
                <label style={labelStyle}>الوحدة</label>
                <select value={formData.unitId || ''} onChange={e => updateField('unitId', e.target.value ? Number(e.target.value) : null)} style={{ ...inputStyle, background: 'white', color: '#1a202c' }}>
                  <option value="" style={{ color: '#4a5568' }}>-- اختر --</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id} style={{ color: '#1a202c' }}>{u.shortName ? `${u.name} (${u.shortName})` : u.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 3: Inventory */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={sectionTitleStyle}><span style={{ color: '#d69e2e' }}>📦</span> المخزون والأكواد</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div>
                <label style={labelStyle}>الكمية الابتدائية</label>
                <input type="number" value={formData.stock || 0} onChange={e => updateField('stock', Number(e.target.value))} style={{ ...inputStyle, fontWeight: 'bold', color: '#1a202c' }} />
              </div>
              <div>
                <label style={labelStyle}>حد التنبيه</label>
                <input type="number" value={formData.reorderLevel || 5} onChange={e => updateField('reorderLevel', Number(e.target.value))} style={{ ...inputStyle, color: '#1a202c' }} title="سيظهر تنبيه عند وصول المخزون لهذا الرقم" />
                <span style={{ fontSize: '10px', color: '#a0aec0' }}>تنبيه عند الوصول لهذا الرقم</span>
              </div>
              <div>
                <label style={labelStyle}>رمز SKU</label>
                <input type="text" value={formData.sku || ''} onChange={e => updateField('sku', e.target.value)} style={{ ...inputStyle, color: '#1a202c' }} placeholder="SKU-1001" />
              </div>
              <div>
                <label style={labelStyle}>الباركود</label>
                <input type="text" value={formData.barcode || ''} onChange={e => updateField('barcode', e.target.value)} style={{ ...inputStyle, color: '#1a202c' }} placeholder="987654321..." />
              </div>
            </div>
          </div>

          {/* Row 4: Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>وصف المنتج</label>
            <textarea 
              value={formData.description || ''} 
              onChange={e => updateField('description', e.target.value)} 
              style={{ ...inputStyle, height: '80px', resize: 'none', padding: '10px', color: '#1a202c' }} 
              placeholder="اكتب وصفاً مختصراً للمنتج..."
            />
          </div>

          {/* Advanced Options Toggle */}
          <div style={{ marginBottom: '10px' }}>
            <button 
              type="button" 
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)} 
              style={{ background: 'none', border: 'none', color: '#3182ce', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
            >
              {isAdvancedOpen ? '▼ خيارات متقدمة' : '▶ خيارات متقدمة (الضريبة، الخصم، الحالة)'}
            </button>
          </div>

          {isAdvancedOpen && (
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #edf2f7', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <label style={labelStyle}>الضريبة (%)</label>
                <input type="number" value={formData.taxRate || 0} onChange={e => updateField('taxRate', Number(e.target.value))} style={{ ...inputStyle, background: 'white', color: '#1a202c' }} />
                <span style={{ fontSize: '10px', color: '#a0aec0' }}>نسبة مضافة على السعر النهائي</span>
              </div>
              <div>
                <label style={labelStyle}>الخصم ($)</label>
                <input type="number" value={formData.discount || 0} onChange={e => updateField('discount', Number(e.target.value))} style={{ ...inputStyle, background: 'white', color: '#1a202c' }} />
              </div>
              <div>
                <label style={labelStyle}>حالة التوفر</label>
                <select value={formData.status} onChange={e => updateField('status', e.target.value)} style={{ ...inputStyle, background: 'white', color: '#1a202c' }}>
                  <option value="active" style={{ color: '#1a202c' }}>نشط (متاح)</option>
                  <option value="inactive" style={{ color: '#1a202c' }}>مخفي (معطل)</option>
                </select>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '30px', borderTop: '1px solid #edf2f7', paddingTop: '20px' }}>
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ flex: 1, padding: '12px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? 'جاري الحفظ...' : (product ? 'حفظ التعديلات' : 'إضافة المنتج')}
            </button>
            {!product && (
              <button 
                type="button" 
                onClick={(e) => handleSave(e as any, true)}
                disabled={isLoading}
                style={{ flex: 1, padding: '12px', background: '#ebf8ff', color: '#2b6cb0', border: '1px solid #bee3f8', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer' }}
              >
                حفظ وإضافة جديد
              </button>
            )}
            <button 
              type="button" 
              onClick={handleClose} 
              style={{ flex: 0.4, padding: '12px', background: 'white', color: '#4a5568', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              إلغاء
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
