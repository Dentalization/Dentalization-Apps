# Quick Start Guide - Authentication System

## 🚀 Running the Authentication System

### Prerequisites
1. **Backend API**: Ensure the backend is running on `http://localhost:3001`
2. **Database**: PostgreSQL database should be running with Prisma migrations applied
3. **Mobile Environment**: React Native development environment set up

### Starting the System

#### 1. Backend API
```bash
cd backend-api
npm install
npm run dev
```

#### 2. Mobile App
```bash
cd mobile-app
npm install

# For iOS
npm run ios

# For Android  
npm run android
```

## 📱 Testing the Authentication Flow

### 1. User Registration
1. Open the mobile app
2. Tap "Sign Up" on the login screen
3. Select role (Patient or Doctor)
4. Fill out the registration form:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Phone: +1234567890
   - Password: SecurePass123!
   - Confirm Password: SecurePass123!
5. Tap "Create Account"

### 2. User Login
1. Enter credentials:
   - Email: john.doe@example.com
   - Password: SecurePass123!
2. Enable "Remember Me" for biometric setup
3. Tap "Sign In"

### 3. Biometric Authentication (On Real Device)
1. After first login with "Remember Me", biometric will be set up
2. Next app launch will show biometric login option
3. Tap the biometric button (Face ID/Touch ID/Fingerprint)
4. Complete biometric authentication

## 🔧 Environment Configuration

### Backend (.env file)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/dentalization"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
NODE_ENV="development"
PORT=3001
```

### Mobile App
The app automatically detects development environment and uses:
- API Base URL: `http://localhost:3001/api`
- Debug mode enabled
- Console logging active

## 🧪 Test Users

### Sample Patient Account
- **Email**: patient@test.com
- **Password**: TestPass123!
- **Role**: PATIENT

### Sample Doctor Account  
- **Email**: doctor@test.com
- **Password**: TestPass123!
- **Role**: DOCTOR

## 🔍 Debugging

### Common Issues

#### 1. Backend Connection Error
```
Error: Network Error
```
**Solution**: 
- Check if backend is running on port 3001
- Verify API_BASE_URL in mobile app
- Check CORS configuration in backend

#### 2. Biometric Not Working
```
Error: Biometric authentication not available
```
**Solution**:
- Test on real device (biometrics don't work in simulator)
- Ensure device has biometric authentication set up
- Check device permissions for biometric access

#### 3. Token Refresh Issues
```
Error: 401 Unauthorized
```
**Solution**:
- Check JWT_SECRET in backend .env
- Verify token expiration times
- Clear app storage and re-login

### Debug Logs
Enable debug logging by setting:
```javascript
// In mobile app
__DEV__ && console.log('Auth Debug:', authState);
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/verify-token` - Verify token validity
- `POST /api/auth/logout` - User logout

### Testing with cURL
```bash
# Register new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User",
    "phoneNumber": "+1234567890",
    "role": "PATIENT"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

## 🔐 Security Features

### Implemented Security Measures
1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Access and refresh token system
3. **Rate Limiting**: API rate limiting to prevent abuse
4. **Input Validation**: Comprehensive form validation
5. **Secure Storage**: Keychain for biometric credentials
6. **CORS Protection**: Configured CORS for mobile app
7. **Helmet Security**: Security headers in backend

### Security Best Practices
- Never store passwords in plain text
- Use HTTPS in production
- Implement proper token expiration
- Regular security audits
- Biometric data never leaves device

## 📱 Device Testing

### iOS Testing
- **iPhone**: Test Face ID and Touch ID
- **iPad**: Test Touch ID
- **Simulator**: Authentication works but biometrics disabled

### Android Testing
- **Physical Device**: Test fingerprint authentication
- **Emulator**: Authentication works but biometrics disabled

## 🎯 Next Steps

After authentication is working:
1. Test role-based navigation (Patient vs Doctor screens)
2. Verify token refresh functionality
3. Test biometric authentication on real devices
4. Begin implementing role-based profile setup

## 🆘 Support

For issues:
1. Check console logs in React Native debugger
2. Check backend logs for API errors
3. Verify database connections
4. Test API endpoints with Postman/cURL

---

This authentication system provides a solid foundation for the Dentalization app with enterprise-grade security and user experience! 🚀
