import SectionLayout from '../../components/SectionLayout'

const invoiceTabs = [
  { label: 'فواتير البيع', path: '' }, // Default to Sales
  { label: 'المرتجعات', path: 'returns' },
  // { label: 'الفواتير المعلقة', path: 'pending' },
]

export default function InvoicesPage() {
  return (
    <SectionLayout 
      title="إدارة الفواتير" 
      tabs={invoiceTabs} 
    />
  )
}
