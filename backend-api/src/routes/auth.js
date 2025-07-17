const express = require('express');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/check-email', authController.checkEmailExists);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;
