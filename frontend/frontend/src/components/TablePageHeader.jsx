import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import CompactSearch from './CompactSearch'

/**
 * TablePageHeader - A reusable page header component with title, search, and action button
 * 
 * @param {String} title - Page title
 * @param {Component} icon - Icon component to display before title
 * @param {Function} onAdd - Callback when add button is clicked
 * @param {String} addButtonText - Text for the add button (default: 'Add')
 * @param {Boolean} showAddButton - Show add button (default: true)
 * @param {Boolean} showSearch - Show search input (default: true)
 * @param {String} searchPlaceholder - Placeholder for search input
 * @param {String} searchValue - Current search value
 * @param {Function} onSearchChange - Callback when search value changes
 * @param {String} searchSize - Size of search input: 'small', 'default', 'large'
 * @param {Component} extra - Additional components to render
 * @param {String} className - Additional CSS classes
 */
export default function TablePageHeader({ 
  title, 
  icon: Icon, 
  onAdd, 
  addButtonText = 'Add',
  showAddButton = true,
  showSearch = true,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  searchSize = 'small',
  extra,
  className = ''
}) {
  return (
    <div 
      className={`table-page-header ${className}`}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: 20,
        padding: '0 4px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {Icon && <Icon style={{ fontSize: '22px', color: '#1cb2b8' }} />}
        <h1 style={{ 
          margin: 0, 
          fontSize: '20px', 
          fontWeight: 600, 
          color: '#262626',
          letterSpacing: '-0.02em'
        }}>
          {title}
        </h1>
      </div>
      
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {showSearch && (
          <CompactSearch
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
            size={searchSize}
          />
        )}
        {extra}
        {showAddButton && onAdd && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={onAdd}
            style={{
              background: '#1cb2b8',
              borderColor: '#1cb2b8',
              height: '32px',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {addButtonText}
          </Button>
        )}
      </div>
    </div>
  )
}