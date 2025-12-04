const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLog.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

router.use(authenticate);
router.use(checkPermission('audit_logs', 'read')); // Only super admin

router.get('/', auditLogController.getAuditLogs);
router.get('/stats', auditLogController.getAuditStats);
router.get('/export', auditLogController.exportAuditLogs);

module.exports = router;
