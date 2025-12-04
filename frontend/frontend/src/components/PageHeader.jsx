import { Button, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

export default function PageHeader({ 
  title, 
  icon: Icon, 
  onAdd, 
  addButtonText = 'Add',
  showSearch = true,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  extra
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {Icon && <Icon style={{ fontSize: '20px', color: '#1890ff' }} />}
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>{title}</h1>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {showSearch && (
          <Input
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined style={{ color: '#999' }} />}
            value={searchValue}
            onChange={onSearchChange}
            style={{ width: 250 }}
            allowClear
          />
        )}
        {extra}
        {onAdd && (
          <Button type="primary" onClick={onAdd}>
            {addButtonText}
          </Button>
        )}
      </div>
    </div>
  )
}
