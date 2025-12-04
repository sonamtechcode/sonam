import { useState } from 'react'
import { Checkbox } from 'antd'
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons'

/**
 * CompactTable - A reusable table component with sorting, selection, and pagination
 * 
 * @param {Array} columns - Array of column definitions with header, accessor, sortable, render, width
 * @param {Array} data - Array of data objects to display
 * @param {Function} onRowSelect - Callback when rows are selected
 * @param {Boolean} showCheckbox - Show checkbox column (default: true)
 * @param {Boolean} showPagination - Show pagination (default: true)
 * @param {Number} pageSize - Number of rows per page (default: 10)
 * @param {String} className - Additional CSS classes
 */
export default function CompactTable({ 
  columns, 
  data, 
  onRowSelect,
  showCheckbox = true,
  showPagination = true,
  pageSize = 10,
  className = ''
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [selectedRows, setSelectedRows] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  const handleSort = (accessor) => {
    let direction = 'asc'
    if (sortConfig.key === accessor && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key: accessor, direction })
  }

  const getSortIcon = (accessor) => {
    if (sortConfig.key !== accessor) {
      return <span style={{ color: '#bfbfbf', fontSize: '12px' }}>⇅</span>
    }
    return sortConfig.direction === 'asc' ? 
      <CaretUpOutlined style={{ color: '#00bcd4', fontSize: '12px' }} /> : 
      <CaretDownOutlined style={{ color: '#00bcd4', fontSize: '12px' }} />
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = sortedData.slice(startIndex, endIndex)

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(paginatedData.map((_, idx) => startIndex + idx))
      onRowSelect?.(paginatedData)
    } else {
      setSelectedRows([])
      onRowSelect?.([])
    }
  }

  const handleSelectRow = (index) => {
    const newSelectedRows = selectedRows.includes(index)
      ? selectedRows.filter(i => i !== index)
      : [...selectedRows, index]
    
    setSelectedRows(newSelectedRows)
    onRowSelect?.(newSelectedRows.map(i => sortedData[i]))
  }

  const arrayForSort = columns.filter(col => col.sortable).map(col => col.accessor)

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className={`compact-table-wrapper ${className}`}>
      <div style={{ 
        overflow: 'hidden'
      }}>
        <div style={{ 
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: '#bfbfbf #f0f0f0'
        }}
        className="custom-scrollbar">
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              height: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f0f0f0;
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #bfbfbf;
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #999;
            }
          `}</style>
          <table style={{ 
            width: '100%', 
            minWidth: '1000px', 
            borderCollapse: 'collapse',
            fontSize: '13px'
          }}>
            <thead>
              <tr style={{ 
                background: 'linear-gradient(to bottom, #e8f4f5 0%, #dceef0 100%)',
                borderBottom: '1px solid #d0e5e7'
              }}>
                {showCheckbox && (
                  <th style={{
                    width: '50px', 
                    textAlign: 'center', 
                    padding: '10px 8px',
                    fontWeight: 500,
                    color: '#34495e'
                  }}>
                    <Checkbox 
                      onChange={handleSelectAll}
                      checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                      indeterminate={selectedRows.length > 0 && selectedRows.length < paginatedData.length}
                    />
                  </th>
                )}
                {columns.map((col, idx) => (
                  <th
                    key={`th_${idx}`}
                    style={{
                      textAlign: col.header === "Status" || col.header === "Action" ? "center" : "left",
                      cursor: arrayForSort.includes(col.accessor) ? "pointer" : "default",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: '#2c3e50',
                      whiteSpace: 'nowrap',
                      padding: '10px 12px',
                      width: col.width || 'auto',
                      userSelect: 'none'
                    }}
                    onClick={() => arrayForSort.includes(col.accessor) && handleSort(col.accessor)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: col.header === "Status" || col.header === "Action" ? "center" : "flex-start" }}>
                      <span>{col.header}</span>
                      {arrayForSort.includes(col.accessor) && (
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          {getSortIcon(col.accessor)}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + (showCheckbox ? 1 : 0)} 
                    style={{ 
                      textAlign: 'center', 
                      padding: '40px 20px',
                      color: '#999',
                      fontSize: '13px'
                    }}
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIdx) => {
                  const actualIndex = startIndex + rowIdx
                  return (
                    <tr 
                      key={actualIndex}
                      style={{ 
                        borderBottom: '1px solid #f0f0f0',
                        background: selectedRows.includes(actualIndex) ? '#e6f7ff' : '#fff',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedRows.includes(actualIndex)) {
                          e.currentTarget.style.background = '#fafafa'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selectedRows.includes(actualIndex)) {
                          e.currentTarget.style.background = '#fff'
                        }
                      }}
                    >
                      {showCheckbox && (
                        <td style={{textAlign: 'center', padding: '10px 8px' }}>
                          <Checkbox 
                            checked={selectedRows.includes(actualIndex)}
                            onChange={() => handleSelectRow(actualIndex)}
                          />
                        </td>
                      )}
                      {columns.map((col, colIdx) => (
                        <td
                          key={`td_${actualIndex}_${colIdx}`}
                          style={{
                            fontSize: '13px',
                            color: '#2c3e50',
                            textAlign: col.header === "Status" || col.header === "Action" ? "center" : "left",
                            padding: '10px 12px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                        </td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {showPagination && data.length > 0 && (
          <div style={{ 
            padding: '12px 16px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderTop: '1px solid #f0f0f0',
            background: '#fafafa'
          }}>
            <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
              Displaying Page {currentPage} of {totalPages} ({data.length} total records)
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button 
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ 
                  padding: '4px 10px', 
                  border: '1px solid #e0e0e0', 
                  background: currentPage === 1 ? '#f5f5f5' : '#fff',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  color: currentPage === 1 ? '#bfbfbf' : '#34495e',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                ‹
              </button>
              
              {[...Array(totalPages)].map((_, idx) => {
                const page = idx + 1
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button 
                      key={page}
                      onClick={() => goToPage(page)}
                      style={{ 
                        padding: '4px 10px', 
                        border: '1px solid #e0e0e0', 
                        background: currentPage === page ? '#00bcd4' : '#fff',
                        color: currentPage === page ? '#fff' : '#34495e',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: currentPage === page ? 600 : 500,
                        minWidth: '28px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {page}
                    </button>
                  )
                } else if (
                  page === currentPage - 2 || 
                  page === currentPage + 2
                ) {
                  return <span key={page} style={{ color: '#bfbfbf', fontSize: '12px' }}>...</span>
                }
                return null
              })}
              
              <button 
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{ 
                  padding: '4px 10px', 
                  border: '1px solid #e0e0e0', 
                  background: currentPage === totalPages ? '#f5f5f5' : '#fff',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  color: currentPage === totalPages ? '#bfbfbf' : '#34495e',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}