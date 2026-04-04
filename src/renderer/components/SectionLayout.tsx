import { NavLink, Outlet, useLocation } from 'react-router-dom'

interface Tab {
  label: string
  path: string
}

interface SectionLayoutProps {
  title: string
  tabs: Tab[]
}

export default function SectionLayout({ title, tabs }: SectionLayoutProps) {
  const location = useLocation()

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      background: '#f8fafc',
      margin: '-20px', // Offset parent padding
      animation: 'fadeIn 0.4s ease-out'
    }} dir="rtl">
      
      {/* Header & Tabs Container */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: title ? '20px 32px 0 32px' : '0 32px 0 32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        zIndex: 10
      }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>{title}</h1>
          </div>
        )}

        {/* Dynamic Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '.' || tab.path === ''}
              style={({ isActive }) => ({
                padding: '12px 20px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                color: isActive ? '#3b82f6' : '#64748b',
                borderBottom: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                marginBottom: '-1px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              })}
              className={({ isActive }) => isActive ? 'active-tab' : ''}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Page Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <Outlet />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .active-tab {
          background: rgba(59, 130, 246, 0.04);
        }
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}
