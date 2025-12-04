const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const db = require('../config/database');

// Get all permissions
router.get('/', authenticate, async (req, res) => {
  try {
    const [permissions] = await db.query(
      'SELECT * FROM permissions ORDER BY module, name'
    );
    res.json({ success: true, data: permissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get permissions for current user
router.get('/my-permissions', authenticate, async (req, res) => {
  try {
    const userRole = req.user.role;
    
    // Super admin has all permissions
    if (userRole === 'super_admin') {
      const [allPermissions] = await db.query('SELECT name FROM permissions');
      const permissionNames = allPermissions.map(p => p.name);
      return res.json({ success: true, data: permissionNames });
    }

    // Get role-specific permissions
    const [permissions] = await db.query(
      `SELECT p.name 
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role = ?`,
      [userRole]
    );

    const permissionNames = permissions.map(p => p.name);
    res.json({ success: true, data: permissionNames });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get permissions by role
router.get('/role/:role', authenticate, async (req, res) => {
  try {
    const { role } = req.params;

    const [permissions] = await db.query(
      `SELECT p.* 
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role = ?
       ORDER BY p.module, p.name`,
      [role]
    );

    res.json({ success: true, data: permissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update role permissions
router.put('/role/:role', authenticate, async (req, res) => {
  try {
    const { role } = req.params;
    const { permissionIds } = req.body;

    // Only super_admin can update permissions
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only super admin can update permissions' 
      });
    }

    // Delete existing permissions for this role
    await db.query('DELETE FROM role_permissions WHERE role = ?', [role]);

    // Insert new permissions
    if (permissionIds && permissionIds.length > 0) {
      const values = permissionIds.map(permId => [role, permId]);
      await db.query(
        'INSERT INTO role_permissions (role, permission_id) VALUES ?',
        [values]
      );
    }

    res.json({ success: true, message: 'Permissions updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check if user has specific permission
router.post('/check', authenticate, async (req, res) => {
  try {
    const { permission } = req.body;
    const userRole = req.user.role;

    if (userRole === 'super_admin') {
      return res.json({ success: true, hasPermission: true });
    }

    const [result] = await db.query(
      `SELECT COUNT(*) as count
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role = ? AND p.name = ?`,
      [userRole, permission]
    );

    res.json({ 
      success: true, 
      hasPermission: result[0].count > 0 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
