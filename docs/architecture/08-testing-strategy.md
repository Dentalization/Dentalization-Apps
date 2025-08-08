# Testing Strategy Documentation

## Overview

Dokumentasi ini menjelaskan strategi testing komprehensif untuk Dentalization App, mencakup unit testing, integration testing, end-to-end testing, performance testing, dan security testing.

## Testing Pyramid

```mermaid
graph TB
    subgraph "Testing Pyramid"
        E2E["End-to-End Tests<br/>UI/API Integration<br/>~10%"]
        INTEGRATION["Integration Tests<br/>API/Database<br/>~20%"]
        UNIT["Unit Tests<br/>Components/Functions<br/>~70%"]
    end
    
    subgraph "Testing Types"
        MANUAL["Manual Testing<br/>Exploratory<br/>User Acceptance"]
        PERFORMANCE["Performance Testing<br/>Load/Stress<br/>Scalability"]
        SECURITY["Security Testing<br/>Penetration<br/>Vulnerability"]
    end
    
    E2E --> MANUAL
    INTEGRATION --> PERFORMANCE
    UNIT --> SECURITY
```

## Frontend Testing Strategy

### React Native Testing Setup

#### Jest Configuration
```javascript
// DentalizationApp/jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.js',
    '@testing-library/jest-native/extend-expect'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/android/',
    '<rootDir>/ios/'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-navigation|@react-navigation|react-native-vector-icons|react-native-image-picker)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/index.js',
    '!src/setupTests.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1'
  }
};
```

#### Test Setup
```javascript
// DentalizationApp/src/setupTests.js
import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { configure } from '@testing-library/react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock react-navigation
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useFocusEffect: jest.fn(),
  };
});

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
}));

// Mock Redux store
jest.mock('./store', () => ({
  store: {
    getState: jest.fn(() => ({})),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
  },
}));

// Configure testing library
configure({
  testIdAttribute: 'testID',
});

// Global test utilities
global.mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
};

global.mockRoute = {
  params: {},
};

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
```

### Unit Testing Examples

#### Component Testing
```javascript
// DentalizationApp/src/components/__tests__/Button.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button Component', () => {
  const defaultProps = {
    title: 'Test Button',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(<Button {...defaultProps} />);
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(<Button {...defaultProps} />);
    
    fireEvent.press(getByText('Test Button'));
    
    expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  });

  it('renders loading state correctly', () => {
    const { getByTestId, queryByText } = render(
      <Button {...defaultProps} loading={true} />
    );
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
    expect(queryByText('Test Button')).toBeNull();
  });

  it('applies disabled styles when disabled', () => {
    const { getByTestId } = render(
      <Button {...defaultProps} disabled={true} />
    );
    
    const button = getByTestId('button');
    expect(button.props.style).toMatchObject({
      opacity: 0.5,
    });
  });

  it('renders with custom variant styles', () => {
    const { getByTestId } = render(
      <Button {...defaultProps} variant="secondary" />
    );
    
    const button = getByTestId('button');
    expect(button.props.style).toMatchObject({
      backgroundColor: '#f0f0f0',
    });
  });
});
```

#### Screen Testing
```javascript
// DentalizationApp/src/screens/__tests__/LoginScreen.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginScreen from '../LoginScreen';
import authSlice from '../../store/slices/authSlice';

// Mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: {
        isLoading: false,
        error: null,
        user: null,
        ...initialState.auth,
      },
    },
  });
};

const renderWithProvider = (component, initialState = {}) => {
  const store = createMockStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        {component}
      </Provider>
    ),
    store,
  };
};

describe('LoginScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    const { getByPlaceholderText, getByText } = renderWithProvider(
      <LoginScreen navigation={mockNavigation} />
    );

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('validates email format', async () => {
    const { getByPlaceholderText, getByText, getByTestId } = renderWithProvider(
      <LoginScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('Email');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByTestId('email-error')).toBeTruthy();
    });
  });

  it('submits form with valid credentials', async () => {
    const { getByPlaceholderText, getByText, store } = renderWithProvider(
      <LoginScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      const actions = store.getState();
      expect(actions).toBeDefined();
    });
  });

  it('displays loading state during login', () => {
    const { getByTestId } = renderWithProvider(
      <LoginScreen navigation={mockNavigation} />,
      {
        auth: { isLoading: true }
      }
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('displays error message on login failure', () => {
    const errorMessage = 'Invalid credentials';
    const { getByText } = renderWithProvider(
      <LoginScreen navigation={mockNavigation} />,
      {
        auth: { error: errorMessage }
      }
    );

    expect(getByText(errorMessage)).toBeTruthy();
  });
});
```

