# API Endpoints Documentation

## Overview

Dentalization App API menggunakan RESTful architecture dengan Express.js. API mendukung authentication berbasis JWT, role-based access control, dan comprehensive error handling.

## Base Configuration

```javascript
// Base URL
const BASE_URL = 'http://localhost:3000/api';

// Headers
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <jwt_token>'
};
```

## Authentication Endpoints

### POST /api/auth/register
Register pengguna baru

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "PATIENT" // or "DOCTOR"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clp123abc",
      "email": "user@example.com",
      "role": "PATIENT",
      "createdAt": "2023-12-01T10:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### POST /api/auth/login
Login pengguna

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clp123abc",
      "email": "user@example.com",
      "role": "PATIENT",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "profileComplete": true
      }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### POST /api/auth/refresh
Refresh access token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### POST /api/auth/logout
Logout pengguna

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## User Profile Endpoints

### GET /api/users/profile
Get user profile

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clp123abc",
      "email": "user@example.com",
      "role": "PATIENT",
      "profile": {
        "id": "clp456def",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890",
        "dateOfBirth": "1990-01-01",
        "profileComplete": true,
        "profilePicture": "https://example.com/profile.jpg"
      }
    }
  }
}
```

### PUT /api/users/profile
Update user profile

**Headers:** `Authorization: Bearer <token>`

**Request Body (Patient):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "address": "123 Main St",
  "allergies": "None",
  "medications": "None",
  "medicalHistory": "No significant history"
}
```

**Request Body (Doctor):**
```json
{
  "firstName": "Dr. Jane",
  "lastName": "Smith",
  "phone": "+1234567890",
  "licenseNumber": "DDS12345",
  "specialization": "Orthodontics",
  "yearsExperience": 15,
  "clinicName": "Smith Dental Clinic",
  "clinicAddress": "456 Medical Ave"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "profile": {
      "id": "clp456def",
      "firstName": "John",
      "lastName": "Doe",
      "profileComplete": true,
      "updatedAt": "2023-12-01T10:30:00Z"
    }
  }
}
```

### POST /api/users/upload-avatar
Upload profile picture

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
```
FormData:
- avatar: File (image file)
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "data": {
    "profilePicture": "https://storage.example.com/avatars/user123.jpg"
  }
}
```

## AI Diagnosis Endpoints

### POST /api/ai-diagnosis/analyze
Analyze dental photo dengan AI

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
```
FormData:
- photo: File (image file)
- patientId: string (optional, for doctors)
```

**Response (200):**
```json
{
  "success": true,
  "message": "Photo analyzed successfully",
  "data": {
    "diagnosis": {
      "id": "clp789ghi",
      "photoUrl": "https://storage.example.com/photos/photo123.jpg",
      "diagnosis": "Dental Caries detected",
      "confidence": 0.85,
      "detections": [
        {
          "condition": "Dental Caries",
          "confidence": 0.85,
          "location": {
            "x": 120,
            "y": 80,
            "width": 50,
            "height": 40
          },
          "severity": "moderate"
        }
      ],
      "status": "PENDING",
      "createdAt": "2023-12-01T11:00:00Z"
    }
  }
}
```

### GET /api/ai-diagnosis/history
Get AI diagnosis history

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `status`: string (optional: PENDING, REVIEWED, CONFIRMED, REJECTED)
- `patientId`: string (optional, for doctors)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "diagnoses": [
      {
        "id": "clp789ghi",
        "photoUrl": "https://storage.example.com/photos/photo123.jpg",
        "diagnosis": "Dental Caries detected",
        "confidence": 0.85,
        "status": "PENDING",
        "createdAt": "2023-12-01T11:00:00Z",
        "patient": {
          "firstName": "John",
          "lastName": "Doe"
        },
        "doctor": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### GET /api/ai-diagnosis/:id
Get specific AI diagnosis

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "diagnosis": {
      "id": "clp789ghi",
      "photoUrl": "https://storage.example.com/photos/photo123.jpg",
      "diagnosis": "Dental Caries detected",
      "confidence": 0.85,
      "detections": [
        {
          "condition": "Dental Caries",
          "confidence": 0.85,
          "location": {
            "x": 120,
            "y": 80,
            "width": 50,
            "height": 40
          },
          "severity": "moderate"
        }
      ],
      "status": "PENDING",
      "notes": null,
      "createdAt": "2023-12-01T11:00:00Z",
      "patient": {
        "id": "clp456def",
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "1990-01-01"
      },
      "doctor": null
    }
  }
}
```

### PUT /api/ai-diagnosis/:id/review
Review AI diagnosis (Doctor only)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "CONFIRMED", // CONFIRMED, REJECTED
  "notes": "Diagnosis confirmed. Recommend immediate treatment."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Diagnosis reviewed successfully",
  "data": {
    "diagnosis": {
      "id": "clp789ghi",
      "status": "CONFIRMED",
      "notes": "Diagnosis confirmed. Recommend immediate treatment.",
      "doctorId": "clp321xyz",
      "updatedAt": "2023-12-01T12:00:00Z"
    }
  }
}
```

