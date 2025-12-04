const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, doctorController.getAllDoctors);
router.get('/:id', authenticate, doctorController.getDoctorById);
router.post('/', authenticate, doctorController.createDoctor);
router.put('/:id', authenticate, doctorController.updateDoctor);
router.delete('/:id', authenticate, doctorController.deleteDoctor);

module.exports = router;
