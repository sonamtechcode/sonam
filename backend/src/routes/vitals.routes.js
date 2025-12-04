const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitals.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/patient/:patientId', vitalsController.getPatientVitals);
router.get('/patient/:patientId/latest', vitalsController.getLatestVitals);
router.post('/', vitalsController.addVitals);
router.put('/:id', vitalsController.updateVitals);
router.delete('/:id', vitalsController.deleteVitals);

module.exports = router;
