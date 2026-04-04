import { useState } from 'react'
import { useUsers } from '../hooks/useUsers'

export default function Users() {
  const { users, createUser, deleteUser, loading } = useUsers()
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user')

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault()
    if (!newUsername || !newPassword) return

    try {
      await createUser(newUsername, newPassword, newRole)
      setNewUsername('')
      setNewPassword('')
      setNewRole('user')
    } catch (err) {
      alert('Failed to add user')
    }
  }

  async function handleRemoveUser(id: number) {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await deleteUser(id)
    } catch (err) {
      alert('Failed to delete user')
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1a202c' }}>إدارة المستخدمين</h2>
      
      {/* Add User Form */}
      <form onSubmit={handleAddUser} style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: '32px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#4a5568' }}>اسم المستخدم</label>
          <input 
            type="text" 
            value={newUsername} 
            onChange={(e) => setNewUsername(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
            required
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#4a5568' }}>كلمة المرور</label>
          <input 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
            required
          />
        </div>
        <div style={{ width: '120px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#4a5568' }}>الصلاحية</label>
          <select 
            value={newRole} 
            onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
          >
            <option value="user">مستخدم</option>
            <option value="admin">مدير</option>
          </select>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            backgroundColor: '#3182ce', 
            color: 'white', 
            padding: '8px 20px', 
            borderRadius: '6px', 
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            height: '40px'
          }}
        >
          {loading ? 'جاري الإضافة...' : 'إضافة مستخدم'}
        </button>
      </form>

      {/* Users List */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }} dir="rtl">
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', fontWeight: 'bold', color: '#4a5568' }}>اسم المستخدم</th>
              <th style={{ padding: '16px', fontWeight: 'bold', color: '#4a5568' }}>الصلاحية</th>
              <th style={{ padding: '16px', fontWeight: 'bold', color: '#4a5568' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: '#718096' }}>جاري التحميل...</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px', color: '#2d3748' }}>{u.username}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    backgroundColor: u.role === 'admin' ? '#ebf8ff' : '#f7fafc', 
                    color: u.role === 'admin' ? '#2b6cb0' : '#4a5568',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {u.role === 'admin' ? 'مدير' : 'مستخدم'}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <button 
                    onClick={() => handleRemoveUser(u.id)} 
                    style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
