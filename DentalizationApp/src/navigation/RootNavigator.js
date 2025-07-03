import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';

import AuthNavigator from './AuthNavigator';
import PatientNavigator from './PatientNavigator';
import DoctorNavigator from './DoctorNavigator';
import LoadingScreen from '../screens/shared/LoadingScreen';
import PatientProfileSetupScreen from '../screens/patient/profile/PatientProfileSetupScreen';
import DoctorProfileSetupScreen from '../screens/doctor/profile/DoctorProfileSetupScreen';

import { checkAuthStatus, setBiometricAvailable } from '../store/slices/authSlice';
import biometricService from '../services/biometricService';
import { USER_ROLES } from '../constants/roles';

const Stack = createStackNavigator();

const RootNavigator = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, isInitializing } = useSelector(state => state.auth);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check auth status
      await dispatch(checkAuthStatus()).unwrap();
      
      // Biometrics disabled in development mode
      dispatch(setBiometricAvailable(false));
    } catch (error) {
      console.log('App initialization error:', error);
    }
  };

  // Show loading screen during initialization
  if (isInitializing || isLoading) {
    return <LoadingScreen />;
  }

  // This component should start with a capital letter as per React convention
  const MainNavigator = () => {
    if (!isAuthenticated || !user) {
      return <AuthNavigator />;
    }

    // Check if profile setup is complete
    const needsProfileSetup = !user.profileComplete;

    if (needsProfileSetup) {
      // Route to appropriate profile setup based on user role
      switch (user.role) {
        case USER_ROLES.PATIENT:
          return <PatientProfileSetupScreen />;
        case USER_ROLES.DOCTOR:
          return <DoctorProfileSetupScreen />;
        default:
          return <AuthNavigator />;
      }
    }

    // Route to appropriate interface based on user role
    switch (user.role) {
      case USER_ROLES.PATIENT:
        return <PatientNavigator />;
      case USER_ROLES.DOCTOR:
        return <DoctorNavigator />;
      default:
        // If user has an invalid role, send them back to auth
        return <AuthNavigator />;
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
