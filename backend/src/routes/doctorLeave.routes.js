const express = require('express');
const router = express.Router();
const doctorLeaveController = require('../controllers/doctorLeave.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', doctorLeaveController.getDoctorLeaves);
router.get('/doctor/:doctorId/balance', doctorLeaveController.getLeaveBalance);
router.post('/', doctorLeaveController.applyLeave);
router.put('/:id/status', doctorLeaveController.updateLeaveStatus);
router.put('/:id/cancel', doctorLeaveController.cancelLeave);

module.exports = router;
