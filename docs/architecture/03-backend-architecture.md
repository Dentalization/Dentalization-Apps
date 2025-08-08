# Backend Architecture - Node.js API

## Overview

Backend Dentalization App dibangun menggunakan Node.js dengan Express framework, menggunakan Prisma ORM untuk database operations dan arsitektur layered yang modular.

## Architecture Diagram

```mermaid
graph TB
    subgraph "Node.js Backend API"
        A["🚀 Express Server<br/>(Entry Point)"]
        
        subgraph "Middleware Layer"
            B["🛡️ Security Middleware<br/>(Helmet, CORS)"]
            C["⚡ Rate Limiter"]
            D["🔐 Auth Middleware"]
            E["✅ Validation Middleware"]
            F["📝 Logging (Morgan)"]
        end
        
        subgraph "Route Layer"
            G["🔑 Auth Routes<br/>(/api/auth)"]
            H["👤 Profile Routes<br/>(/api/profile)"]
            I["👨‍⚕️ Doctor Routes<br/>(/api/doctors)"]
            J["👤 Patient Routes<br/>(/api/patients)"]
            K["🤖 AI Diagnosis Routes<br/>(/api/ai-diagnosis)"]
            L["🤝 Shared Routes<br/>(/api/shared)"]
        end
        
        subgraph "Controller Layer"
            M["🔐 Auth Controller"]
            N["👨‍⚕️ Doctor Controller"]
            O["👤 Patient Controller"]
            P["🤖 AI Diagnosis Controller"]
            Q["🤝 Shared Controller"]
        end
        
        subgraph "Service Layer"
            R["🔐 Auth Service"]
            S["🤖 AI Processing Service"]
            T["📧 Email Service"]
            U["📁 File Upload Service"]
            V["🔍 Validation Service"]
        end
        
        subgraph "Data Access Layer"
            W["🗄️ Prisma Client"]
            X["📊 Database Queries"]
            Y["🔄 Transactions"]
        end
    end
    
    subgraph "External Dependencies"
        Z["🗄️ PostgreSQL Database"]
        AA["🤖 AI/ML Service"]
        BB["📧 Email Provider (SMTP)"]
        CC["☁️ File Storage"]
    end
    
    %% Flow connections
    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    
    B --> G
    B --> H
    B --> I
    B --> J
    B --> K
    B --> L
    
    G --> M
    H --> M
    I --> N
    J --> O
    K --> P
    L --> Q
    
    M --> R
    N --> R
    O --> R
    P --> S
    Q --> T
    Q --> U
    M --> V
    
    R --> W
    S --> W
    T --> W
    U --> W
    V --> W
    
    W --> X
    W --> Y
    
    X --> Z
    Y --> Z
    S --> AA
    T --> BB
    U --> CC
    
    classDef server fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef middleware fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef routes fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef controllers fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef services fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef data fill:#f1f8e9,stroke:#689f38,stroke-width:2px
    classDef external fill:#fff8e1,stroke:#ff8f00,stroke-width:2px
    
    class A server
    class B,C,D,E,F middleware
    class G,H,I,J,K,L routes
    class M,N,O,P,Q controllers
    class R,S,T,U,V services
    class W,X,Y data
    class Z,AA,BB,CC external
```

## Directory Structure

```
backend-api/
├── src/
│   ├── controllers/         # Request handlers
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── patientController.js
│   │   ├── aiDiagnosisController.js
│   │   └── sharedController.js
│   ├── routes/             # Route definitions
│   │   ├── auth.js
│   │   ├── profile.js
│   │   ├── doctors/
│   │   ├── patients/
│   │   ├── aiDiagnosis.js
│   │   └── shared/
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   └── validation.js
│   ├── services/          # Business logic
│   │   ├── authService.js
│   │   ├── aiService.js
│   │   ├── emailService.js
│   │   └── fileService.js
│   ├── config/           # Configuration
│   │   ├── database.js
│   │   ├── email.js
│   │   └── storage.js
│   ├── models/           # Data models (if needed)
│   └── index.js          # Server entry point
├── prisma/              # Database schema
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
├── uploads/             # File uploads
├── package.json
└── .env.example
```

## Layer Details

### 1. Middleware Layer

#### Security Middleware
```javascript
// Helmet - Security headers
app.use(helmet());

// CORS - Cross-origin requests
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Compression - Response compression
app.use(compression());
```

#### Rate Limiting
```javascript
// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 auth requests per windowMs
  skipSuccessfulRequests: true
});
```

#### Authentication Middleware
```javascript
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
```

### 2. Route Layer

