import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

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

// Custom tab bar component for modern design
const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.98)']}
        style={styles.tabBarGradient}
      >
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel || options.title || route.name;
            const isFocused = state.index === index;
            const isCenter = index === 2; // Diagnosis tab (middle)

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            let iconName;
            if (route.name === ROUTES.DOCTOR_DASHBOARD) {
              iconName = 'home';
            } else if (route.name === ROUTES.DOCTOR_PATIENTS) {
              iconName = 'people';
            } else if (route.name === ROUTES.DOCTOR_DIAGNOSIS) {
              iconName = 'qr-code-scanner'; // Changed to scan icon
            } else if (route.name === ROUTES.DOCTOR_APPOINTMENTS) {
              iconName = 'schedule';
            } else if (route.name === ROUTES.DOCTOR_PROFILE) {
              iconName = 'person';
            }

            if (isCenter) {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={onPress}
                  style={styles.centerTabButton}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={isFocused 
                      ? ['#667eea', '#764ba2'] 
                      : ['#4facfe', '#00f2fe']
                    }
                    style={styles.centerTabGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.centerTabIconContainer}>
                      <Icon 
                        name={iconName} 
                        size={28} 
                        color="white"
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={index}
                onPress={onPress}
                style={[
                  styles.tabButton,
                  isFocused && styles.tabButtonActive
                ]}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.tabIconContainer,
                  isFocused && styles.tabIconContainerActive
                ]}>
                  <Icon 
                    name={iconName} 
                    size={24} 
                    color={isFocused ? Colors.doctor.primary : Colors.gray400}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
};

const DoctorTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.doctor.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerBackground: () => (
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        ),
      }}
    >
      <Tab.Screen 
        name={ROUTES.DOCTOR_DASHBOARD} 
        component={DoctorDashboard}
        options={{ 
          title: 'Dashboard',
          headerLeft: () => (
            <View style={{ marginLeft: 15 }}>
              <Icon name="medical-services" size={24} color="white" />
            </View>
          )
        }}
      />
      <Tab.Screen 
        name={ROUTES.DOCTOR_PATIENTS} 
        component={PatientsScreen}
        options={{ 
          title: 'Patients',
          headerLeft: () => (
            <View style={{ marginLeft: 15 }}>
              <Icon name="people" size={24} color="white" />
            </View>
          )
        }}
      />
      <Tab.Screen 
        name={ROUTES.DOCTOR_DIAGNOSIS} 
        component={DiagnosisScreen}
        options={{ 
          title: 'AI Diagnosis',
          headerLeft: () => (
            <View style={{ marginLeft: 15 }}>
              <Icon name="qr-code-scanner" size={24} color="white" />
            </View>
          )
        }}
      />
      <Tab.Screen 
        name={ROUTES.DOCTOR_APPOINTMENTS} 
        component={ScheduleScreen}
        options={{ 
          title: 'Schedule',
          headerLeft: () => (
            <View style={{ marginLeft: 15 }}>
              <Icon name="schedule" size={24} color="white" />
            </View>
          )
        }}
      />
      <Tab.Screen 
        name={ROUTES.DOCTOR_PROFILE} 
        component={DoctorProfileScreen}
        options={{ 
          title: 'Profile',
          headerLeft: () => (
            <View style={{ marginLeft: 15 }}>
              <Icon name="person" size={24} color="white" />
            </View>
          )
        }}
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

// Modern tab bar styles
const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  tabBarGradient: {
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  tabIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabIconContainerActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    transform: [{ scale: 1.1 }],
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -5,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.doctor.primary,
  },
  centerTabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -35, // Make it protrude more from the tab bar
  },
  centerTabGradient: {
    width: 70, // Slightly larger
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12, // More shadow
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  centerTabIconContainer: {
    width: 60, // Slightly larger
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});

export default DoctorNavigator;
