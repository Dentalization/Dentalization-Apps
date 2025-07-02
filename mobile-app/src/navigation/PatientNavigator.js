import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import PatientDashboard from '../screens/patient/dashboard/PatientDashboard';
import CameraScreen from '../screens/patient/camera/CameraScreen';
import AppointmentsScreen from '../screens/patient/appointments/AppointmentsScreen';
import HistoryScreen from '../screens/patient/history/HistoryScreen';
import ProfileScreen from '../screens/patient/profile/ProfileScreen';

// Shared screens
import ChatScreen from '../screens/shared/ChatScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';

import { Colors, ROUTES } from '../../shared/constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const PatientTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === ROUTES.PATIENT_DASHBOARD) {
            iconName = 'dashboard';
          } else if (route.name === ROUTES.PATIENT_CAMERA) {
            iconName = 'camera-alt';
          } else if (route.name === ROUTES.PATIENT_APPOINTMENTS) {
            iconName = 'event';
          } else if (route.name === ROUTES.PATIENT_HISTORY) {
            iconName = 'history';
          } else if (route.name === ROUTES.PATIENT_PROFILE) {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.patient.primary,
        tabBarInactiveTintColor: Colors.secondaryText,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.gray200,
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: Colors.patient.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name={ROUTES.PATIENT_DASHBOARD} 
        component={PatientDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name={ROUTES.PATIENT_CAMERA} 
        component={CameraScreen}
        options={{ title: 'Camera' }}
      />
      <Tab.Screen 
        name={ROUTES.PATIENT_APPOINTMENTS} 
        component={AppointmentsScreen}
        options={{ title: 'Appointments' }}
      />
      <Tab.Screen 
        name={ROUTES.PATIENT_HISTORY} 
        component={HistoryScreen}
        options={{ title: 'History' }}
      />
      <Tab.Screen 
        name={ROUTES.PATIENT_PROFILE} 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const PatientNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientTabs" component={PatientTabNavigator} />
      <Stack.Screen name={ROUTES.CHAT} component={ChatScreen} />
      <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
      <Stack.Screen name={ROUTES.NOTIFICATIONS} component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

export default PatientNavigator;
