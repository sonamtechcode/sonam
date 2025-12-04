const express = require('express');
const router = express.Router();
const ambulanceController = require('../controllers/ambulance.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', ambulanceController.getAllAmbulances);
router.post('/', ambulanceController.addAmbulance);
router.put('/:id', ambulanceController.updateAmbulance);
router.delete('/:id', ambulanceController.deleteAmbulance);

router.get('/trips', ambulanceController.getAmbulanceTrips);
router.post('/trips', ambulanceController.createTrip);
router.put('/trips/:id/status', ambulanceController.updateTripStatus);

module.exports = router;
