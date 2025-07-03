import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../constants/api';

class ApiClient {
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
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
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
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        if (error.response) {
          console.error(`❌ API Response Error: ${error.response.status} ${error.config?.url}`);
        } else if (error.request) {
          console.error(`❌ API Request Failed: No response received`);
          console.error('Error details:', error.message);
          console.error('Request config:', {
            baseURL: error.config?.baseURL,
            url: error.config?.url,
            method: error.config?.method,
          });
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
      console.log(`⚡ Testing API Health at: ${API_CONFIG.BASE_URL}${API_ENDPOINTS.HEALTH}`);
      const response = await this.client.get(API_ENDPOINTS.HEALTH);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error('❌ Health check failed with details:', {
        message: error.message,
        code: error.code,
        baseURL: API_CONFIG.BASE_URL,
        endpoint: API_ENDPOINTS.HEALTH,
      });
      
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
const apiClient = new ApiClient();

export default apiClient;
