const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
} = require('../middleware/validation');

const router = express.Router();

// Public routes with rate limiting
router.post('/register', authLimiter, validateRegistration, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/refresh-token', authLimiter, authController.refreshToken);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/profile', authController.getProfile);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);
router.put('/change-password', validatePasswordChange, authController.changePassword);

module.exports = router;
