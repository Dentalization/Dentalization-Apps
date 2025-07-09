import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/auth/LoginScreen';

import RegisterPatientScreen from '../screens/auth/RegisterPatientScreen';
import RegisterDoctorScreen from '../screens/auth/RegisterDoctorScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';

import { ROUTES } from '../constants';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.LOGIN}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />

      <Stack.Screen name={ROUTES.REGISTER_PATIENT} component={RegisterPatientScreen} />
      <Stack.Screen name={ROUTES.REGISTER_DOCTOR} component={RegisterDoctorScreen} />
      <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
      <Stack.Screen name={ROUTES.RESET_PASSWORD} component={ResetPasswordScreen} />
      <Stack.Screen name={ROUTES.VERIFY_EMAIL} component={EmailVerificationScreen} />
      <Stack.Screen name={ROUTES.ROLE_SELECTION} component={RoleSelectionScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
