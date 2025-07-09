import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

import PatientDashboard from '../screens/patient/dashboard/PatientDashboard';
import CameraScreen from '../screens/patient/camera/CameraScreen';
import AppointmentsScreen from '../screens/patient/appointments/AppointmentsScreen';
import HistoryScreen from '../screens/patient/history/HistoryScreen';
import ProfileScreen from '../screens/patient/profile/ProfileScreen';
import PatientProfileSetupScreen from '../screens/patient/profile/PatientProfileSetupScreen';
import MessagesScreen from '../screens/patient/messages/MessagesScreen';

// Shared screens
import ChatScreen from '../screens/shared/ChatScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';

import { Colors, ROUTES } from '../constants';

const { width } = Dimensions.get('window');

// Custom tab bar component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const tabs = [
    { name: ROUTES.PATIENT_DASHBOARD, label: 'Beranda', icon: 'home', type: 'MaterialIcons' },
    { name: 'Messages', label: 'Pesan', icon: 'message-text', type: 'MaterialCommunityIcons' },
    { name: ROUTES.PATIENT_CAMERA, label: 'Scan', icon: 'camera', type: 'MaterialCommunityIcons', isCenter: true },
    { name: ROUTES.PATIENT_APPOINTMENTS, label: 'Booking', icon: 'calendar-check', type: 'MaterialCommunityIcons' },
    { name: ROUTES.PATIENT_PROFILE, label: 'Profil', icon: 'person', type: 'MaterialIcons' },
  ];

  return (
    <View style={styles.tabBar}>
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
            <TouchableOpacity
              key={index}
              style={styles.centerTabButton}
              onPress={onPress}
            >
              <LinearGradient
                colors={['#6B46C1', '#9333EA']}
                style={styles.centerTabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons 
                  name={tab.icon} 
                  size={28} 
                  color="#FFFFFF" 
                />
              </LinearGradient>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={index}
            style={styles.tabButton}
            onPress={onPress}
          >
            {tab.type === 'MaterialIcons' ? (
              <Icon 
                name={tab.icon} 
                size={24} 
                color={isFocused ? '#6B46C1' : '#9CA3AF'} 
              />
            ) : (
              <MaterialCommunityIcons 
                name={tab.icon} 
                size={24} 
                color={isFocused ? '#6B46C1' : '#9CA3AF'} 
              />
            )}
            <Text style={[
              styles.tabLabel, 
              { color: isFocused ? '#6B46C1' : '#9CA3AF' }
            ]}>
              {tab.label}
            </Text>
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
    </Stack.Navigator>
  );
};

export default PatientNavigator;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
    paddingBottom: 30,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    position: 'relative',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  centerTabButton: {
    position: 'absolute',
    top: -25,
    left: width / 2 - 35,
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B46C1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  centerTabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
