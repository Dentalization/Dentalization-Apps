import { API_CONFIG } from '../constants/api';
import { AUTH_STORAGE_KEYS } from '../constants/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from './authService';

class AiDiagnosisHistoryService {
  async getAuthHeaders() {
    let token = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    
    // If no token, try to refresh
    if (!token) {
      const refreshToken = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        const refreshResult = await authService.refreshAccessToken(refreshToken);
        if (refreshResult.success) {
          token = refreshResult.data.token;
        }
      }
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Save AI diagnosis result to history
  async saveDiagnosis(diagnosisData) {
    try {
      const headers = await this.getAuthHeaders();
      
      // Check if we have a valid token
      if (!headers.Authorization || headers.Authorization === 'Bearer null') {
        throw new Error('Authentication required. Please login again.');
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/ai-diagnosis`, {
        method: 'POST',
        headers,
        body: JSON.stringify(diagnosisData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Handle authentication errors specifically
        if (response.status === 401) {
          throw new Error('Authentication expired. Please login again.');
        }
        throw new Error(data.message || 'Failed to save diagnosis');
      }

      return data;
    } catch (error) {
      console.error('Save diagnosis error:', error);
      throw error;
    }
  }

  // Get AI diagnosis history for a specific patient (for doctors)
  async getDiagnosisHistory(patientId, page = 1, limit = 10) {
    try {
      const headers = await this.getAuthHeaders();
      
      if (!headers.Authorization || headers.Authorization === 'Bearer null') {
        throw new Error('Authentication required. Please login again.');
      }
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/ai-diagnosis/history/${patientId}?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers,
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired. Please login again.');
        }
        throw new Error(data.message || 'Failed to get diagnosis history');
      }

      return data;
    } catch (error) {
      console.error('Get diagnosis history error:', error);
      throw error;
    }
  }

  // Get AI diagnosis history for current user (for patients)
  async getMyDiagnosisHistory(page = 1, limit = 10) {
    try {
      const headers = await this.getAuthHeaders();
      
      if (!headers.Authorization || headers.Authorization === 'Bearer null') {
        throw new Error('Authentication required. Please login again.');
      }
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/ai-diagnosis/my-history?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers,
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired. Please login again.');
        }
        throw new Error(data.message || 'Failed to get diagnosis history');
      }

      return data;
    } catch (error) {
      console.error('Get my diagnosis history error:', error);
      throw error;
    }
  }

  // Get specific AI diagnosis by ID
  async getDiagnosisById(diagnosisId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/ai-diagnosis/${diagnosisId}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get diagnosis');
      }

      return data;
    } catch (error) {
      console.error('Get diagnosis by ID error:', error);
      throw error;
    }
  }

  // Delete AI diagnosis
  async deleteDiagnosis(diagnosisId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/ai-diagnosis/${diagnosisId}`, {
        method: 'DELETE',
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete diagnosis');
      }

      return data;
    } catch (error) {
      console.error('Delete diagnosis error:', error);
      throw error;
    }
  }

  // Get diagnosis statistics
  async getDiagnosisStats(patientId = null) {
    try {
      const headers = await this.getAuthHeaders();
      const url = patientId 
        ? `${API_CONFIG.BASE_URL}/api/ai-diagnosis/stats?patientId=${patientId}`
        : `${API_CONFIG.BASE_URL}/api/ai-diagnosis/stats`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get diagnosis statistics');
      }

      return data;
    } catch (error) {
      console.error('Get diagnosis stats error:', error);
      throw error;
    }
  }

  // Format diagnosis data for saving
  formatDiagnosisForSaving(analysisResult, imageUri, patientId = null) {
    return {
      patientId,
      imageUrl: imageUri,
      detectionResult: analysisResult.detection_result,
      reasoningResult: analysisResult.reasoning_result,
      reportUrl: analysisResult.report_url,
      requestId: analysisResult.request_id,
      aiServerResponse: analysisResult
    };
  }
}

export default new AiDiagnosisHistoryService();