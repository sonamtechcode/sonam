const db = require('../config/database');

// Check if user has specific permission
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;

      // Super admin has all permissions
      if (userRole === 'super_admin') {
        return next();
      }

      // Check if role has the required permission
      const [result] = await db.query(
        `SELECT COUNT(*) as count
         FROM permissions p
         JOIN role_permissions rp ON p.id = rp.permission_id
         WHERE rp.role = ? AND p.name = ?`,
        [userRole, requiredPermission]
      );

      if (result[0].count > 0) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
};

// Check if user has any of the specified permissions
const checkAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;

      if (userRole === 'super_admin') {
        return next();
      }

      const placeholders = permissions.map(() => '?').join(',');
      const [result] = await db.query(
        `SELECT COUNT(*) as count
         FROM permissions p
         JOIN role_permissions rp ON p.id = rp.permission_id
         WHERE rp.role = ? AND p.name IN (${placeholders})`,
        [userRole, ...permissions]
      );

      if (result[0].count > 0) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
};

module.exports = {
  checkPermission,
  checkAnyPermission
};
