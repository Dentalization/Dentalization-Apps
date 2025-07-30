import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Animated,
  Dimensions,
  StatusBar,
  Easing
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DoctorProfileScreen = () => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const scrollY = useState(new Animated.Value(0))[0];
  const [isScrolled, setIsScrolled] = useState(false);

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 150,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.elastic(1.2),
      useNativeDriver: true,
    }).start();
  };

  // Handle scroll for profile header animation
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsScrolled(offsetY > 30);
      },
    }
  );

  // Smooth opacity animation for profile header
  const profileOpacity = scrollY.interpolate({
    inputRange: [0, 50, 90],
    outputRange: [1, 0.9, 0],
    extrapolate: 'clamp',
  });

  // Smooth transform animation for profile header
  const profileTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  // Smooth scale animation for profile header
  const profileScale = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const headerBorderRadius = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [30, 0],
    extrapolate: 'clamp',
  });

  const statsOpacity = scrollY.interpolate({
    inputRange: [0, 20, 60],
    outputRange: [0, 1, 1],
    extrapolate: 'clamp',
  });

  const statsTranslateY = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [20, 0],
    extrapolate: 'clamp',
  });

  const ProfileCard = ({ icon, title, subtitle, onPress, showArrow = true }) => (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0F0FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
      }}>
        <MaterialIcons name={icon} size={24} color="#483AA0" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#333333',
          marginBottom: 4,
        }}>
          {title}
        </Text>
        <Text style={{
          fontSize: 14,
          color: '#6E6E6E',
          lineHeight: 18,
        }}>
          {subtitle}
        </Text>
      </View>
      {showArrow && (
        <MaterialIcons name="chevron-right" size={24} color="#C0C0C0" />
      )}
    </TouchableOpacity>
  );

  const StatCard = ({ number, label, color }) => (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 18,
      alignItems: 'center',
      flex: 1,
      marginHorizontal: 6,
      shadowColor: color,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    }}>
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: color,
        marginBottom: 4,
      }}>
        {number}
      </Text>
      <Text style={{
        fontSize: 12,
        color: '#6E6E6E',
        textAlign: 'center',
      }}>
        {label}
      </Text>
    </View>
  );

  return (
      <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <StatusBar barStyle="light-content" backgroundColor="#483AA0" />
        
        {/* Fixed Navigation Header */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <Animated.View
          style={{
            borderBottomLeftRadius: scrollY.interpolate({
              inputRange: [0, 60],
              outputRange: [30, 0],
              extrapolate: 'clamp',
            }),
            borderBottomRightRadius: scrollY.interpolate({
              inputRange: [0, 60],
              outputRange: [30, 0],
              extrapolate: 'clamp',
            }),
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={isScrolled ? 
              ['rgba(72, 58, 160, 0.98)', 'rgba(107, 92, 231, 0.98)'] : 
              ['#483AA0', '#6B5CE7']
            }
            style={{
              paddingTop: 70,
              paddingBottom: 20,
              paddingHorizontal: 20,
            }}
          >
        {/* Navigation Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => console.log('Back pressed')}
            >
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#FFFFFF',
            }}>
              Profile
            </Text>
            
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => console.log('Settings pressed')}
            >
              <MaterialIcons name="settings" size={24} color="#FFFFFF" />
            </TouchableOpacity>
           </View>
           </LinearGradient>
         </Animated.View>
       </View>

      {/* Animated Profile Header */}
       <Animated.View
         style={{
           position: 'absolute',
           top: 0,
           left: 0,
           right: 0,
           zIndex: 999,
           opacity: profileOpacity,
           transform: [
             { translateY: profileTranslateY },
             { scale: profileScale }
           ],
         }}
       >
        <LinearGradient
          colors={['#483AA0', '#6B5CE7']}
          style={{
            paddingTop: 140,
            paddingBottom: 40,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
          }}
        >
          {/* Profile Content */}
           <View style={{ alignItems: 'center', paddingHorizontal: 4, paddingBottom: 1}}>
            {/* Profile Avatar */}
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#FFFFFF',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <MaterialIcons name="person" size={50} color="#483AA0" />
              <TouchableOpacity style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: '#4CAF50',
                borderRadius: 12,
                width: 24,
                height: 24,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#FFFFFF',
              }}>
                <MaterialIcons name="camera-alt" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {/* Doctor Info */}
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#FFFFFF',
              marginBottom: 4,
            }}>
              Dr. Sarah Johnson
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#E8E8FF',
              marginBottom: 8,
            }}>
              Dental Specialist
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.2)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              marginBottom: 24,
            }}>
              <MaterialIcons name="verified" size={16} color="#4CAF50" />
              <Text style={{
                fontSize: 14,
                color: '#FFFFFF',
                marginLeft: 4,
                fontWeight: '500',
              }}>
                Verified Professional
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 280, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={4}
          bounces={true}
          decelerationRate="normal"
        >
          {/* Stats Section - Overlapping */}
          <Animated.View style={{
            paddingHorizontal: 20,
            marginTop: -20,
            marginBottom: 24,
            opacity: statsOpacity,
            transform: [{ translateY: statsTranslateY }],
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
              <StatCard number="156" label="Patients Treated" color="#483AA0" />
              <StatCard number="4.9" label="Rating" color="#FF6B35" />
              <StatCard number="8" label="Years Experience" color="#4CAF50" />
            </View>
          </Animated.View>

          {/* Profile Options */}
        <View style={{ paddingHorizontal: 24 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333333',
            marginBottom: 16,
          }}>
            Profile Settings
          </Text>

          <ProfileCard
            icon="person-outline"
            title="Personal Information"
            subtitle="Update your personal details and contact info"
            onPress={() => console.log('Personal Info')}
          />

          <ProfileCard
            icon="work-outline"
            title="Professional Details"
            subtitle="Manage your qualifications and specializations"
            onPress={() => console.log('Professional Details')}
          />

          <ProfileCard
            icon="schedule"
            title="Availability & Schedule"
            subtitle="Set your working hours and availability"
            onPress={() => console.log('Schedule')}
          />

          <ProfileCard
            icon="notifications"
            title="Notification Preferences"
            subtitle="Customize your notification settings"
            onPress={() => console.log('Notifications')}
          />

          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333333',
            marginTop: 32,
            marginBottom: 16,
          }}>
            Account & Security
          </Text>

          <ProfileCard
            icon="security"
            title="Privacy & Security"
            subtitle="Manage your account security settings"
            onPress={() => console.log('Security')}
          />

          <ProfileCard
            icon="help-outline"
            title="Help & Support"
            subtitle="Get help and contact support team"
            onPress={() => console.log('Help')}
          />

          <ProfileCard
            icon="logout"
            title="Sign Out"
            subtitle="Sign out from your account"
            onPress={() => console.log('Logout')}
            showArrow={false}
          />
        </View>
        </ScrollView>
        </SafeAreaView>
      </View>
    );
};

export default DoctorProfileScreen;
