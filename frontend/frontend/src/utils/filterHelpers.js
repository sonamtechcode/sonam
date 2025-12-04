/**
 * Count the number of active filters in a filter object
 * @param {Object} filters - Filter object with filter values
 * @returns {Number} - Count of active filters
 */
export const countActiveFilters = (filters) => {
  if (!filters || typeof filters !== 'object') return 0
  
  return Object.values(filters).filter(value => {
    // Check if value is not null, undefined, empty string, or empty array
    if (value === null || value === undefined || value === '') return false
    if (Array.isArray(value) && value.length === 0) return false
    return true
  }).length
}