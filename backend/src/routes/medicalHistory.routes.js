const express = require('express');
const router = express.Router();
const medicalHistoryController = require('../controllers/medicalHistory.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/patient/:patientId', medicalHistoryController.getPatientMedicalHistory);
router.get('/patient/:patientId/summary', medicalHistoryController.getPatientSummary);
router.post('/', medicalHistoryController.addMedicalHistory);
router.put('/:id', medicalHistoryController.updateMedicalHistory);
router.delete('/:id', medicalHistoryController.deleteMedicalHistory);

module.exports = router;
