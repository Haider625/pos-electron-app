import SectionLayout from '../../components/SectionLayout'

const inventoryTabs = [
  { label: 'المنتجات', path: '' }, // path: '' means the relative root /inventory
  { label: 'التصنيفات', path: 'categories' },
  { label: 'الماركات', path: 'brands' },
  { label: 'المشتريات', path: 'purchases' },
  { label: 'الجرد', path: 'audit' },
  { label: 'حركات المخزون', path: 'movements' },
]

export default function InventoryPage() {
  return (
    <SectionLayout 
      // title="إدارة المخزون" 
      tabs={inventoryTabs} 
    />
  )
}
