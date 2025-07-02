# Dentalization API Documentation

## Overview

This is the backend API for the Dentalization dental care application, providing role-based access for patients, doctors, and administrators.

## Base URL

```
Development: http://localhost:3001/api
Production: https://api.dentalization.com/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/refresh-token` | Refresh JWT token |
| POST | `/auth/logout` | Logout user |
| POST | `/auth/logout-all` | Logout from all devices |

## Role-Based Access

### Patient Endpoints (`/api/patients`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard` | Get patient dashboard | ✅ |
| PUT | `/profile` | Update patient profile | ✅ |
| GET | `/appointments` | Get patient appointments | ✅ |
| POST | `/appointments` | Book new appointment | ✅ |
| GET | `/photos` | Get patient photos | ✅ |
| POST | `/photos` | Upload new photo | ✅ |
| GET | `/doctors` | Get available doctors | ✅ |

### Doctor Endpoints (`/api/doctors`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard` | Get doctor dashboard | ✅ |
| PUT | `/profile` | Update doctor profile | ✅ |
| GET | `/patients` | Get doctor's patients | ✅ |
| GET | `/patients/:id` | Get patient details | ✅ |
| GET | `/appointments` | Get doctor appointments | ✅ |
| PUT | `/appointments/:id/status` | Update appointment status | ✅ |
| POST | `/appointments/:id/treatment` | Add treatment notes | ✅ |
| POST | `/availability` | Set doctor availability | ✅ |

### Shared Endpoints (`/api/shared`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications` | Get user notifications | ✅ |
| PUT | `/notifications/:id/read` | Mark notification as read | ✅ |
| PUT | `/notifications/read-all` | Mark all notifications as read | ✅ |
| GET | `/chat/contacts` | Get chat contacts | ✅ |
| GET | `/chat/:userId/messages` | Get chat messages | ✅ |
| POST | `/chat/:userId/messages` | Send chat message | ✅ |
| GET | `/search/users` | Search users | ✅ |

## Request/Response Examples

### Register User

**Request:**
```json
POST /api/auth/register
{
  "email": "patient@example.com",
  "password": "password123!",
  "role": "PATIENT",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "patient@example.com",
      "role": "PATIENT",
      "status": "ACTIVE"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User

**Request:**
```json
POST /api/auth/login
{
  "email": "patient@example.com",
  "password": "password123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "patient@example.com",
      "role": "PATIENT",
      "status": "ACTIVE",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Book Appointment

**Request:**
```json
POST /api/patients/appointments
Authorization: Bearer <token>
{
  "doctorId": "clxxx...",
  "appointmentDate": "2024-01-15T10:00:00.000Z",
  "reason": "Regular checkup",
  "notes": "Patient reports tooth sensitivity"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "id": "clxxx...",
    "patientId": "clxxx...",
    "doctorId": "clxxx...",
    "appointmentDate": "2024-01-15T10:00:00.000Z",
    "reason": "Regular checkup",
    "status": "PENDING",
    "doctor": {
      "id": "clxxx...",
      "doctorProfile": {
        "firstName": "Dr. Jane",
        "lastName": "Smith",
        "specialization": "General Dentistry"
      }
    }
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

- General endpoints: 100 requests per 15 minutes per IP
- Authentication endpoints: 5 requests per 15 minutes per IP
- File upload endpoints: 10 requests per minute per IP

## File Uploads

File uploads (photos) are handled via multipart/form-data:

```javascript
const formData = new FormData();
formData.append('photo', fileBlob);
formData.append('description', 'Front teeth photo');
formData.append('tags', 'front,teeth,checkup');

fetch('/api/patients/photos', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

## WebSocket Events (Future Implementation)

For real-time features like chat and notifications:

```javascript
// Connect to WebSocket
const socket = io('ws://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Listen for new messages
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Listen for notifications
socket.on('new_notification', (notification) => {
  console.log('New notification:', notification);
});
```

## Environment Variables

Required environment variables for setup:

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/dentalization_db"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="30d"

# Server
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up PostgreSQL database
4. Copy `.env.example` to `.env` and fill in values
5. Run database migrations: `npm run db:migrate`
6. Seed database: `npm run db:seed`
7. Start development server: `npm run dev`
8. Open Prisma Studio: `npm run db:studio`

## Testing

```bash
# Run tests
npm test

# Test specific endpoint
curl -X GET http://localhost:3001/health
```

## Deployment

The API is ready for deployment to platforms like:
- Heroku
- Railway
- DigitalOcean
- AWS
- Google Cloud Platform

Make sure to:
1. Set all environment variables
2. Use a production PostgreSQL database
3. Configure CORS for your frontend domain
4. Set up SSL/HTTPS
5. Configure file storage (Cloudinary, AWS S3, etc.)
