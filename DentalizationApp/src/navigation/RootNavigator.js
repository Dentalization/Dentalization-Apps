import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';

import AuthNavigator from './AuthNavigator';
import PatientNavigator from './PatientNavigator';
import DoctorNavigator from './DoctorNavigator';
import LoadingScreen from '../screens/shared/LoadingScreen';
import SplashScreen from '../screens/shared/SplashScreen';

import { checkAuthStatus, setBiometricAvailable, setShowLoginPrompt } from '../store/slices/authSlice';
import biometricService from '../services/biometricService';
import { USER_ROLES } from '../constants/roles';

const Stack = createStackNavigator();

const RootNavigator = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, isInitializing, showLoginPrompt } = useSelector(state => state.auth);
  const [showSplash, setShowSplash] = useState(true);

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

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Show loading screen during initialization
  if (isInitializing || isLoading) {
    return <LoadingScreen />;
  }

  // This component should start with a capital letter as per React convention
  const MainNavigator = () => {
    if (!isAuthenticated || !user) {
      return <AuthNavigator />;
    }

    // Ensure we have complete user data before making routing decisions
    if (!user.profile) {
      console.log('WARNING: RootNavigator - No profile data available, loading...');
      return <LoadingScreen />;
    }

    // Always route to dashboard/home page after login
    // Profile setup will be available in the profile section
    console.log('ROUTING: Going to home/dashboard for role:', user.role);
    
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
