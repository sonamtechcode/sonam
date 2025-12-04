import { Drawer, Button, Space } from 'antd'

/**
 * FilterDrawer - A reusable drawer component for filters
 * 
 * @param {Boolean} open - Whether the drawer is open
 * @param {Function} onClose - Close handler
 * @param {String} title - Drawer title (default: 'Filters')
 * @param {Component} children - Filter form content
 * @param {Function} onApply - Apply filters handler
 * @param {Function} onReset - Reset filters handler
 * @param {String} width - Drawer width (default: 400)
 */
export default function FilterDrawer({
  open,
  onClose,
  title = 'Filters',
  children,
  onApply,
  onReset,
  width = 400
}) {
  return (
    <Drawer
      title={title}
      placement="right"
      onClose={onClose}
      open={open}
      width={width}
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onReset}>
            Reset
          </Button>
          <Button 
            type="primary" 
            onClick={onApply}
            style={{
              background: '#00bcd4',
              borderColor: '#00bcd4'
            }}
          >
            Apply Filters
          </Button>
        </Space>
      }
    >
      {children}
    </Drawer>
  )
}