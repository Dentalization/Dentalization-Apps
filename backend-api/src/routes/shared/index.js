const express = require('express');
const sharedController = require('../controllers/sharedController');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation for chat messages
const validateChatMessage = [
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message must be less than 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['TEXT', 'IMAGE', 'VOICE'])
    .withMessage('Invalid message type'),
  handleValidationErrors,
];

// All routes require authentication
router.use(authenticate);

// Notification routes
router.get('/notifications', sharedController.getNotifications);
router.put('/notifications/:notificationId/read', sharedController.markNotificationRead);
router.put('/notifications/read-all', sharedController.markAllNotificationsRead);

// Chat routes
router.get('/chat/contacts', sharedController.getChatContacts);
router.get('/chat/:otherUserId/messages', sharedController.getChatMessages);
router.post('/chat/:receiverId/messages', validateChatMessage, sharedController.sendChatMessage);

// Search routes
router.get('/search/users', sharedController.searchUsers);

module.exports = router;
