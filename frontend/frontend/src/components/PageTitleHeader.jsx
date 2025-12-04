import { Button, Badge } from 'antd'
import { FilterOutlined } from '@ant-design/icons'
import CompactSearch from './CompactSearch'

/**
 * PageTitleHeader - A page header with title on left and action buttons on right
 * 
 * @param {String} title - Main page title
 * @param {String} subtitle - Subtitle or count text (e.g., "All Policies: 78")
 * @param {Array} actions - Array of action button configurations
 *   Each action: { label, onClick, icon, type, style, disabled }
 * @param {Boolean} showSearch - Show search input in header
 * @param {String} searchPlaceholder - Search placeholder text
 * @param {String} searchValue - Current search value
 * @param {Function} onSearchChange - Search change handler
 * @param {String} searchSize - Search input size
 * @param {Boolean} showFilter - Show filter button
 * @param {Function} onFilterClick - Filter button click handler
 * @param {Number} activeFilterCount - Number of active filters
 * @param {Component} children - Additional content (e.g., tabs, filters)
 * @param {String} className - Additional CSS classes
 */
export default function PageTitleHeader({ 
  title, 
  subtitle,
  actions = [],
  showSearch = false,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  searchSize = 'default',
  showFilter = false,
  onFilterClick,
  activeFilterCount = 0,
  children,
  className = '' 
}) {
  return (
    <div className={`page-title-header ${className}`}>
      {/* Title and Actions Row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: children ? '16px' : '0'
      }}>
        {/* Left: Title and Subtitle */}
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '14px', 
            fontWeight: 600, 
            color: '#2c3e50',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: '12px', 
              color: '#7f8c8d',
              fontWeight: 400
            }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Search, Filter and Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Search Input */}
          {showSearch && (
            <CompactSearch
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={onSearchChange}
              size={searchSize}
            />
          )}
          
          {/* Filter Button */}
          {showFilter && (
            <Badge 
              count={activeFilterCount} 
              offset={[-5, 5]}
              style={{ 
                backgroundColor: '#00bcd4',
                fontSize: '11px',
                minWidth: '18px',
                height: '18px',
                lineHeight: '18px',
                padding: '0 5px'
              }}
            >
              <Button
                icon={<FilterOutlined />}
                onClick={onFilterClick}
                style={{
                  height: '32px',
                  fontSize: '13px',
                  fontWeight: 500,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderColor: activeFilterCount > 0 ? '#00bcd4' : '#e0e0e0',
                  color: activeFilterCount > 0 ? '#00bcd4' : '#34495e',
                  background: activeFilterCount > 0 ? '#e0f7fa' : '#fff'
                }}
              >
                Filters
              </Button>
            </Badge>
          )}
          
          {/* Action Buttons */}
          {actions.length > 0 && actions.map((action, index) => (
            <Button
              key={index}
              type={action.type || 'default'}
              icon={action.icon}
              onClick={action.onClick}
              disabled={action.disabled}
              style={{
                height: '32px',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                ...(action.type === 'primary' && {
                  background: '#00bcd4',
                  borderColor: '#00bcd4',
                }),
                ...action.style
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Additional Content (Tabs, Filters, etc.) */}
      {children && (
        <div style={{ marginTop: '16px' }}>
          {children}
        </div>
      )}
    </div>
  )
}