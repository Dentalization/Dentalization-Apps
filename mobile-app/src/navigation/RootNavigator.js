import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import AuthNavigator from './AuthNavigator';
import PatientNavigator from './PatientNavigator';
import DoctorNavigator from './DoctorNavigator';
import LoadingScreen from '../screens/shared/LoadingScreen';

import { USER_ROLES } from '../../shared/constants';

const Stack = createStackNavigator();

const RootNavigator = () => {
  const { user, isAuthenticated, isLoading } = useSelector(state => state.auth);

  if (isLoading) {
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
