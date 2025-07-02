const express = require('express');
const multer = require('multer');
const path = require('path');
const patientController = require('../controllers/patientController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateProfileUpdate, validateAppointment } = require('../middleware/validation');
const { uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/photos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// All routes require authentication and PATIENT role
router.use(authenticate);
router.use(authorize('PATIENT'));

// Dashboard and profile routes
router.get('/dashboard', patientController.getDashboard);
router.put('/profile', validateProfileUpdate, patientController.updateProfile);

// Appointment routes
router.get('/appointments', patientController.getAppointments);
router.post('/appointments', validateAppointment, patientController.bookAppointment);

// Photo routes
router.get('/photos', patientController.getPhotos);
router.post('/photos', uploadLimiter, upload.single('photo'), patientController.uploadPhoto);

// Doctor discovery
router.get('/doctors', patientController.getAvailableDoctors);

module.exports = router;
