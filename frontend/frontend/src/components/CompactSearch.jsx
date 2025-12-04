import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

/**
 * CompactSearch - A compact search input component
 * 
 * @param {String} placeholder - Placeholder text for the search input
 * @param {String} value - Current search value
 * @param {Function} onChange - Callback when search value changes
 * @param {String} size - Size of the search input: 'small', 'default', 'large'
 * @param {Object} style - Additional inline styles
 * @param {String} className - Additional CSS classes
 */
export default function CompactSearch({ 
  placeholder = 'Search...', 
  value, 
  onChange,
  size = 'small',
  style = {},
  className = ''
}) {
  const sizeStyles = {
    small: { width: 200, height: 32 },
    default: { width: 250, height: 36 },
    large: { width: 300, height: 40 }
  }

  return (
    <Input
      placeholder={placeholder}
      prefix={<SearchOutlined style={{ color: '#7f8c8d', fontSize: '14px' }} />}
      value={value}
      onChange={onChange}
      allowClear
      className={`compact-search ${className}`}
      style={{
        ...sizeStyles[size],
        borderRadius: '6px',
        fontSize: '13px',
        ...style
      }}
    />
  )
}