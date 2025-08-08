const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = '';
    
    // Determine subdirectory based on file type
    if (file.fieldname === 'photo') {
      subDir = 'profilepicture';
    } else if (file.fieldname === 'document') {
      // Use documentType from request body to determine subfolder
      const documentType = req.body.documentType;
      
      switch (documentType) {
        case 'education_degree':
          subDir = 'document/Ijazah';
          break;
        case 'skdg':
          subDir = 'document/SKDG';
          break;
        case 'str':
          subDir = 'document/STR';
          break;
        case 'sip':
          subDir = 'document/SIP';
          break;
        case 'certificate':
          subDir = 'certifications';
          break;
        default:
          subDir = 'document'; // fallback for unknown document types
      }
    } else if (file.fieldname === 'certification') {
      subDir = 'certifications';
    } else {
      subDir = 'misc'; // fallback for other file types
    }
    
    const uploadDir = path.join(__dirname, '../../uploads', subDir);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'photo') {
      // Allow images for profile photos
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Profile photo must be an image file'), false);
      }
    } else if (file.fieldname === 'document') {
      // Allow PDFs and images for documents
      if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Documents must be PDF or image files'), false);
      }
    } else {
      cb(new Error('Unexpected field'), false);
    }
  }
});

// GET /api/profile - Get user profile
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Remove sensitive information
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// POST /api/profile/patient - Create/update patient profile
router.post('/patient', 
  authenticate,
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('phone').optional().isMobilePhone(),
    body('dateOfBirth').optional().isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const {
        firstName,
        lastName,
        dateOfBirth,
        phone,
        address,
        emergencyContact,
        allergies,
        medications,
        medicalHistory,
        insuranceInfo,
        painTolerance,
        preferredLanguage,
        dietaryRestrictions,
        smokingStatus,
        dentalConcerns,
        previousDentalWork,
        lastDentalVisit,
        profilePicture,
      } = req.body;

      // Check if user has PATIENT role
      if (req.user.role !== 'PATIENT') {
        return res.status(403).json({
          success: false,
          message: 'Only patients can create patient profiles',
        });
      }

      // Create or update patient profile
      const profile = await prisma.patientProfile.upsert({
        where: { userId: req.user.id },
        update: {
          firstName,
          lastName,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          phone,
          address,
          emergencyContact,
          allergies,
          medications,
          medicalHistory,
          insuranceInfo,
          painTolerance,
          preferredLanguage,
          dietaryRestrictions,
          smokingStatus,
          dentalConcerns,
          previousDentalWork,
          lastDentalVisit: lastDentalVisit ? new Date(lastDentalVisit) : null,
          profilePicture,
          profileComplete: true,
        },
        create: {
          userId: req.user.id,
          firstName,
          lastName,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          phone,
          address,
          emergencyContact,
          allergies,
          medications,
          medicalHistory,
          insuranceInfo,
          painTolerance,
          preferredLanguage,
          dietaryRestrictions,
          smokingStatus,
          dentalConcerns,
          previousDentalWork,
          lastDentalVisit: lastDentalVisit ? new Date(lastDentalVisit) : null,
          profilePicture,
          profileComplete: true,
        },
      });

      // Debug: Log saved profile data
      console.log('✅ Backend saved profile with profilePicture:', profile.profilePicture);
      console.log('✅ Backend saved profile with verificationDocs:', profile.verificationDocs);
      console.log('✅ Backend saved profile verificationDocs length:', profile.verificationDocs?.length || 0);
      console.log('💳 Payment methods in result:', profile.paymentMethods);
      console.log('💳 Payment methods length in result:', profile.paymentMethods?.length || 0);
      console.log('🏥 Accepted insurance in result:', profile.acceptedInsurance);
      console.log('🏥 Accepted insurance length in result:', profile.acceptedInsurance?.length || 0);

      res.json({
        success: true,
        message: 'Patient profile created successfully',
        data: { profile },
      });
    } catch (error) {
      console.error('Patient profile creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// POST /api/profile/doctor - Create/update doctor profile
router.post('/doctor',
  authenticate,
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('licenseNumber').notEmpty().withMessage('License number is required'),
    body('phone').optional().isMobilePhone(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const {
        firstName,
        lastName,
        phone,
        licenseNumber,
        specialization,
        subspecialties,
        experience,
        education,
        certifications,
        clinicName,
        clinicAddress,
        clinicPhone,
        clinicWebsite,
        services,
        workingHours,
        appointmentDuration,
        consultationFee,
        acceptedInsurance,
        paymentMethods,
        verificationDocs,
        profilePicture,
        bio,
      } = req.body;

      // Debug: Log received data for profilePicture and verificationDocs
      console.log('🔍 Backend received profilePicture:', profilePicture);
      console.log('🔍 Backend received verificationDocs:', verificationDocs);
      console.log('🔍 Backend received verificationDocs type:', typeof verificationDocs);
      console.log('🔍 Backend received verificationDocs length:', verificationDocs?.length || 0);
      
      console.log('📋 Received profile data:', {
        profilePicture,
        verificationDocs,
        verificationDocsType: typeof verificationDocs,
        verificationDocsLength: verificationDocs?.length || 0,
        paymentMethods,
        paymentMethodsType: typeof paymentMethods,
        paymentMethodsLength: paymentMethods?.length || 0,
        acceptedInsurance,
        acceptedInsuranceType: typeof acceptedInsurance,
        acceptedInsuranceLength: acceptedInsurance?.length || 0
      });

      // Check if user has DOCTOR role
      if (req.user.role !== 'DOCTOR') {
        return res.status(403).json({
          success: false,
          message: 'Only doctors can create doctor profiles',
        });
      }

      // Check if license number is unique (excluding current user)
      const existingDoctor = await prisma.doctorProfile.findFirst({
        where: {
          licenseNumber,
          userId: { not: req.user.id },
        },
      });

      if (existingDoctor) {
        return res.status(400).json({
          success: false,
          message: 'License number already registered',
        });
      }

      // Create or update doctor profile
      const profile = await prisma.doctorProfile.upsert({
        where: { userId: req.user.id },
        update: {
          firstName,
          lastName,
          phone,
          licenseNumber,
          specialization,
          subspecialties: subspecialties || [],
          experience,
          education,
          certifications: certifications || [],
          clinicName,
          clinicAddress,
          clinicPhone,
          clinicWebsite,
          services: services || [],
          workingHours,
          appointmentDuration,
          consultationFee,
          acceptedInsurance: acceptedInsurance || [],
          paymentMethods: paymentMethods || [],
          verificationDocs: verificationDocs || [],
          profilePicture,
          bio,
          profileComplete: true,
          // Keep existing verification status
        },
        create: {
          userId: req.user.id,
          firstName,
          lastName,
          phone,
          licenseNumber,
          specialization,
          subspecialties: subspecialties || [],
          experience,
          education,
          certifications: certifications || [],
          clinicName,
          clinicAddress,
          clinicPhone,
          clinicWebsite,
          services: services || [],
          workingHours,
          appointmentDuration,
          consultationFee,
          acceptedInsurance: acceptedInsurance || [],
          paymentMethods: paymentMethods || [],
          verificationDocs: verificationDocs || [],
          profilePicture,
          bio,
          profileComplete: true,
          isVerified: false, // New doctors need verification
        },
      });

      res.json({
        success: true,
        message: 'Doctor profile created successfully. Verification process will begin shortly.',
        data: { profile },
      });
    } catch (error) {
      console.error('Doctor profile creation error:', error);
      
      if (error.code === 'P2002') {
        // Unique constraint violation
        return res.status(400).json({
          success: false,
          message: 'License number already registered',
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// POST /api/profile/upload-photo - Upload profile photo
router.post('/upload-photo', authenticate, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo uploaded',
      });
    }

    const photoUrl = `/uploads/profilepicture/${req.file.filename}`;

    // Update the doctor's profile with the new photo URL
    if (req.user.role === 'DOCTOR') {
      await prisma.doctorProfile.update({
        where: { userId: req.user.id },
        data: { profilePicture: photoUrl }
      });
    } else if (req.user.role === 'PATIENT') {
      await prisma.patientProfile.update({
        where: { userId: req.user.id },
        data: { profilePicture: photoUrl }
      });
    }

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        url: photoUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
      },
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Photo upload failed',
    });
  }
});

