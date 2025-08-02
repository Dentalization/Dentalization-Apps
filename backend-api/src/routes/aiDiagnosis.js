const express = require('express');
const router = express.Router();
const aiDiagnosisController = require('../controllers/aiDiagnosisController');
const { authenticate } = require('../middleware/auth');

// Save AI diagnosis result
router.post('/', authenticate, aiDiagnosisController.saveDiagnosis);

// Get AI diagnosis history for a patient
router.get('/history/:patientId', authenticate, aiDiagnosisController.getDiagnosisHistory);

// Get AI diagnosis history for current user (patient)
router.get('/my-history', authenticate, aiDiagnosisController.getMyDiagnosisHistory);

// Get specific AI diagnosis by ID
router.get('/:diagnosisId', authenticate, aiDiagnosisController.getDiagnosisById);

// Delete AI diagnosis
router.delete('/:diagnosisId', authenticate, aiDiagnosisController.deleteDiagnosis);

// Get diagnosis statistics
router.get('/stats', authenticate, aiDiagnosisController.getDiagnosisStats);

module.exports = router;