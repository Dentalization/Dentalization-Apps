const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class AIService {
  constructor() {
    this.baseURL = process.env.AI_SERVICE_URL || 'https://api.dentalization.id';
    this.apiKey = process.env.AI_SERVICE_API_KEY || '';
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Process chat message with AI Agent
   * @param {Object} params - Chat parameters
   * @param {string} params.message - User message
   * @param {string} params.sessionId - Session ID
   * @param {string} [params.imageId] - Optional image ID
   * @returns {Promise<Object>} AI response
   */
  async processChat({ message, sessionId, imageId }) {
    try {
      const requestId = uuidv4();
      const timestamp = new Date().toISOString();

      // Prepare request payload
      const payload = {
        message,
        session_id: sessionId,
        image_id: imageId || null,
        request_id: requestId,
        timestamp,
        context: {
          service: 'dentalization-backend',
          version: '2.0.0'
        }
      };

      // Make request to AI service
      const response = await axios.post(
        `${this.baseURL}/api/v1/chat`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Request-ID': requestId
          },
          timeout: this.timeout
        }
      );

      if (response.data && response.data.status === 'success') {
        return {
          status: 'success',
          assistant_message: {
            content: response.data.message || response.data.assistant_message?.content,
            type: 'text',
            timestamp: new Date().toISOString()
          },
          analysis: response.data.analysis || null,
          resources: response.data.resources || [],
          session_id: sessionId,
          request_id: requestId,
          processing_time: response.data.processing_time || null
        };
      } else {
        throw new Error('Invalid AI service response');
      }
    } catch (error) {
      console.error('AI Service Error:', error.message);
      
      // Return fallback response for development/testing
      return this.getFallbackResponse({ message, sessionId, imageId, error: error.message });
    }
  }

  /**
   * Generate dental analysis for image
   * @param {Object} params - Analysis parameters
   * @param {string} params.imageId - Image ID
   * @param {string} params.analysisType - Type of analysis
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeImage({ imageId, analysisType = 'comprehensive' }) {
    try {
      const requestId = uuidv4();
      
      const payload = {
        image_id: imageId,
        analysis_type: analysisType,
        request_id: requestId,
        timestamp: new Date().toISOString()
      };

      const response = await axios.post(
        `${this.baseURL}/api/v1/ai/analyze`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Request-ID': requestId
          },
          timeout: this.timeout
        }
      );

      return response.data;
    } catch (error) {
      console.error('AI Image Analysis Error:', error.message);
      throw error;
    }
  }

  /**
   * Get fallback response when AI service is unavailable
   * @param {Object} params - Fallback parameters
   * @returns {Object} Fallback response
   */
  getFallbackResponse({ message, sessionId, imageId, error }) {
    const responses = {
      'karies': 'Karies gigi adalah kerusakan pada struktur gigi yang disebabkan oleh bakteri. Untuk mencegahnya, sikat gigi 2x sehari dan hindari makanan manis berlebihan.',
      'sakit gigi': 'Sakit gigi bisa disebabkan oleh karies, infeksi, atau masalah gusi. Sebaiknya segera konsultasi ke dokter gigi untuk pemeriksaan lebih lanjut.',
      'sikat gigi': 'Sikat gigi sebaiknya dilakukan 2 kali sehari, pagi setelah sarapan dan malam sebelum tidur. Gunakan pasta gigi berfluoride dan sikat dengan gerakan memutar.',
      'gigi berlubang': 'Gigi berlubang terjadi karena asam dari bakteri mengikis email gigi. Pencegahan terbaik adalah menjaga kebersihan mulut dan rutin kontrol ke dokter gigi.',
      'default': 'Terima kasih atas pertanyaan Anda tentang kesehatan gigi. Untuk diagnosis yang akurat, saya sarankan berkonsultasi langsung dengan dokter gigi profesional.'
    };

    // Find appropriate response based on message content
    let responseContent = responses.default;
    for (const [key, value] of Object.entries(responses)) {
      if (message.toLowerCase().includes(key)) {
        responseContent = value;
        break;
      }
    }

    return {
      status: 'success',
      assistant_message: {
        content: responseContent,
        type: 'text',
        timestamp: new Date().toISOString(),
        fallback: true
      },
      analysis: imageId ? {
        image_processed: true,
        visualizations_generated: 0,
        confidence: 0.85,
        findings: ['Analisis gambar memerlukan koneksi ke AI service']
      } : null,
      resources: [],
      session_id: sessionId,
      request_id: uuidv4(),
      note: `AI service temporarily unavailable: ${error}`,
      fallback_mode: true
    };
  }

  /**
   * Check AI service health
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/v1/health`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 5000
        }
      );

      return {
        ai_service: true,
        image_processing: response.data.dependencies?.image_processing || false,
        analysis_engine: response.data.dependencies?.analysis_engine || false,
        response_time: response.data.uptime || 0
      };
    } catch (error) {
      return {
        ai_service: false,
        image_processing: false,
        analysis_engine: false,
        error: error.message
      };
    }
  }
}

module.exports = new AIService();