#### Redux Testing
```javascript
// DentalizationApp/src/store/slices/__tests__/authSlice.test.js
import authSlice, {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
} from '../authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
  };

  it('should return the initial state', () => {
    expect(authSlice(undefined, {})).toEqual(initialState);
  });

  it('should handle loginStart', () => {
    const action = loginStart();
    const state = authSlice(initialState, action);

    expect(state.isLoading).toBe(true);
    expect(state.error).toBe(null);
  });

  it('should handle loginSuccess', () => {
    const user = { id: 1, email: 'test@example.com' };
    const token = 'jwt-token';
    const action = loginSuccess({ user, token });
    const state = authSlice(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.user).toEqual(user);
    expect(state.token).toBe(token);
    expect(state.isAuthenticated).toBe(true);
    expect(state.error).toBe(null);
  });

  it('should handle loginFailure', () => {
    const error = 'Login failed';
    const action = loginFailure(error);
    const state = authSlice(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(error);
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle logout', () => {
    const loggedInState = {
      ...initialState,
      user: { id: 1, email: 'test@example.com' },
      token: 'jwt-token',
      isAuthenticated: true,
    };
    
    const action = logout();
    const state = authSlice(loggedInState, action);

    expect(state).toEqual(initialState);
  });

  it('should handle clearError', () => {
    const errorState = {
      ...initialState,
      error: 'Some error',
    };
    
    const action = clearError();
    const state = authSlice(errorState, action);

    expect(state.error).toBe(null);
  });
});
```

#### Service Testing
```javascript
// DentalizationApp/src/services/__tests__/apiService.test.js
import apiService from '../apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock fetch
global.fetch = jest.fn();

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('apiService', () => {
  beforeEach(() => {
    fetch.mockClear();
    AsyncStorage.getItem.mockClear();
  });

  describe('login', () => {
    it('should make POST request to login endpoint', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: 1, email: 'test@example.com' },
          token: 'jwt-token',
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await apiService.login(credentials);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(credentials),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle login failure', async () => {
      const mockError = {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockError,
      });

      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(apiService.login(credentials)).rejects.toThrow(
        'Invalid email or password'
      );
    });
  });

  describe('authenticated requests', () => {
    it('should include authorization header when token exists', async () => {
      const token = 'jwt-token';
      AsyncStorage.getItem.mockResolvedValueOnce(token);

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      await apiService.getUserProfile();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/profile'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${token}`,
          }),
        })
      );
    });

    it('should handle token refresh on 401 response', async () => {
      const oldToken = 'old-token';
      const newToken = 'new-token';
      
      AsyncStorage.getItem
        .mockResolvedValueOnce(oldToken) // First call
        .mockResolvedValueOnce(newToken); // After refresh

      // First request fails with 401
      fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: 'Token expired' }),
        })
        // Token refresh succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { token: newToken } }),
        })
        // Retry original request succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });

      const result = await apiService.getUserProfile();

      expect(fetch).toHaveBeenCalledTimes(3);
      expect(result.success).toBe(true);
    });
  });
});
```

## Backend Testing Strategy

### Node.js Testing Setup

#### Jest Configuration
```javascript
// backend-api/jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.js',
    '<rootDir>/src/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/setupTests.js',
    '!src/server.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testTimeout: 10000,
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1'
  }
};
```

#### Test Setup
```javascript
// backend-api/src/setupTests.js
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const { v4: uuidv4 } = require('uuid');

// Create test database URL
const generateDatabaseURL = () => {
  const testId = uuidv4();
  return process.env.DATABASE_URL.replace(
    /\/([^/]+)$/,
    `/test_${testId}`
  );
};

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = generateDatabaseURL();
  
  // Create test database
  execSync('npx prisma db push --force-reset', {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    stdio: 'inherit'
  });
});

// Global test cleanup
afterAll(async () => {
  // Clean up test database
  const prisma = new PrismaClient();
  await prisma.$disconnect();
});

// Test utilities
global.testUtils = {
  createTestUser: async (overrides = {}) => {
    const prisma = new PrismaClient();
    return await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'PATIENT',
        firstName: 'Test',
        lastName: 'User',
        ...overrides
      }
    });
  },
  
  generateJWT: (payload) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  },
  
  cleanDatabase: async () => {
    const prisma = new PrismaClient();
    await prisma.session.deleteMany();
    await prisma.aiDiagnosis.deleteMany();
    await prisma.dentalPhoto.deleteMany();
    await prisma.medicalRecord.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.doctorProfile.deleteMany();
    await prisma.patientProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  }
};
```

### Unit Testing Examples

#### Controller Testing
```javascript
// backend-api/src/controllers/__tests__/authController.test.js
const request = require('supertest');
const app = require('../../app');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

