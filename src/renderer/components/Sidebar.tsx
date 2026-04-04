import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Simple helper for SVG icons to keep the component clean
const Icon = ({ name }: { name: string }) => {
  switch (name) {
    case 'home': return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case 'pos': return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>;
    case 'invoices': return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M14 8H6"/><path d="M14 12H6"/><path d="M10 16H6"/></svg>;
    case 'returns': return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>;
    case 'products': return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.27 6.96 8.73 5.05 8.73-5.05"/><path d="M12 22.08V12"/></svg>;
    case 'categories': return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>;
    case 'brands': return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l5.58-5.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>;
    case 'purchases': return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
    case 'inventory': return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
    case 'customers': return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'suppliers': return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
    case 'users': return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case 'permissions': return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
    case 'reports': return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
    case 'settings': return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.17a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
    default: return null;
  }
}

export default function Sidebar() {
  const { user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const menuGroups = [
    {
      title: 'التشغيل',
      items: [
        { path: '/dashboard', label: 'الرئيسية', icon: 'home' },
        { path: '/', label: 'نقطة البيع', icon: 'pos' },
        { path: '/invoices', label: 'الفواتير', icon: 'invoices' },
      ]
    },

    {
      title: 'العمليات',
      items: [
        { path: '/inventory', label: 'المخزون', icon: 'inventory' },
        { path: '/parties', label: 'الأطراف', icon: 'customers' },
        { path: '/reports', label: 'التقارير', icon: 'reports' },
      ]
    },
    {
      title: 'النظام',
      items: [
        { path: '/admin', label: 'الإدارة', icon: 'users' },
        { path: '/settings', label: 'الإعدادات', icon: 'settings' },
      ]
    }
  ]

  return (
    <div style={{ 
      width: isCollapsed ? '68px' : '260px', 
      background: '#0f172a', 
      color: 'white', 
      padding: '15px 0',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      borderLeft: '1px solid #1e293b',
      boxShadow: '4px 0 25px rgba(0,0,0,0.4)',
      position: 'relative',
      height: '100vh',
      boxSizing: 'border-box',
      zIndex: 100
    }}>
      <style>{`
        .sidebar-item {
          margin: 4px 12px;
          position: relative;
          border-radius: 12px !important;
        }
        .sidebar-item:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          transform: translateX(${isCollapsed ? '0' : '-4px'});
        }
        .sidebar-item.active {
          background: rgba(59, 130, 246, 0.15) !important;
          color: #60a5fa !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .sidebar-item.active::after {
          content: "";
          position: absolute;
          right: -12px;
          top: 15%;
          bottom: 15%;
          width: 4px;
          background: #3b82f6;
          border-radius: 4px 0 0 4px;
          box-shadow: -2px 0 10px rgba(59, 130, 246, 0.6);
        }
        .group-header {
          padding: 24px 24px 10px;
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          white-space: nowrap;
          opacity: 0.8;
        }
        .toggle-btn:hover {
          background: #3b82f6 !important;
          transform: scale(1.1);
        }
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}</style>

      {/* Header & Toggle */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isCollapsed ? 'center' : 'space-between',
        padding: '10px 15px',
        marginBottom: '15px'
      }}>
        {!isCollapsed && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', background: 'linear-gradient(to left, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>نظام سمارت POS</h2>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{user?.role === 'admin' ? 'مدير النظام' : 'كاشير'}: {user?.username}</div>
          </div>
        )}
        <button 
          className="toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: '#1e293b',
            border: 'none',
            color: 'white',
            borderRadius: '10px',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            fontSize: '12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
          }}
        >
          {isCollapsed ? '➡' : '⬅'}
        </button>
      </div>

      {/* Nav Groups */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden' }}>
        {menuGroups.map(group => (
          <div key={group.title} style={{ marginBottom: '10px' }}>
            {!isCollapsed && <div className="group-header">{group.title}</div>}
            {group.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : ''}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                style={{
                  padding: '12px 14px',
                  color: 'inherit',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: isCollapsed ? '0' : '14px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  whiteSpace: 'nowrap',
                  background: 'transparent'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#94a3b8',
                  transition: 'color 0.2s'
                }} className="icon-wrapper">
                  <Icon name={item.icon} />
                </div>
                {!isCollapsed && (
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    animation: 'fadeIn 0.3s ease-out'
                  }}>{item.label}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .sidebar-item.active .icon-wrapper {
          color: #60a5fa !important;
        }
      `}</style>
    </div>
  )
}
