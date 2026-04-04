import SectionLayout from '../../components/SectionLayout'

const partiesTabs = [
  { label: 'العملاء', path: '' }, // Default to Customers
  { label: 'الموردون', path: 'suppliers' },
]

export default function PartiesPage() {
  return (
    <SectionLayout 
      title="إدارة الأطراف" 
      tabs={partiesTabs} 
    />
  )
}
