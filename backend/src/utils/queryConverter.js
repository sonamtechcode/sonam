// Utility to convert MySQL query results to PostgreSQL format
// PostgreSQL returns {rows} directly, MySQL returns array [rows, fields]

module.exports = {
  // Convert PostgreSQL query result to MySQL format for backwards compatibility
  convertResult: (result) => {
    if (!result) return [[], []];
    
    // If it's already in MySQL format (array), return as is
    if (Array.isArray(result)) {
      return result;
    }
    
    // PostgreSQL format {rows, rowCount, fields, ...}
    return [result.rows || [], []];
  },
  
  // Wrapper around db.query that handles both MySQL and PostgreSQL
  queryWrapper: async (db, sql, params) => {
    try {
      const result = await db.query(sql, params);
      return module.exports.convertResult(result);
    } catch (error) {
      console.error('Query error:', error.message);
      throw error;
    }
  }
};
