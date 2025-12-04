const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/patient/:patientId', authenticate, reportController.getByPatient);
router.post('/', authenticate, reportController.uploadMiddleware, reportController.upload);
router.delete('/:id', authenticate, reportController.delete);

module.exports = router;
