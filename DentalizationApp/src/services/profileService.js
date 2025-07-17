import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../constants/api';

class ProfileService {
  constructor() {
    this.baseURL = __DEV__ 
      ? 'http://127.0.0.1:3001/api' 
      : 'https://api.dentalization.com/api';
  }

  async getAuthHeaders() {
    const token = await AsyncStorage.getItem('@dentalization_access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async setupPatientProfile(profileData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/profile/patient`, {
        method: 'POST',
        headers,
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Profile setup failed',
          errors: data.errors || [],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Network error',
      };
    }
  }

  async setupDoctorProfile(profileData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/profile/doctor`, {
        method: 'POST',
        headers,
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Profile setup failed',
          errors: data.errors || [],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Network error',
      };
    }
  }

  async uploadProfilePhoto(imageUri, userId) {
    try {
      console.log('🚀 [API] Uploading profile photo:', { imageUri, userId });
      
      const headers = await this.getAuthHeaders();
      delete headers['Content-Type']; // Let FormData set the content type

      const formData = new FormData();
      formData.append('photo', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `profile_${userId}.jpg`,
      });

      console.log('🚀 [API] POST', `${this.baseURL}/profile/upload-photo`);

      const response = await fetch(`${this.baseURL}/profile/upload-photo`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ [API] POST /profile/upload-photo -', response.status, '\nResponse:', data);
        return {
          success: true,
          data: data,
        };
      } else {
        console.log('❌ [API] POST /profile/upload-photo -', response.status, '\nResponse:', data);
        return {
          success: false,
          message: data.message || 'Photo upload failed',
        };
      }
    } catch (error) {
      console.log('❌ [API] POST /profile/upload-photo - Error:', error);
      return {
        success: false,
        message: error.message || 'Network error',
      };
    }
  }

  async uploadDocument(documentUri, documentType, userId) {
    try {
      const headers = await this.getAuthHeaders();
      delete headers['Content-Type']; // Let FormData set the content type

      const formData = new FormData();
      formData.append('document', {
        uri: documentUri,
        type: 'application/pdf',
        name: `${documentType}_${userId}.pdf`,
      });
      formData.append('documentType', documentType);

      const response = await fetch(`${this.baseURL}/profile/upload-document`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Document upload failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Network error',
      };
    }
  }

  async getProfile() {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/profile`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to fetch profile',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Network error',
      };
    }
  }

  async updateProfile(profileData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Profile update failed',
          errors: data.errors || [],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Network error',
      };
    }
  }
}

export default new ProfileService();
