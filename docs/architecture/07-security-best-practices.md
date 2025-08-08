# Security & Best Practices Documentation

## Overview

Dokumentasi ini menjelaskan implementasi security, best practices, dan compliance requirements untuk Dentalization App yang menangani data medis sensitif.

## Security Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        MOBILE[Mobile App]
        WEB[Web Dashboard]
    end
    
    subgraph "Security Layer"
        WAF[Web Application Firewall]
        DDOS[DDoS Protection]
        RATE[Rate Limiting]
    end
    
    subgraph "API Gateway"
        ALB[Application Load Balancer]
        SSL[SSL/TLS Termination]
    end
    
    subgraph "Authentication Layer"
        JWT[JWT Validation]
        RBAC[Role-Based Access Control]
        MFA[Multi-Factor Authentication]
    end
    
    subgraph "Application Layer"
        API[API Server]
        VALIDATION[Input Validation]
        SANITIZATION[Data Sanitization]
    end
    
    subgraph "Data Layer"
        ENCRYPTION[Data Encryption]
        DB[(Encrypted Database)]
        BACKUP[(Encrypted Backups)]
    end
    
    subgraph "Monitoring Layer"
        LOGS[Security Logs]
        ALERTS[Security Alerts]
        AUDIT[Audit Trail]
    end
    
    %% Connections
    MOBILE --> WAF
    WEB --> WAF
    WAF --> DDOS
    DDOS --> RATE
    RATE --> ALB
    ALB --> SSL
    SSL --> JWT
    JWT --> RBAC
    RBAC --> MFA
    MFA --> API
    API --> VALIDATION
    VALIDATION --> SANITIZATION
    SANITIZATION --> ENCRYPTION
    ENCRYPTION --> DB
    DB --> BACKUP
    
    API --> LOGS
    LOGS --> ALERTS
    ALERTS --> AUDIT
```

## Authentication & Authorization

### JWT Implementation

#### JWT Token Structure
```javascript
// backend-api/src/utils/jwt.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class JWTService {
  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  generateTokens(payload) {
    const accessToken = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        type: 'access'
      },
      this.accessTokenSecret,
      {
        expiresIn: this.accessTokenExpiry,
        issuer: 'dentalization-api',
        audience: 'dentalization-app'
      }
    );

    const refreshToken = jwt.sign(
      {
        userId: payload.userId,
        type: 'refresh',
        jti: crypto.randomUUID() // Unique token ID for revocation
      },
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiry,
        issuer: 'dentalization-api',
        audience: 'dentalization-app'
      }
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessTokenSecret, {
        issuer: 'dentalization-api',
        audience: 'dentalization-app'
      });
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'dentalization-api',
        audience: 'dentalization-app'
      });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async storeRefreshToken(userId, refreshToken, deviceInfo, ipAddress) {
    const decoded = this.verifyRefreshToken(refreshToken);
    const expiresAt = new Date(decoded.exp * 1000);

    await prisma.session.create({
      data: {
        id: decoded.jti,
        userId,
        refreshToken,
        deviceInfo,
        ipAddress,
        expiresAt
      }
    });
  }

  async revokeRefreshToken(tokenId) {
    await prisma.session.delete({
      where: { id: tokenId }
    });
  }

  async revokeAllUserTokens(userId) {
    await prisma.session.deleteMany({
      where: { userId }
    });
  }
}

module.exports = new JWTService();
```

#### Authentication Middleware
```javascript
// backend-api/src/middleware/auth.js
const jwtService = require('../utils/jwt');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token required'
        }
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwtService.verifyAccessToken(token);

    // Get user with profile
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        doctorProfile: true,
        patientProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found'
        }
      });
    }

    // Check if user is active
    if (user.status === 'SUSPENDED' || user.status === 'DELETED') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Account has been suspended'
        }
      });
    }

    // Attach user to request
    req.user = user;
    req.tokenPayload = decoded;

    // Log authentication event
    logger.info('User authenticated', {
      userId: user.id,
      email: user.email,
      role: user.role,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token'
      }
    });
  }
};

