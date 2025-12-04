const express = require('express');
const router = express.Router();
const doctorScheduleController = require('../controllers/doctorSchedule.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', doctorScheduleController.getDoctorSchedules);
router.get('/doctor/:doctorId/weekly', doctorScheduleController.getWeeklySchedule);
router.post('/', doctorScheduleController.addSchedule);
router.put('/:id', doctorScheduleController.updateSchedule);
router.delete('/:id', doctorScheduleController.deleteSchedule);

module.exports = router;
