import { API_CONFIG } from '../constants/api';

class AIService {
  constructor() {
    this.baseURL = 'https://development-srv.burro-platy.ts.net:10000'; // Replace with actual deployed server URL
    this.timeout = 60000; // 60 seconds timeout for AI processing
  }

  /**
   * Check AI server health status
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        timeout: 10000,
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        data: data,
        status: response.status
      };
    } catch (error) {
      console.error('❌ AIService: Health check failed:', error);
      return {
        success: false,
        error: error.message || 'AI server not available',
      };
    }
  }

  /**
   * Detect dental conditions from image
   * @param {string} imageUri - Local image URI
   * @param {boolean} generateVisualization - Whether to generate visualization
   */
  async detectConditions(imageUri, generateVisualization = true) {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `dental_detection_${Date.now()}.jpg`,
      });

      const url = `${this.baseURL}/api/detect${generateVisualization ? '?generate_visualization=true' : ''}`;
      
      console.log('🔍 AIService: Starting dental condition detection...');
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        timeout: this.timeout,
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ AIService: Detection completed successfully');
        return {
          success: true,
          data: data,
        };
      } else {
        console.error('❌ AIService: Detection failed:', data);
        return {
          success: false,
          error: data.message || 'Detection failed',
        };
      }
    } catch (error) {
      console.error('❌ AIService: Network error during detection:', error);
      return {
        success: false,
        error: error.message || 'Network error during detection',
      };
    }
  }

  /**
   * Perform comprehensive dental reasoning with AI
   * @param {string} imageUri - Local image URI
   * @param {Object} patientInfo - Patient information object
   * @param {boolean} generateVisualization - Whether to generate visualization
   * @param {boolean} generateReport - Whether to generate detailed report
   */
  async performDentalReasoning(imageUri, patientInfo = null, generateVisualization = true, generateReport = true) {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `dental_reasoning_${Date.now()}.jpg`,
      });

      // Add patient information if provided
      // Comment out patient_info for doctor app - not needed for doctor diagnosis
      // For patient app, this will be provided later
      // if (patientInfo) {
      //   formData.append('patient_info', JSON.stringify(patientInfo));
      // }

      const queryParams = new URLSearchParams();
      if (generateVisualization) queryParams.append('generate_visualization', 'true');
      if (generateReport) queryParams.append('generate_report', 'true');
      
      const url = `${this.baseURL}/api/reason${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      console.log('🧠 AIService: Starting dental reasoning analysis...');
      console.log('🧠 AIService: Patient info:', patientInfo);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        timeout: this.timeout,
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ AIService: Reasoning analysis completed successfully');
        return {
          success: true,
          data: data,
        };
      } else {
        console.error('❌ AIService: Reasoning analysis failed:', data);
        return {
          success: false,
          error: data.message || 'Reasoning analysis failed',
        };
      }
    } catch (error) {
      console.error('❌ AIService: Network error during reasoning:', error);
      return {
        success: false,
        error: error.message || 'Network error during reasoning analysis',
      };
    }
  }

  /**
   * Batch detect conditions from multiple images
   * @param {Array} imageUris - Array of local image URIs
   * @param {boolean} generateVisualization - Whether to generate visualization
   */
  async batchDetectConditions(imageUris, generateVisualization = true) {
    try {
      const formData = new FormData();
      
      imageUris.forEach((imageUri, index) => {
        formData.append('images', {
          uri: imageUri,
          type: 'image/jpeg',
          name: `dental_batch_${index}_${Date.now()}.jpg`,
        });
      });

      const url = `${this.baseURL}/api/batch-detect${generateVisualization ? '?generate_visualization=true' : ''}`;
      
      console.log('📊 AIService: Starting batch detection for', imageUris.length, 'images...');
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        timeout: this.timeout * 2, // Double timeout for batch processing
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ AIService: Batch detection completed successfully');
        return {
          success: true,
          data: data,
        };
      } else {
        console.error('❌ AIService: Batch detection failed:', data);
        return {
          success: false,
          error: data.message || 'Batch detection failed',
        };
      }
    } catch (error) {
      console.error('❌ AIService: Network error during batch detection:', error);
      return {
        success: false,
        error: error.message || 'Network error during batch detection',
      };
    }
  }

  /**
   * Get file from AI server (visualization, report, etc.)
   * @param {string} filePath - File path returned from AI API
   */
  async getFile(filePath) {
    try {
      const url = `${this.baseURL}${filePath}`;
      
      console.log('📁 AIService: Fetching file:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        timeout: 30000,
      });

      if (response.ok) {
        console.log('✅ AIService: File fetched successfully');
        return {
          success: true,
          url: url,
          blob: await response.blob(),
        };
      } else {
        console.error('❌ AIService: File fetch failed:', response.status);
        return {
          success: false,
          error: `File not found: ${response.status}`,
        };
      }
    } catch (error) {
      console.error('❌ AIService: Network error during file fetch:', error);
      return {
        success: false,
        error: error.message || 'Network error during file fetch',
      };
    }
  }

  /**
   * Get full URL for AI server files
   * @param {string} relativePath - Relative path from AI API response
   */
  getFileUrl(relativePath) {
    if (!relativePath) return null;
    return `${this.baseURL}${relativePath}`;
  }

  /**
   * Validate image before sending to AI
   * @param {string} imageUri - Local image URI
   */
  validateImage(imageUri) {
    if (!imageUri) {
      return { valid: false, error: 'Image URI is required' };
    }

    // Check if it's a valid URI format
    if (!imageUri.startsWith('file://') && !imageUri.startsWith('content://')) {
      return { valid: false, error: 'Invalid image URI format' };
    }

    return { valid: true };
  }

  /**
   * Format patient info for AI analysis
   * @param {Object} userProfile - User profile from Redux store
   */
  formatPatientInfo(userProfile) {
    if (!userProfile) return null;

    const calculateAge = (dateOfBirth) => {
      if (!dateOfBirth) return null;
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    };

    return {
      name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'Pasien',
      age: userProfile.dateOfBirth ? calculateAge(userProfile.dateOfBirth) : null,
      gender: userProfile.gender || 'tidak diketahui',
      chief_complaint: userProfile.dentalConcerns || 'Tidak ada keluhan khusus',
      medical_history: userProfile.medicalHistory || userProfile.allergies || 'Tidak ada riwayat medis yang tercatat',
      dental_history: userProfile.dentalHistory || 'Tidak ada riwayat dental yang tercatat',
      medications: userProfile.medications || 'Tidak ada obat yang sedang dikonsumsi',
      allergies: userProfile.allergies || 'Tidak ada alergi yang diketahui'
    };
  }
}

export default new AIService();