import { useState } from 'react'
import { Checkbox } from 'antd'
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons'

export default function CustomTable({ columns, data, onRowSelect }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [selectedRows, setSelectedRows] = useState([])

  const handleSort = (accessor) => {
    let direction = 'asc'
    if (sortConfig.key === accessor && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key: accessor, direction })
  }

  const getSortIcon = (accessor) => {
    if (sortConfig.key !== accessor) {
      return <span style={{ color: '#d9d9d9' }}>⇅</span>
    }
    return sortConfig.direction === 'asc' ? 
      <CaretUpOutlined style={{ color: '#1890ff' }} /> : 
      <CaretDownOutlined style={{ color: '#1890ff' }} />
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(data.map((_, idx) => idx))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter(i => i !== index))
    } else {
      setSelectedRows([...selectedRows, index])
    }
  }

  const arrayForSort = columns.filter(col => col.sortable).map(col => col.accessor)

  return (
    <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
      <table className="table mb-0" style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f2f5', borderBottom: '1px solid #d9d9d9' }}>
            <th style={{width: '50px', textAlign: 'center', padding: '12px 8px' }}>
              <Checkbox 
                onChange={handleSelectAll}
                checked={selectedRows.length === data.length && data.length > 0}
                indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
              />
            </th>
            {columns.map((col, idx) => (
              <th
                key={`th_${idx}`}
                style={{
                  textAlign: col.header === "Status" || col.header === "Action" ? "center" : "left",
                  cursor: arrayForSort.includes(col.accessor) ? "pointer" : "default",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: '#262626',
                  whiteSpace: 'nowrap',
                  padding: '12px 8px',
                }}
                onClick={() => arrayForSort.includes(col.accessor) && handleSort(col.accessor)}
              >
                {col.header}
                {arrayForSort.includes(col.accessor) && (
                  <span style={{ marginLeft: "5px" }}>
                    {getSortIcon(col.accessor)}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIdx) => (
            <tr 
              key={rowIdx}
              style={{ 
                borderBottom: '1px solid #f0f0f0',
                background: selectedRows.includes(rowIdx) ? '#e6f7ff' : '#fff',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!selectedRows.includes(rowIdx)) {
                  e.currentTarget.style.background = '#f5f5f5'
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedRows.includes(rowIdx)) {
                  e.currentTarget.style.background = '#fff'
                }
              }}
            >
              <td style={{textAlign: 'center' }}>
                <Checkbox 
                  checked={selectedRows.includes(rowIdx)}
                  onChange={() => handleSelectRow(rowIdx)}
                />
              </td>
              {columns.map((col, colIdx) => (
                <td
                  key={`td_${rowIdx}_${colIdx}`}
                  style={{
                    fontSize: '10px',
                    color: '#262626',
                    textAlign: col.header === "Status" || col.header === "Action" ? "center" : "left",
                  }}
                >
                  {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination */}
      <div style={{ 
        padding: '16px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderTop: '1px solid #f0f0f0'
      }}>
        <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
          Displaying Page 1 of {Math.ceil(data.length / 10)}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ 
            padding: '4px 12px', 
            border: '1px solid #d9d9d9', 
            background: '#fff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}>‹</button>
          <button style={{ 
            padding: '4px 12px', 
            border: '1px solid #d9d9d9', 
            background: '#1890ff',
            color: '#fff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}>1</button>
          <button style={{ 
            padding: '4px 12px', 
            border: '1px solid #d9d9d9', 
            background: '#fff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}>›</button>
        </div>
      </div>
    </div>
  )
}
