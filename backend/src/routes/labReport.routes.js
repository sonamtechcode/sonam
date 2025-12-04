const express = require('express');
const router = express.Router();
const labReportController = require('../controllers/labReport.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', labReportController.getLabReports);
router.post('/', labReportController.addLabReport);
router.put('/:id', labReportController.updateLabReport);
router.delete('/:id', labReportController.deleteLabReport);

module.exports = router;
