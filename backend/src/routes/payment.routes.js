const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/patient/:patientId', authenticate, paymentController.getByPatient);
router.post('/', authenticate, paymentController.create);
router.put('/:id', authenticate, paymentController.update);
router.delete('/:id', authenticate, paymentController.delete);

module.exports = router;