describe('Auth Controller', () => {
  beforeEach(async () => {
    await global.testUtils.cleanDatabase();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'ValidPass123!',
        role: 'PATIENT',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.password).toBeUndefined();
      expect(response.body.data.token).toBeDefined();

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      expect(user).toBeTruthy();
      expect(user.role).toBe('PATIENT');
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'ValidPass123!',
        role: 'PATIENT'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        role: 'PATIENT'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with duplicate email', async () => {
      // Create existing user
      await global.testUtils.createTestUser({
        email: 'existing@example.com'
      });

      const userData = {
        email: 'existing@example.com',
        password: 'ValidPass123!',
        role: 'PATIENT'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.error.code).toBe('EMAIL_EXISTS');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create test user
      const hashedPassword = await bcrypt.hash('ValidPass123!', 12);
      await global.testUtils.createTestUser({
        email: 'test@example.com',
        password: hashedPassword
      });
    });

    it('should login with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'ValidPass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(credentials.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should reject login with invalid password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login with non-existent email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'ValidPass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });
});
```

#### Service Testing
```javascript
// backend-api/src/services/__tests__/aiDiagnosisService.test.js
const aiDiagnosisService = require('../aiDiagnosisService');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

// Mock external AI service
jest.mock('../externalAIService', () => ({
  analyzeImage: jest.fn(),
}));

const mockAIService = require('../externalAIService');

describe('AI Diagnosis Service', () => {
  let testUser, testPatient;

  beforeEach(async () => {
    await global.testUtils.cleanDatabase();
    
    testUser = await global.testUtils.createTestUser({
      role: 'PATIENT'
    });
    
    testPatient = await prisma.patientProfile.create({
      data: {
        userId: testUser.id,
        dateOfBirth: new Date('1990-01-01'),
        phone: '+1234567890'
      }
    });
  });

  describe('analyzeImage', () => {
    it('should analyze dental image successfully', async () => {
      // Mock AI service response
      const mockAIResponse = {
        diagnosis: 'Dental Caries',
        confidence: 0.85,
        recommendations: ['Visit dentist for treatment'],
        severity: 'MODERATE'
      };
      
      mockAIService.analyzeImage.mockResolvedValueOnce(mockAIResponse);

      // Create mock image buffer
      const imageBuffer = Buffer.from('fake-image-data');
      const imageMetadata = {
        filename: 'test-image.jpg',
        mimetype: 'image/jpeg',
        size: 1024
      };

      const result = await aiDiagnosisService.analyzeImage(
        imageBuffer,
        imageMetadata,
        testUser.id
      );

      expect(result.success).toBe(true);
      expect(result.data.diagnosis).toBe(mockAIResponse.diagnosis);
      expect(result.data.confidence).toBe(mockAIResponse.confidence);
      expect(result.data.status).toBe('PENDING');

      // Verify diagnosis was saved to database
      const savedDiagnosis = await prisma.aiDiagnosis.findUnique({
        where: { id: result.data.id }
      });
      expect(savedDiagnosis).toBeTruthy();
      expect(savedDiagnosis.diagnosis).toBe(mockAIResponse.diagnosis);
    });

    it('should handle AI service failure gracefully', async () => {
      mockAIService.analyzeImage.mockRejectedValueOnce(
        new Error('AI service unavailable')
      );

      const imageBuffer = Buffer.from('fake-image-data');
      const imageMetadata = {
        filename: 'test-image.jpg',
        mimetype: 'image/jpeg',
        size: 1024
      };

      await expect(
        aiDiagnosisService.analyzeImage(
          imageBuffer,
          imageMetadata,
          testUser.id
        )
      ).rejects.toThrow('AI analysis failed');
    });

    it('should validate image format', async () => {
      const imageBuffer = Buffer.from('fake-image-data');
      const invalidMetadata = {
        filename: 'test-file.txt',
        mimetype: 'text/plain',
        size: 1024
      };

      await expect(
        aiDiagnosisService.analyzeImage(
          imageBuffer,
          invalidMetadata,
          testUser.id
        )
      ).rejects.toThrow('Invalid image format');
    });

    it('should enforce file size limits', async () => {
      const imageBuffer = Buffer.from('fake-image-data');
      const largeFileMetadata = {
        filename: 'large-image.jpg',
        mimetype: 'image/jpeg',
        size: 20 * 1024 * 1024 // 20MB
      };

      await expect(
        aiDiagnosisService.analyzeImage(
          imageBuffer,
          largeFileMetadata,
          testUser.id
        )
      ).rejects.toThrow('File size too large');
    });
  });

  describe('getDiagnosisHistory', () => {
    beforeEach(async () => {
      // Create test diagnoses
      await prisma.aiDiagnosis.createMany({
        data: [
          {
            userId: testUser.id,
            diagnosis: 'Dental Caries',
            confidence: 0.85,
            status: 'CONFIRMED',
            createdAt: new Date('2023-01-01')
          },
          {
            userId: testUser.id,
            diagnosis: 'Gingivitis',
            confidence: 0.75,
            status: 'PENDING',
            createdAt: new Date('2023-01-02')
          }
        ]
      });
    });

    it('should return user diagnosis history', async () => {
      const result = await aiDiagnosisService.getDiagnosisHistory(
        testUser.id,
        { page: 1, limit: 10 }
      );

      expect(result.success).toBe(true);
      expect(result.data.diagnoses).toHaveLength(2);
      expect(result.data.pagination.total).toBe(2);
      
      // Should be ordered by creation date (newest first)
      expect(result.data.diagnoses[0].diagnosis).toBe('Gingivitis');
      expect(result.data.diagnoses[1].diagnosis).toBe('Dental Caries');
    });

    it('should filter by status', async () => {
      const result = await aiDiagnosisService.getDiagnosisHistory(
        testUser.id,
        { status: 'CONFIRMED' }
      );

      expect(result.data.diagnoses).toHaveLength(1);
      expect(result.data.diagnoses[0].status).toBe('CONFIRMED');
    });

    it('should paginate results correctly', async () => {
      const result = await aiDiagnosisService.getDiagnosisHistory(
        testUser.id,
        { page: 1, limit: 1 }
      );

      expect(result.data.diagnoses).toHaveLength(1);
      expect(result.data.pagination.page).toBe(1);
      expect(result.data.pagination.totalPages).toBe(2);
    });
  });
});
```

### Integration Testing

#### API Integration Tests
```javascript
// backend-api/src/__tests__/integration/aiDiagnosis.integration.test.js
const request = require('supertest');
const app = require('../../app');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

describe('AI Diagnosis Integration Tests', () => {
  let authToken, testUser;

  beforeEach(async () => {
    await global.testUtils.cleanDatabase();
    
    // Create and authenticate test user
    testUser = await global.testUtils.createTestUser({
      role: 'PATIENT'
    });
    
    authToken = global.testUtils.generateJWT({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role
    });
  });

  describe('POST /api/ai-diagnosis/analyze', () => {
    it('should complete full AI diagnosis workflow', async () => {
      // Create test image file
      const testImagePath = path.join(__dirname, 'fixtures', 'test-dental-image.jpg');
      
      // Upload and analyze image
      const response = await request(app)
        .post('/api/ai-diagnosis/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testImagePath)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.diagnosis).toBeDefined();
      expect(response.body.data.confidence).toBeGreaterThan(0);
      expect(response.body.data.status).toBe('PENDING');

      // Verify diagnosis was saved
      const diagnosis = await prisma.aiDiagnosis.findUnique({
        where: { id: response.body.data.id },
        include: { dentalPhoto: true }
      });
      
      expect(diagnosis).toBeTruthy();
      expect(diagnosis.dentalPhoto).toBeTruthy();
      expect(diagnosis.userId).toBe(testUser.id);
    });

    it('should handle concurrent analysis requests', async () => {
      const testImagePath = path.join(__dirname, 'fixtures', 'test-dental-image.jpg');
      
      // Make multiple concurrent requests
      const requests = Array(3).fill().map(() => 
        request(app)
          .post('/api/ai-diagnosis/analyze')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('photo', testImagePath)
      );

      const responses = await Promise.all(requests);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Verify all diagnoses were saved
      const diagnoses = await prisma.aiDiagnosis.findMany({
        where: { userId: testUser.id }
      });
      
      expect(diagnoses).toHaveLength(3);
    });
  });

  describe('GET /api/ai-diagnosis/history', () => {
    beforeEach(async () => {
      // Create test diagnoses
      await prisma.aiDiagnosis.createMany({
        data: Array(15).fill().map((_, index) => ({
          userId: testUser.id,
          diagnosis: `Test Diagnosis ${index + 1}`,
          confidence: 0.8 + (index * 0.01),
          status: index % 2 === 0 ? 'CONFIRMED' : 'PENDING',
          createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000))
        }))
      });
    });

    it('should return paginated diagnosis history', async () => {
      const response = await request(app)
        .get('/api/ai-diagnosis/history?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.diagnoses).toHaveLength(10);
      expect(response.body.data.pagination.total).toBe(15);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/ai-diagnosis/history?status=CONFIRMED')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.diagnoses.length).toBeGreaterThan(0);
      response.body.data.diagnoses.forEach(diagnosis => {
        expect(diagnosis.status).toBe('CONFIRMED');
      });
    });
  });

  describe('Doctor Review Workflow', () => {
    let doctorToken, doctorUser, testDiagnosis;

    beforeEach(async () => {
      // Create doctor user
      doctorUser = await global.testUtils.createTestUser({
        email: 'doctor@example.com',
        role: 'DOCTOR'
      });
      
      doctorToken = global.testUtils.generateJWT({
        userId: doctorUser.id,
        email: doctorUser.email,
        role: doctorUser.role
      });

      // Create test diagnosis
      testDiagnosis = await prisma.aiDiagnosis.create({
        data: {
          userId: testUser.id,
          diagnosis: 'Test Diagnosis',
          confidence: 0.85,
          status: 'PENDING'
        }
      });
    });

    it('should allow doctor to review and confirm diagnosis', async () => {
      const reviewData = {
        status: 'CONFIRMED',
        notes: 'Diagnosis confirmed after review'
      };

      const response = await request(app)
        .patch(`/api/ai-diagnosis/${testDiagnosis.id}/review`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(reviewData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('CONFIRMED');
      expect(response.body.data.reviewedBy).toBe(doctorUser.id);
      expect(response.body.data.reviewNotes).toBe(reviewData.notes);

      // Verify in database
      const updatedDiagnosis = await prisma.aiDiagnosis.findUnique({
        where: { id: testDiagnosis.id }
      });
      
      expect(updatedDiagnosis.status).toBe('CONFIRMED');
      expect(updatedDiagnosis.reviewedBy).toBe(doctorUser.id);
    });

    it('should prevent patient from reviewing diagnosis', async () => {
      const reviewData = {
        status: 'CONFIRMED',
        notes: 'Trying to review own diagnosis'
      };

      await request(app)
        .patch(`/api/ai-diagnosis/${testDiagnosis.id}/review`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(403);
    });
  });
});
```

## End-to-End Testing

### E2E Testing Setup with Detox

#### Detox Configuration
```javascript
// DentalizationApp/.detoxrc.js
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/jest.config.js',
  configurations: {
    'ios.sim.debug': {
      device: {
        type: 'ios.simulator',
        device: {
          type: 'iPhone 14'
        }
      },
      app: {
        type: 'ios.app',
        binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/DentalizationApp.app',
        build: 'xcodebuild -workspace ios/DentalizationApp.xcworkspace -scheme DentalizationApp -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
      }
    },
    'android.emu.debug': {
      device: {
        type: 'android.emulator',
        device: {
          avdName: 'Pixel_4_API_30'
        }
      },
      app: {
        type: 'android.apk',
        binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
        build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug'
      }
    }
  }
};
```

#### E2E Test Examples
```javascript
// DentalizationApp/e2e/auth.e2e.js
const { device, expect, element, by, waitFor } = require('detox');

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete registration flow', async () => {
    // Navigate to registration
    await element(by.id('register-button')).tap();
    
    // Fill registration form
    await element(by.id('email-input')).typeText('newuser@example.com');
    await element(by.id('password-input')).typeText('ValidPass123!');
    await element(by.id('confirm-password-input')).typeText('ValidPass123!');
    await element(by.id('first-name-input')).typeText('John');
    await element(by.id('last-name-input')).typeText('Doe');
    
    // Select role
    await element(by.id('role-patient')).tap();
    
    // Submit registration
    await element(by.id('submit-registration')).tap();
    
    // Wait for success and navigation
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Verify user is logged in
    await expect(element(by.text('Welcome, John!'))).toBeVisible();
  });

  it('should complete login flow', async () => {
    // Navigate to login
    await element(by.id('login-button')).tap();
    
    // Fill login form
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('ValidPass123!');
    
    // Submit login
    await element(by.id('submit-login')).tap();
    
    // Wait for dashboard
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle login errors', async () => {
    await element(by.id('login-button')).tap();
    
    // Enter invalid credentials
    await element(by.id('email-input')).typeText('invalid@example.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    
    await element(by.id('submit-login')).tap();
    
    // Verify error message
    await waitFor(element(by.text('Invalid email or password')))
      .toBeVisible()
      .withTimeout(3000);
  });
});
```

```javascript
// DentalizationApp/e2e/aiDiagnosis.e2e.js
const { device, expect, element, by, waitFor } = require('detox');

