import toast from 'react-hot-toast'

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file to download
 * @param {Array} columns - Optional array of column definitions with header and accessor
 */
export const exportToCSV = (data, filename = 'export.csv', columns = null) => {
  try {
    if (!data || data.length === 0) {
      toast.error('No data to export')
      return
    }

    let headers = []
    let accessors = []

    if (columns) {
      // Use provided column definitions
      headers = columns.map(col => col.header)
      accessors = columns.map(col => col.accessor)
    } else {
      // Use all keys from first object
      headers = Object.keys(data[0])
      accessors = headers
    }

    // Create CSV header
    const csvHeader = headers.join(',')

    // Create CSV rows
    const csvRows = data.map(row => {
      return accessors.map(accessor => {
        let value = row[accessor]
        
        // Handle null/undefined
        if (value === null || value === undefined) {
          return ''
        }
        
        // Handle dates
        if (value instanceof Date) {
          value = value.toLocaleDateString()
        }
        
        // Handle objects
        if (typeof value === 'object') {
          value = JSON.stringify(value)
        }
        
        // Escape quotes and wrap in quotes if contains comma
        value = String(value).replace(/"/g, '""')
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = `"${value}"`
        }
        
        return value
      }).join(',')
    })

    // Combine header and rows
    const csv = [csvHeader, ...csvRows].join('\n')

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Data exported successfully')
  } catch (error) {
    console.error('Export error:', error)
    toast.error('Failed to export data')
  }
}

/**
 * Export data to JSON format
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file to download
 */
export const exportToJSON = (data, filename = 'export.json') => {
  try {
    if (!data || data.length === 0) {
      toast.error('No data to export')
      return
    }

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Data exported successfully')
  } catch (error) {
    console.error('Export error:', error)
    toast.error('Failed to export data')
  }
}
