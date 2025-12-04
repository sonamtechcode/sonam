import { Table, Button } from 'antd'
import { useState } from 'react'

export default function DataTable({ 
  columns, 
  dataSource, 
  loading, 
  rowKey = 'id',
  onRow,
  scroll = { x: 1200 },
  showSelection = true
}) {
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const rowSelection = showSelection ? {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys)
    },
  } : null

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      rowKey={rowKey}
      loading={loading}
      rowSelection={rowSelection}
      pagination={{
        pageSize: 10,
        showSizeChanger: false,
        showTotal: (total, range) => (
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
            Displaying Page {Math.ceil(range[0] / 10)} of {Math.ceil(total / 10)}
          </span>
        ),
        style: { marginTop: 16, marginBottom: 0 },
        itemRender: (_page, type, originalElement) => {
          if (type === 'prev') {
            return <Button size="small" style={{ fontSize: '12px' }}>‹</Button>
          }
          if (type === 'next') {
            return <Button size="small" style={{ fontSize: '12px' }}>›</Button>
          }
          return originalElement
        },
      }}
      scroll={scroll}
      style={{ background: '#fff', borderRadius: '8px' }}
      rowClassName={() => 'table-row-hover'}
      onRow={onRow}
    />
  )
}