#### Auth Routes (`/api/auth`)
- `POST /login` - User authentication
- `POST /register` - User registration
- `POST /refresh` - Token refresh
- `POST /logout` - User logout
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset
- `POST /verify-email` - Email verification

#### Profile Routes (`/api/profile`)
- `GET /` - Get user profile
- `PUT /` - Update user profile
- `POST /upload-avatar` - Upload profile picture
- `DELETE /` - Delete user account

#### AI Diagnosis Routes (`/api/ai-diagnosis`)
- `POST /` - Create new diagnosis
- `GET /` - Get diagnosis history
- `GET /:id` - Get specific diagnosis
- `PUT /:id` - Update diagnosis
- `DELETE /:id` - Delete diagnosis

### 3. Controller Layer

#### Auth Controller
```javascript
class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  
  async register(req, res) {
    try {
      const userData = req.body;
      const result = await authService.register(userData);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}
```

#### AI Diagnosis Controller
```javascript
class AiDiagnosisController {
  async createDiagnosis(req, res) {
    try {
      const { userId } = req.user;
      const photoFile = req.file;
      const result = await aiService.processDiagnosis(userId, photoFile);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  async getDiagnosisHistory(req, res) {
    try {
      const { userId } = req.user;
      const history = await aiService.getDiagnosisHistory(userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
```

### 4. Service Layer

#### Auth Service
```javascript
class AuthService {
  async login(email, password) {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('Invalid password');
    
    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    // Save session
    await this.saveSession(user.id, refreshToken);
    
    return { user, accessToken, refreshToken };
  }
  
  generateAccessToken(user) {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
  }
}
```

#### AI Service
```javascript
class AiService {
  async processDiagnosis(userId, photoFile) {
    // Upload file
    const photoUrl = await fileService.uploadFile(photoFile);
    
    // Call AI service
    const aiResult = await this.callAiApi(photoUrl);
    
    // Save to database
    const diagnosis = await prisma.aiDiagnosis.create({
      data: {
        userId,
        photoUrl,
        diagnosis: aiResult.diagnosis,
        confidence: aiResult.confidence,
        detections: aiResult.detections
      }
    });
    
    return diagnosis;
  }
  
  async callAiApi(photoUrl) {
    const response = await axios.post(process.env.AI_SERVICE_URL, {
      image_url: photoUrl
    });
    return response.data;
  }
}
```

### 5. Data Access Layer (Prisma)

#### Database Configuration
```javascript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      Role     @default(PATIENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  doctorProfile  DoctorProfile?
  patientProfile PatientProfile?
  sessions       Session[]
  aiDiagnoses    AiDiagnosis[]
}
```

#### Query Examples
```javascript
// Get user with profile
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    doctorProfile: true,
    patientProfile: true
  }
});

// Get diagnosis history with pagination
const diagnoses = await prisma.aiDiagnosis.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: page * 10
});
```

## API Response Format

### Success Response
```javascript
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response
```javascript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {
      // Additional error details
    }
  }
}
```

## Security Implementation

### 1. Authentication & Authorization
- **JWT Tokens**: Access (15min) + Refresh (7 days)
- **Role-based Access**: Doctor/Patient permissions
- **Session Management**: Secure session storage

### 2. Input Validation
```javascript
const { body, validationResult } = require('express-validator');

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

### 3. File Upload Security
```javascript
const multer = require('multer');

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});
```

## Error Handling

### Global Error Handler
```javascript
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  
  // Prisma errors
  if (error.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: 'Record already exists'
    });
  }
  
  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});
```

## Performance Optimizations

### 1. Database Optimization
- **Indexing**: Proper database indexes
- **Query Optimization**: Efficient Prisma queries
- **Connection Pooling**: Database connection management

### 2. Caching
- **Redis**: Session and data caching
- **Memory Cache**: Frequently accessed data
- **CDN**: Static file delivery

### 3. Monitoring
- **Logging**: Structured logging with Winston
- **Metrics**: Performance monitoring
- **Health Checks**: Service health endpoints

## Deployment Considerations

### 1. Environment Configuration
```bash
# .env
DATABASE_URL="postgresql://user:pass@localhost:5432/dentalization"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
AI_SERVICE_URL="https://ai-service.example.com"
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

### 2. Production Setup
- **Process Management**: PM2 for process management
- **Reverse Proxy**: Nginx for load balancing
- **SSL/TLS**: HTTPS encryption
- **Database**: PostgreSQL with backups

### 3. Monitoring & Logging
- **Application Logs**: Winston + log rotation
- **Error Tracking**: Sentry for error monitoring
- **Performance**: New Relic or similar APM
- **Uptime**: Health check endpoints