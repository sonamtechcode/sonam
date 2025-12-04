import { Select, DatePicker, Button } from 'antd'
import { FilterOutlined } from '@ant-design/icons'
import CompactSearch from './CompactSearch'

const { RangePicker } = DatePicker

/**
 * FilterBar - A horizontal filter bar with search, dropdowns, and date pickers
 * 
 * @param {String} searchValue - Current search value
 * @param {Function} onSearchChange - Search change handler
 * @param {String} searchPlaceholder - Search placeholder text
 * @param {Array} filters - Array of filter configurations
 *   Each filter: { type: 'select'|'dateRange', placeholder, options, value, onChange, style }
 * @param {Boolean} showExpandFilters - Show expand filters button
 * @param {Function} onExpandFilters - Expand filters click handler
 * @param {String} className - Additional CSS classes
 */
export default function FilterBar({ 
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  showExpandFilters = false,
  onExpandFilters,
  className = '' 
}) {
  return (
    <div 
      className={`filter-bar ${className}`}
      style={{ 
        display: 'flex', 
        gap: '12px', 
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '20px'
      }}
    >
      {/* Search */}
      {onSearchChange && (
        <CompactSearch
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={onSearchChange}
          size="default"
          style={{ minWidth: '280px' }}
        />
      )}

      {/* Dynamic Filters */}
      {filters.map((filter, index) => {
        if (filter.type === 'select') {
          return (
            <Select
              key={index}
              placeholder={filter.placeholder}
              value={filter.value}
              onChange={filter.onChange}
              style={{ 
                minWidth: '180px',
                ...filter.style 
              }}
              options={filter.options}
            />
          )
        }
        
        if (filter.type === 'dateRange') {
          return (
            <RangePicker
              key={index}
              placeholder={filter.placeholder || ['Start Date', 'End Date']}
              value={filter.value}
              onChange={filter.onChange}
              style={{ 
                minWidth: '260px',
                ...filter.style 
              }}
            />
          )
        }
        
        return null
      })}

      {/* Expand Filters Button */}
      {showExpandFilters && (
        <Button
          icon={<FilterOutlined />}
          onClick={onExpandFilters}
          style={{
            height: '36px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#1cb2b8',
            borderColor: '#1cb2b8'
          }}
        >
          Expand Filters
        </Button>
      )}
    </div>
  )
}