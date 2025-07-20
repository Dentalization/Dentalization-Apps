import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, TouchableOpacity, Text, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';

import PatientDashboard from '../screens/patient/dashboard/PatientDashboard';
import CameraScreen from '../screens/patient/camera/CameraScreen';
import AppointmentsScreen from '../screens/patient/appointments/AppointmentsScreen';
import AppointmentBookingScreen from '../screens/patient/appointments/AppointmentBookingScreen';
import DoctorListScreen from '../screens/patient/appointments/DoctorListScreen';
import HistoryScreen from '../screens/patient/history/HistoryScreen';
import ProfileScreen from '../screens/patient/profile/ProfileScreen';
import PatientProfileSetupScreen from '../screens/patient/profile/PatientProfileSetupScreen';
import MessagesScreen from '../screens/patient/messages/MessagesScreen';
import ChatScreen from '../screens/patient/messages/ChatScreen';

// Shared screens
import SettingsScreen from '../screens/shared/SettingsScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';

import { Colors, ROUTES } from '../constants';

const { width } = Dimensions.get('window');

// Custom tab bar component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const tabs = [
    { name: ROUTES.PATIENT_DASHBOARD, label: 'Home', icon: 'home', type: 'MaterialIcons' },
    { name: 'Messages', label: 'Message', icon: 'message-text', type: 'MaterialCommunityIcons' },
    { name: ROUTES.PATIENT_CAMERA, label: '', icon: 'camera', type: 'MaterialCommunityIcons', isCenter: true },
    { name: ROUTES.PATIENT_APPOINTMENTS, label: 'Booking', icon: 'calendar-check', type: 'MaterialCommunityIcons' },
    { name: ROUTES.PATIENT_PROFILE, label: 'Profile', icon: 'person', type: 'MaterialIcons' },
  ];

  console.log('🔍 CustomTabBar - Available routes:', state.routes.map(r => r.name));
  console.log('🔍 CustomTabBar - Current index:', state.index);

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

          console.log('🔍 Tab pressed:', tab.name, 'routeIndex:', routeIndex, 'isFocused:', isFocused);
          console.log('🔍 Available routes:', state.routes.map(r => r.name));
          console.log('🔍 Current route index:', state.index);

          if (!isFocused && !event.defaultPrevented) {
            console.log('🔍 Navigating to:', tab.name);
            navigation.navigate(tab.name);
          }
        };

        if (tab.isCenter) {
          return (
            <TouchableOpacity key={index} style={{ position: 'absolute', top: -30, left: width / 2 - 40, width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 12 }} onPress={onPress}>
              <LinearGradient colors={['#8B5CF6', '#667EEA']} style={{ width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <MaterialCommunityIcons name={tab.icon} size={32} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={index} style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: 12, paddingHorizontal: 8 }} onPress={onPress}>
            <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: isFocused ? 'rgba(139, 92, 246, 0.1)' : 'transparent', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 12, minWidth: 60 }}>
              {tab.type === 'MaterialIcons' ? (
                <Icon name={tab.icon} size={26} color={isFocused ? '#8B5CF6' : '#9CA3AF'} />
              ) : (
                <MaterialCommunityIcons name={tab.icon} size={26} color={isFocused ? '#8B5CF6' : '#9CA3AF'} />
              )}
              <Text style={{ fontSize: 12, fontWeight: isFocused ? '600' : '500', marginTop: 4, color: isFocused ? '#8B5CF6' : '#9CA3AF', textAlign: 'center' }}>
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const PatientTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name={ROUTES.PATIENT_DASHBOARD} 
        component={PatientDashboard}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
      />
      <Tab.Screen 
        name={ROUTES.PATIENT_CAMERA} 
        component={CameraScreen}
      />
      <Tab.Screen 
        name={ROUTES.PATIENT_APPOINTMENTS} 
        component={AppointmentsScreen}
      />
      <Tab.Screen 
        name={ROUTES.PATIENT_PROFILE} 
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

const PatientNavigator = () => {
  const { user } = useSelector(state => state.auth);
  
  // Always show main app, profile setup is accessible from profile screen
  console.log('🔍 PatientNavigator - User:', JSON.stringify(user, null, 2));
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientTabs" component={PatientTabNavigator} />
      <Stack.Screen name={ROUTES.CHAT} component={ChatScreen} />
      <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
      <Stack.Screen name={ROUTES.NOTIFICATIONS} component={NotificationsScreen} />
      <Stack.Screen 
        name="PatientProfileSetup" 
        component={PatientProfileSetupScreen}
        options={{ 
          headerShown: true,
          title: 'Lengkapi Profil',
          headerBackTitle: 'Kembali'
        }}
      />
      <Stack.Screen 
        name="DoctorList" 
        component={DoctorListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AppointmentBooking" 
        component={AppointmentBookingScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default PatientNavigator;