describe('AI Diagnosis Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    
    // Login first
    await element(by.id('login-button')).tap();
    await element(by.id('email-input')).typeText('patient@example.com');
    await element(by.id('password-input')).typeText('ValidPass123!');
    await element(by.id('submit-login')).tap();
    
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should complete AI diagnosis flow', async () => {
    // Navigate to AI diagnosis
    await element(by.id('ai-diagnosis-tab')).tap();
    
    // Start new diagnosis
    await element(by.id('new-diagnosis-button')).tap();
    
    // Take photo (mock camera)
    await element(by.id('camera-button')).tap();
    await element(by.id('take-photo')).tap();
    await element(by.id('use-photo')).tap();
    
    // Wait for analysis
    await waitFor(element(by.id('analysis-result')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Verify result is displayed
    await expect(element(by.id('diagnosis-text'))).toBeVisible();
    await expect(element(by.id('confidence-score'))).toBeVisible();
    
    // Save diagnosis
    await element(by.id('save-diagnosis')).tap();
    
    // Verify navigation to history
    await waitFor(element(by.id('diagnosis-history')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should display diagnosis history', async () => {
    await element(by.id('ai-diagnosis-tab')).tap();
    await element(by.id('history-tab')).tap();
    
    // Verify history list
    await expect(element(by.id('diagnosis-history-list'))).toBeVisible();
    
    // Tap on first diagnosis
    await element(by.id('diagnosis-item-0')).tap();
    
    // Verify detail view
    await expect(element(by.id('diagnosis-detail'))).toBeVisible();
    await expect(element(by.id('diagnosis-image'))).toBeVisible();
    await expect(element(by.id('diagnosis-info'))).toBeVisible();
  });
});
```

## Performance Testing

### Load Testing with Artillery

#### Artillery Configuration
```yaml
# backend-api/artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up load"
    - duration: 300
      arrivalRate: 100
      name: "Sustained load"
  payload:
    path: "./test-data.csv"
    fields:
      - "email"
      - "password"
  processor: "./artillery-processor.js"

scenarios:
  - name: "Authentication Flow"
    weight: 30
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ email }}"
            password: "{{ password }}"
          capture:
            - json: "$.data.token"
              as: "authToken"
      - get:
          url: "/api/users/profile"
          headers:
            Authorization: "Bearer {{ authToken }}"

  - name: "AI Diagnosis Flow"
    weight: 50
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ email }}"
            password: "{{ password }}"
          capture:
            - json: "$.data.token"
              as: "authToken"
      - post:
          url: "/api/ai-diagnosis/analyze"
          headers:
            Authorization: "Bearer {{ authToken }}"
          beforeRequest: "uploadTestImage"
      - get:
          url: "/api/ai-diagnosis/history"
          headers:
            Authorization: "Bearer {{ authToken }}"

  - name: "Data Retrieval"
    weight: 20
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ email }}"
            password: "{{ password }}"
          capture:
            - json: "$.data.token"
              as: "authToken"
      - get:
          url: "/api/users/profile"
          headers:
            Authorization: "Bearer {{ authToken }}"
      - get:
          url: "/api/ai-diagnosis/history?page=1&limit=10"
          headers:
            Authorization: "Bearer {{ authToken }}"
