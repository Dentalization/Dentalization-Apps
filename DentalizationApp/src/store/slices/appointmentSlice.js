import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appointments: [],
  upcomingAppointments: [],
  isLoading: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAppointments: (state, action) => {
      state.appointments = action.payload;
    },
    addAppointment: (state, action) => {
      state.appointments.push(action.payload);
    },
    updateAppointment: (state, action) => {
      const index = state.appointments.findIndex(
        app => app.id === action.payload.id
      );
      if (index !== -1) {
        state.appointments[index] = { ...state.appointments[index], ...action.payload };
      }
    },
    removeAppointment: (state, action) => {
      state.appointments = state.appointments.filter(
        app => app.id !== action.payload
      );
    },
    setUpcomingAppointments: (state, action) => {
      state.upcomingAppointments = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setAppointments,
  addAppointment,
  updateAppointment,
  removeAppointment,
  setUpcomingAppointments,
  setLoading,
  setError,
  clearError,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;