// POST /api/profile/upload-document - Upload verification document
router.post('/upload-document', authenticate, upload.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document uploaded',
      });
    }

    const { documentType } = req.body;
    console.log('📄 Document upload - documentType:', documentType);
    console.log('📄 Document upload - file saved to:', req.file.path);
    console.log('📄 Document upload - expected destination based on type:', documentType);
    
    // Move file to correct directory if it's in wrong place
    const fs = require('fs');
    const path = require('path');
    
    let correctSubDir = '';
    switch (documentType) {
      case 'education_degree':
        correctSubDir = 'document/Ijazah';
        break;
      case 'skdg':
        correctSubDir = 'document/SKDG';
        break;
      case 'str':
        correctSubDir = 'document/STR';
        break;
      case 'sip':
        correctSubDir = 'document/SIP';
        break;
      case 'certificate':
        correctSubDir = 'certifications';
        break;
      default:
        correctSubDir = 'document';
    }
    
    const correctDir = path.join(__dirname, '../../uploads', correctSubDir);
    const correctPath = path.join(correctDir, req.file.filename);
    
    // Ensure correct directory exists
    if (!fs.existsSync(correctDir)) {
      fs.mkdirSync(correctDir, { recursive: true });
    }
    
    // Move file if it's not in the correct location
     if (req.file.path !== correctPath) {
       fs.renameSync(req.file.path, correctPath);
       console.log('📄 File moved to correct location:', correctPath);
       // Update req.file.path to reflect the new location
       req.file.path = correctPath;
     }
     
     // Use the correct URL path based on where file is actually stored
     const documentUrl = `/uploads/${correctSubDir}/${req.file.filename}`;
     console.log('📄 Document URL:', documentUrl);
     console.log('📄 File final location:', req.file.path);

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        url: documentUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        documentType,
      },
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Document upload failed',
    });
  }
});