```

#### Performance Test Processor
```javascript
// backend-api/artillery-processor.js
const fs = require('fs');
const path = require('path');

module.exports = {
  uploadTestImage: uploadTestImage,
  generateTestData: generateTestData
};

function uploadTestImage(requestParams, context, ee, next) {
  // Load test image
  const imagePath = path.join(__dirname, 'test-fixtures', 'test-image.jpg');
  const imageBuffer = fs.readFileSync(imagePath);
  
  // Set up multipart form data
  requestParams.formData = {
    photo: {
      value: imageBuffer,
      options: {
        filename: 'test-image.jpg',
        contentType: 'image/jpeg'
      }
    }
  };
  
  return next();
}

function generateTestData(userContext, events, done) {
  // Generate test user data
  userContext.vars.testUserId = Math.floor(Math.random() * 1000) + 1;
  userContext.vars.timestamp = Date.now();
  
  return done();
}
```

### Frontend Performance Testing

#### React Native Performance Tests
```javascript
// DentalizationApp/src/__tests__/performance/listPerformance.test.js
import React from 'react';
import { render } from '@testing-library/react-native';
import { FlatList } from 'react-native';
import DiagnosisHistoryList from '../../components/DiagnosisHistoryList';

// Mock large dataset
const generateMockData = (count) => {
  return Array(count).fill().map((_, index) => ({
    id: `diagnosis-${index}`,
    diagnosis: `Test Diagnosis ${index}`,
    confidence: Math.random(),
    createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    status: index % 2 === 0 ? 'CONFIRMED' : 'PENDING'
  }));
};

