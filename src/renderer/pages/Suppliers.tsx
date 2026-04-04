import React, { useState } from 'react';
import { useSuppliers } from '../hooks/useSuppliers';
import type { Supplier } from '../../shared/types';

export default function Suppliers() {
  const { suppliers, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
  });

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData(supplier);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المورد؟')) {
      await deleteSupplier(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, formData);
      } else {
        await createSupplier(formData);
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
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
    });
    setEditingSupplier(null);
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', direction: 'rtl' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#2d3748' }}>إدارة الموردين</h1>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#48bb78',
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
          مورد جديد
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="البحث باسم المورد أو جهة الاتصال..."
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
              <th style={{ padding: '15px' }}>اسم المورد</th>
              <th style={{ padding: '15px' }}>جهة الاتصال</th>
              <th style={{ padding: '15px' }}>الهاتف</th>
              <th style={{ padding: '15px' }}>البريد الإلكتروني</th>
              <th style={{ padding: '15px' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map(supplier => (
              <tr key={supplier.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{supplier.name}</td>
                <td style={{ padding: '15px', color: '#4a5568' }}>{supplier.contactPerson || '-'}</td>
                <td style={{ padding: '15px', color: '#4a5568' }}>{supplier.phone || '-'}</td>
                <td style={{ padding: '15px', color: '#4a5568' }}>{supplier.email || '-'}</td>
                <td style={{ padding: '15px', display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleEdit(supplier)}
                    style={{ padding: '6px 12px', backgroundColor: '#edf2f7', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#4a5568' }}
                  >
                    تعديل
                  </button>
                  <button 
                    onClick={() => handleDelete(supplier.id)}
                    style={{ padding: '6px 12px', backgroundColor: '#fff5f5', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#c53030' }}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {filteredSuppliers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#a0aec0' }}>
                  لا يوجد موردين مطابقين للبحث
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
              {editingSupplier ? 'تعديل بيانات مورد' : 'إضافة مورد جديد'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#4a5568' }}>اسم المورد / الشركة</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#4a5568' }}>جهة الاتصال (الموظف مسؤول)</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
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
                    backgroundColor: '#48bb78',
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