// PUT /api/profile - Update profile (general)
router.put('/', authenticate, require('../middleware/validation').validateProfileUpdate, async (req, res) => {
  try {
    const { role } = req.user;
    const updates = req.body;

    // Filter out null values and ensure arrays are clean
    const cleanArray = (arr) => {
      if (!Array.isArray(arr)) return [];
      return arr.filter(item => item !== null && item !== undefined && item !== '');
    };
    
    // Clean arrays in updates to prevent null values
    if (updates.verificationDocs) {
      const cleaned = cleanArray(updates.verificationDocs);
      if (cleaned.length > 0) {
        updates.verificationDocs = cleaned;
      } else {
        delete updates.verificationDocs;
      }
    }
    if (updates.paymentMethods) {
      const cleaned = cleanArray(updates.paymentMethods);
      if (cleaned.length > 0) {
        updates.paymentMethods = cleaned;
      } else {
        delete updates.paymentMethods;
      }
    }
    if (updates.acceptedInsurance) {
      const cleaned = cleanArray(updates.acceptedInsurance);
      if (cleaned.length > 0) {
        updates.acceptedInsurance = cleaned;
      } else {
        delete updates.acceptedInsurance;
      }
    }
    if (updates.subspecialties) {
      const cleaned = cleanArray(updates.subspecialties);
      if (cleaned.length > 0) {
        updates.subspecialties = cleaned;
      } else {
        delete updates.subspecialties;
      }
    }
    if (updates.certifications) {
      const cleaned = cleanArray(updates.certifications);
      if (cleaned.length > 0) {
        updates.certifications = cleaned;
      } else {
        delete updates.certifications;
      }
    }
    if (updates.services) {
      const cleaned = cleanArray(updates.services);
      if (cleaned.length > 0) {
        updates.services = cleaned;
      } else {
        delete updates.services;
      }
    }
     
     // Clean doctor-specific document arrays
     if (role === 'DOCTOR') {
       const documentFields = ['educationDegree', 'skdg', 'str', 'sip', 'additionalCerts'];
       
       documentFields.forEach(field => {
         if (updates[field] !== undefined) {
           const cleaned = cleanArray(updates[field]);
           if (cleaned.length > 0) {
             updates[field] = cleaned;
           } else {
             delete updates[field];
           }
           console.log(`🧹 Cleaned ${field}:`, cleaned);
         }
       });

       // Auto-populate verificationDocs with all professional documents
       const allVerificationDocs = [];
       console.log('🔍 Starting auto-population of verificationDocs...');
       
       if (updates.educationDegree && updates.educationDegree.length > 0) {
         console.log('📚 Adding educationDegree to verificationDocs:', updates.educationDegree);
         allVerificationDocs.push(...updates.educationDegree);
       }
       if (updates.skdg && updates.skdg.length > 0) {
         console.log('📚 Adding skdg to verificationDocs:', updates.skdg);
         allVerificationDocs.push(...updates.skdg);
       }
       if (updates.str && updates.str.length > 0) {
         console.log('📚 Adding str to verificationDocs:', updates.str);
         allVerificationDocs.push(...updates.str);
       }
       if (updates.sip && updates.sip.length > 0) {
         console.log('📚 Adding sip to verificationDocs:', updates.sip);
         allVerificationDocs.push(...updates.sip);
       }
       
       console.log('🔍 All verification docs collected:', allVerificationDocs);
       
       // Update verificationDocs with all professional documents (remove duplicates)
       if (allVerificationDocs.length > 0) {
         updates.verificationDocs = [...new Set(allVerificationDocs)];
         console.log('📋 Auto-populated verificationDocs:', updates.verificationDocs);
       } else {
         console.log('⚠️ No verification docs to populate');
       }

       // Auto-populate certifications with additional certificates
       console.log('🔍 Starting auto-population of certifications...');
       if (updates.additionalCerts && updates.additionalCerts.length > 0) {
         updates.certifications = [...updates.additionalCerts];
         console.log('📋 Auto-populated certifications:', updates.certifications);
       } else {
         console.log('⚠️ No additional certs to populate');
       }
     }
     
     console.log('🔍 Profile update request for role:', role);
    console.log('🔍 Profile update data (cleaned):', updates);
    console.log('💳 PaymentMethods in request:', updates.paymentMethods);
    console.log('🏥 AcceptedInsurance in request:', updates.acceptedInsurance);
    console.log('📋 Final verificationDocs before save:', updates.verificationDocs);
    console.log('📋 Final certifications before save:', updates.certifications);

    let profile;
    if (role === 'PATIENT') {
      profile = await prisma.patientProfile.update({
        where: { userId: req.user.id },
        data: updates,
      });
    } else if (role === 'DOCTOR') {
      profile = await prisma.doctorProfile.update({
        where: { userId: req.user.id },
        data: updates,
      });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid user role',
      });
    }

    console.log('✅ Profile updated successfully:', profile.id);
    console.log('✅ Updated profile verificationDocs:', profile.verificationDocs);
    console.log('✅ Updated profile certifications:', profile.certifications);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
});

module.exports = router;
