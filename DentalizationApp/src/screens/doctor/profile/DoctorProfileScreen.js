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
  Easing,
  Alert
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, updateUser } from '../../../store/slices/authSlice';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import profileService from '../../../services/profileService';
import { API_CONFIG } from '../../../constants/api';

const { width } = Dimensions.get('window');

const DoctorProfileScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector(state => state.auth);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar dari akun ini?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logoutUser()).unwrap();
              // Navigation will be handled by the auth state change
            } catch (error) {
              Alert.alert('Error', 'Gagal logout. Silakan coba lagi.');
            }
          },
        },
      ],
    );
  };

  const handleProfilePhotoPress = () => {
    Alert.alert('Select Photo', 'Choose how you would like to upload your photo', [
      { text: 'Camera', onPress: () => openCamera() },
      { text: 'Photo Library', onPress: () => openImageLibrary() },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is required to take photos. Please enable camera permission in your device settings.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePhoto(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera. Please try again.');
      console.error('Camera error:', error);
    }
  };

  const openImageLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library access is required to select photos. Please enable photo library permission in your device settings.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePhoto(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open photo library. Please try again.');
      console.error('Image library error:', error);
    }
  };

  const testUpdatePaymentMethods = async () => {
    console.log('🔥 TEST PAYMENT METHODS BUTTON PRESSED!');
    try {
      console.log('🧪 Testing payment methods update...');
      const updateData = {
        paymentMethods: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer'],
        acceptedInsurance: ['BPJS Kesehatan', 'Allianz', 'AXA Mandiri']
      };
      
      console.log('📤 Sending update data:', updateData);
      const response = await profileService.updateProfile(updateData);
      console.log('📥 Received response:', response);
      
      if (response.success) {
        Alert.alert('Success', 'Payment methods updated successfully!');
        console.log('✅ Payment methods updated:', response.data);
        console.log('💳 Updated paymentMethods:', response.data?.paymentMethods);
      } else {
        Alert.alert('Error', response.message || 'Failed to update payment methods');
        console.log('❌ Payment methods update failed:', response.message);
      }
    } catch (error) {
      console.error('Payment methods update error:', error);
      Alert.alert('Error', 'Failed to update payment methods');
    }
  };

  const uploadProfilePhoto = async (photo) => {
    setIsUploading(true);
    try {
      console.log('📸 Starting profile photo upload...');
      const photoResponse = await profileService.uploadProfilePhoto(
        photo.uri,
        user.id
      );
      
      if (!photoResponse.success) {
        console.log('❌ Profile photo upload failed:', photoResponse.message);
        Alert.alert('Error', photoResponse.message || 'Failed to upload profile photo');
        return;
      }
      
      console.log('📸 Full photo response data:', photoResponse.data);
      console.log('📸 Photo response structure:', JSON.stringify(photoResponse, null, 2));
      
      // The response structure shows nested data: photoResponse.data.data.url
      const profilePictureUrl = photoResponse.data?.data?.url;
      console.log('📸 Direct access test:', {
        'photoResponse.data': photoResponse.data,
        'photoResponse.data.data': photoResponse.data?.data,
        'photoResponse.data.data.url': photoResponse.data?.data?.url
      });
      console.log('📸 Extracted profilePictureUrl:', profilePictureUrl);
      console.log('📸 Type of profilePictureUrl:', typeof profilePictureUrl);
      
      // Update profile with new photo URL
      if (profilePictureUrl) {
        const updateResponse = await profileService.updateProfile({
          profilePicture: profilePictureUrl
        });
        
        if (updateResponse.success) {
          setProfilePhoto(photo);
          
          // Update Redux store with new profile picture
          dispatch(updateUser({
            profile: {
              ...user.profile,
              profilePicture: profilePictureUrl
            }
          }));
          console.log('✅ Profile picture updated in Redux store');
          
          Alert.alert('Success', 'Profile photo updated successfully!');
        } else {
          Alert.alert('Error', 'Failed to update profile with new photo');
        }
      } else {
        console.log('❌ Profile picture URL is undefined');
        Alert.alert('Error', 'Failed to get profile photo URL from upload response');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload profile photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  const [scaleAnim] = useState(new Animated.Value(1));
  const scrollY = useState(new Animated.Value(0))[0];
  const [isScrolled, setIsScrolled] = useState(false);

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.96,
      duration: 120,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  // Handle scroll for profile header animation with dynamic smooth transitions
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsScrolled(offsetY > 20);
      },
    }
  );

  // Dynamic opacity animation with smooth fade effect
  const profileOpacity = scrollY.interpolate({
    inputRange: [0, 50, 120, 180],
    outputRange: [1, 0.9, 0.4, 0],
    extrapolate: 'clamp',
  });

  // Enhanced parallax transform with fluid motion
  const profileTranslateY = scrollY.interpolate({
    inputRange: [0, 60, 120, 200],
    outputRange: [0, -15, -35, -60],
    extrapolate: 'clamp',
  });

  // Dynamic scale animation with elastic feel
  const profileScale = scrollY.interpolate({
    inputRange: [0, 50, 100, 150],
    outputRange: [1, 0.95, 0.85, 0.75],
    extrapolate: 'clamp',
  });

  // Smooth border radius transition with curve
  const headerBorderRadius = scrollY.interpolate({
    inputRange: [0, 30, 60],
    outputRange: [30, 15, 0],
    extrapolate: 'clamp',
  });

  // Enhanced stats animation with staggered entrance
  const statsOpacity = scrollY.interpolate({
    inputRange: [0, 20, 50, 80],
    outputRange: [0, 0.2, 0.7, 1],
    extrapolate: 'clamp',
  });

  // Bouncy stats slide-in animation
  const statsTranslateY = scrollY.interpolate({
    inputRange: [0, 40, 80],
    outputRange: [50, 15, 0],
    extrapolate: 'clamp',
  });

  // Profile rotation animation for dynamic effect
  const profileRotate = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: ['0deg', '2deg', '5deg'],
    extrapolate: 'clamp',
  });

  // Profile blur effect simulation with opacity layers
  const profileBlurOpacity = scrollY.interpolate({
    inputRange: [0, 80, 150],
    outputRange: [0, 0.3, 0.7],
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
            <View style={{ width: 40 }} />
            
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
              {profilePhoto || user?.profile?.profilePicture ? (
                <Image 
                  source={{ 
                    uri: profilePhoto?.uri || 
                      (user?.profile?.profilePicture 
                        ? `${API_CONFIG.BASE_URL}${user.profile.profilePicture}`
                        : null)
                  }} 
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <MaterialIcons name="person" size={50} color="#483AA0" />
              )}
              <TouchableOpacity 
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: isUploading ? '#9E9E9E' : '#4CAF50',
                  borderRadius: 12,
                  width: 24,
                  height: 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                }}
                onPress={handleProfilePhotoPress}
                disabled={isUploading}
              >
                <MaterialIcons 
                  name={isUploading ? "hourglass-empty" : "camera-alt"} 
                  size={12} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
            </View>
            
            {/* Doctor Info with Enhanced Animation */}
            <Animated.View style={{
              transform: [
                { rotateZ: profileRotate },
                { perspective: 1000 }
              ]
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#FFFFFF',
                marginBottom: 4,
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}>
                {user?.profile?.firstName && user?.profile?.lastName 
                  ? `${user.profile.firstName} ${user.profile.lastName}` 
                  : 'Doctor Profile'}
              </Text>
              <Text style={{
                fontSize: 16,
                color: '#E8E8FF',
                marginBottom: 8,
                textShadowColor: 'rgba(0,0,0,0.2)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}>
                {user?.profile?.specialization || 'Dental Specialist'}
              </Text>
              <Animated.View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.25)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                transform: [{
                  scale: scrollY.interpolate({
                    inputRange: [0, 50, 100],
                    outputRange: [1, 1.05, 0.95],
                    extrapolate: 'clamp',
                  })
                }]
              }}>
                <MaterialIcons name="verified" size={16} color="#4CAF50" />
                <Text style={{
                  fontSize: 14,
                  color: '#FFFFFF',
                  marginLeft: 4,
                  fontWeight: '600',
                }}>
                  Verified Professional
                </Text>
              </Animated.View>
            </Animated.View>
            
            {/* Blur overlay for depth effect */}
            <Animated.View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255,255,255,0.1)',
              opacity: profileBlurOpacity,
              borderRadius: 20,
            }} />
          </View>
        </LinearGradient>
      </Animated.View>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 280, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={2}
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
              <StatCard number={user?.profile?.experience || "0"} label="Years Experience" color="#4CAF50" />
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
            onPress={() => navigation.navigate('DoctorProfileSetup')}
          />

          <ProfileCard
            icon="work-outline"
            title="Professional Details" 
            subtitle="Manage your qualifications and specializations"
            onPress={() => navigation.navigate('ProfessionalDetails')}
          />

          <ProfileCard
            icon="schedule"
            title="Availability & Schedule"
            subtitle="Set your working hours and availability"
            onPress={() => console.log('Schedule')}
          />

          <ProfileCard
            icon="history"
            title="AI Diagnosis History"
            subtitle="View AI diagnosis history and reports"
            onPress={() => navigation.navigate('AiDiagnosisHistoryDoctor')}
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
            icon="payment"
            title="Test Payment Methods"
            subtitle="Test payment methods update functionality"
            onPress={testUpdatePaymentMethods}
          />

          <ProfileCard
            icon="logout"
            title="Sign Out"
            subtitle="Sign out from your account"
            onPress={handleLogout}
            showArrow={false}
          />
        </View>
        </ScrollView>
        </SafeAreaView>
      </View>
    );
};

export default DoctorProfileScreen;
