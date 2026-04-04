import { useState } from 'react';
import { useInvoices } from '../hooks/useInvoices';
import { useReturns } from '../hooks/useReturns';

export default function Invoices() {
  const { invoices, loading, getInvoiceDetails } = useInvoices();
  const { createReturn } = useReturns();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [invoiceReturns, setInvoiceReturns] = useState<any[]>([]);
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [isReturning, setIsReturning] = useState(false);

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShowDetails = async (id: number) => {
    try {
      const details = await getInvoiceDetails(id);
      setSelectedInvoice(details);
      
      // Fetch linked returns
      const returnsArr = await (window.api as any).returns.getByInvoice(id);
      setInvoiceReturns(returnsArr);
      
      setShowDetails(true);
      setIsReturning(false);
    } catch (err) {
      alert('خطأ في تحميل تفاصيل الفاتورة');
    }
  };

  const handleInitiateReturn = () => {
    setIsReturning(true);
    setReturnItems(selectedInvoice.items.map((it: any) => ({
      ...it,
      returnQuantity: 0,
      refundAmount: 0
    })));
  };

  const processReturn = async () => {
    const itemsToReturn = returnItems.filter(it => it.returnQuantity > 0).map(it => ({
      invoiceItemId: it.id,
      productId: it.productId,
      quantity: it.returnQuantity,
      refundAmount: it.refundAmount
    }));

    if (itemsToReturn.length === 0) return alert('يرجى تحديد الكميات المراد إرجاعها');

    try {
      await createReturn({
        invoiceId: selectedInvoice.id,
        items: itemsToReturn,
        reason: 'إرجاع يدوي من سجل الفواتير'
      });
      alert('تمت معالجة المرتجع بنجاح');
      setShowDetails(false);
    } catch (err: any) {
      alert(err.message || 'خطأ في معالجة المرتجع');
    }
  };

  return (
    <div style={{ padding: '20px', direction: 'rtl', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: '#1e293b', fontSize: '24px' }}>سجل الفواتير الاحترافي</h1>
      </div>

      <div style={{ marginBottom: '24px', position: 'relative' }}>
         <input
          type="text"
          placeholder="البحث برقم الفاتورة أو اسم العميل..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', maxWidth: '500px', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
        />
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '18px' }}>رقم الفاتورة</th>
              <th style={{ padding: '18px' }}>التاريخ</th>
              <th style={{ padding: '18px' }}>العميل</th>
              <th style={{ padding: '18px' }}>الحالة</th>
              <th style={{ padding: '18px' }}>المجموع</th>
              <th style={{ padding: '18px' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>جاري التحميل...</td></tr>
            ) : filteredInvoices.map(invoice => (
              <tr key={invoice.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '18px', fontWeight: 'bold' }}>{invoice.invoiceNumber}</td>
                <td style={{ padding: '18px', color: '#64748b' }}>{new Date(invoice.date).toLocaleString('ar-EG')}</td>
                <td style={{ padding: '18px', fontWeight: '700' }}>{invoice.customerName || 'عميل نقدي'}</td>
                <td style={{ padding: '18px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    backgroundColor: invoice.status === 'active' ? '#dcfce7' : 
                                   invoice.status === 'partially_returned' ? '#fef9c3' : '#fee2e2',
                    color: invoice.status === 'active' ? '#166534' : 
                           invoice.status === 'partially_returned' ? '#854d0e' : '#991b1b'
                  }}>
                    {invoice.status === 'active' ? 'نشطة' : 
                     invoice.status === 'returned' ? 'مرتجعة' : 
                     invoice.status === 'partially_returned' ? 'مرتجعة جزئياً' : 'ملغاة'}
                  </span>
                </td>

                <td style={{ padding: '18px', color: '#2563eb', fontWeight: '900' }}>{invoice.total.toFixed(2)}</td>
                <td style={{ padding: '18px' }}>
                  <button 
                    onClick={() => handleShowDetails(invoice.id)}
                    style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#475569' }}
                  >تفاصيل</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDetails && selectedInvoice && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
              <h2 style={{ margin: 0 }}>تفاصيل فاتورة: {selectedInvoice.invoiceNumber}</h2>
              <button onClick={() => setShowDetails(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✖</button>
            </div>

            <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>المنتجات (Snapshot)</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'right' }}>
                  <th style={{ padding: '12px' }}>المنتج</th>
                  <th style={{ padding: '12px' }}>السعر</th>
                  <th style={{ padding: '12px' }}>الكمية</th>
                  <th style={{ padding: '12px' }}>المتاح للإرجاع</th>
                  <th style={{ padding: '12px' }}>الإجمالي</th>
                  {isReturning && <th style={{ padding: '12px' }}>إرجاع</th>}
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items.map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '12px' }}>{item.productName}</td>
                    <td style={{ padding: '12px' }}>{item.price.toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>{item.quantity}</td>
                    <td style={{ padding: '12px' }}>{item.returnableQuantity}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{(item.price * item.quantity).toFixed(2)}</td>
                    {isReturning && (
                      <td style={{ padding: '12px' }}>
                        <input 
                          type="number" 
                          max={item.returnableQuantity} min={0}
                          style={{ width: '60px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          onChange={(e) => {
                            const q = Number(e.target.value);
                            setReturnItems(prev => prev.map(p => p.id === item.id ? { ...p, returnQuantity: q, refundAmount: q * item.price } : p));
                          }}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {invoiceReturns.length > 0 && (
              <>
                <h3 style={{ marginBottom: '15px', color: '#ef4444' }}>سجل المرتجعات لهذه الفاتورة</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                  <thead>
                    <tr style={{ background: '#fff5f5', textAlign: 'right' }}>
                      <th style={{ padding: '12px' }}>التاريخ</th>
                      <th style={{ padding: '12px' }}>السبب</th>
                      <th style={{ padding: '12px' }}>المبلغ المسترد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceReturns.map((r: any) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #fff5f5' }}>
                        <td style={{ padding: '12px' }}>{new Date(r.date).toLocaleString('ar-EG')}</td>
                        <td style={{ padding: '12px' }}>{r.reason}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#c53030' }}>{r.totalAmount.toFixed(2)} ر.س</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              {!isReturning && selectedInvoice.status === 'active' && (
                <button onClick={handleInitiateReturn} style={{ flex: 1, padding: '14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>تجهيز مرتجع</button>
              )}
              {isReturning && (
                <button onClick={processReturn} style={{ flex: 1, padding: '14px', background: '#059669', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>تأكيد المرتجع</button>
              )}
              <button onClick={() => setShowDetails(false)} style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