describe('List Performance Tests', () => {
  it('should render large list efficiently', () => {
    const largeDataset = generateMockData(1000);
    
    const startTime = performance.now();
    
    const { getByTestId } = render(
      <DiagnosisHistoryList data={largeDataset} />
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 100ms
    expect(renderTime).toBeLessThan(100);
    
    // Verify list is rendered
    expect(getByTestId('diagnosis-list')).toBeTruthy();
  });

  it('should handle rapid scrolling without performance issues', async () => {
    const largeDataset = generateMockData(500);
    
    const { getByTestId } = render(
      <DiagnosisHistoryList data={largeDataset} />
    );
    
    const flatList = getByTestId('diagnosis-list');
    
    // Simulate rapid scrolling
    const scrollEvents = Array(10).fill().map((_, index) => ({
      nativeEvent: {
        contentOffset: { y: index * 100 },
        contentSize: { height: largeDataset.length * 80 },
        layoutMeasurement: { height: 600 }
      }
    }));
    
    const startTime = performance.now();
    
    scrollEvents.forEach(event => {
      flatList.props.onScroll(event);
    });
    
    const endTime = performance.now();
    const scrollTime = endTime - startTime;
    
    // Scroll handling should be fast
    expect(scrollTime).toBeLessThan(50);
  });
});
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: dentalization_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: backend-api/package-lock.json
    
    - name: Install dependencies
      working-directory: backend-api
      run: npm ci
    
    - name: Setup test database
      working-directory: backend-api
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/dentalization_test
      run: |
        npx prisma generate
        npx prisma db push --force-reset
    
    - name: Run unit tests
      working-directory: backend-api
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/dentalization_test
        JWT_SECRET: test-secret
        ENCRYPTION_KEY: 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
      run: npm test -- --coverage
    
    - name: Run integration tests
      working-directory: backend-api
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/dentalization_test
        JWT_SECRET: test-secret
        ENCRYPTION_KEY: 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
      run: npm run test:integration
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        directory: backend-api/coverage
        flags: backend

  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: DentalizationApp/package-lock.json
    
    - name: Install dependencies
      working-directory: DentalizationApp
      run: npm ci
    
    - name: Run tests
      working-directory: DentalizationApp
      run: npm test -- --coverage --watchAll=false
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        directory: DentalizationApp/coverage
        flags: frontend

  e2e-tests:
    runs-on: macos-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: DentalizationApp/package-lock.json
    
    - name: Install dependencies
      working-directory: DentalizationApp
      run: npm ci
    
    - name: Setup iOS Simulator
      run: |
        xcrun simctl create "iPhone 14" "iPhone 14" "iOS16.0"
        xcrun simctl boot "iPhone 14"
    
    - name: Build iOS app
      working-directory: DentalizationApp
      run: |
        npx detox build --configuration ios.sim.debug
    
    - name: Run E2E tests
      working-directory: DentalizationApp
      run: npx detox test --configuration ios.sim.debug --cleanup

  performance-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: backend-api/package-lock.json
    
    - name: Install dependencies
      working-directory: backend-api
      run: npm ci
    
    - name: Start application
      working-directory: backend-api
      run: |
        npm start &
        sleep 30
    
    - name: Run performance tests
      working-directory: backend-api
      run: npx artillery run artillery.yml
```

## Test Data Management

### Test Fixtures
```javascript
// backend-api/src/__tests__/fixtures/testData.js
const bcrypt = require('bcryptjs');

class TestDataFactory {
  static async createUser(overrides = {}) {
    const defaultUser = {
      email: 'test@example.com',
      password: await bcrypt.hash('ValidPass123!', 12),
      role: 'PATIENT',
      firstName: 'Test',
      lastName: 'User',
      status: 'ACTIVE'
    };
    
    return { ...defaultUser, ...overrides };
  }
  
  static createDiagnosis(overrides = {}) {
    const defaultDiagnosis = {
      diagnosis: 'Dental Caries',
      confidence: 0.85,
      status: 'PENDING',
      recommendations: ['Visit dentist for treatment'],
      severity: 'MODERATE'
    };
    
    return { ...defaultDiagnosis, ...overrides };
  }
  
  static createPatientProfile(overrides = {}) {
    const defaultProfile = {
      dateOfBirth: new Date('1990-01-01'),
      phone: '+1234567890',
      address: '123 Test Street',
      emergencyContact: '+1234567891',
      allergies: 'None',
      medications: 'None'
    };
    
    return { ...defaultProfile, ...overrides };
  }
  
  static createDoctorProfile(overrides = {}) {
    const defaultProfile = {
      specialization: 'General Dentistry',
      licenseNumber: 'DDS123456',
      phone: '+1234567892',
      experience: 5,
      education: 'DDS from University'
    };
    
    return { ...defaultProfile, ...overrides };
  }
}

module.exports = TestDataFactory;
```

### Database Seeding
```javascript
// backend-api/src/__tests__/helpers/dbSeeder.js
const { PrismaClient } = require('@prisma/client');
const TestDataFactory = require('../fixtures/testData');

const prisma = new PrismaClient();

class DatabaseSeeder {
  static async seedTestData() {
    // Create test users
    const patientUser = await prisma.user.create({
      data: await TestDataFactory.createUser({
        email: 'patient@example.com',
        role: 'PATIENT'
      })
    });
    
    const doctorUser = await prisma.user.create({
      data: await TestDataFactory.createUser({
        email: 'doctor@example.com',
        role: 'DOCTOR'
      })
    });
    
    // Create profiles
    await prisma.patientProfile.create({
      data: {
        ...TestDataFactory.createPatientProfile(),
        userId: patientUser.id
      }
    });
    
    await prisma.doctorProfile.create({
      data: {
        ...TestDataFactory.createDoctorProfile(),
        userId: doctorUser.id
      }
    });
    
    // Create test diagnoses
    const diagnoses = [
      TestDataFactory.createDiagnosis({ status: 'CONFIRMED' }),
      TestDataFactory.createDiagnosis({ status: 'PENDING' }),
      TestDataFactory.createDiagnosis({ status: 'REJECTED' })
    ];
    
    for (const diagnosis of diagnoses) {
      await prisma.aiDiagnosis.create({
        data: {
          ...diagnosis,
          userId: patientUser.id
        }
      });
    }
    
    return {
      patientUser,
      doctorUser
    };
  }
  
  static async cleanDatabase() {
    const tablenames = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;
    
    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
      }
    }
  }
}

