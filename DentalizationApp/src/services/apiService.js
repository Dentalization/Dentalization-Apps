import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS } from '../constants/api';
import { AUTH_STORAGE_KEYS } from '../constants/auth';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        
        // Add auth token to requests
        const token = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`🔐 Added auth token to request`);
        } else {
          console.warn(`⚠️ No auth token found for request`);
        }
        
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.baseURL}${response.config.url}`);
        return response;
      },
      (error) => {
        if (error.response) {
          console.error(`❌ API Response Error: ${error.response.status} ${error.config?.baseURL}${error.config?.url}`);
        } else if (error.request) {
          console.error(`❌ API Request Failed: No response received from ${error.config?.baseURL}${error.config?.url}`);
          console.error('Error details:', error.message);
        } else {
          console.error(`❌ API Error: ${error.message}`);
        }
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status || 0,
      };
    }
  }

  // Doctor dashboard data
  async getDoctorDashboard() {
    try {
      const response = await this.client.get(API_ENDPOINTS.DOCTORS.DASHBOARD);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  // Get doctor patients
  async getDoctorPatients() {
    try {
      const response = await this.client.get(API_ENDPOINTS.DOCTORS.PATIENTS);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  // Generic GET request
  async get(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status || 0,
      };
    }
  }

  // Generic POST request
  async post(endpoint, data = {}) {
    try {
      const response = await this.client.post(endpoint, data);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status || 0,
      };
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
