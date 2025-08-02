import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../constants/api';
import { AUTH_STORAGE_KEYS } from '../constants/auth';

class ProfileService {
  constructor() {
    this.baseURL = __DEV__ 
      ? 'http://127.0.0.1:3001' 
      : 'https://api.dentalization.com';
  }

  async getAuthHeaders() {
    const token = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
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
      
      console.log('🔄 ProfileService: Sending doctor profile data to:', `${this.baseURL}${API_ENDPOINTS.PROFILE.DOCTOR}`);
      console.log('🔄 ProfileService: Request headers:', headers);
      console.log('🔄 ProfileService: Profile data keys:', Object.keys(profileData));
      console.log('🔍 ProfileService: Checking critical fields:');
      console.log('  - profilePicture:', profileData.profilePicture);
      console.log('  - verificationDocs:', profileData.verificationDocs);
      console.log('  - verificationDocs type:', typeof profileData.verificationDocs);
      console.log('  - verificationDocs length:', profileData.verificationDocs?.length || 0);
      console.log('📤 ProfileService: Full request body:', JSON.stringify(profileData, null, 2));
      
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.PROFILE.DOCTOR}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      
      console.log('📡 ProfileService: Response status:', response.status);
      console.log('📡 ProfileService: Response data:', data);

      if (response.ok) {
        console.log('✅ ProfileService: Doctor profile setup successful');
        return {
          success: true,
          data: data,
        };
      } else {
        console.error('❌ ProfileService: Doctor profile setup failed:', data);
        return {
          success: false,
          message: data.message || 'Profile setup failed',
          errors: data.errors || [],
        };
      }
    } catch (error) {
      console.error('❌ ProfileService: Network error during doctor profile setup:', error);
      return {
        success: false,
        message: error.message || 'Network error',
      };
    }
  }

  async uploadProfilePhoto(imageUri, userId) {
    try {
      const headers = await this.getAuthHeaders();
      delete headers['Content-Type']; // Let FormData set the boundary

      const formData = new FormData();
      formData.append('photo', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `profile_${userId}_${Date.now()}.jpg`,
      });
      formData.append('userId', userId);

      console.log('📸 ProfileService: Uploading profile photo for user:', userId);

      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.PROFILE.UPLOAD_PHOTO}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();
      
      console.log('📸 ProfileService: Photo upload response:', response.status, data);

      if (response.ok) {
        console.log('✅ ProfileService: Profile photo uploaded successfully');
        return {
          success: true,
          data: data,
        };
      } else {
        console.error('❌ ProfileService: Photo upload failed:', data);
        return {
          success: false,
          message: data.message || 'Photo upload failed',
        };
      }
    } catch (error) {
      console.error('❌ ProfileService: Network error during photo upload:', error);
      return {
        success: false,
        message: error.message || 'Network error',
      };
    }
  }

  async uploadDocument(documentUri, documentType, userId) {
    try {
      const headers = await this.getAuthHeaders();
      delete headers['Content-Type']; // Let FormData set the boundary

      const formData = new FormData();
      formData.append('document', {
        uri: documentUri,
        type: 'application/pdf',
        name: `${documentType}_${userId}_${Date.now()}.pdf`,
      });
      formData.append('documentType', documentType);
      formData.append('userId', userId);

      console.log('📄 ProfileService: Uploading document:', { documentType, userId });

      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.PROFILE.UPLOAD_DOCUMENT}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();
      
      console.log('📄 ProfileService: Document upload response:', response.status, data);

      if (response.ok) {
        console.log('✅ ProfileService: Document uploaded successfully');
        return {
          success: true,
          data: data,
        };
      } else {
        console.error('❌ ProfileService: Document upload failed:', data);
        return {
          success: false,
          message: data.message || 'Document upload failed',
        };
      }
    } catch (error) {
      console.error('❌ ProfileService: Network error during document upload:', error);
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
