/**
 * PageTabs - Tab navigation component with counts
 * 
 * @param {Array} tabs - Array of tab configurations
 *   Each tab: { key, label, count, active }
 * @param {Function} onChange - Callback when tab is clicked
 * @param {String} activeKey - Currently active tab key
 * @param {String} className - Additional CSS classes
 */
export default function PageTabs({ 
  tabs = [], 
  onChange,
  activeKey,
  className = '' 
}) {
  return (
    <div 
      className={`page-tabs ${className}`}
      style={{ 
        display: 'flex', 
        gap: '24px',
        borderBottom: '2px solid #f0f0f0',
        marginBottom: '20px'
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeKey === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onChange?.(tab.key)}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 4px',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#1cb2b8' : '#595959',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease',
              borderBottom: isActive ? '2px solid #1cb2b8' : '2px solid transparent',
              marginBottom: '-2px'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = '#1cb2b8'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = '#595959'
              }
            }}
          >
            {tab.label} {tab.count !== undefined && `(${tab.count})`}
          </button>
        )
      })}
    </div>
  )
}