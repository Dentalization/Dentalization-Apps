import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_STORAGE_KEYS } from '../constants/auth';

class AppointmentService {
  constructor() {
    this.baseURL = __DEV__ 
      ? 'http://127.0.0.1:3001/api' 
      : 'https://api.dentalization.com/api';
  }

  async getAuthHeaders() {
    const token = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }
  async getDoctors(filters = {}) {
    try {
      const headers = await this.getAuthHeaders();
      const queryParams = new URLSearchParams(filters).toString();
      
      const response = await fetch(`${this.baseURL}/appointments/doctors?${queryParams}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      return response.ok ? { success: true, data } : { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.message || 'Network error' };
    }
  }

  async getDoctorAvailability(doctorId, date) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/appointments/doctors/${doctorId}/availability?date=${date}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      return response.ok ? { success: true, data } : { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.message || 'Network error' };
    }
  }

  async createAppointment(appointmentData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/appointments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(appointmentData),
      });

      const data = await response.json();
      return response.ok ? { success: true, data } : { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.message || 'Network error' };
    }
  }

  async getMyAppointments(status = 'all') {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/appointments/my?status=${status}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      return response.ok ? { success: true, data } : { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.message || 'Network error' };
    }
  }

  async cancelAppointment(appointmentId, reason) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/appointments/${appointmentId}/cancel`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();
      return response.ok ? { success: true, data } : { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.message || 'Network error' };
    }
  }

  async rescheduleAppointment(appointmentId, newDate, newTime) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/appointments/${appointmentId}/reschedule`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ date: newDate, time: newTime }),
      });

      const data = await response.json();
      return response.ok ? { success: true, data } : { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.message || 'Network error' };
    }
  }

  async getServices() {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/appointments/services`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      return response.ok ? { success: true, data } : { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.message || 'Network error' };
    }
  }
}

export default new AppointmentService();
