import React from 'react';

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '80vh',
      color: '#64748b',
      textAlign: 'center',
      direction: 'rtl'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚧</div>
      <h1 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '10px' }}>{title}</h1>
      <p style={{ fontSize: '16px' }}>هذه الصفحة قيد التطوير حالياً وستكون متاحة قريباً.</p>
    </div>
  );
}