module.exports = DatabaseSeeder;
```

## Test Coverage & Quality

### Coverage Configuration
```javascript
// backend-api/jest.coverage.config.js
module.exports = {
  ...require('./jest.config.js'),
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/controllers/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/__tests__/',
    '/test-fixtures/',
    'setupTests.js'
  ]
};
```

### Quality Gates
```javascript
// scripts/quality-gate.js
const fs = require('fs');
const path = require('path');

class QualityGate {
  static checkCoverage() {
    const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');
    
    if (!fs.existsSync(coveragePath)) {
      console.error('Coverage report not found');
      process.exit(1);
    }
    
    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const { total } = coverage;
    
    const thresholds = {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    };
    
    let passed = true;
    
    Object.entries(thresholds).forEach(([metric, threshold]) => {
      const actual = total[metric].pct;
      if (actual < threshold) {
        console.error(`❌ ${metric} coverage ${actual}% is below threshold ${threshold}%`);
        passed = false;
      } else {
        console.log(`✅ ${metric} coverage ${actual}% meets threshold ${threshold}%`);
      }
    });
    
    if (!passed) {
      console.error('\n❌ Quality gate failed: Coverage thresholds not met');
      process.exit(1);
    }
    
    console.log('\n✅ Quality gate passed: All coverage thresholds met');
  }
  
