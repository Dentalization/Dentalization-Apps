import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class AIAgentService {
  constructor() {
    // Base URL for AI Agent API
    this.baseURL = 'https://api.dentalization.id/api/v1';
    this.sessionId = null;
    this.currentImageId = null;
  }

  /**
   * Health check for AI Agent service
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        return {
          success: true,
          data: {
            status: data.status,
            message: data.message,
            timestamp: data.timestamp,
            service: data.service,
            version: data.version,
            uptime: data.uptime,
            dependencies: data.dependencies
          }
        };
      } else {
        return {
          success: false,
          error: data.message || 'Health check failed'
        };
      }
    } catch (error) {
      // Server AI Agent offline - tidak perlu menampilkan error
      return {
        success: false,
        error: 'Failed to connect to AI Agent service'
      };
    }
  }

  /**
   * Alias for healthCheck - for consistency
   */
  async checkHealth() {
    return await this.healthCheck();
  }

  /**
   * Create a new session
   */
  async createSession() {
    try {
      const response = await fetch(`${this.baseURL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        this.sessionId = data.session.id;
        // Store session ID in AsyncStorage for persistence
        await AsyncStorage.setItem('ai_agent_session_id', this.sessionId);
        
        return {
          success: true,
          data: {
            sessionId: data.session.id,
            createdAt: data.created_at,
            expiresAt: data.expires_at
          }
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to create session'
        };
      }
    } catch (error) {
      console.error('Create session error:', error);
      return {
        success: false,
        error: 'Failed to create session'
      };
    }
  }

  /**
   * Get session details
   */
  async getSessionDetails(sessionId = null) {
    try {
      const targetSessionId = sessionId || this.sessionId || await AsyncStorage.getItem('ai_agent_session_id');
      
      if (!targetSessionId) {
        return {
          success: false,
          error: 'No session ID available'
        };
      }

      const response = await fetch(`${this.baseURL}/sessions/${targetSessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        return {
          success: true,
          data: {
            messagesCount: data.messages_count,
            lastActivity: data.last_activity
          }
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to get session details'
        };
      }
    } catch (error) {
      console.error('Get session details error:', error);
      return {
        success: false,
        error: 'Failed to get session details'
      };
    }
  }

  /**
   * Upload image to AI Agent service
   */
  async uploadImage(imageUri) {
    try {
      const formData = new FormData();
      
      // Handle different platforms
      const imageFile = {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        type: 'image/jpeg',
        name: `dental_image_${Date.now()}.jpg`,
      };
      
      formData.append('file', imageFile);

      const response = await fetch(`${this.baseURL}/images`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        this.currentImageId = data.image.id;
        
        return {
          success: true,
          data: {
            imageId: data.image.id,
            filename: data.image.filename,
            size: data.image.size,
            accessUrl: data.access_url
          }
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to upload image'
        };
      }
    } catch (error) {
      console.error('Upload image error:', error);
      return {
        success: false,
        error: 'Failed to upload image'
      };
    }
  }

  /**
   * Get uploaded image
   */
  async getImage(imageId, format = 'file') {
    try {
      const response = await fetch(`${this.baseURL}/images/${imageId}?format=${format}`, {
        method: 'GET',
      });

      if (response.ok) {
        if (format === 'base64') {
          const data = await response.json();
          return {
            success: true,
            data: data
          };
        } else {
          // Return blob for file format
          const blob = await response.blob();
          return {
            success: true,
            data: blob
          };
        }
      } else {
        return {
          success: false,
          error: 'Failed to get image'
        };
      }
    } catch (error) {
      console.error('Get image error:', error);
      return {
        success: false,
        error: 'Failed to get image'
      };
    }
  }

  /**
   * Chat with AI Agent (text only)
   */
  async chatWithAgent(message, sessionId = null) {
    try {
      const targetSessionId = sessionId || this.sessionId || await AsyncStorage.getItem('ai_agent_session_id');
      
      if (!targetSessionId) {
        // Create new session if none exists
        const sessionResult = await this.createSession();
        if (!sessionResult.success) {
          return sessionResult;
        }
      }

      const response = await fetch(`${this.baseURL}/chat?session_id=${this.sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message
        })
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        return {
          success: true,
          data: {
            assistant_message: data.assistant_message,
            assistantMessage: data.assistant_message?.content || data.assistant_message,
            resources: data.resources || [],
            analysis: data.analysis || null,
            session_id: data.session_id
          }
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to chat with agent'
        };
      }
    } catch (error) {
      console.error('Chat with agent error:', error);
      return {
        success: false,
        error: 'Failed to chat with agent'
      };
    }
  }

  /**
   * Chat with AI Agent (with image)
   */
  async chatWithAgentAndImage(message, imageId = null, sessionId = null) {
    try {
      const targetSessionId = sessionId || this.sessionId || await AsyncStorage.getItem('ai_agent_session_id');
      const targetImageId = imageId || this.currentImageId;
      
      if (!targetSessionId) {
        // Create new session if none exists
        const sessionResult = await this.createSession();
        if (!sessionResult.success) {
          return sessionResult;
        }
      }

      if (!targetImageId) {
        return {
          success: false,
          error: 'No image ID available'
        };
      }

      const response = await fetch(`${this.baseURL}/chat?session_id=${this.sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          image_id: targetImageId
        })
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        return {
          success: true,
          data: {
            assistant_message: data.assistant_message,
            assistantMessage: data.assistant_message?.content || data.assistant_message,
            resources: data.resources || [],
            analysis: data.analysis || null,
            session_id: data.session_id
          }
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to chat with agent'
        };
      }
    } catch (error) {
      console.error('Chat with agent and image error:', error);
      return {
        success: false,
        error: 'Failed to chat with agent'
      };
    }
  }

  /**
   * Get generated visualization/resource
   * @param {string} resourceId - The resource ID to retrieve
   * @param {string} format - Format: 'file', 'base64', or 'url'
   */
  async getVisualization(resourceId, format = 'file') {
    try {
      const response = await fetch(`${this.baseURL}/resources/${resourceId}?format=${format}`, {
        method: 'GET',
      });

      if (response.ok) {
        if (format === 'base64') {
          const data = await response.json();
          return {
            success: true,
            data: data,
            format: 'base64'
          };
        } else if (format === 'url') {
          const data = await response.json();
          return {
            success: true,
            data: data,
            format: 'url'
          };
        } else {
          // Return blob for file format
          const blob = await response.blob();
          return {
            success: true,
            data: blob,
            format: 'file'
          };
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `Failed to get visualization (${response.status})`,
          status: response.status
        };
      }
    } catch (error) {
      console.error('Get visualization error:', error);
      return {
        success: false,
        error: 'Network error: Failed to get visualization'
      };
    }
  }

  /**
   * List all sessions
   */
  async listSessions(page = 1, perPage = 10) {
    try {
      const response = await fetch(`${this.baseURL}/sessions?page=${page}&per_page=${perPage}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data: data
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to list sessions'
        };
      }
    } catch (error) {
      console.error('List sessions error:', error);
      return {
        success: false,
        error: 'Failed to list sessions'
      };
    }
  }

  /**
   * List all images
   */
  async listImages(page = 1, perPage = 10) {
    try {
      const response = await fetch(`${this.baseURL}/images?page=${page}&per_page=${perPage}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data: data
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to list images'
        };
      }
    } catch (error) {
      console.error('List images error:', error);
      return {
        success: false,
        error: 'Failed to list images'
      };
    }
  }

  /**
   * Clear current session
   */
  async clearSession() {
    this.sessionId = null;
    this.currentImageId = null;
    await AsyncStorage.removeItem('ai_agent_session_id');
  }

  /**
   * Get current session ID
   */
  async getCurrentSessionId() {
    if (this.sessionId) {
      return this.sessionId;
    }
    
    const storedSessionId = await AsyncStorage.getItem('ai_agent_session_id');
    if (storedSessionId) {
      this.sessionId = storedSessionId;
      return storedSessionId;
    }
    
    return null;
  }

  /**
   * Get current image ID
   */
  getCurrentImageId() {
    return this.currentImageId;
  }
}

// Export singleton instance
const aiAgentService = new AIAgentService();
export default aiAgentService;