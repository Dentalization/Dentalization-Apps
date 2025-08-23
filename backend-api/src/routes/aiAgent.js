const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const aiService = require('../services/aiService');

// Validation for chat messages
const validateChatMessage = [
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 2000 })
    .withMessage('Message must be less than 2000 characters'),
  body('image_id')
    .optional()
    .isString()
    .withMessage('Image ID must be a string'),
  query('session_id')
    .notEmpty()
    .withMessage('Session ID is required'),
  handleValidationErrors,
];

// Validation for session creation
const validateSessionCreation = [
  body('user_id')
    .optional()
    .isString()
    .withMessage('User ID must be a string'),
  handleValidationErrors,
];

// Validation for image upload
const validateImageUpload = [
  // File validation will be handled by multer middleware
  handleValidationErrors,
];

// Chat with AI Agent
router.post('/chat', validateChatMessage, async (req, res) => {
  try {
    const { message, image_id } = req.body;
    const { session_id } = req.query;

    // Process chat with AI service
    const aiResponse = await aiService.processChat({
      message,
      sessionId: session_id,
      imageId: image_id
    });

    res.json(aiResponse);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during chat processing',
      timestamp: new Date().toISOString()
    });
  }
});

// Create new session
router.post('/sessions', validateSessionCreation, async (req, res) => {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    res.json({
      status: 'success',
      session: {
        id: sessionId,
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create session'
    });
  }
});

// Get session details
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Mock session details
    res.json({
      status: 'success',
      session: {
        id: sessionId,
        messages_count: 5,
        last_activity: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get session details'
    });
  }
});

// Upload image for analysis
router.post('/images', validateImageUpload, async (req, res) => {
  try {
    // Mock image upload response
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
      status: 'success',
      image: {
        id: imageId,
        filename: `dental_image_${Date.now()}.jpg`,
        size: 1024000, // 1MB mock size
        uploaded_at: new Date().toISOString()
      },
      access_url: `/api/v1/images/${imageId}`
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload image'
    });
  }
});

// Get uploaded image
router.get('/images/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const { format = 'file' } = req.query;

    if (format === 'base64') {
      // Mock base64 response
      res.json({
        status: 'success',
        data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // 1x1 transparent PNG
        format: 'base64',
        imageId: imageId
      });
    } else {
      // For file format, return a simple response
      res.json({
        status: 'success',
        message: 'Image file endpoint - would return binary data in production',
        imageId: imageId
      });
    }
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get image'
    });
  }
});

module.exports = router;