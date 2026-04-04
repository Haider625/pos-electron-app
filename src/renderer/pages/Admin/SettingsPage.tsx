import { useState } from 'react';
import { useUnits } from '../../hooks/useUnits';

export default function SettingsPage() {
  const { units, createUnit, deleteUnit, loading } = useUnits();
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitShortName, setNewUnitShortName] = useState('');

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    try {
      await createUnit(newUnitName.trim(), newUnitShortName.trim() || undefined);
      setNewUnitName('');
      setNewUnitShortName('');
    } catch (err) {
      alert('فشل في إضافة الوحدة');
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0'
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    outline: 'none',
    fontSize: '14px'
  };

  return (
    <div style={{ padding: '32px' }} dir="rtl">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b' }}>إعدادات النظام</h1>
        <p style={{ color: '#64748b' }}>تخصيص الإعدادات العامة والوحدات.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', maxWidth: '800px' }}>
        <section style={cardStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📏</span> إدارة الوحدات
          </h3>
          
          <form onSubmit={handleAddUnit} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <input 
              type="text" 
              placeholder="اسم الوحدة (مثلاً: حبة)" 
              value={newUnitName} 
              onChange={e => setNewUnitName(e.target.value)} 
              style={{ ...inputStyle, flex: 2, background: '#f8fafc', color: '#1e293b' }}
              required 
              disabled={loading}
            />
            <input 
              type="text" 
              placeholder="الرمز (مثلاً: ق)" 
              value={newUnitShortName} 
              onChange={e => setNewUnitShortName(e.target.value)} 
              style={{ ...inputStyle, flex: 1, background: '#f8fafc', color: '#1e293b' }}
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !newUnitName.trim()}
              style={{ 
                background: loading ? '#94a3b8' : '#3b82f6', 
                color: 'white', 
                border: 'none', 
                padding: '8px 24px', 
                borderRadius: '8px', 
                fontWeight: 'bold', 
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'جاري...' : 'إضافة'}
            </button>
          </form>


          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            {loading ? (
              <p>جاري التحميل...</p>
            ) : units.length === 0 ? (
              <p style={{ color: '#94a3b8', gridColumn: '1/-1' }}>لا توجد وحدات مضافة بعد.</p>
            ) : units.map(unit => (
              <div 
                key={unit.id} 
                style={{ 
                  background: '#f8fafc', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontWeight: 'bold' }}>{unit.name}</span>
                  {unit.shortName && <span style={{ fontSize: '12px', color: '#64748b', marginRight: '4px' }}>({unit.shortName})</span>}
                </div>
                <button 
                  onClick={() => { if(confirm('حذف هذه الوحدة؟')) deleteUnit(unit.id) }} 
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