module.exports = { authenticate };
```

### Role-Based Access Control (RBAC)

#### Authorization Middleware
```javascript
// backend-api/src/middleware/authorize.js
const logger = require('../utils/logger');

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;
      
      if (!allowedRoles.includes(userRole)) {
        logger.warn('Authorization failed', {
          userId: req.user.id,
          userRole,
          allowedRoles,
          endpoint: req.path,
          method: req.method
        });
        
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions'
          }
        });
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Authorization check failed'
        }
      });
    }
  };
};

// Resource-based authorization
const authorizeResource = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const resourceId = req.params.id;

      // Admin can access everything
      if (userRole === 'ADMIN') {
        return next();
      }

      // Check resource ownership or access rights
      let hasAccess = false;

      switch (resourceType) {
        case 'ai-diagnosis':
          hasAccess = await checkAiDiagnosisAccess(userId, userRole, resourceId);
          break;
        case 'patient-profile':
          hasAccess = await checkPatientProfileAccess(userId, userRole, resourceId);
          break;
        case 'medical-record':
          hasAccess = await checkMedicalRecordAccess(userId, userRole, resourceId);
          break;
        default:
          hasAccess = false;
      }

      if (!hasAccess) {
        logger.warn('Resource access denied', {
          userId,
          userRole,
          resourceType,
          resourceId
        });
        
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access to this resource is denied'
          }
        });
      }

      next();
    } catch (error) {
      logger.error('Resource authorization error:', error);
      
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Resource authorization check failed'
        }
      });
    }
  };
};

