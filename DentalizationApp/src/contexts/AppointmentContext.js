import React, { createContext, useContext, useState, useEffect } from 'react';

const AppointmentContext = createContext();

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState({
    Today: [
      {
        id: '1',
        patientName: 'Sarah Johnson',
        patientImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        time: '09:00 AM',
        date: 'Today',
        treatmentType: 'Dental Cleaning',
        status: 'Waiting',
        duration: '30 min',
        notes: 'Regular checkup and cleaning',
        // Dashboard format compatibility
        patient: 'Sarah Johnson',
        type: 'Cleaning',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
        patientDetails: {
          age: 28,
          phone: '+62 812-3456-7890',
          email: 'sarah.johnson@email.com',
          lastVisit: '3 months ago',
          allergies: ['Penicillin', 'Latex'],
          medicalHistory: ['Hypertension', 'No previous dental surgery'],
          emergencyContact: {
            name: 'John Johnson (Husband)',
            phone: '+62 812-3456-7891'
          },
          insurance: 'BPJS Kesehatan',
          bloodType: 'A+'
        }
      },
      {
        id: '2',
        patientName: 'Michael Chen',
        patientImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        time: '10:30 AM',
        date: 'Today',
        treatmentType: 'Tooth Filling',
        status: 'In Progress',
        duration: '45 min',
        notes: 'Cavity filling on upper molar',
        // Dashboard format compatibility
        patient: 'Michael Chen',
        type: 'Root Canal',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        patientDetails: {
          age: 35,
          phone: '+62 813-4567-8901',
          email: 'michael.chen@email.com',
          lastVisit: '6 months ago',
          allergies: ['None'],
          medicalHistory: ['Diabetes Type 2', 'Previous root canal (2019)'],
          emergencyContact: {
            name: 'Lisa Chen (Wife)',
            phone: '+62 813-4567-8902'
          },
          insurance: 'Prudential',
          bloodType: 'B+'
        }
      },
      {
        id: '3',
        patientName: 'Emma Wilson',
        patientImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        time: '02:00 PM',
        date: 'Today',
        treatmentType: 'Root Canal',
        status: 'Waiting',
        duration: '90 min',
        notes: 'Root canal treatment',
        // Dashboard format compatibility
        patient: 'Emma Wilson',
        type: 'Checkup',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face'
      },
      {
        id: '4',
        patientName: 'David Brown',
        patientImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        time: '03:30 PM',
        date: 'Today',
        treatmentType: 'Consultation',
        status: 'Done',
        duration: '20 min',
        notes: 'Initial consultation completed',
        // Dashboard format compatibility
        patient: 'David Brown',
        type: 'Filling',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face'
      }
    ],
    Upcoming: [
      {
        id: '5',
        patientName: 'Lisa Anderson',
        patientImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        time: '09:00 AM',
        date: 'Tomorrow',
        treatmentType: 'Teeth Whitening',
        status: 'Waiting',
        duration: '60 min',
        notes: 'Professional whitening session',
        // Dashboard format compatibility
        patient: 'Lisa Anderson',
        type: 'Whitening',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face'
      },
      {
        id: '6',
        patientName: 'James Miller',
        patientImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        time: '11:00 AM',
        date: 'Dec 28',
        treatmentType: 'Crown Placement',
        status: 'Waiting',
        duration: '75 min',
        notes: 'Ceramic crown installation',
        // Dashboard format compatibility
        patient: 'James Miller',
        type: 'Crown',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face'
      }
    ],
    Past: [
      {
        id: '7',
        patientName: 'Anna Garcia',
        patientImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
        time: '02:00 PM',
        date: 'Yesterday',
        treatmentType: 'Dental Cleaning',
        status: 'Done',
        duration: '30 min',
        notes: 'Routine cleaning completed',
        // Dashboard format compatibility
        patient: 'Anna Garcia',
        type: 'Cleaning',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=50&h=50&fit=crop&crop=face'
      },
      {
        id: '8',
        patientName: 'Robert Taylor',
        patientImage: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face',
        time: '10:00 AM',
        date: 'Dec 24',
        treatmentType: 'Tooth Extraction',
        status: 'Cancelled',
        duration: '45 min',
        notes: 'Patient cancelled appointment',
        // Dashboard format compatibility
        patient: 'Robert Taylor',
        type: 'Extraction',
        avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=50&h=50&fit=crop&crop=face'
      }
    ]
  });

  // Get today's appointments for dashboard
  const getTodayAppointments = () => {
    return appointments.Today.map(appointment => ({
      id: appointment.id,
      time: appointment.time.replace(' AM', '').replace(' PM', ''),
      patient: appointment.patientName,
      status: appointment.status,
      type: appointment.type || appointment.treatmentType,
      avatar: appointment.avatar || appointment.patientImage
    }));
  };

  // Get appointments by filter (Today, Upcoming, Past)
  const getAppointmentsByFilter = (filter) => {
    return appointments[filter] || [];
  };

  // Update appointment status
  const updateAppointmentStatus = (appointmentId, newStatus) => {
    setAppointments(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(filter => {
        updated[filter] = updated[filter].map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: newStatus }
            : appointment
        );
      });
      return updated;
    });
  };

  // Add new appointment
  const addAppointment = (appointment, filter = 'Today') => {
    setAppointments(prev => ({
      ...prev,
      [filter]: [...prev[filter], appointment]
    }));
  };

  // Remove appointment
  const removeAppointment = (appointmentId) => {
    setAppointments(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(filter => {
        updated[filter] = updated[filter].filter(appointment => 
          appointment.id !== appointmentId
        );
      });
      return updated;
    });
  };

  const value = {
    appointments,
    getTodayAppointments,
    getAppointmentsByFilter,
    updateAppointmentStatus,
    addAppointment,
    removeAppointment,
    setAppointments
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

export default AppointmentContext;