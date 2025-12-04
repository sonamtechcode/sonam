const express = require('express');
const router = express.Router();
const patientProfileController = require('../controllers/patientProfile.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Get complete patient profile
router.get('/:patientId', patientProfileController.getPatientProfile);

// Update patient basic info
router.put('/:patientId/basic-info', patientProfileController.updatePatientBasicInfo);

// Medical details
router.put('/:patientId/medical-details', patientProfileController.updateMedicalDetails);

// Vitals
router.post('/:patientId/vitals', patientProfileController.addVitals);

// Visits
router.post('/:patientId/visits', patientProfileController.createVisit);
router.put('/visits/:visitId', patientProfileController.updateVisit);

// Prescriptions
router.post('/:patientId/prescriptions', patientProfileController.addPrescription);

// Procedures
router.post('/:patientId/procedures', patientProfileController.addProcedure);

// Documents
router.post('/:patientId/documents', patientProfileController.uploadDocument);
router.delete('/documents/:documentId', patientProfileController.deleteDocument);

// Ledger
router.post('/:patientId/ledger', patientProfileController.addLedgerEntry);

// Follow-ups
router.post('/:patientId/followups', patientProfileController.addFollowup);

// Communications
router.post('/:patientId/communications', patientProfileController.logCommunication);

// Consents
router.post('/:patientId/consents', patientProfileController.addConsent);

// Feedback
router.post('/:patientId/feedback', patientProfileController.addFeedback);

// Clinic Settings
router.get('/clinic/settings', patientProfileController.getClinicSettings);
router.put('/clinic/settings', patientProfileController.updateClinicSettings);

module.exports = router;
