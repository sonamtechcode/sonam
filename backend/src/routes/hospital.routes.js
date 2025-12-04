const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospital.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Get all hospitals
router.get('/', hospitalController.getAllHospitals);

// Get single hospital
router.get('/:id', hospitalController.getHospital);

// Get hospital statistics
router.get('/:id/stats', hospitalController.getHospitalStats);

// Create new hospital
router.post('/', hospitalController.createHospital);

// Update hospital
router.put('/:id', hospitalController.updateHospital);

// Toggle hospital status
router.patch('/:id/status', hospitalController.toggleHospitalStatus);

// Delete hospital
router.delete('/:id', hospitalController.deleteHospital);

module.exports = router;
