import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import type { Product, Customer } from '../../shared/types'
import { useProducts } from '../hooks/useProducts'
import { useInvoices } from '../hooks/useInvoices'
import { useCustomers } from '../hooks/useCustomers'
import { useCategories } from '../hooks/useCategories'

type CartItem = Product & { quantity: number; itemDiscount?: number }

export default function POS() {
  const { products, loading: productsLoading } = useProducts()
  const { categories } = useCategories()
  const { customers } = useCustomers()
  const { createInvoice } = useInvoices()

  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [totalDiscount, setTotalDiscount] = useState(0)
  const [paidAmount, setPaidAmount] = useState<number | ''>('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'credit'>('cash')
  const [successInfo, setSuccessInfo] = useState<{ id: number; number: string } | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [selectedCartIndex, setSelectedCartIndex] = useState<number | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)
  const paidAmountRef = useRef<HTMLInputElement>(null)

  const selectedCustomer = useMemo<Customer | undefined>(
    () => customers.find(c => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  )

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = Math.max(0, subtotal - totalDiscount)
  const change = typeof paidAmount === 'number' ? Math.max(0, paidAmount - total) : 0
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0)

  const filteredProducts = useMemo(
    () => products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.includes(search)
      const matchesCategory = selectedCategoryId ? p.categoryId === selectedCategoryId : true
      return matchesSearch && matchesCategory
    }),
    [products, search, selectedCategoryId]
  )

  const filteredCustomers = useMemo(
    () => customers.filter(c =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone?.includes(customerSearch)
    ),
    [customers, customerSearch]
  )

  const addToCart = (product: Product) => {
    if (product.stock === 0) return
    const existingIndex = cart.findIndex(item => item.id === product.id)
    if (existingIndex !== -1) {
      setCart(cart.map((item, idx) => idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item))
      setSelectedCartIndex(existingIndex)
    } else {
      const newItems = [...cart, { ...product, quantity: 1, itemDiscount: 0 }]
      setCart(newItems)
      setSelectedCartIndex(newItems.length - 1)
    }
  }

  const removeFromCart = (id: number) => {
    const newCart = cart.filter(item => item.id !== id)
    setCart(newCart)
    if (newCart.length === 0) setSelectedCartIndex(null)
    else if (selectedCartIndex !== null) setSelectedCartIndex(Math.min(selectedCartIndex, newCart.length - 1))
  }

  const updateQuantity = (id: number, q: number) => {
    if (q < 1) return removeFromCart(id)
    setCart(cart.map(item => item.id === id ? { ...item, quantity: q } : item))
  }

  const clearCart = () => {
    setCart([])
    setTotalDiscount(0)
    setPaidAmount('')
    setSelectedCustomerId(null)
    setCustomerSearch('')
  }

  const checkout = useCallback(async () => {
    if (cart.length === 0 || isCheckingOut) return
    setIsCheckingOut(true)
    try {
      const result = await createInvoice({
        total,
        totalDiscount,
        totalTax: 0,
        paidAmount: typeof paidAmount === 'number' ? paidAmount : total,
        changeAmount: change,
        paymentMethod,
        customerName: selectedCustomer?.name || 'نقدي',
        customerId: selectedCustomerId || undefined,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          discount: item.itemDiscount || 0,
        })),
      })
      setSuccessInfo({ id: result.id, number: result.invoiceNumber })
      clearCart()
    } catch (err: any) {
      const msg = err?.message || err?.toString() || 'خطأ غير معروف'
      alert(`خطأ في حفظ الفاتورة:\n${msg}`)
    } finally {
      setIsCheckingOut(false)
    }
  }, [cart, isCheckingOut, total, totalDiscount, paidAmount, change, paymentMethod, selectedCustomer, selectedCustomerId, createInvoice])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus(); searchRef.current?.select() }
      if (e.key === 'F4') {
        e.preventDefault()
        const targetInput = document.querySelector(`.qty-input[data-index="${selectedCartIndex}"]`) as HTMLInputElement
        if (targetInput) { targetInput.focus(); targetInput.select() }
      }
      if (e.key === 'F9') { e.preventDefault(); checkout() }
      if (cart.length > 0) {
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedCartIndex(prev => (prev === null || prev <= 0) ? cart.length - 1 : prev - 1)
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedCartIndex(prev => (prev === null || prev >= cart.length - 1) ? 0 : prev + 1)
        }
        if (e.key === 'Delete' && selectedCartIndex !== null && document.activeElement?.tagName !== 'INPUT') {
          removeFromCart(cart[selectedCartIndex].id)
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [checkout])

  const handleSuccessClose = () => {
    setSuccessInfo(null)
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  const stockBadge = (stock: number) => {
    if (stock === 0) return { label: 'نافد', bg: '#fef2f2', color: '#dc2626' }
    if (stock < 5) return { label: 'منخفض', bg: '#fff7ed', color: '#ea580c' }
    return { label: 'متوفر', bg: '#f0fdf4', color: '#16a34a' }
  }

  const P = '#2563eb'
  const SUCCESS = '#16a34a'
  const BG = '#f1f5f9'

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)', background: BG, overflow: 'hidden' }}>
      <style>{`
        .pos-scroll::-webkit-scrollbar { width: 3px; height: 3px; }
        .pos-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .pos-card { transition: all 0.2s ease; }
        .pos-card:hover:not(.disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important; border-color: #93c5fd !important; }
        .pos-card.disabled { opacity: 0.4; cursor: not-allowed !important; }
        .pay-btn { transition: all 0.15s; }
        .pay-btn.active { border-color: ${P} !important; background: #eff6ff !important; color: ${P} !important; font-weight: 700; }
        .cat-tab { transition: all 0.15s; white-space: nowrap; }
        .cat-tab.active { background: ${P} !important; color: white !important; }
        .cat-tab:not(.active):hover { background: #eff6ff; color: ${P}; }
        .qty-btn:hover { background: #e2e8f0 !important; }
        .qty-input::-webkit-outer-spin-button, .qty-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .qty-input[type=number] { -moz-appearance: textfield; }
        @keyframes slideIn { from { opacity:0; transform: translateY(4px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .anim-slide { animation: slideIn 0.15s ease; }
        .anim-fade { animation: fadeIn 0.1s ease; }
      `}</style>

      {/* ── TOP BAR ────────────────────────────────────────────── */}
      <div style={{ background: 'white', padding: '10px 20px', display: 'flex', gap: '10px', alignItems: 'center', borderBottom: '1px solid #e2e8f0', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

        {/* Search */}
        <div style={{ flex: 1, position: 'relative', maxWidth: '560px' }}>
          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '15px', pointerEvents: 'none' }}>🔍</span>
          <input
            ref={searchRef}
            type="text"
            placeholder="ابحث بالاسم أو SKU أو الباركود..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            style={{ width: '100%', padding: '10px 38px 10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)' }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        {/* Customer input */}
        <div style={{ position: 'relative', width: '200px' }}>
          <input
            type="text"
            placeholder="👤 عميل..."
            value={selectedCustomer ? selectedCustomer.name : customerSearch}
            onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); if (selectedCustomerId) setSelectedCustomerId(null) }}
            onFocus={() => setShowCustomerDropdown(true)}
            onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 150)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
          />
          {showCustomerDropdown && customerSearch && !selectedCustomerId && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', marginTop: '6px', overflow: 'hidden', maxHeight: '200px', overflowY: 'auto' }} className="pos-scroll anim-slide">
              {filteredCustomers.map(c => (
                <div key={c.id} onMouseDown={() => { setSelectedCustomerId(c.id); setCustomerSearch(''); setShowCustomerDropdown(false) }} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f8fafc' }} onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')} onMouseOut={e => (e.currentTarget.style.background = 'white')}>
                  <div style={{ fontWeight: '700', fontSize: '13px' }}>{c.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{c.phone}</div>
                </div>
              ))}
              {filteredCustomers.length === 0 && <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>لا يوجد عميل مطابق</div>}
            </div>
          )}
        </div>

        {/* Cash customer quick button */}
        <button
          onClick={() => { setSelectedCustomerId(null); setCustomerSearch(''); setShowCustomerDropdown(false) }}
          style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', color: '#475569', fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap' }}
        >
          نقدي
        </button>

        {/* Invoice badge */}
        <div style={{ fontSize: '12px', color: '#94a3b8', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
          فاتورة: <span style={{ color: '#1e293b', fontWeight: '700' }}>جديدة</span>
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Products Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '14px 16px 14px 20px' }}>

          {/* Category Tabs */}
          <div className="pos-scroll" style={{ display: 'flex', gap: '4px', overflowX: 'auto', marginBottom: '8px', paddingBottom: '2px', flexShrink: 0 }}>
            <button onClick={() => setSelectedCategoryId(null)} className={`cat-tab ${selectedCategoryId === null ? 'active' : ''}`} style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', background: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '11px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>الكل</button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategoryId(cat.id)} className={`cat-tab ${selectedCategoryId === cat.id ? 'active' : ''}`} style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', background: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '11px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>{cat.name}</button>
            ))}
          </div>

          {/* Product Cards */}
          <div className="pos-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '4px', alignContent: 'flex-start' }}>
            {productsLoading ? (
              <div style={{ width: '100%', textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
                <div style={{ fontSize: '30px', marginBottom: '10px' }}>⏳</div>جاري التحميل...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ width: '100%', textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</div>لا توجد منتجات مطابقة
              </div>
            ) : filteredProducts.map(p => {
              const badge = stockBadge(p.stock)
              const isOOS = p.stock === 0
              return (
                <div key={p.id} onClick={() => addToCart(p)} className={`pos-card${isOOS ? ' disabled' : ''}`} title={isOOS ? 'المخزون نافد' : undefined}
                  style={{ background: 'white', borderRadius: '6px', border: '1.5px solid #e2e8f0', padding: '4px 8px', cursor: isOOS ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '11px', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ color: P, fontSize: '11px', fontWeight: '800', whiteSpace: 'nowrap' }}>{p.price.toFixed(2)} <span style={{ fontSize: '9px', fontWeight: '500', color: '#94a3b8' }}>ر.س</span></div>
                  <div style={{ background: badge.bg, color: badge.color, fontSize: '8px', fontWeight: '800', padding: '1px 4px', borderRadius: '3px', whiteSpace: 'nowrap' }}>{badge.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── INVOICE PANEL ───────────────────────────────────────── */}
        <div style={{ width: '450px', flexShrink: 0, background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>{selectedCustomer ? selectedCustomer.name : 'عميل نقدي'}</div>
              {totalQty > 0 && <div style={{ fontSize: '11px', color: '#94a3b8', background: '#f1f5f9', padding: '1px 8px', borderRadius: '20px' }}>{cart.length} صنف · {totalQty} قطعة</div>}
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>🗑️ إفراغ</button>
            )}
          </div>

          {/* Cart Items */}
          <div className="pos-scroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 10px' }}>
            {cart.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', gap: '10px' }}>
                <div style={{ fontSize: '52px' }}>🛒</div>
                <div style={{ fontWeight: '700', fontSize: '14px' }}>السلة فارغة</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>انقر على منتج لإضافته</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingTop: '2px' }}>
                {cart.map((item, index) => (
                  <div key={item.id} onClick={() => setSelectedCartIndex(index)} className="anim-slide" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: '#f8fafc', borderRadius: '8px', border: index === selectedCartIndex ? `2px solid ${P}` : '1px solid #e8f0fe', cursor: 'pointer', boxShadow: index === selectedCartIndex ? '0 0 0 2px rgba(37,99,235,0.1)' : 'none' }}>
                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontWeight: '700', fontSize: '11px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{item.name}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{item.price.toFixed(2)} ر.س</div>
                      <div style={{ fontSize: '11px', color: P, fontWeight: '900', whiteSpace: 'nowrap', minWidth: '55px', textAlign: 'left', borderRight: '1.5px solid #e2e8f0', paddingRight: '6px' }}>
                         {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'white', borderRadius: '6px', padding: '1px', border: '1.5px solid #e2e8f0' }}>
                      <button className="qty-btn" onClick={e => { e.stopPropagation(); updateQuantity(item.id, item.quantity - 1) }} style={{ width: '20px', height: '20px', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', color: '#64748b', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateQuantity(item.id, Math.max(1, Number(e.target.value)))}
                        onFocus={() => setSelectedCartIndex(index)}
                        className="qty-input"
                        data-index={index}
                        style={{
                          width: '24px', textAlign: 'center', fontWeight: '800', fontSize: '11px',
                          color: '#0f172a', border: 'none', outline: 'none', background: 'transparent',
                          padding: 0, MozAppearance: 'textfield'
                        }}
                      />
                      <button className="qty-btn" onClick={e => { e.stopPropagation(); updateQuantity(item.id, item.quantity + 1) }} style={{ width: '20px', height: '20px', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', color: '#64748b', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    <button onClick={e => { e.stopPropagation(); removeFromCart(item.id) }} style={{ width: '20px', height: '20px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#cbd5e1', borderRadius: '4px', flexShrink: 0, fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626' }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary + Payment + Checkout */}
          <div style={{ borderTop: '1px solid #e2e8f0', background: '#fafbfc', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '7px', flexShrink: 0 }}>

            {/* Subtotal & Discount & Total */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                <span>إجمالي المشتريات</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>{subtotal.toFixed(2)} ر.س</span>
              </div> */}
              {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                <span>الخصم</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input type="number" min={0} value={totalDiscount} onChange={e => setTotalDiscount(Math.max(0, Number(e.target.value)))} style={{ width: '58px', padding: '3px 6px', borderRadius: '6px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontWeight: '700', fontSize: '12px', outline: 'none', background: 'white' }} onFocus={e => (e.target.style.borderColor = P)} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>ر.س</span>
                </div>
              </div> */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 10px', background: 'white', borderRadius: '8px', border: '1.5px solid #e2e8f0' }}>
                <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '12px' }}>الإجمالي النهائي</span>
                <span style={{ fontWeight: '900', fontSize: '15px', color: P }}>{total.toFixed(2)} <span style={{ fontSize: '10px', fontWeight: '600' }}>ر.س</span></span>
              </div>
            </div>

            {/* Payment Method Buttons */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['cash', 'card', 'transfer', 'credit'] as const).map(pm => (
                <button key={pm} onClick={() => setPaymentMethod(pm)} className={`pay-btn ${paymentMethod === pm ? 'active' : ''}`}
                  style={{ flex: 1, padding: '6px 2px', borderRadius: '7px', border: '2px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '10px', fontWeight: '600', color: '#64748b' }}>
                  {pm === 'cash' ? '💵 نقدي' : pm === 'card' ? '💳 بطاقة' : pm === 'transfer' ? '🏦 تحويل' : '⏳ آجل'}
                </button>
              ))}
            </div>

            {/* Paid + Change */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                {/* <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '3px' }}>المبلغ المدفوع</div> */}
                <input ref={paidAmountRef} type="number" min={0} placeholder={total > 0 ? total.toFixed(2) : '0.00'} value={paidAmount} onChange={e => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ width: '92%', padding: '2px 10px', borderRadius: '9px', border: `2px solid ${P}`, fontWeight: '700', textAlign: 'center', fontSize: '15px', outline: 'none', background: 'white', boxShadow: '0 0 0 3px rgba(37,99,235,0.08)' }} />
              </div>
              <div style={{ textAlign: 'center', minWidth: '76px' }}>
                {/* <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '3px' }}>الباقي</div> */}
                <div style={{ fontSize: '16px', fontWeight: '700', color: change > 0 ? '#16a34a' : '#94a3b8', padding: '1px 6px', background: change > 0 ? '#f0fdf4' : '#f8fafc', borderRadius: '9px', border: `2px solid ${change > 0 ? '#bbf7d0' : '#e2e8f0'}` }}>
                  {change.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Checkout */}
            <button onClick={checkout} disabled={cart.length === 0 || isCheckingOut}
              style={{ width: '100%', padding: '8px', borderRadius: '11px', border: 'none', background: cart.length === 0 ? '#e2e8f0' : SUCCESS, color: cart.length === 0 ? '#94a3b8' : 'white', fontSize: '15px', fontWeight: '700', cursor: cart.length === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: cart.length > 0 ? '0 4px 14px rgba(22,163,74,0.3)' : 'none' }}
              onMouseOver={e => { if (cart.length > 0) e.currentTarget.style.background = '#15803d' }}
              onMouseOut={e => { if (cart.length > 0) e.currentTarget.style.background = SUCCESS }}>
              {isCheckingOut ? '⏳ جاري الحفظ...' : '✅ إتمام البيع  [F9]'}
            </button>
          </div>
        </div>
      </div>

      {/* ── SUCCESS MODAL ───────────────────────────────────────── */}
      {successInfo && (
        <div className="anim-fade" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="anim-slide" style={{ background: 'white', padding: '48px 40px', borderRadius: '24px', textAlign: 'center', maxWidth: '420px', width: '90%', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>تمت عملية البيع</h2>
            <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '32px' }}>رقم الفاتورة: <span style={{ color: '#0f172a', fontWeight: '800' }}>{successInfo.number}</span></p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleSuccessClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '15px', color: '#1e293b' }}>إغلاق</button>
              <button style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: P, color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>🖨️ طباعة الفاتورة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
