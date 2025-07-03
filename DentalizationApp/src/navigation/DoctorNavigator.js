import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import DoctorDashboard from '../screens/doctor/dashboard/DoctorDashboard';
import PatientsScreen from '../screens/doctor/patients/PatientsScreen';
import ScheduleScreen from '../screens/doctor/appointments/ScheduleScreen';
import DiagnosisScreen from '../screens/doctor/diagnosis/DiagnosisScreen';
import DoctorProfileScreen from '../screens/doctor/profile/DoctorProfileScreen';

// Shared screens
import ChatScreen from '../screens/shared/ChatScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';

import { Colors, ROUTES } from '../constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const DoctorTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === ROUTES.DOCTOR_DASHBOARD) {
            iconName = 'dashboard';
          } else if (route.name === ROUTES.DOCTOR_PATIENTS) {
            iconName = 'people';
          } else if (route.name === ROUTES.DOCTOR_APPOINTMENTS) {
            iconName = 'schedule';
          } else if (route.name === ROUTES.DOCTOR_DIAGNOSIS) {
            iconName = 'local-hospital';
          } else if (route.name === ROUTES.DOCTOR_PROFILE) {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.doctor.primary,
        tabBarInactiveTintColor: Colors.secondaryText,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.gray200,
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: Colors.doctor.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name={ROUTES.DOCTOR_DASHBOARD} 
        component={DoctorDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name={ROUTES.DOCTOR_PATIENTS} 
        component={PatientsScreen}
        options={{ title: 'Patients' }}
      />
      <Tab.Screen 
        name={ROUTES.DOCTOR_APPOINTMENTS} 
        component={ScheduleScreen}
        options={{ title: 'Schedule' }}
      />
      <Tab.Screen 
        name={ROUTES.DOCTOR_DIAGNOSIS} 
        component={DiagnosisScreen}
        options={{ title: 'Diagnosis' }}
      />
      <Tab.Screen 
        name={ROUTES.DOCTOR_PROFILE} 
        component={DoctorProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const DoctorNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorTabs" component={DoctorTabNavigator} />
      <Stack.Screen name={ROUTES.CHAT} component={ChatScreen} />
      <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
      <Stack.Screen name={ROUTES.NOTIFICATIONS} component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

export default DoctorNavigator;
