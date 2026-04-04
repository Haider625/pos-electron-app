import React, { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import type { Customer } from '../../shared/types';

export default function Customers() {
  const { customers, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    totalDebt: 0,
    loyaltyPoints: 0,
  });

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      await deleteCustomer(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
      } else {
        await createCustomer(formData);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      totalDebt: 0,
      loyaltyPoints: 0,
    });
    setEditingCustomer(null);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  return (
    <div style={{ padding: '20px', direction: 'rtl' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#2d3748' }}>إدارة العملاء</h1>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>+</span>
          عميل جديد
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="البحث بالاسم أو الهاتف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            outline: 'none',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '15px' }}>اسم العميل</th>
              <th style={{ padding: '15px' }}>الهاتف</th>
              <th style={{ padding: '15px' }}>العنوان</th>
              <th style={{ padding: '15px' }}>الديون</th>
              <th style={{ padding: '15px' }}>النقاط</th>
              <th style={{ padding: '15px' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{customer.name}</td>
                <td style={{ padding: '15px', color: '#4a5568' }}>{customer.phone || '-'}</td>
                <td style={{ padding: '15px', color: '#4a5568' }}>{customer.address || '-'}</td>
                <td style={{ padding: '15px', color: customer.totalDebt && customer.totalDebt > 0 ? '#e53e3e' : '#48bb78', fontWeight: 'bold' }}>
                  {customer.totalDebt?.toFixed(2) || '0.00'}
                </td>
                <td style={{ padding: '15px', color: '#4299e1' }}>{customer.loyaltyPoints || 0}</td>
                <td style={{ padding: '15px', display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleEdit(customer)}
                    style={{ padding: '6px 12px', backgroundColor: '#edf2f7', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#4a5568' }}
                  >
                    تعديل
                  </button>
                  <button 
                    onClick={() => handleDelete(customer.id)}
                    style={{ padding: '6px 12px', backgroundColor: '#fff5f5', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#c53030' }}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#a0aec0' }}>
                  لا يوجد عملاء مطابقين للبحث
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(4px)', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '500px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', animation: 'slideUp 0.3s ease-out'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#2d3748' }}>
              {editingCustomer ? 'تعديل بيانات عميل' : 'إضافة عميل جديد'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#4a5568' }}>الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#4a5568' }}>رقم الهاتف</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#4a5568' }}>البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#4a5568' }}>العنوان</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#4a5568' }}>الرصيد الافتتاحي (مدين)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.totalDebt}
                    onChange={(e) => setFormData({ ...formData, totalDebt: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#4a5568' }}>نقاط الولاء</label>
                  <input
                    type="number"
                    value={formData.loyaltyPoints}
                    onChange={(e) => setFormData({ ...formData, loyaltyPoints: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#edf2f7',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#4a5568'
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 30px',
                    backgroundColor: '#4299e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  حفـــظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        tr:hover { backgroundColor: #f8fafc; }
      `}</style>
    </div>
  );
}
