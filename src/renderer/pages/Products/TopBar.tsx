interface TopBarProps {
  onAdd: () => void
  searchTerm: string
  onSearchChange: (value: string) => void
  totalCount: number
  resultsCount: number
  activeFiltersCount: number
  onResetFilters: () => void
}

export default function TopBar({ onAdd, searchTerm, onSearchChange, totalCount, resultsCount, activeFiltersCount, onResetFilters }: TopBarProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      gap: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1 }}>
        <div>
          {/* <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 2px 0', color: '#0f172a' }}>المنتجات</h1> */}
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
            {resultsCount} من {totalCount} منتج
          </div>
        </div>

        <div style={{ position: 'relative', flex: 1, maxWidth: '480px' }}>
          <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}>🔍</span>
          <input
            type="text"
            placeholder="البحث بالاسم أو SKU..." 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '78%',
              padding: '12px 42px 12px 16px',
              borderRadius: '10px',
              border: '2px solid transparent',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.2s',
              backgroundColor: '#f1f5f9',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
              color: '#334155'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.backgroundColor = 'white'
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'transparent'
              e.target.style.backgroundColor = '#f1f5f9'
              e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.02)'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {activeFiltersCount > 0 && (
          <button
            onClick={onResetFilters}
            style={{
              padding: '10px 10px',
              background: '#fef2f2',
              color: '#ef4444',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
            onMouseOut={(e) => e.currentTarget.style.background = '#fef2f2'}
          >
            مسح الفلاتر ({activeFiltersCount})
          </button>
        )}

        <button
          onClick={onAdd}
          style={{
            padding: '10px 24px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#1d4ed8'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#2563eb'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <span>إضافة منتج</span>
          <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
        </button>
      </div>
    </div>
  )
}
