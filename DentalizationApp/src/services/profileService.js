import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_ENDPOINTS } from '../constants/api';
import { AUTH_STORAGE_KEYS } from '../constants/auth';

class ProfileService {
  constructor() {
    this.baseURL = __DEV__ 
      ? 'http://192.168.0.155:3001' 
      : 'https://api.dentalization.com';
  }

  async getAuthHeaders() {
    const token = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    console.log('🔑 ProfileService: Retrieved token:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async setupPatientProfile(profileData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.PROFILE.PATIENT}`, {
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

  async uploadProfilePhoto(imageUri, userId, base64Data = null) {
    try {
      console.log('📸 ProfileService: Starting photo upload process...');
      
      // Validate URI or base64
      if (!imageUri || typeof imageUri !== 'string') {
        throw new Error('Invalid image URI provided');
      }
      
      // Check if URI is properly formatted
      const isValidUri = imageUri.startsWith('file://') || imageUri.startsWith('content://') || imageUri.startsWith('ph://');
      if (!isValidUri) {
        console.warn('📸 ProfileService: URI may not be properly formatted:', imageUri);
        
        // If URI is invalid and we have base64 data, use it instead
        if (base64Data) {
          console.log('📸 ProfileService: Using base64 data as fallback for invalid URI');
          return await this.uploadProfilePhotoBase64(base64Data, userId);
        }
      }
      
      const headers = await this.getAuthHeaders();
      delete headers['Content-Type']; // Let FormData set the boundary
      
      console.log('📸 ProfileService: Auth headers prepared');

      const formData = new FormData();
      
      // Use simple file object format for better Expo compatibility
      console.log('📸 ProfileService: Creating file object for upload');
      const fileObject = {
        uri: imageUri,
        type: 'image/jpeg',
        name: `profile_${userId}_${Date.now()}.jpg`,
      };
      
      console.log('📸 ProfileService: Original URI:', imageUri);
      console.log('📸 ProfileService: Platform:', Platform.OS);
      console.log('📸 ProfileService: File object type:', fileObject.uri.substring(0, 20) + '...');
      
      formData.append('photo', fileObject);
      formData.append('userId', userId);

      console.log('📸 ProfileService: Uploading profile photo for user:', userId);
      console.log('📸 ProfileService: Image URI:', imageUri);
      console.log('📸 ProfileService: File object:', fileObject);
      console.log('📸 ProfileService: Endpoint:', `${this.baseURL}${API_ENDPOINTS.PROFILE.UPLOAD_PHOTO}`);

      // Remove all headers for FormData to work properly with Expo
      const cleanHeaders = await this.getAuthHeaders();
      delete cleanHeaders['Content-Type'];
      delete cleanHeaders['Accept'];
      
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.PROFILE.UPLOAD_PHOTO}`, {
        method: 'POST',
        headers: {
          'Authorization': cleanHeaders['Authorization']
        },
        body: formData,
      });

      console.log('📸 ProfileService: Response status:', response.status);
      console.log('📸 ProfileService: Response headers:', response.headers);
      
      const responseText = await response.text();
      console.log('📸 ProfileService: Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ ProfileService: Failed to parse response as JSON:', parseError);
        return {
          success: false,
          message: 'Invalid response format from server',
        };
      }
      
      if (!response.ok) {
        console.error('❌ ProfileService: Upload failed with status:', response.status);
        return {
          success: false,
          message: data.message || 'Upload failed',
        };
      }
      
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('❌ ProfileService: Error uploading photo:', error);
      
      // If URI parsing error and we have base64 data, try base64 upload
      if (error.message && error.message.includes('URI parsing error') && base64Data) {
        console.log('📸 ProfileService: URI parsing failed, trying base64 upload...');
        return await this.uploadProfilePhotoBase64(base64Data, userId);
      }
      
      return {
        success: false,
        message: error.message || 'Failed to upload photo',
      };
    }
  }
  
  async uploadProfilePhotoBase64(base64Data, userId) {
    try {
      console.log('📸 ProfileService: Starting base64 photo upload...');
      
      if (!base64Data || typeof base64Data !== 'string') {
        throw new Error('Invalid base64 data provided');
      }
      
      const headers = await this.getAuthHeaders();
      
      const payload = {
        photo: `data:image/jpeg;base64,${base64Data}`,
        userId: userId,
      };
      
      console.log('📸 ProfileService: Uploading base64 photo for user:', userId);
      console.log('📸 ProfileService: Base64 data length:', base64Data.length);
      
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.PROFILE.UPLOAD_PHOTO}`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('📸 ProfileService: Base64 upload response status:', response.status);
      
      const responseText = await response.text();
      console.log('📸 ProfileService: Base64 upload raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ ProfileService: Failed to parse base64 response as JSON:', parseError);
        return {
          success: false,
          message: 'Invalid response format from server',
        };
      }
      
      console.log('📸 ProfileService: Parsed base64 response data:', data);
       
       if (!response.ok) {
         console.error('❌ ProfileService: Base64 upload failed with status:', response.status);
         return {
           success: false,
           message: data.message || 'Base64 upload failed',
         };
       }
       
       return {
         success: true,
         data: data,
       };
     } catch (error) {
       console.error('❌ ProfileService: Error uploading base64 photo:', error);
       return {
         success: false,
         message: error.message || 'Failed to upload base64 photo',
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
      
      const response = await fetch(`${this.baseURL}/api/profile`, {
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
      
      const response = await fetch(`${this.baseURL}/api/profile`, {
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
