import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';

import AuthNavigator from './AuthNavigator';
import PatientNavigator from './PatientNavigator';
import DoctorNavigator from './DoctorNavigator';
import LoadingScreen from '../screens/shared/LoadingScreen';

import { checkAuthStatus, setBiometricAvailable } from '../store/slices/authSlice';
import BiometricService from '../services/biometricService';
import { USER_ROLES } from '../../shared/constants';

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
      
      // Initialize biometric authentication
      const biometricService = new BiometricService();
      const biometricType = await biometricService.getBiometricType();
      dispatch(setBiometricAvailable(!!biometricType));
    } catch (error) {
      console.log('App initialization error:', error);
    }
  };

  // Show loading screen during initialization
  if (isInitializing || isLoading) {
    return <LoadingScreen />;
  }

  const renderMainNavigator = () => {
    if (!isAuthenticated || !user) {
      return <AuthNavigator />;
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
        <Stack.Screen name="Main" component={renderMainNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
