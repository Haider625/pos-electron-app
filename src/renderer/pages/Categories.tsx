import { useState, useMemo } from 'react'
import { useCategories } from '../hooks/useCategories'
import { useSubCategories } from '../hooks/useSubCategories'

// Icons (SVG components)
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const DeleteIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/></svg>;
const EmptyFolderIcon = () => <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

export default function Categories() {
  const { categories, createCategory, updateCategory, deleteCategory, loading: catLoading } = useCategories()
  const { subCategories, createSubCategory, deleteSubCategory, loading: subCatLoading } = useSubCategories()
  
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)
  
  const [newCatName, setNewCatName] = useState('')
  const [editingCatId, setEditingCatId] = useState<number | null>(null)
  const [editCatName, setEditCatName] = useState('')
  
  const [newSubCatName, setNewSubCatName] = useState('')

  const activeCategory = useMemo(() => 
    categories.find(c => c.id === activeCategoryId), 
    [categories, activeCategoryId]
  )
  
  const filteredSubCategories = useMemo(() => 
    activeCategoryId ? subCategories.filter(s => s.categoryId === activeCategoryId) : [],
    [subCategories, activeCategoryId]
  )

  const getSubCount = (catId: number) => subCategories.filter(s => s.categoryId === catId).length;

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCatName.trim()) return
    try {
      await createCategory(newCatName.trim())
      setNewCatName('')
    } catch (err) { alert('فشل في إضافة التصنيف') }
  }

  async function handleUpdateCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!editCatName.trim() || editingCatId === null) return
    try {
      await updateCategory(editingCatId, editCatName.trim())
      setEditingCatId(null)
    } catch (err) { alert('فشل في تحديث التصنيف') }
  }

  async function handleAddSubCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newSubCatName.trim() || !activeCategoryId) return
    try {
      await createSubCategory(newSubCatName.trim(), activeCategoryId)
      setNewSubCatName('')
    } catch (err) { alert('فشل في إضافة التصنيف الفرعي') }
  }

  // Styles
  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  }

  const inputClass = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    transition: 'all 0.2s',
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column' }} dir="rtl">
      
      {/* Global Header */}
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>إدارة التصنيفات</h2>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>نظّم التصنيفات الرئيسية والفروع المرتبطة بها.</p>
      </header>

      {/* Main Layout Workspace - 35% / 65% Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 35%) 1fr', gap: '24px', flex: 1, minHeight: 0 }}>
        
        {/* Right Pane: Main Categories */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          
          <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>التصنيفات الرئيسية</h3>
            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                value={newCatName} 
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="اسم التصنيف..." 
                style={{ ...inputClass, flex: 1 }} 
              />
              <button 
                type="submit" 
                disabled={!newCatName.trim() || catLoading}
                style={{ 
                  background: (!newCatName.trim() || catLoading) ? '#93c5fd' : '#2563eb', 
                  color: 'white', border: 'none', borderRadius: '10px', width: '48px', 
                  cursor: (!newCatName.trim() || catLoading) ? 'not-allowed' : 'pointer', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s',
                  boxShadow: (!newCatName.trim() || catLoading) ? 'none' : '0 2px 4px rgba(37,99,235,0.2)'
                }}
              >
                <PlusIcon />
              </button>
            </form>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {categories.map(cat => {
              const isSelected = activeCategoryId === cat.id;
              return (
                <div 
                  key={cat.id} 
                  onClick={() => setActiveCategoryId(cat.id)}
                  className="cat-item"
                  style={{
                    padding: '16px 20px', 
                    borderRadius: '12px', 
                    marginBottom: '8px', 
                    cursor: 'pointer',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    transition: 'all 0.2s',
                    background: isSelected ? '#eff6ff' : 'transparent',
                    borderRight: isSelected ? '4px solid #2563eb' : '4px solid transparent',
                    borderLeft: '4px solid transparent', // Layout symmetry
                    borderTop: '1px solid transparent',
                    borderBottom: '1px solid transparent',
                  }}
                >
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    {editingCatId === cat.id ? (
                      <form onSubmit={handleUpdateCategory} style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                        <input 
                          type="text" value={editCatName} onChange={(e) => setEditCatName(e.target.value)}
                          style={{ ...inputClass, padding: '8px 12px', fontSize: '13px' }} autoFocus onClick={e => e.stopPropagation()}
                        />
                        <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✓</button>
                        <button type="button" onClick={() => setEditingCatId(null)} style={{ background: '#94a3b8', color: 'white', border: 'none', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✕</button>
                      </form>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: isSelected ? '700' : '600', color: isSelected ? '#1e293b' : '#334155', fontSize: '15px' }}>{cat.name}</span>
                        <span style={{ fontSize: '13px', color: isSelected ? '#3b82f6' : '#64748b', fontWeight: isSelected ? '600' : '400' }}>
                          {getSubCount(cat.id)} فروع
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {!editingCatId && (
                    <div className="cat-actions" style={{ display: 'flex', gap: '6px', opacity: isSelected ? 1 : 0, transition: '0.2s' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingCatId(cat.id); setEditCatName(cat.name); }}
                        style={{ background: isSelected ? '#dbeafe' : '#f1f5f9', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex' }}
                        title="تعديل"
                      >
                        <EditIcon />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); if(confirm('هل تريد فعلاً حذف التصنيف؟ سيتم حذف جميع الفروع المرتبطة به.')) { deleteCategory(cat.id); if(activeCategoryId === cat.id) setActiveCategoryId(null); } }}
                        style={{ background: isSelected ? '#fee2e2' : '#fef2f2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex' }}
                        title="حذف"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {categories.length === 0 && !catLoading && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                <div style={{ marginBottom: '16px' }}><EmptyFolderIcon /></div>
                <span style={{ fontSize: '14px', lineHeight: '1.6', display: 'block' }}>لا توجد تصنيفات رئيسية بعد.<br/>أضف تصنيفاً للبدء.</span>
              </div>
            )}
          </div>
        </div>

        {/* Left Pane: Sub Categories Workspace */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {activeCategory ? (
            <>
              {/* Contextual Header */}
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>فروع: {activeCategory.name}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{filteredSubCategories.length} فروع مرتبطة بهذا التصنيف</p>
                </div>
                <form onSubmit={handleAddSubCategory} style={{ display: 'flex', gap: '12px', minWidth: '380px' }}>
                  <input 
                    type="text" 
                    value={newSubCatName} 
                    onChange={(e) => setNewSubCatName(e.target.value)}
                    placeholder="اسم الفرع الجديد..." 
                    style={{ ...inputClass, flex: 1 }} 
                  />
                  <button 
                    type="submit" 
                    disabled={!newSubCatName.trim() || subCatLoading}
                    style={{ 
                      background: (!newSubCatName.trim() || subCatLoading) ? '#93c5fd' : '#2563eb', 
                      color: 'white', border: 'none', borderRadius: '10px', padding: '0 24px', 
                      fontWeight: '700', fontSize: '14px', cursor: (!newSubCatName.trim() || subCatLoading) ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s',
                      boxShadow: (!newSubCatName.trim() || subCatLoading) ? 'none' : '0 2px 4px rgba(37,99,235,0.2)'
                    }}
                  >
                    <PlusIcon />
                    إضافة فرع
                  </button>
                </form>
              </div>

              {/* Workspace Area */}
              <div style={{ flex: 1, padding: '32px', overflowY: 'auto', background: '#f8fafc' }}>
                {filteredSubCategories.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', alignContent: 'start' }}>
                    {filteredSubCategories.map(sub => (
                      <div 
                        key={sub.id} 
                        className="subcat-item"
                        style={{ 
                          padding: '18px 24px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '15px' }}>{sub.name}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => { if(confirm('هل تريد بالتأكيد حذف هذا الفرع؟')) deleteSubCategory(sub.id) }}
                            style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fee2e2', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', transition: '0.2s' }}
                            title="حذف"
                            className="subcat-del-btn"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <div style={{ marginBottom: '24px' }}>
                      <EmptyFolderIcon />
                    </div>
                    <h3 style={{ color: '#0f172a', fontSize: '20px', margin: '0 0 10px 0', fontWeight: '700' }}>لا توجد فروع بعد</h3>
                    <p style={{ margin: 0, fontSize: '15px', color: '#94a3b8' }}>أضف أول تصنيف فرعي لهذا القسم لتبدأ التنظيم بشكل أفضل.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', background: '#f8fafc' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </div>
              <h3 style={{ color: '#0f172a', margin: '0 0 12px 0', fontSize: '22px', fontWeight: '800' }}>مساحة العمل</h3>
              <p style={{ textAlign: 'center', maxWidth: '300px', margin: 0, fontSize: '15px', lineHeight: '1.6', color: '#64748b' }}>
                اختر تصنيفاً رئيسياً من القائمة الجانبية لإدارة الفروع التابعة له وعرض المحتوى.
              </p>
            </div>
          )}
        </div>

      </div>

      <style>{`
        .cat-item:hover {
          background: #f8fafc !important;
        }
        .cat-item:hover .cat-actions {
          opacity: 1 !important;
        }
        .subcat-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
          border-color: #cbd5e1 !important;
        }
        .subcat-del-btn:hover {
          background: #fee2e2 !important;
          border-color: #fca5a5 !important;
          color: #dc2626 !important;
        }
        input:focus {
          border-color: #3b82f6 !important;
          background: white !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
        }
        /* Custom Scrollbar for list */
        *::-webkit-scrollbar {
          width: 6px;
        }
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        *::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        *::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}