module.exports = { authorize, authorizeResource };
```

## Data Protection

### Encryption Implementation

#### Data Encryption Service
```javascript
// backend-api/src/utils/encryption.js
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
    this.saltRounds = 12;
    
    // Get encryption key from environment
    this.encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    
    if (this.encryptionKey.length !== this.keyLength) {
      throw new Error('Invalid encryption key length');
    }
  }

  // Encrypt sensitive data
  encrypt(text) {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
      cipher.setAAD(Buffer.from('dentalization-app'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  // Decrypt sensitive data
  decrypt(encryptedData) {
    try {
      const { encrypted, iv, tag } = encryptedData;
      
      const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
      decipher.setAAD(Buffer.from('dentalization-app'));
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  // Hash passwords
  async hashPassword(password) {
    return await bcrypt.hash(password, this.saltRounds);
  }

  // Verify passwords
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // Generate secure random tokens
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Hash sensitive identifiers (for indexing)
  hashIdentifier(identifier) {
    return crypto.createHash('sha256')
      .update(identifier + process.env.HASH_SALT)
      .digest('hex');
  }
}

module.exports = new EncryptionService();
```

#### Database Encryption Middleware
```javascript
// backend-api/src/middleware/encryption.js
const encryptionService = require('../utils/encryption');

// Fields that should be encrypted
const ENCRYPTED_FIELDS = {
  PatientProfile: ['phone', 'address', 'emergencyContact', 'allergies', 'medications'],
  DoctorProfile: ['phone', 'licenseNumber'],
  MedicalRecord: ['description', 'data']
};

// Prisma middleware for automatic encryption/decryption
const encryptionMiddleware = (prisma) => {
  // Encrypt before write operations
  prisma.$use(async (params, next) => {
    const { model, action, args } = params;
    
    if (['create', 'update', 'upsert'].includes(action) && ENCRYPTED_FIELDS[model]) {
      const fieldsToEncrypt = ENCRYPTED_FIELDS[model];
      const data = args.data || {};
      
      for (const field of fieldsToEncrypt) {
        if (data[field] && typeof data[field] === 'string') {
          data[field] = encryptionService.encrypt(data[field]);
        }
      }
    }
    
    const result = await next(params);
    
    // Decrypt after read operations
    if (['findUnique', 'findFirst', 'findMany'].includes(action) && result) {
      const decryptResult = (item) => {
        if (!item || !ENCRYPTED_FIELDS[model]) return item;
        
        const fieldsToDecrypt = ENCRYPTED_FIELDS[model];
        const decrypted = { ...item };
        
        for (const field of fieldsToDecrypt) {
          if (decrypted[field] && typeof decrypted[field] === 'object') {
            try {
              decrypted[field] = encryptionService.decrypt(decrypted[field]);
            } catch (error) {
              // Handle decryption errors gracefully
              decrypted[field] = '[ENCRYPTED]';
            }
          }
        }
        
        return decrypted;
      };
      
      if (Array.isArray(result)) {
        return result.map(decryptResult);
      } else {
        return decryptResult(result);
      }
    }
    
    return result;
  });
};

module.exports = { encryptionMiddleware };
```

## Input Validation & Sanitization

### Validation Schemas
```javascript
// backend-api/src/validation/schemas.js
const { z } = require('zod');

// User validation schemas
const userSchemas = {
  register: z.object({
    email: z.string().email('Invalid email format').toLowerCase(),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Password must contain uppercase, lowercase, number and special character'),
    role: z.enum(['PATIENT', 'DOCTOR'], 'Invalid role')
  }),
  
  login: z.object({
    email: z.string().email('Invalid email format').toLowerCase(),
    password: z.string().min(1, 'Password is required')
  }),
  
  updateProfile: z.object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
    dateOfBirth: z.string().datetime().optional()
  })
};

// AI Diagnosis validation schemas
const aiDiagnosisSchemas = {
  analyze: z.object({
    patientId: z.string().uuid().optional()
  }),
  
  review: z.object({
    status: z.enum(['CONFIRMED', 'REJECTED'], 'Invalid status'),
    notes: z.string().max(1000, 'Notes too long').optional()
  })
};

// File upload validation
const fileSchemas = {
  photo: z.object({
    mimetype: z.enum([
      'image/jpeg', 
      'image/png', 
      'image/webp'
    ], 'Invalid file type'),
    size: z.number().max(10 * 1024 * 1024, 'File too large (max 10MB)')
  })
};

module.exports = {
  userSchemas,
  aiDiagnosisSchemas,
  fileSchemas
};
```

### Validation Middleware
```javascript
// backend-api/src/middleware/validation.js
const { z } = require('zod');
const DOMPurify = require('isomorphic-dompurify');
const logger = require('../utils/logger');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = req[source];
      
      // Sanitize string inputs
      const sanitizedData = sanitizeInput(data);
      
      // Validate against schema
      const validatedData = schema.parse(sanitizedData);
      
      // Replace original data with validated data
      req[source] = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        logger.warn('Validation failed', {
          errors: validationErrors,
          data: sanitizeForLogging(req[source]),
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: validationErrors
          }
        });
      }
      
      logger.error('Validation middleware error:', error);
      
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Validation check failed'
        }
      });
    }
  };
};

// Sanitize input to prevent XSS
const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return DOMPurify.sanitize(data.trim());
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }
  
  if (data && typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
};

// Sanitize data for logging (remove sensitive fields)
const sanitizeForLogging = (data) => {
  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  
  if (data && typeof data === 'object') {
    const sanitized = { ...data };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
  
  return data;
};

module.exports = { validate, sanitizeInput, sanitizeForLogging };
```

## Security Headers & CORS

### Security Headers Middleware
```javascript
// backend-api/src/middleware/security.js
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:8081',
      'https://dentalization.com'
    ];
    
    // Allow requests with no origin (mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

// Rate limiting configuration
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.path
      });
      
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(windowMs / 1000)
        }
      });
    }
  });
};

// Different rate limits for different endpoints
const rateLimits = {
  general: createRateLimit(15 * 60 * 1000, 100, 'Too many requests'), // 100 requests per 15 minutes
  auth: createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts'), // 5 attempts per 15 minutes
  upload: createRateLimit(60 * 60 * 1000, 10, 'Too many file uploads'), // 10 uploads per hour
  aiAnalysis: createRateLimit(60 * 60 * 1000, 20, 'Too many AI analysis requests') // 20 analyses per hour
};

