import SectionLayout from '../../components/SectionLayout'

const adminTabs = [
  { label: 'المستخدمون', path: '' }, // Default to Users
  { label: 'الصلاحيات', path: 'permissions' },
  { label: 'إعدادات النظام', path: 'settings' },
]

export default function AdminPage() {
  return (
    <SectionLayout 
      title="إدارة النظام" 
      tabs={adminTabs} 
    />
  )
}
