const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/patient/:patientId', authenticate, prescriptionController.getByPatient);
router.post('/', authenticate, prescriptionController.create);
router.put('/:id', authenticate, prescriptionController.update);
router.delete('/:id', authenticate, prescriptionController.delete);

module.exports = router;
