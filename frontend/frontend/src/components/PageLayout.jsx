import { Card } from 'antd'

/**
 * PageLayout - A layout component with header outside card and content inside card
 * 
 * @param {Component} header - Header component to render outside the card
 * @param {Component} children - Content to render inside the card
 * @param {Boolean} showCard - Whether to wrap content in a card (default: true)
 * @param {Object} cardStyle - Additional styles for the card
 * @param {String} className - Additional CSS classes
 */
export default function PageLayout({ 
  header, 
  children, 
  showCard = true,
  cardStyle = {},
  className = '' 
}) {
  return (
    <div 
      className={`page-layout ${className}`}
      style={{ 
        // padding: '24px', 
        // background: '#f5f5f5', 
        minHeight: '100vh' 
      }}
    >
      {/* Header outside card */}
      {header && (
        <div style={{ marginBottom: '20px' }}>
          {header}
        </div>
      )}
      
      {/* Content inside card */}
      {showCard ? (
        <Card 
          bordered={false} 
          style={{ 
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            ...cardStyle 
          }}
        >
          {children}
        </Card>
      ) : (
        <div>{children}</div>
      )}
    </div>
  )
}