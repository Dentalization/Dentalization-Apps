import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Image
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '../../../components/common/ThemeProvider';
import { logoutUser, checkAuthStatus, updateUser } from '../../../store/slices/authSlice';
import profileService from '../../../services/profileService';

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnims = useRef(Array.from({ length: 4 }, () => new Animated.Value(1))).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Debug log for profile picture
  React.useEffect(() => {
    console.log('🔍 ProfileScreen - Current user data:', JSON.stringify(user, null, 2));
    console.log('🔍 ProfileScreen - Profile picture URL:', user?.profile?.profilePicture);
    console.log('🔍 ProfileScreen - Profile picture type:', typeof user?.profile?.profilePicture);
    console.log('🔍 ProfileScreen - Profile picture length:', user?.profile?.profilePicture?.length);
    
    // Clean up invalid profile picture URLs
    if (user?.profile?.profilePicture && 
        (user.profile.profilePicture.includes('undefined') || 
         user.profile.profilePicture.includes('null'))) {
      console.log('🔍 ProfileScreen - Detected invalid profile picture URL, cleaning up...');
      cleanupInvalidProfilePicture();
    }
  }, [user]);

  const cleanupInvalidProfilePicture = async () => {
    try {
      // Update Redux store to remove invalid URL
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          profilePicture: null,
        }
      };
      
      dispatch(updateUser(updatedUser));
      console.log('✅ ProfileScreen - Invalid profile picture URL cleaned up');
    } catch (error) {
      console.error('❌ ProfileScreen - Error cleaning up profile picture:', error);
    }
  };

  // Refresh auth data only if user is null or missing critical data
  // and limit frequency to avoid excessive API calls and rate limiting
  const lastAuthCheck = React.useRef(0);
  
  useFocusEffect(
    React.useCallback(() => {
      const now = Date.now();
      const timeSinceLastCheck = now - lastAuthCheck.current;
      const MINIMUM_CHECK_INTERVAL = 60000; // Increased to 60 seconds to avoid rate limiting
      
      if (!user || !user.profile) {
        if (timeSinceLastCheck > MINIMUM_CHECK_INTERVAL) {
          console.log('🔍 ProfileScreen focused, user data missing - refreshing (with rate limiting)');
          lastAuthCheck.current = now;
          dispatch(checkAuthStatus());
        } else {
          console.log(`🔍 ProfileScreen focused, but skipping auth check (rate limited: ${Math.round((MINIMUM_CHECK_INTERVAL - timeSinceLastCheck) / 1000)}s remaining)`);
        }
      } else {
        console.log('🔍 ProfileScreen focused, user data available - no refresh needed');
      }
    }, [dispatch, user])
  );

  // Auto-redirect to profile setup if profile is incomplete
  useFocusEffect(
    React.useCallback(() => {
      // Add delay to ensure user data is loaded
      const timer = setTimeout(() => {
        if (user?.profile) {
          const completionPercentage = calculateProfileCompletion(); // ADD () - it's a function!
          console.log('🔍 ProfileScreen - Profile completion check:', completionPercentage);
          
          // Only redirect if profile is significantly incomplete (less than 50%)
          // AND if profileComplete is not explicitly set to true in backend
          if (completionPercentage < 50 && user.profile.profileComplete !== true) {
            console.log('🔍 ProfileScreen - Auto-redirecting to profile setup (completion: ' + completionPercentage + '%)');
            navigation.navigate('PatientProfileSetup');
          } else {
            console.log('🔍 ProfileScreen - Profile sufficient or marked complete, staying on ProfileScreen');
          }
        }
      }, 500); // Small delay to ensure smooth transition

      return () => clearTimeout(timer);
    }, [user, navigation, calculateProfileCompletion])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate progress bar
    const completionPercentage = calculateProfileCompletion(); // ADD () - it's a function!
    Animated.timing(progressAnim, {
      toValue: completionPercentage / 100,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [user, calculateProfileCompletion]);

  const calculateProfileCompletion = React.useCallback(() => {
    console.log('🔍 ProfileScreen - Calculating completion for user:', JSON.stringify(user, null, 2));
    console.log('🔍 ProfileScreen - Profile picture value:', user?.profile?.profilePicture);
    
    if (!user?.profile) {
      console.log('🔍 ProfileScreen - No profile data found');
      return 0;
    }
    
    // Check if profile is marked as complete in backend
    if (user.profile.profileComplete === true) {
      console.log('🔍 ProfileScreen - Profile marked as complete in backend');
      return 100;
    }
    
    const requiredFields = [
      'firstName', 'lastName', 'phone', 'address', 'dateOfBirth',
      'emergencyContactName', 'emergencyContactPhone'
    ];
    
    const optionalFields = [
      'allergies', 'medications', 'dentalConcerns', 'insuranceProvider'
    ];
    
    let completed = 0;
    const total = requiredFields.length + optionalFields.length;
    
    console.log('🔍 ProfileScreen - Checking required fields:');
    requiredFields.forEach(field => {
      let value = null;
      
      // Priority 1: Check if already parsed in Redux (emergencyContactName, emergencyContactPhone)
      if (user.profile[field]) {
        value = user.profile[field];
      }
      // Priority 2: Handle emergencyContact parsing fallback
      else if (field === 'emergencyContactName' || field === 'emergencyContactPhone') {
        if (user.profile.emergencyContact) {
          try {
            const emergencyContact = typeof user.profile.emergencyContact === 'string' 
              ? JSON.parse(user.profile.emergencyContact) 
              : user.profile.emergencyContact;
            
            if (field === 'emergencyContactName') {
              value = emergencyContact?.name;
            } else if (field === 'emergencyContactPhone') {
              value = emergencyContact?.phone;
            }
          } catch {
            // Fallback: try to parse old format "Name - Phone"
            if (typeof user.profile.emergencyContact === 'string' && user.profile.emergencyContact.includes(' - ')) {
              const parts = user.profile.emergencyContact.split(' - ');
              if (field === 'emergencyContactName') {
                value = parts[0];
              } else if (field === 'emergencyContactPhone') {
                value = parts[1];
              }
            }
          }
        }
      }
      // Priority 3: Get other field values directly
      else {
        value = user.profile[field];
      }
      
      // Clean up null/undefined string values
      if (value === 'null' || value === 'undefined' || value === null || value === undefined) {
        value = '';
      }
      
      const hasValue = value && value.toString().trim() !== '';
      console.log(`  ${field}: "${value}" -> ${hasValue ? 'COMPLETE' : 'MISSING'}`);
      if (hasValue) {
        completed += 1;
      }
    });
    
    console.log('🔍 ProfileScreen - Checking optional fields:');
    optionalFields.forEach(field => {
      let value = null;
      
      // Priority 1: Check if already parsed in Redux (insuranceProvider)
      if (user.profile[field]) {
        value = user.profile[field];
      }
      // Priority 2: Handle insurance info parsing fallback
      else if (field === 'insuranceProvider' && user.profile.insuranceInfo) {
        try {
          const insurance = typeof user.profile.insuranceInfo === 'string' 
            ? JSON.parse(user.profile.insuranceInfo) 
            : user.profile.insuranceInfo;
          value = insurance?.provider;
        } catch {
          value = user.profile.insuranceInfo;
        }
      }
      // Priority 3: Get other field values directly
      else {
        value = user.profile[field];
      }
      
      // Clean up null/undefined string values
      if (value === 'null' || value === 'undefined' || value === null || value === undefined) {
        value = '';
      }
      
      const hasValue = value && value.toString().trim() !== '';
      console.log(`  ${field}: "${value}" -> ${hasValue ? 'COMPLETE' : 'MISSING'}`);
      if (hasValue) {
        completed += 0.5; // Optional fields count as half
      }
    });
    
    const percentage = Math.round((completed / total) * 100);
    console.log(`🔍 ProfileScreen - Completion: ${completed}/${total} = ${percentage}%`);
    
    return percentage;
  }, [user]);

  const handleProfilePhotoChange = () => {
    const hasInvalidPhoto = user?.profile?.profilePicture && 
      (user.profile.profilePicture.includes('undefined') || 
       user.profile.profilePicture.includes('null'));
    
    const options = [
      { text: 'Batal', style: 'cancel' },
      { text: 'Kamera', onPress: openCamera },
      { text: 'Galeri', onPress: openImageLibrary },
    ];
    
    // Add remove option if there's an invalid photo
    if (hasInvalidPhoto) {
      options.splice(1, 0, { 
        text: 'Hapus Foto Rusak', 
        onPress: () => {
          Alert.alert(
            'Hapus Foto',
            'Foto profil rusak akan dihapus. Anda bisa mengupload foto baru.',
            [
              { text: 'Batal', style: 'cancel' },
              { text: 'Hapus', style: 'destructive', onPress: cleanupInvalidProfilePicture }
            ]
          );
        },
        style: 'destructive'
      });
    }
    
    Alert.alert(
      'Ubah Foto Profil',
      hasInvalidPhoto ? 'Foto profil rusak terdeteksi. Pilih opsi:' : 'Pilih sumber foto',
      options
    );
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.getCameraPermissionsAsync();
      
      if (status !== 'granted') {
        const { status: newStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert(
            'Izin Diperlukan',
            'Untuk mengambil foto, aplikasi memerlukan izin akses kamera.',
            [{ text: 'OK', style: 'default' }]
          );
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadProfilePhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Gagal membuka kamera. Pastikan aplikasi memiliki izin akses kamera.');
    }
  };

  const openImageLibrary = async () => {
    try {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert(
            'Izin Diperlukan',
            'Untuk memilih foto dari galeri, aplikasi memerlukan izin akses galeri.',
            [{ text: 'OK', style: 'default' }]
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadProfilePhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Error opening image library:', error);
      Alert.alert('Error', 'Gagal membuka galeri foto. Pastikan aplikasi memiliki izin akses galeri.');
    }
  };

  const uploadProfilePhoto = async (photoAsset) => {
    try {
      console.log('🔍 ProfileScreen - Uploading new profile photo:', photoAsset.uri);
      Alert.alert('Info', 'Sedang mengunggah foto...');
      
      // Upload photo to backend
      const photoResponse = await profileService.uploadProfilePhoto(
        photoAsset.uri, 
        user.id
      );
      
      console.log('🔍 Photo upload response:', photoResponse);
      
      if (photoResponse.success) {
        // Handle nested response structure from API
        const responseData = photoResponse.data?.data || photoResponse.data;
        console.log('🔍 Parsed response data:', responseData);
        
        // Convert relative URL to full URL and validate
        const baseURL = __DEV__ 
          ? 'http://127.0.0.1:3001' 
          : 'https://api.dentalization.com';
        
        let fullPhotoUrl = null;
        if (responseData?.url && responseData.url !== 'undefined' && responseData.url !== 'null') {
          fullPhotoUrl = responseData.url.startsWith('http') 
            ? responseData.url 
            : `${baseURL}${responseData.url}`;
        }
        
        console.log('✅ Photo uploaded successfully, full URL:', fullPhotoUrl);
        
        if (fullPhotoUrl) {
          // Update Redux store immediately for UI feedback
          const updatedUser = {
            ...user,
            profile: {
              ...user.profile,
              profilePicture: fullPhotoUrl,
            }
          };
          
          dispatch(updateUser(updatedUser));
          Alert.alert('Berhasil', 'Foto profil berhasil diperbarui!');
        } else {
          console.log('❌ Invalid photo URL received from server');
          console.log('🔍 Response data structure:', responseData);
          Alert.alert('Error', 'Foto berhasil diupload tetapi URL tidak valid. Coba upload ulang.');
        }
      } else {
        console.log('❌ Photo upload failed:', photoResponse.message);
        Alert.alert('Error', 'Gagal mengunggah foto: ' + (photoResponse.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload photo error:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat mengunggah foto');
    }
  };

  const getProfileStatus = () => {
    const completion = calculateProfileCompletion(); // ADD () - it's a function!
    if (completion >= 80) return { text: '✓ Profil Lengkap', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.9)' };
    if (completion >= 50) return { text: '⚡ Hampir Selesai', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.9)' };
    return { text: '! Profil Belum Lengkap', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.9)' };
  };

  const animatePress = (index) => {
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogout = () => {
    Alert.alert(
      'Keluar',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Keluar', 
          style: 'destructive',
          onPress: () => dispatch(logoutUser())
        }
      ]
    );
  };

  const profileOptions = [
    {
      title: 'Lengkapi Profil',
      subtitle: `${calculateProfileCompletion()}% Lengkap - ${getProfileStatus().text.split(' ').slice(1).join(' ')}`, // ADD () - it's a function!
      icon: 'account-edit',
      iconType: 'MaterialCommunityIcons',
      color: getProfileStatus().color,
      gradient: calculateProfileCompletion() >= 80 ? ['#10B981', '#059669'] : calculateProfileCompletion() >= 50 ? ['#F59E0B', '#D97706'] : ['#EF4444', '#DC2626'], // ADD () - it's a function!
      onPress: () => {
        animatePress(0);
        console.log('🔍 ProfileScreen - Edit profile button tapped');
        navigation.navigate('PatientProfileSetup');
      },
      showProgress: true,
    },
    {
      title: 'Informasi Pribadi',
      subtitle: 'Lihat dan edit informasi dasar',
      icon: 'person-outline',
      iconType: 'MaterialIcons',
      color: '#3B82F6',
      gradient: ['#3B82F6', '#1D4ED8'],
      onPress: () => {
        animatePress(1);
        Alert.alert('Info', 'Fitur ini akan segera tersedia');
      },
    },
    {
      title: 'Riwayat Medis',
      subtitle: 'Kelola riwayat kesehatan gigi',
      icon: 'medical-bag',
      iconType: 'MaterialCommunityIcons',
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#7C3AED'],
      onPress: () => {
        animatePress(2);
        Alert.alert('Info', 'Fitur ini akan segera tersedia');
      },
    },
    {
      title: 'Pengaturan',
      subtitle: 'Notifikasi, bahasa, dan preferensi',
      icon: 'settings',
      iconType: 'MaterialIcons',
      color: '#6B7280',
      gradient: ['#6B7280', '#4B5563'],
      onPress: () => {
        animatePress(3);
        Alert.alert('Info', 'Fitur ini akan segera tersedia');
      },
    },
  ];

  const renderProfileOption = (option, index) => (
    <Animated.View
      key={index}
      style={{
        transform: [{ scale: scaleAnims[index] }],
        marginBottom: 16,
      }}
    >
      <TouchableOpacity
        onPress={option.onPress}
        activeOpacity={0.7}
        style={{ borderRadius: 20, overflow: 'hidden', shadowColor: option.color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 }}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          style={{ padding: 20, flexDirection: 'row', alignItems: 'center' }}
        >
          <LinearGradient
            colors={option.gradient}
            style={{ width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}
          >
            {option.iconType === 'MaterialCommunityIcons' ? (
              <MaterialCommunityIcons name={option.icon} size={28} color="#FFFFFF" />
            ) : (
              <Icon name={option.icon} size={28} color="#FFFFFF" />
            )}
          </LinearGradient>
          
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 4 }}>
              {option.title}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: option.showProgress ? 8 : 0 }}>
              {option.subtitle}
            </Text>
            
            {option.showProgress && (
              <View style={{ backgroundColor: '#E5E7EB', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                <Animated.View
                  style={{
                    height: '100%',
                    borderRadius: 3,
                    backgroundColor: option.color,
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', `${calculateProfileCompletion()}%`] // ADD () - it's a function!
                    })
                  }}
                />
              </View>
            )}
          </View>
          
          <View style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevron-right" size={24} color="#8B5CF6" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <LinearGradient
        colors={['#8B5CF6', '#667EEA']}
        style={{ paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20 }}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => {
                console.log('🔍 ProfileScreen - Profile photo tapped, showing photo options');
                handleProfilePhotoChange();
              }}
              style={{ positison: 'relative' }}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F3F4F6']}
                style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginRight: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8, overflow: 'hidden' }}
              >
                {user?.profile?.profilePicture && 
                 !user.profile.profilePicture.includes('undefined') && 
                 !user.profile.profilePicture.includes('null') &&
                 user.profile.profilePicture.startsWith('http') ? (
                  <>
                    <Image
                      source={{ uri: user.profile.profilePicture }}
                      style={{ width: 80, height: 80, borderRadius: 40 }}
                      resizeMode="cover"
                      onError={(e) => {
                        console.log('🔍 ProfileScreen - Image load error:', e.nativeEvent.error);
                        console.log('🔍 ProfileScreen - Image URI:', user.profile.profilePicture);
                      }}
                      onLoad={() => {
                        console.log('🔍 ProfileScreen - Image loaded successfully:', user.profile.profilePicture);
                      }}
                    />
                  </>
                ) : (
                  <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#8B5CF6' }}>
                    {(user?.profile?.firstName?.[0] || user?.name?.[0] || 'P').toUpperCase()}
                  </Text>
                )}
              </LinearGradient>
              
              {/* Camera icon overlay */}
              <View style={{ 
                position: 'absolute', 
                bottom: -2, 
                right: 18, 
                backgroundColor: '#8B5CF6', 
                width: 28, 
                height: 28, 
                borderRadius: 14, 
                alignItems: 'center', 
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: '#FFFFFF'
              }}>
                <MaterialCommunityIcons name="camera" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 6 }}>
                {user?.profile?.firstName && user?.profile?.lastName 
                  ? `${user.profile.firstName} ${user.profile.lastName}`
                  : user?.name || 'Pasien'
                }
              </Text>
              <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>
                {user?.email}
              </Text>
              <View style={{ backgroundColor: getProfileStatus().bgColor, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, alignSelf: 'flex-start', marginBottom: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>
                  {getProfileStatus().text}
                </Text>
              </View>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', height: 4, borderRadius: 2, overflow: 'hidden' }}>
                <Animated.View
                  style={{
                    height: '100%',
                    borderRadius: 2,
                    backgroundColor: '#FFFFFF',
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', `${calculateProfileCompletion()}%`] // ADD () - it's a function!
                    })
                  }}
                />
              </View>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                Profil {calculateProfileCompletion()}% lengkap
              </Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView 
        style={{ flex: 1, marginTop: -20, borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: '#FFFFFF' }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 20, textAlign: 'center' }}>
            Kelola Profil Anda
          </Text>
          {profileOptions.map(renderProfileOption)}
          
          <TouchableOpacity
            onPress={handleLogout}
            style={{ marginTop: 20, backgroundColor: '#FEF2F2', borderRadius: 16, padding: 20, borderWidth: 2, borderColor: '#FECACA', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="logout" size={24} color="#EF4444" style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#EF4444' }}>
              Keluar
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