  static checkTestResults() {
    const testResultsPath = path.join(__dirname, '../test-results.json');
    
    if (!fs.existsSync(testResultsPath)) {
      console.error('Test results not found');
      process.exit(1);
    }
    
    const results = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
    
    if (results.numFailedTests > 0) {
      console.error(`❌ ${results.numFailedTests} tests failed`);
      process.exit(1);
    }
    
    if (results.numPassedTests === 0) {
      console.error('❌ No tests passed');
      process.exit(1);
    }
    
    console.log(`✅ All ${results.numPassedTests} tests passed`);
  }
}

if (require.main === module) {
  QualityGate.checkCoverage();
  QualityGate.checkTestResults();
}

module.exports = QualityGate;
```

## Testing Best Practices

### 1. Test Organization
- **Arrange-Act-Assert (AAA)**: Structure tests clearly
- **Single Responsibility**: One test per behavior
- **Descriptive Names**: Clear test descriptions
- **Test Independence**: Tests should not depend on each other

### 2. Mock Strategy
- **External Dependencies**: Always mock external APIs
- **Database**: Use test database, not mocks for integration tests
- **Time**: Mock Date.now() for consistent tests
- **File System**: Mock file operations

### 3. Data Management
- **Test Fixtures**: Use factories for test data
- **Database Cleanup**: Clean state between tests
- **Isolation**: Each test should have isolated data
- **Realistic Data**: Use realistic test data

### 4. Performance Considerations
- **Parallel Execution**: Run tests in parallel when possible
- **Test Timeouts**: Set appropriate timeouts
- **Resource Cleanup**: Clean up resources after tests
- **Selective Testing**: Run only relevant tests during development

### 5. Maintenance
- **Regular Updates**: Keep tests updated with code changes
- **Refactoring**: Refactor tests when refactoring code
- **Documentation**: Document complex test scenarios
- **Review**: Include tests in code reviews

Dokumentasi ini memberikan panduan komprehensif untuk implementasi testing strategy yang robust dalam Dentalization App, mencakup semua level testing dari unit hingga end-to-end, serta best practices untuk maintainability dan quality assurance.