// Slow down repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per windowMs without delay
  delayMs: 500 // Add 500ms delay per request after delayAfter
});

module.exports = {
  securityHeaders,
  corsOptions,
  rateLimits,
  speedLimiter
};
```

## File Upload Security

### Secure File Upload
```javascript
// backend-api/src/middleware/fileUpload.js
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const { fileSchemas } = require('../validation/schemas');
const logger = require('../utils/logger');

// File type validation
const allowedMimeTypes = {
  image: ['image/jpeg', 'image/png', 'image/webp'],
  document: ['application/pdf']
};

// File size limits (in bytes)
const fileSizeLimits = {
  image: 10 * 1024 * 1024, // 10MB
  document: 5 * 1024 * 1024 // 5MB
};

// Multer configuration
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  try {
    // Check file type
    const fileType = req.route.path.includes('photo') ? 'image' : 'document';
    const allowedTypes = allowedMimeTypes[fileType];
    
    if (!allowedTypes.includes(file.mimetype)) {
      logger.warn('Invalid file type uploaded', {
        mimetype: file.mimetype,
        filename: file.originalname,
        ip: req.ip
      });
      
      return cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
    }
    
    // Validate file size
    const maxSize = fileSizeLimits[fileType];
    if (file.size > maxSize) {
      return cb(new Error(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`));
    }
    
    cb(null, true);
  } catch (error) {
    logger.error('File filter error:', error);
    cb(error);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Math.max(...Object.values(fileSizeLimits)),
    files: 1 // Only allow single file upload
  }
});

// Image processing and security
const processImage = async (buffer, options = {}) => {
  try {
    const {
      width = 1024,
      height = 1024,
      quality = 80,
      format = 'jpeg'
    } = options;
    
    // Process image with Sharp (removes EXIF data and potential malicious content)
    const processedBuffer = await sharp(buffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFormat(format, { quality })
      .toBuffer();
    
    return processedBuffer;
  } catch (error) {
    logger.error('Image processing error:', error);
    throw new Error('Invalid image file');
  }
};

// Generate secure filename
const generateSecureFilename = (originalname, userId) => {
  const ext = path.extname(originalname).toLowerCase();
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const hash = crypto.createHash('sha256')
    .update(`${userId}-${timestamp}-${random}`)
    .digest('hex')
    .substring(0, 16);
  
  return `${hash}-${timestamp}${ext}`;
};

// File upload middleware
const uploadMiddleware = (fieldName, fileType = 'image') => {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'FILE_REQUIRED',
              message: 'File is required'
            }
          });
        }
        
        // Validate file
        const validation = fileSchemas[fileType].safeParse({
          mimetype: req.file.mimetype,
          size: req.file.size
        });
        
        if (!validation.success) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_FILE',
              message: 'Invalid file',
              details: validation.error.errors
            }
          });
        }
        
        // Process image files
        if (fileType === 'image') {
          req.file.buffer = await processImage(req.file.buffer);
        }
        
        // Generate secure filename
        req.file.secureFilename = generateSecureFilename(
          req.file.originalname,
          req.user?.id || 'anonymous'
        );
        
        logger.info('File uploaded successfully', {
          filename: req.file.secureFilename,
          mimetype: req.file.mimetype,
          size: req.file.size,
          userId: req.user?.id
        });
        
        next();
      } catch (error) {
        logger.error('File upload middleware error:', error);
        
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_PROCESSING_ERROR',
            message: error.message || 'File processing failed'
          }
        });
      }
    }
  ];
};

module.exports = {
  uploadMiddleware,
  processImage,
  generateSecureFilename
};
```

## Security Monitoring & Logging

### Security Event Logging
```javascript
// backend-api/src/utils/securityLogger.js
const winston = require('winston');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class SecurityLogger {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: {
        service: 'dentalization-security'
      },
      transports: [
        new winston.transports.File({ 
          filename: 'logs/security.log',
          level: 'warn'
        }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });
  }

  // Log authentication events
  async logAuthEvent(event, data) {
    const logData = {
      event,
      timestamp: new Date(),
      ...data
    };
    
    this.logger.info('Authentication event', logData);
    
    // Store critical events in database
    if (['LOGIN_FAILED', 'ACCOUNT_LOCKED', 'SUSPICIOUS_ACTIVITY'].includes(event)) {
      await this.storeSecurityEvent(event, logData);
    }
  }

  // Log authorization events
  async logAuthzEvent(event, data) {
    const logData = {
      event,
      timestamp: new Date(),
      ...data
    };
    
    this.logger.warn('Authorization event', logData);
    
    if (event === 'ACCESS_DENIED') {
      await this.storeSecurityEvent(event, logData);
    }
  }

  // Log data access events
  async logDataAccess(action, data) {
    const logData = {
      action,
      timestamp: new Date(),
      ...data
    };
    
    this.logger.info('Data access event', logData);
    
    // Log sensitive data access
    if (['PATIENT_DATA_ACCESS', 'MEDICAL_RECORD_ACCESS'].includes(action)) {
      await this.storeSecurityEvent(action, logData);
    }
  }

  // Log security incidents
  async logSecurityIncident(incident, data) {
    const logData = {
      incident,
      severity: 'HIGH',
      timestamp: new Date(),
      ...data
    };
    
    this.logger.error('Security incident', logData);
    await this.storeSecurityEvent(incident, logData);
    
    // Send alert for critical incidents
    await this.sendSecurityAlert(incident, logData);
  }

  // Store security events in database
  async storeSecurityEvent(event, data) {
    try {
      await prisma.securityEvent.create({
        data: {
          event,
          data: JSON.stringify(data),
          severity: data.severity || 'MEDIUM',
          ipAddress: data.ip,
          userAgent: data.userAgent,
          userId: data.userId
        }
      });
    } catch (error) {
      this.logger.error('Failed to store security event:', error);
    }
  }

  // Send security alerts
  async sendSecurityAlert(incident, data) {
    try {
      // Implementation depends on alerting system (email, Slack, etc.)
      // This is a placeholder for the actual implementation
      console.log(`SECURITY ALERT: ${incident}`, data);
    } catch (error) {
      this.logger.error('Failed to send security alert:', error);
    }
  }
}

module.exports = new SecurityLogger();
```

### Intrusion Detection
```javascript
// backend-api/src/middleware/intrusionDetection.js
const securityLogger = require('../utils/securityLogger');
const redis = require('../utils/redis');

class IntrusionDetection {
  constructor() {
    this.suspiciousPatterns = [
      /union.*select/i,
      /script.*alert/i,
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i
    ];
    
    this.rateLimitThresholds = {
      requests: { window: 60, limit: 100 }, // 100 requests per minute
      failures: { window: 300, limit: 5 },  // 5 failures per 5 minutes
      uploads: { window: 3600, limit: 10 }  // 10 uploads per hour
    };
  }

  // Middleware to detect suspicious activity
  detectSuspiciousActivity() {
    return async (req, res, next) => {
      try {
        const ip = req.ip;
        const userAgent = req.get('User-Agent');
        const userId = req.user?.id;
        
        // Check for suspicious patterns in request
        const suspiciousContent = this.checkSuspiciousPatterns(req);
        if (suspiciousContent) {
          await securityLogger.logSecurityIncident('SUSPICIOUS_PATTERN_DETECTED', {
            ip,
            userAgent,
            userId,
            pattern: suspiciousContent,
            url: req.url,
            method: req.method,
            body: req.body
          });
          
          return res.status(400).json({
            success: false,
            error: {
              code: 'SUSPICIOUS_ACTIVITY',
              message: 'Suspicious activity detected'
            }
          });
        }
        
        // Check rate limits
        const rateLimitViolation = await this.checkRateLimits(ip, req.path);
        if (rateLimitViolation) {
          await securityLogger.logSecurityIncident('RATE_LIMIT_VIOLATION', {
            ip,
            userAgent,
            userId,
            violation: rateLimitViolation
          });
          
          return res.status(429).json({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Rate limit exceeded'
            }
          });
        }
        
        // Check for unusual user behavior
        if (userId) {
          const unusualBehavior = await this.checkUnusualBehavior(userId, req);
          if (unusualBehavior) {
            await securityLogger.logSecurityIncident('UNUSUAL_BEHAVIOR', {
              ip,
              userAgent,
              userId,
              behavior: unusualBehavior
            });
          }
        }
        
        next();
      } catch (error) {
        console.error('Intrusion detection error:', error);
        next(); // Don't block request on detection errors
      }
    };
  }

  // Check for suspicious patterns
  checkSuspiciousPatterns(req) {
    const checkString = (str) => {
      if (typeof str !== 'string') return false;
      return this.suspiciousPatterns.some(pattern => pattern.test(str));
    };
    
    const checkObject = (obj) => {
      if (!obj || typeof obj !== 'object') return false;
      
      for (const [key, value] of Object.entries(obj)) {
        if (checkString(key) || checkString(value)) return true;
        if (typeof value === 'object' && checkObject(value)) return true;
      }
      
      return false;
    };
    
    // Check URL, query parameters, and body
    if (checkString(req.url)) return 'URL';
    if (checkObject(req.query)) return 'Query parameters';
    if (checkObject(req.body)) return 'Request body';
    
    return null;
  }

  // Check rate limits
  async checkRateLimits(ip, path) {
    try {
      const key = `rate_limit:${ip}`;
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, this.rateLimitThresholds.requests.window);
      }
      
      if (current > this.rateLimitThresholds.requests.limit) {
        return 'Request rate limit exceeded';
      }
      
      // Check specific endpoint limits
      if (path.includes('/upload')) {
        const uploadKey = `upload_limit:${ip}`;
        const uploadCount = await redis.incr(uploadKey);
        
        if (uploadCount === 1) {
          await redis.expire(uploadKey, this.rateLimitThresholds.uploads.window);
        }
        
        if (uploadCount > this.rateLimitThresholds.uploads.limit) {
          return 'Upload rate limit exceeded';
        }
      }
      
      return null;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return null;
    }
  }

  // Check for unusual user behavior
  async checkUnusualBehavior(userId, req) {
    try {
      const key = `user_behavior:${userId}`;
      const behavior = await redis.hgetall(key);
      
      const currentHour = new Date().getHours();
      const requestCount = parseInt(behavior.requests || 0);
      const lastActivity = parseInt(behavior.lastActivity || 0);
      const currentTime = Date.now();
      
      // Reset counters if it's a new hour
      if (currentTime - lastActivity > 3600000) {
        await redis.hset(key, {
          requests: 1,
          lastActivity: currentTime,
          lastHour: currentHour
        });
        await redis.expire(key, 86400); // Expire after 24 hours
        return null;
      }
      
      // Update counters
      await redis.hset(key, {
        requests: requestCount + 1,
        lastActivity: currentTime
      });
      
      // Check for unusual patterns
      if (requestCount > 200) { // More than 200 requests per hour
        return 'High request frequency';
      }
      
      // Check for unusual time patterns
      if (currentHour < 6 || currentHour > 23) {
        const nightRequests = parseInt(behavior.nightRequests || 0) + 1;
        await redis.hset(key, 'nightRequests', nightRequests);
        
        if (nightRequests > 10) {
          return 'Unusual activity hours';
        }
      }
      
      return null;
    } catch (error) {
      console.error('Unusual behavior check error:', error);
      return null;
    }
  }
}

module.exports = new IntrusionDetection();
```

## HIPAA Compliance

### HIPAA Compliance Checklist

#### Technical Safeguards
- ✅ **Access Control**: Role-based access control implemented
- ✅ **Audit Controls**: Comprehensive logging and monitoring
- ✅ **Integrity**: Data integrity checks and validation
- ✅ **Person or Entity Authentication**: Multi-factor authentication
- ✅ **Transmission Security**: End-to-end encryption

#### Physical Safeguards
- ✅ **Facility Access Controls**: Cloud infrastructure security
- ✅ **Workstation Use**: Secure development practices
- ✅ **Device and Media Controls**: Encrypted storage

#### Administrative Safeguards
- ✅ **Security Officer**: Designated security responsibilities
- ✅ **Workforce Training**: Security awareness training
- ✅ **Information Access Management**: Principle of least privilege
- ✅ **Security Awareness and Training**: Regular security updates
- ✅ **Security Incident Procedures**: Incident response plan
- ✅ **Contingency Plan**: Disaster recovery procedures
- ✅ **Evaluation**: Regular security assessments

### HIPAA Audit Trail
```javascript
// backend-api/src/utils/hipaaAudit.js
const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient();

class HIPAAAuditTrail {
  constructor() {
    this.auditableActions = [
      'CREATE_PATIENT',
      'UPDATE_PATIENT',
      'VIEW_PATIENT',
      'DELETE_PATIENT',
      'CREATE_MEDICAL_RECORD',
      'UPDATE_MEDICAL_RECORD',
      'VIEW_MEDICAL_RECORD',
      'DELETE_MEDICAL_RECORD',
      'AI_DIAGNOSIS_CREATED',
      'AI_DIAGNOSIS_REVIEWED',
      'EXPORT_DATA',
      'LOGIN',
      'LOGOUT',
      'PASSWORD_CHANGE',
      'PERMISSION_CHANGE'
    ];
  }

  async logAuditEvent(action, data) {
    try {
      if (!this.auditableActions.includes(action)) {
        return;
      }

      const auditEntry = {
        action,
        userId: data.userId,
        targetUserId: data.targetUserId,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        timestamp: new Date(),
        details: JSON.stringify(data.details || {}),
        outcome: data.outcome || 'SUCCESS'
      };

      await prisma.auditLog.create({
        data: auditEntry
      });

      logger.info('HIPAA audit event logged', auditEntry);
    } catch (error) {
      logger.error('Failed to log HIPAA audit event:', error);
    }
  }

  async getAuditTrail(filters = {}) {
    try {
      const {
        userId,
        action,
        resourceType,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = filters;

      const where = {};
      
      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (resourceType) where.resourceType = resourceType;
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = new Date(startDate);
        if (endDate) where.timestamp.lte = new Date(endDate);
      }

      const auditLogs = await prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              email: true,
              role: true
            }
          }
        }
      });

      const total = await prisma.auditLog.count({ where });

      return {
        auditLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to retrieve audit trail:', error);
      throw error;
    }
  }

  // Generate HIPAA compliance report
  async generateComplianceReport(startDate, endDate) {
    try {
      const report = {
        period: { startDate, endDate },
        summary: {},
        violations: [],
        recommendations: []
      };

      // Count audit events by action
      const actionCounts = await prisma.auditLog.groupBy({
        by: ['action'],
        where: {
          timestamp: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        _count: {
          id: true
        }
      });

      report.summary.actionCounts = actionCounts.reduce((acc, item) => {
        acc[item.action] = item._count.id;
        return acc;
      }, {});

      // Check for potential violations
      const violations = await this.detectViolations(startDate, endDate);
      report.violations = violations;

      // Generate recommendations
      report.recommendations = this.generateRecommendations(report);

      return report;
    } catch (error) {
      logger.error('Failed to generate compliance report:', error);
      throw error;
    }
  }

  async detectViolations(startDate, endDate) {
    const violations = [];

    // Check for excessive data access
    const excessiveAccess = await prisma.auditLog.groupBy({
      by: ['userId'],
      where: {
        action: 'VIEW_PATIENT',
        timestamp: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      _count: {
        id: true
      },
      having: {
        id: {
          _count: {
            gt: 100 // More than 100 patient views
          }
        }
      }
    });

    for (const access of excessiveAccess) {
      violations.push({
        type: 'EXCESSIVE_DATA_ACCESS',
        userId: access.userId,
        count: access._count.id,
        severity: 'MEDIUM'
      });
    }

    // Check for after-hours access
    const afterHoursAccess = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      select: {
        userId: true,
        timestamp: true,
        action: true
      }
    });

    const afterHoursViolations = afterHoursAccess.filter(log => {
      const hour = log.timestamp.getHours();
      return hour < 6 || hour > 22; // Outside business hours
    });

    if (afterHoursViolations.length > 0) {
      violations.push({
        type: 'AFTER_HOURS_ACCESS',
        count: afterHoursViolations.length,
        severity: 'LOW'
      });
    }

    return violations;
  }

  generateRecommendations(report) {
    const recommendations = [];

    // Check if audit logging is comprehensive
    const totalActions = Object.values(report.summary.actionCounts).reduce((a, b) => a + b, 0);
    if (totalActions < 100) {
      recommendations.push({
        type: 'INCREASE_AUDIT_COVERAGE',
        message: 'Consider increasing audit logging coverage for better compliance monitoring'
      });
    }

    // Check for violations
    if (report.violations.length > 0) {
      recommendations.push({
        type: 'INVESTIGATE_VIOLATIONS',
        message: 'Investigate and address the detected potential violations'
      });
    }

    return recommendations;
  }
}

module.exports = new HIPAAAuditTrail();
```

## Security Testing

### Security Test Suite
```javascript
// backend-api/tests/security.test.js
const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Security Tests', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany();
  });

  describe('Authentication Security', () => {
    test('should reject requests without authentication', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    test('should reject invalid JWT tokens', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should enforce password complexity', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123', // Weak password
          role: 'PATIENT'
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Input Validation', () => {
    test('should sanitize XSS attempts', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'ValidPass123!',
          role: 'PATIENT',
          firstName: maliciousInput
        });

      // Should either reject or sanitize the input
      if (response.status === 201) {
        expect(response.body.data.user.firstName).not.toContain('<script>');
      } else {
        expect(response.status).toBe(400);
      }
    });

    test('should reject SQL injection attempts', async () => {
      const sqlInjection = "'; DROP TABLE users; --";
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: sqlInjection,
          password: 'password'
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits', async () => {
      const requests = [];
      
      // Make multiple requests quickly
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrongpassword'
            })
        );
      }
      
      const responses = await Promise.all(requests);
      
      // At least one should be rate limited
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('File Upload Security', () => {
    test('should reject malicious file types', async () => {
      const response = await request(app)
        .post('/api/upload/photo')
        .attach('photo', Buffer.from('malicious content'), 'malware.exe')
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_FILE');
    });

    test('should reject oversized files', async () => {
      const largeBuffer = Buffer.alloc(20 * 1024 * 1024); // 20MB
      
      const response = await request(app)
        .post('/api/upload/photo')
        .attach('photo', largeBuffer, 'large.jpg')
        .expect(400);

      expect(response.body.error.message).toContain('too large');
    });
  });

  describe('Authorization', () => {
    test('should enforce role-based access control', async () => {
      // Create a patient user
      const patientUser = await prisma.user.create({
        data: {
          email: 'patient@example.com',
          password: 'hashedpassword',
          role: 'PATIENT'
        }
      });

      // Try to access doctor-only endpoint
      const token = generateTestToken(patientUser);
      
      const response = await request(app)
        .get('/api/doctors/patients')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });
});
```

Dokumentasi ini memberikan panduan komprehensif untuk implementasi security dan best practices dalam Dentalization App, termasuk authentication, authorization, data protection, input validation, monitoring, dan compliance dengan standar HIPAA.