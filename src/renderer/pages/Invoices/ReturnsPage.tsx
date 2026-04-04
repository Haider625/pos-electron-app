import { useState, useEffect } from 'react';
import { useReturns } from '../../hooks/useReturns';
import { useInvoices } from '../../hooks/useInvoices';

export default function ReturnsPage() {
  const { getAllReturns, getReturnDetails, getReturnableItems, createReturn, loading } = useReturns();
  const { getInvoiceByNumber } = useInvoices();
  
  const [returns, setReturns] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewReturnModal, setShowNewReturnModal] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [foundInvoice, setFoundInvoice] = useState<any | null>(null);
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [selectedReturn, setSelectedReturn] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // KPIs
  const [stats, setStats] = useState({
    totalCount: 0,
    totalAmount: 0,
    partialCount: 0
  });

  const loadReturns = async () => {
    try {
      const data = await getAllReturns();
      setReturns(data);
      
      // Calculate simple stats
      const total = data.reduce((sum: number, r: any) => sum + r.totalRefunded, 0);
      setStats({
        totalCount: data.length,
        totalAmount: total,
        partialCount: data.filter((r: any) => r.status === 'partially_returned').length
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const handleSearchInvoice = async () => {
    if (!invoiceSearch) return;
    try {
      // Find invoice by number using the hook
      const inv = await getInvoiceByNumber(invoiceSearch);
      if (inv) {
        const items = await getReturnableItems(inv.id);
        setFoundInvoice(inv);
        setReturnItems(items.map((it: any) => ({ ...it, returnQty: 0 })));
      } else {
        alert('لم يتم العثور على الفاتورة');
      }
    } catch (err) {
      alert('خطأ في البحث عن الفاتورة');
    }
  };

  const handleProcessReturn = async () => {
    const itemsToReturn = returnItems.filter(it => it.returnQty > 0).map(it => ({
      invoiceItemId: it.id,
      productId: it.productId,
      quantity: it.returnQty,
      unitPrice: it.price
    }));

    if (itemsToReturn.length === 0) return alert('يرجى تحديد كميات للإرجاع');

    try {
      await createReturn({
        invoiceId: foundInvoice.id,
        customerId: foundInvoice.customerId,
        items: itemsToReturn,
        reason: 'مرتجع يدوي من صفحة المرتجعات'
      });

      alert('تمت عملية المرتجع بنجاح');
      setShowNewReturnModal(false);
      setFoundInvoice(null);
      setReturnItems([]);
      setInvoiceSearch('');
      loadReturns();
    } catch (err: any) {
      alert(err.message || 'فشل في إتمام المرتجع');
    }
  };

  const handleShowDetails = async (id: number) => {
    try {
      const details = await getReturnDetails(id);
      setSelectedReturn(details);
      setShowDetailsModal(true);
    } catch (err) {
      alert('خطأ في تحميل التفاصيل');
    }
  };

  const filteredReturns = returns.filter(r => 
    r.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.customerName && r.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ padding: '24px', direction: 'rtl', height: '100%', overflowY: 'auto', background: '#f8fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '28px', fontWeight: '800' }}>إدارة المرتجعات</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>عرض ومعالجة مرتجعات المبيعات والتحكم في المخزون</p>
        </div>
        <button 
          onClick={() => setShowNewReturnModal(true)}
          style={{ 
            padding: '12px 24px', 
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            fontWeight: '600', 
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '20px' }}>+</span> مرتجع جديد
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.06)' }}>
          <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>إجمالي عمليات المرتجع</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{stats.totalCount}</div>
        </div>
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.06)' }}>
          <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>إجمالي المبالغ المستردة</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#ef4444' }}>{stats.totalAmount.toLocaleString('ar-EG')} ر.س</div>
        </div>
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.06)' }}>
          <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>مرتجعات اليوم</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#3b82f6' }}>{returns.filter(r => new Date(r.date).toDateString() === new Date().toDateString()).length}</div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
          <input 
            type="text" 
            placeholder="البحث برقم المرتجع، رقم الفاتورة، أو اسم العميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', maxWidth: '400px', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc' }}
          />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>رقم المرتجع</th>
              <th style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>التاريخ</th>
              <th style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>الفاتورة الأصلية</th>
              <th style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>العميل</th>
              <th style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>المبلغ</th>
              <th style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>الحالة</th>
              <th style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading && returns.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>جاري التحميل...</td></tr>
            ) : filteredReturns.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>لا توجد بيانات</td></tr>
            ) : filteredReturns.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover-row">
                <td style={{ padding: '16px', fontWeight: '700', color: '#1e293b' }}>{r.returnNumber}</td>
                <td style={{ padding: '16px', color: '#64748b' }}>{new Date(r.date).toLocaleDateString('ar-EG')}</td>
                <td style={{ padding: '16px', color: '#3b82f6', fontWeight: '500' }}>#{r.invoiceNumber}</td>
                <td style={{ padding: '16px' }}>{r.customerName || 'عميل نقدي'}</td>
                <td style={{ padding: '16px', fontWeight: '800', color: '#ef4444' }}>{r.totalRefunded.toFixed(2)}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    background: '#dcfce7',
                    color: '#166534'
                  }}>مكتمل</span>
                </td>
                <td style={{ padding: '16px' }}>
                  <button 
                    onClick={() => handleShowDetails(r.id)}
                    style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: '600' }}
                  >عرض</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNewReturnModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>إنشاء مرتجع جديد</h2>
              <button onClick={() => setShowNewReturnModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✖</button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {!foundInvoice ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ marginBottom: '16px', color: '#64748b' }}>أدخل رقم الفاتورة للبدء في عملية الإرجاع</p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="رقم الفاتورة (مثلاً: INV-001)"
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchInvoice()}
                      style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', width: '240px', outline: 'none' }}
                    />
                    <button 
                      onClick={handleSearchInvoice}
                      style={{ padding: '12px 24px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
                    >بحث</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>فاتورة رقم</div>
                      <div style={{ fontWeight: '800' }}>{foundInvoice.invoiceNumber}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>العميل</div>
                      <div style={{ fontWeight: '800' }}>{foundInvoice.customerName || 'عميل نقدي'}</div>
                    </div>
                    <button onClick={() => setFoundInvoice(null)} style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>تغيير الفاتورة</button>
                  </div>

                  <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>الأصناف القابلة للإرجاع</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'right', borderBottom: '2px solid #f1f5f9' }}>
                        <th style={{ padding: '12px 8px' }}>المنتج</th>
                        <th style={{ padding: '12px 8px' }}>المتاح</th>
                        <th style={{ padding: '12px 8px' }}>الكمية للإرجاع</th>
                        <th style={{ padding: '12px 8px' }}>قيمة المسترد</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnItems.map((item, idx) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '12px 8px' }}>
                            <div style={{ fontWeight: '600' }}>{item.productName}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>سعر البيع: {item.price.toFixed(2)}</div>
                          </td>
                          <td style={{ padding: '12px 8px' }}>{item.returnableQuantity}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button 
                                onClick={() => setReturnItems(prev => prev.map((p, i) => i === idx ? { ...p, returnQty: Math.max(0, p.returnQty - 1) } : p))}
                                style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}
                              >-</button>
                              <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '700' }}>{item.returnQty}</span>
                              <button 
                                onClick={() => setReturnItems(prev => prev.map((p, i) => i === idx ? { ...p, returnQty: Math.min(p.returnableQuantity, p.returnQty + 1) } : p))}
                                style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}
                              >+</button>
                            </div>
                          </td>
                          <td style={{ padding: '12px 8px', fontWeight: '800', color: '#ef4444' }}>{(item.price * item.returnQty).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div style={{ marginTop: '24px', padding: '16px', background: '#fff5f5', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '700', color: '#c53030' }}>إجمالي المبلغ المسترد:</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#c53030' }}>
                      {returnItems.reduce((s, it) => s + (it.price * it.returnQty), 0).toFixed(2)} ر.س
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px' }}>
              <button 
                disabled={!foundInvoice || returnItems.every(i => i.returnQty === 0) || loading}
                onClick={handleProcessReturn}
                style={{ 
                  flex: 2, 
                  padding: '14px', 
                  background: '#0f172a', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  opacity: (!foundInvoice || returnItems.every(i => i.returnQty === 0) || loading) ? 0.5 : 1
                }}
              >
                {loading ? 'جاري المعالجة...' : 'تأكيد وإتمام المرتجع'}
              </button>
              <button 
                onClick={() => setShowNewReturnModal(false)}
                style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
              >إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedReturn && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '600px', padding: '30px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>تفاصيل مرتجع {selectedReturn.returnNumber}</h2>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>سبب المرتجع:</div>
              <div style={{ fontWeight: '600' }}>{selectedReturn.reason || 'غير محدد'}</div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
              <thead>
                <tr style={{ textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '8px' }}>المنتج</th>
                  <th style={{ padding: '8px' }}>الكمية</th>
                  <th style={{ padding: '8px' }}>السعر</th>
                  <th style={{ padding: '8px' }}>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {selectedReturn.items.map((it: any) => (
                  <tr key={it.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '8px' }}>{it.productName}</td>
                    <td style={{ padding: '8px' }}>{it.quantity}</td>
                    <td style={{ padding: '8px' }}>{it.unitPrice.toFixed(2)}</td>
                    <td style={{ padding: '8px', fontWeight: '700' }}>{it.lineTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '600' }}>إجمالي المبلغ المسترد:</span>
              <span style={{ fontWeight: '900', color: '#ef4444' }}>{selectedReturn.totalRefunded.toFixed(2)} ر.س</span>
            </div>

            <button 
              onClick={() => setShowDetailsModal(false)}
              style={{ width: '100%', marginTop: '32px', padding: '14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
            >إغلاق</button>
          </div>
        </div>
      )}

      <style>{`
        .hover-row:hover {
          background-color: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}