## Doctor-Specific Endpoints

### GET /api/doctors/patients
Get doctor's patients list

**Headers:** `Authorization: Bearer <token>`
**Role Required:** DOCTOR

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `search`: string (optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "clp456def",
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "1990-01-01",
        "phone": "+1234567890",
        "lastDiagnosis": "2023-12-01T11:00:00Z",
        "totalDiagnoses": 3
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

### GET /api/doctors/dashboard/stats
Get doctor dashboard statistics

**Headers:** `Authorization: Bearer <token>`
**Role Required:** DOCTOR

**Query Parameters:**
- `period`: string (optional: 'week', 'month', 'year', default: 'month')

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalPatients": 45,
      "totalDiagnoses": 128,
      "pendingReviews": 8,
      "confirmedDiagnoses": 95,
      "rejectedDiagnoses": 25,
      "thisMonth": {
        "newPatients": 5,
        "newDiagnoses": 23,
        "reviewsCompleted": 18
      },
      "commonConditions": [
        {
          "condition": "Dental Caries",
          "count": 45,
          "percentage": 35.2
        },
        {
          "condition": "Gingivitis",
          "count": 32,
          "percentage": 25.0
        }
      ]
    }
  }
}
```

## Patient-Specific Endpoints

### GET /api/patients/dashboard/stats
Get patient dashboard statistics

**Headers:** `Authorization: Bearer <token>`
**Role Required:** PATIENT

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalDiagnoses": 8,
      "pendingReviews": 2,
      "confirmedDiagnoses": 5,
      "rejectedDiagnoses": 1,
      "lastDiagnosis": "2023-12-01T11:00:00Z",
      "recentConditions": [
        {
          "condition": "Dental Caries",
          "count": 3,
          "lastDetected": "2023-12-01T11:00:00Z"
        }
      ]
    }
  }
}
```

## File Upload Endpoints

### POST /api/upload/photo
Upload dental photo

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
```
FormData:
- photo: File (image file)
- type: string ("intraoral", "extraoral", "xray")
- description: string (optional)
```

**Response (200):**
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "data": {
    "photo": {
      "id": "clp999zzz",
      "photoUrl": "https://storage.example.com/photos/photo456.jpg",
      "photoType": "intraoral",
      "description": "Front teeth examination",
      "createdAt": "2023-12-01T13:00:00Z"
    }
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Common Error Codes

#### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data"
  }
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

#### 409 Conflict
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Email already exists"
  }
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Internal server error"
  }
}
```

## Rate Limiting

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701432000
```

### Rate Limit Response (429)
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

## API Versioning

### Version Header
```
API-Version: v1
```

### Versioned Endpoints
```
GET /api/v1/users/profile
GET /api/v2/users/profile
```

## Pagination

### Standard Pagination
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Cursor-based Pagination
```json
{
  "data": [...],
  "pagination": {
    "cursor": "eyJpZCI6ImNscDEyM2FiYyJ9",
    "hasNext": true,
    "limit": 10
  }
}
```

## WebSocket Events

### Connection
```javascript
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'Bearer eyJhbGciOiJIUzI1NiIs...'
  }
});
```

### Events

#### diagnosis:new
```json
{
  "event": "diagnosis:new",
  "data": {
    "diagnosisId": "clp789ghi",
    "patientId": "clp456def",
    "diagnosis": "Dental Caries detected",
    "confidence": 0.85
  }
}
```

#### diagnosis:reviewed
```json
{
  "event": "diagnosis:reviewed",
  "data": {
    "diagnosisId": "clp789ghi",
    "status": "CONFIRMED",
    "doctorId": "clp321xyz",
    "notes": "Treatment recommended"
  }
}
```

## Testing Examples

### cURL Examples

#### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "PATIENT"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Get Profile
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

#### Upload Photo for Analysis
```bash
curl -X POST http://localhost:3000/api/ai-diagnosis/analyze \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -F "photo=@/path/to/dental-photo.jpg"
```

### Postman Collection
```json
{
  "info": {
    "name": "Dentalization API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{accessToken}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "accessToken",
      "value": ""
    }
  ]
}
```

## Security Considerations

### Authentication
- JWT tokens dengan expiration time
- Refresh token rotation
- Secure token storage

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- API endpoint protection

### Data Protection
- Input validation dan sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### File Upload Security
- File type validation
- File size limits
- Virus scanning
- Secure file storage

### Rate Limiting
- Per-user rate limiting
- Per-endpoint rate limiting
- DDoS protection

### HTTPS
- SSL/TLS encryption
- Certificate management
- HSTS headers

## Performance Optimization

### Caching
- Redis caching untuk frequent queries
- Response caching
- Database query optimization

### Database
- Connection pooling
- Query optimization
- Indexing strategy

### File Handling
- CDN untuk static files
- Image optimization
- Lazy loading

### Monitoring
- API response times
- Error rates
- Resource usage
- User activity tracking