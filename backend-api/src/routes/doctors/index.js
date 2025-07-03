const express = require('express');
const doctorController = require('../../controllers/doctorController');
const { authenticate, authorize } = require('../../middleware/auth');
const { validateProfileUpdate } = require('../../middleware/validation');
const { body } = require('express-validator');

const router = express.Router();

// Validation for appointment status update
const validateAppointmentUpdate = [
  body('status')
    .isIn(['CONFIRMED', 'CANCELLED', 'COMPLETED', 'RESCHEDULED'])
    .withMessage('Invalid appointment status'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
];

// Validation for treatment notes
const validateTreatmentNotes = [
  body('diagnosis')
    .notEmpty()
    .withMessage('Diagnosis is required')
    .isLength({ max: 2000 })
    .withMessage('Diagnosis must be less than 2000 characters'),
  body('treatment')
    .notEmpty()
    .withMessage('Treatment is required')
    .isLength({ max: 2000 })
    .withMessage('Treatment must be less than 2000 characters'),
  body('recommendations')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Recommendations must be less than 1000 characters'),
  body('nextAppointment')
    .optional()
    .isISO8601()
    .withMessage('Next appointment must be a valid date'),
];

// All routes require authentication and DOCTOR role
router.use(authenticate);
router.use(authorize('DOCTOR'));

// Dashboard and profile routes
router.get('/dashboard', doctorController.getDashboard);
router.put('/profile', validateProfileUpdate, doctorController.updateProfile);

// Patient management routes
router.get('/patients', doctorController.getPatients);
router.get('/patients/:patientId', doctorController.getPatientDetails);

// Appointment management routes
router.get('/appointments', doctorController.getAppointments);
router.put('/appointments/:appointmentId/status', validateAppointmentUpdate, doctorController.updateAppointmentStatus);
router.post('/appointments/:appointmentId/treatment', validateTreatmentNotes, doctorController.addTreatmentNotes);

// Availability management
router.post('/availability', doctorController.setAvailability);

module.exports = router;
