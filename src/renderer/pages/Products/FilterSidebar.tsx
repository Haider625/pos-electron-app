import type { Category, Brand } from '../../../shared/types'

interface FilterSidebarProps {
  categories: Category[]
  subCategories: Category[]
  brands: Brand[]
  filters: {
    categoryId: number | null
    subCategoryId: number | null
    brandId: number | null
    stockStatus: 'all' | 'low' | 'out' | 'available'
    priceRange: [number, number]
  }
  onFilterChange: (filters: any) => void
}

export default function FilterSidebar({ categories, subCategories, brands, filters, onFilterChange }: FilterSidebarProps) {
  const updateFilter = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value })
  }

  return (
    <div style={{ 
      background: 'white', 
      borderBottom: '1px solid #e2e8f0', 
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      {/* Category Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>التصنيف:</span>
        <select 
          value={filters.categoryId || ''} 
          onChange={(e) => updateFilter('categoryId', e.target.value === '' ? null : Number(e.target.value))}
          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', background: '#f8fafc', outline: 'none', cursor: 'pointer', minWidth: '90px', color: '#0f172a' }}
        >
          <option value="" style={{ color: '#0f172a' }}>الكل</option>
          {categories.map(cat => <option key={cat.id} value={cat.id} style={{ color: '#0f172a' }}>{cat.name}</option>)}
        </select>
      </div>

      {/* SubCategory Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>الفرعي:</span>
        <select 
          value={filters.subCategoryId || ''} 
          onChange={(e) => updateFilter('subCategoryId', e.target.value === '' ? null : Number(e.target.value))}
          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', background: '#f8fafc', outline: 'none', cursor: 'pointer', minWidth: '90px', color: '#0f172a' }}
        >
          <option value="" style={{ color: '#0f172a' }}>الكل</option>
          {subCategories.map(cat => <option key={cat.id} value={cat.id} style={{ color: '#0f172a' }}>{cat.name}</option>)}
        </select>
      </div>

      {/* Brand Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>الماركة:</span>
        <select 
          value={filters.brandId || ''} 
          onChange={(e) => updateFilter('brandId', e.target.value === '' ? null : Number(e.target.value))}
          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', background: '#f8fafc', outline: 'none', cursor: 'pointer', minWidth: '90px', color: '#0f172a' }}
        >
          <option value="" style={{ color: '#0f172a' }}>الكل</option>
          {brands.map(b => <option key={b.id} value={b.id} style={{ color: '#0f172a' }}>{b.name}</option>)}
        </select>
      </div>

      {/* Stock Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>المخزون:</span>
        <select 
          value={filters.stockStatus} 
          onChange={(e) => updateFilter('stockStatus', e.target.value)}
          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', background: '#f8fafc', outline: 'none', cursor: 'pointer', minWidth: '90px', color: '#0f172a' }}
        >
          <option value="all" style={{ color: '#0f172a' }}>الكل</option>
          <option value="available" style={{ color: '#0f172a' }}>متوفر</option>
          <option value="low" style={{ color: '#0f172a' }}>منخفض</option>
          <option value="out" style={{ color: '#0f172a' }}>نافد</option>
        </select>
      </div>

      {/* Price Range */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>السعر:</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input 
            type="number" 
            placeholder="من"
            value={filters.priceRange[0] || 0}
            onChange={(e) => updateFilter('priceRange', [Number(e.target.value), filters.priceRange[1]])}
            style={{ width: '60px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', outline: 'none', background: '#f8fafc', color: '#0f172a' }}
          />
          <span style={{ color: '#94a3b8' }}>-</span>
          <input 
            type="number" 
            placeholder="إلى"
            value={filters.priceRange[1] || 1000000}
            onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])}
            style={{ width: '60px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', outline: 'none', background: '#f8fafc', color: '#0f172a' }}
          />
        </div>
      </div>
    </div>
  )
}
