import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, TouchableOpacity, Text, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

import DoctorDashboard from '../screens/doctor/dashboard/DoctorDashboard';
import PatientsScreen from '../screens/doctor/patients/PatientsScreen';
import ScheduleScreen from '../screens/doctor/appointments/ScheduleScreen';
import DiagnosisScreen from '../screens/doctor/diagnosis/DiagnosisScreen';
import DoctorProfileScreen from '../screens/doctor/profile/DoctorProfileScreen';
import DoctorProfileSetupScreen from '../screens/doctor/profile/DoctorProfileSetupScreen';
import AiDiagnosisHistoryDoctor from '../screens/doctor/profile/AiDiagnosisHistoryDoctor.js';

// Shared screens
import ChatScreen from '../screens/shared/ChatScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';
import NotificationDoctor from '../screens/doctor/notification/NotificationDoctor';
import MessageScreenDoc from '../screens/doctor/messages/MessageScreenDoc';
import ChatScreenDoc from '../screens/doctor/messages/ChatScreenDoc';

import { Colors, ROUTES } from '../constants';

const { width } = Dimensions.get('window');

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom tab bar component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const tabs = [
    { name: ROUTES.DOCTOR_DASHBOARD, label: 'Home', icon: 'home', type: 'MaterialIcons' },
    { name: ROUTES.DOCTOR_PATIENTS, label: 'Patients', icon: 'account-group', type: 'MaterialCommunityIcons' },
    { name: ROUTES.DOCTOR_DIAGNOSIS, label: '', icon: 'qr-code-scanner', type: 'MaterialIcons', isCenter: true },
    { name: ROUTES.DOCTOR_APPOINTMENTS, label: 'Schedule', icon: 'calendar-clock', type: 'MaterialCommunityIcons' },
    { name: ROUTES.DOCTOR_PROFILE, label: 'Profile', icon: 'person', type: 'MaterialIcons' },
  ];

  return (
    <View style={{ flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 5, paddingBottom: 5, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'space-around', shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 15, position: 'relative' }}>
      {tabs.map((tab, index) => {
        // Find the actual route index for this tab
        const routeIndex = state.routes.findIndex(route => route.name === tab.name);
        const isFocused = state.index === routeIndex;
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: tab.name,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(tab.name);
          }
        };

        if (tab.isCenter) {
          return (
            <TouchableOpacity key={index} style={{ position: 'absolute', top: -30, left: width / 2 - 40, width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', shadowColor: '#667EEA', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 12 }} onPress={onPress}>
              <LinearGradient colors={['#667EEA', '#764BA2']} style={{ width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Icon name={tab.icon} size={32} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={index} style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: 12, paddingHorizontal: 8 }} onPress={onPress}>
            <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: isFocused ? 'rgba(102, 126, 234, 0.1)' : 'transparent', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 12, minWidth: 60 }}>
              {tab.type === 'MaterialIcons' ? (
                <Icon name={tab.icon} size={26} color={isFocused ? '#667EEA' : '#9CA3AF'} />
              ) : (
                <MaterialCommunityIcons name={tab.icon} size={26} color={isFocused ? '#667EEA' : '#9CA3AF'} />
              )}
              <Text style={{ fontSize: 12, fontWeight: isFocused ? '600' : '500', marginTop: 4, color: isFocused ? '#667EEA' : '#9CA3AF', textAlign: 'center' }}>
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const DoctorTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name={ROUTES.DOCTOR_DASHBOARD} 
        component={DoctorDashboard}
      />
      <Tab.Screen 
        name={ROUTES.DOCTOR_PATIENTS} 
        component={PatientsScreen}
      />
      <Tab.Screen 
        name={ROUTES.DOCTOR_DIAGNOSIS} 
        component={DiagnosisScreen}
      />
      <Tab.Screen 
        name={ROUTES.DOCTOR_APPOINTMENTS} 
        component={ScheduleScreen}
      />
      <Tab.Screen 
        name={ROUTES.DOCTOR_PROFILE} 
        component={DoctorProfileScreen}
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
      <Stack.Screen name={ROUTES.NOTIFICATIONS} component={NotificationDoctor} />
      <Stack.Screen name="NotificationDoctor" component={NotificationDoctor} />
      <Stack.Screen name="MessageScreenDoc" component={MessageScreenDoc} />
      <Stack.Screen name="ChatDoc" component={ChatScreenDoc} />
      <Stack.Screen name="DoctorProfileSetup" component={DoctorProfileSetupScreen} />
      <Stack.Screen name="AiDiagnosisHistoryDoctor" component={AiDiagnosisHistoryDoctor} />
    </Stack.Navigator>
  );
};



export default DoctorNavigator;
