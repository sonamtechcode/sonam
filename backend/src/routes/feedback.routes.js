const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', feedbackController.getAllFeedback);
router.get('/stats', feedbackController.getFeedbackStats);
router.post('/', feedbackController.addFeedback);
router.put('/:id/status', feedbackController.updateFeedbackStatus);

module.exports = router;
