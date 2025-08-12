import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  Animated as RNAnimated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';

import { setProfileComplete, updateUser } from '../../../store/slices/authSlice';
import profileService from '../../../services/profileService';
import authService from '../../../services/authService';

const PatientProfileSetupScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation references for progress and step transitions
  const progressAnim = new RNAnimated.Value(0);
  const scrollRef = useRef(null);
  
  const [profileData, setProfileData] = useState({
    // Personal Information - Initialize with existing user data
    firstName: user?.profile?.firstName || user?.firstName || '',
    lastName: user?.profile?.lastName || user?.lastName || '',
    phone: user?.profile?.phone || '',
    address: user?.profile?.address || '',
    dateOfBirth: user?.profile?.dateOfBirth || '',
    gender: '',
    bloodType: '',
    height: '',
    weight: '',
    
    // Dental Medical History
    previousDentalTreatments: user?.profile?.previousDentalWork || '',
    currentDentalProblems: '',
    lastDentalVisit: user?.profile?.lastDentalVisit || '',
    dentalConcerns: user?.profile?.dentalConcerns || '',
    
    // Allergies & Health
    allergies: user?.profile?.allergies || '',
    medications: user?.profile?.medications || '',
    medicalConditions: '',
    smokingStatus: user?.profile?.smokingStatus || '',
    alcoholConsumption: '',
    
    // Emergency Contact - Parse if exists
    emergencyContactName: user?.profile?.emergencyContact ? (() => {
      try {
        const contact = typeof user.profile.emergencyContact === 'string' 
          ? JSON.parse(user.profile.emergencyContact) 
          : user.profile.emergencyContact;
        return contact?.name || '';
      } catch {
        return user.profile.emergencyContact.split(' - ')[0] || '';
      }
    })() : '',
    emergencyContactPhone: user?.profile?.emergencyContact ? (() => {
      try {
        const contact = typeof user.profile.emergencyContact === 'string' 
          ? JSON.parse(user.profile.emergencyContact) 
          : user.profile.emergencyContact;
        return contact?.phone || '';
      } catch {
        return user.profile.emergencyContact.split(' - ')[1] || '';
      }
    })() : '',
    emergencyContactRelation: user?.profile?.emergencyContact ? (() => {
      try {
        const contact = typeof user.profile.emergencyContact === 'string' 
          ? JSON.parse(user.profile.emergencyContact) 
          : user.profile.emergencyContact;
        return contact?.relation || '';
      } catch {
        return '';
      }
    })() : '',
    
    // Dental Preferences
    preferredTreatmentTime: '',
    dentalAnxietyLevel: '',
    painTolerance: user?.profile?.painTolerance || '',
    insuranceProvider: user?.profile?.insuranceInfo ? (() => {
      try {
        const insurance = typeof user.profile.insuranceInfo === 'string' 
          ? JSON.parse(user.profile.insuranceInfo) 
          : user.profile.insuranceInfo;
        return insurance?.provider || '';
      } catch {
        return user.profile.insuranceInfo || '';
      }
    })() : '',
    insuranceNumber: user?.profile?.insuranceInfo ? (() => {
      try {
        const insurance = typeof user.profile.insuranceInfo === 'string' 
          ? JSON.parse(user.profile.insuranceInfo) 
          : user.profile.insuranceInfo;
        return insurance?.number || '';
      } catch {
        return '';
      }
    })() : '',
    

  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;



  // Update progress animation when step changes
  useEffect(() => {
    RNAnimated.timing(progressAnim, {
      toValue: currentStep / totalSteps,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  
  const renderStepIndicator = () => (
    <View style={{ alignItems: 'center', marginBottom: 32 }}>
      {/* Progress Bar */}
      <View style={{ 
        backgroundColor: 'rgba(139, 92, 246, 0.08)', 
        height: 6, 
        borderRadius: 8, 
        width: '100%', 
        overflow: 'hidden', 
        marginBottom: 24,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
      }}>
        <RNAnimated.View
          style={{
            height: '100%',
            borderRadius: 8,
            backgroundColor: '#8B5CF6',
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%']
            }),
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 3
          }}
        />
      </View>
      
      {/* Step Circles */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
        {[1, 2, 3, 4, 5].map((step) => (
          <View key={step} style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ 
              width: 44, 
              height: 44, 
              borderRadius: 22, 
              backgroundColor: step <= currentStep ? '#8B5CF6' : '#F3F4F6', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: 10,
              borderWidth: step <= currentStep ? 0 : 2,
              borderColor: step === currentStep ? '#8B5CF6' : '#E5E7EB',
              shadowColor: step <= currentStep ? '#8B5CF6' : '#000',
              shadowOffset: { width: 0, height: step <= currentStep ? 4 : 2 },
              shadowOpacity: step <= currentStep ? 0.3 : 0.1,
              shadowRadius: step <= currentStep ? 8 : 4,
              elevation: step <= currentStep ? 6 : 2
            }}>
              {step < currentStep ? (
                <MaterialCommunityIcons name="check" size={22} color="#FFFFFF" />
              ) : (
                <Text style={{ 
                  color: step <= currentStep ? '#FFFFFF' : step === currentStep ? '#8B5CF6' : '#9CA3AF', 
                  fontSize: 16, 
                  fontWeight: 'bold' 
                }}>{step}</Text>
              )}
            </View>
            <Text style={{ 
              fontSize: 12, 
              color: step <= currentStep ? '#8B5CF6' : '#9CA3AF', 
              fontWeight: '700', 
              textAlign: 'center',
              lineHeight: 16,
              letterSpacing: 0.3
            }}>
              {['Pribadi', 'Gigi', 'Kesehatan', 'Darurat', 'Preferensi'][step - 1]}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Current Step Title */}
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.08)']}
        style={{
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(139, 92, 246, 0.3)',
          shadowColor: '#8B5CF6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4
        }}
      >
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '800', 
          color: '#1F2937', 
          textAlign: 'center',
          letterSpacing: 0.8
        }}>
          Langkah {currentStep} dari {totalSteps}: {['Informasi Pribadi', 'Riwayat Gigi', 'Informasi Kesehatan', 'Kontak Darurat', 'Preferensi & Asuransi'][currentStep - 1]}
        </Text>
      </LinearGradient>
    </View>
  );

  const renderPersonalInfo = () => (
    <Animated.View
      entering={FadeInUp.delay(200).duration(600)}
      style={{ marginBottom: 24 }}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={{ borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}
      >
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <MaterialCommunityIcons name="account-circle" size={40} color="#8B5CF6" style={{ marginBottom: 8 }} />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 }}>Informasi Pribadi</Text>
          <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>Ceritakan tentang diri Anda</Text>
        </View>



        {/* Modern Input Fields */}
        <View style={{ gap: 20 }}>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Nama Depan *</Text>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: '#F9FAFB', 
                borderRadius: 16, 
                paddingHorizontal: 18, 
                paddingVertical: 16, 
                borderWidth: 2, 
                borderColor: profileData.firstName ? '#8B5CF6' : '#E5E7EB',
                shadowColor: profileData.firstName ? '#8B5CF6' : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: profileData.firstName ? 0.1 : 0.05,
                shadowRadius: 4,
                elevation: 2
              }}>
                <MaterialCommunityIcons name="account" size={20} color="#8B5CF6" style={{ marginRight: 12 }} />
                <TextInput placeholder="Masukkan nama depan" value={profileData.firstName} onChangeText={(value) => handleInputChange('firstName', value)} style={{ flex: 1, fontSize: 16, color: '#374151' }} placeholderTextColor="#9CA3AF" />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Nama Belakang *</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16, borderWidth: 2, borderColor: profileData.lastName ? '#8B5CF6' : '#E5E7EB', shadowColor: profileData.lastName ? '#8B5CF6' : '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: profileData.lastName ? 0.1 : 0.05, shadowRadius: 4, elevation: 2 }}>
                <MaterialCommunityIcons name="account" size={20} color="#8B5CF6" style={{ marginRight: 12 }} />
                <TextInput placeholder="Masukkan nama belakang" value={profileData.lastName} onChangeText={(value) => handleInputChange('lastName', value)} style={{ flex: 1, fontSize: 16, color: '#374151' }} placeholderTextColor="#9CA3AF" />
              </View>
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Nomor Telepon *</Text>
<View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16, borderWidth: 2, borderColor: profileData.phone ? '#8B5CF6' : '#E5E7EB', shadowColor: profileData.phone ? '#8B5CF6' : '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: profileData.phone ? 0.1 : 0.05, shadowRadius: 4, elevation: 2 }}>
              <MaterialCommunityIcons name="phone" size={20} color="#8B5CF6" style={{ marginRight: 12 }} />
              <TextInput placeholder="Masukkan nomor telepon" value={profileData.phone} onChangeText={(value) => handleInputChange('phone', value)} keyboardType="phone-pad" style={{ flex: 1, fontSize: 16, color: '#374151' }} placeholderTextColor="#9CA3AF" />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Alamat *</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F9FAFB', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16, borderWidth: 2, borderColor: profileData.address ? '#8B5CF6' : '#E5E7EB', shadowColor: profileData.address ? '#8B5CF6' : '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: profileData.address ? 0.1 : 0.05, shadowRadius: 4, elevation: 2 }}>
              <MaterialCommunityIcons name="home" size={20} color="#8B5CF6" style={{ marginRight: 12, marginTop: 2 }} />
              <TextInput placeholder="Masukkan alamat Anda" value={profileData.address} onChangeText={(value) => handleInputChange('address', value)} multiline numberOfLines={2} style={{ flex: 1, fontSize: 16, color: '#374151', textAlignVertical: 'top' }} placeholderTextColor="#9CA3AF" />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Tanggal Lahir *</Text>
<View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16, borderWidth: 2, borderColor: profileData.dateOfBirth ? '#8B5CF6' : '#E5E7EB', shadowColor: profileData.dateOfBirth ? '#8B5CF6' : '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: profileData.dateOfBirth ? 0.1 : 0.05, shadowRadius: 4, elevation: 2 }}>
              <MaterialCommunityIcons name="calendar" size={20} color="#8B5CF6" style={{ marginRight: 12 }} />
              <TextInput 
                placeholder="DD/MM/YYYY (contoh: 12/05/2000)" 
                value={profileData.dateOfBirth} 
                onChangeText={(value) => {
                  // Auto-format date as user types
                  let formatted = value.replace(/\D/g, ''); // Remove non-digits
                  if (formatted.length >= 2) {
                    formatted = formatted.substring(0, 2) + '/' + formatted.substring(2);
                  }
                  if (formatted.length >= 5) {
                    formatted = formatted.substring(0, 5) + '/' + formatted.substring(5, 9);
                  }
                  handleInputChange('dateOfBirth', formatted);
                }}
                maxLength={10}
                keyboardType="numeric"
                style={{ flex: 1, fontSize: 16, color: '#374151' }} 
                placeholderTextColor="#9CA3AF" 
              />
            </View>
            <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>Format: DD/MM/YYYY</Text>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Jenis Kelamin</Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              {['Pria', 'Wanita', 'Lainnya'].map((gender, index) => (
                <TouchableOpacity
                  key={gender}
                  onPress={() => handleInputChange('gender', ['Male', 'Female', 'Other'][index])}
                  style={{ 
                    flex: 1, 
                    paddingVertical: 16, 
                    paddingHorizontal: 18, 
                    borderRadius: 16, 
                    borderWidth: 2, 
                    borderColor: profileData.gender === ['Male', 'Female', 'Other'][index] ? '#8B5CF6' : '#E5E7EB', 
                    backgroundColor: profileData.gender === ['Male', 'Female', 'Other'][index] ? 'rgba(139, 92, 246, 0.1)' : '#FFFFFF', 
                    alignItems: 'center',
                    shadowColor: profileData.gender === ['Male', 'Female', 'Other'][index] ? '#8B5CF6' : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: profileData.gender === ['Male', 'Female', 'Other'][index] ? 0.1 : 0.05,
                    shadowRadius: 4,
                    elevation: 2
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: profileData.gender === ['Male', 'Female', 'Other'][index] ? '#8B5CF6' : '#6B7280', fontSize: 14, fontWeight: '600' }}>
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Tinggi Badan (cm)</Text>
<View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16, borderWidth: 2, borderColor: profileData.height ? '#8B5CF6' : '#E5E7EB', shadowColor: profileData.height ? '#8B5CF6' : '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: profileData.height ? 0.1 : 0.05, shadowRadius: 4, elevation: 2 }}>
                <MaterialCommunityIcons name="human-male-height" size={20} color="#8B5CF6" style={{ marginRight: 12 }} />
                <TextInput placeholder="170" value={profileData.height} onChangeText={(value) => handleInputChange('height', value)} keyboardType="numeric" style={{ flex: 1, fontSize: 16, color: '#374151' }} placeholderTextColor="#9CA3AF" />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Berat Badan (kg)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16, borderWidth: 2, borderColor: profileData.weight ? '#8B5CF6' : '#E5E7EB', shadowColor: profileData.weight ? '#8B5CF6' : '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: profileData.weight ? 0.1 : 0.05, shadowRadius: 4, elevation: 2 }}>
                <MaterialCommunityIcons name="weight" size={20} color="#8B5CF6" style={{ marginRight: 12 }} />
                <TextInput placeholder="70" value={profileData.weight} onChangeText={(value) => handleInputChange('weight', value)} keyboardType="numeric" style={{ flex: 1, fontSize: 16, color: '#374151' }} placeholderTextColor="#9CA3AF" />
              </View>
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Golongan Darah</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16, borderWidth: 2, borderColor: profileData.bloodType ? '#8B5CF6' : '#E5E7EB', shadowColor: profileData.bloodType ? '#8B5CF6' : '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: profileData.bloodType ? 0.1 : 0.05, shadowRadius: 4, elevation: 2 }}>
              <MaterialCommunityIcons name="water" size={20} color="#8B5CF6" style={{ marginRight: 12 }} />
              <TextInput placeholder="A+, B-, O+, dst." value={profileData.bloodType} onChangeText={(value) => handleInputChange('bloodType', value)} style={{ flex: 1, fontSize: 16, color: '#374151' }} placeholderTextColor="#9CA3AF" />
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderDentalHistory = () => (
    <Animated.View
      entering={FadeInRight.delay(200).duration(600)}
      style={{ marginBottom: 24 }}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={{ borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}
      >
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <MaterialCommunityIcons name="tooth" size={40} color="#8B5CF6" style={{ marginBottom: 8 }} />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 }}>Riwayat Gigi</Text>
          <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>Ceritakan tentang riwayat perawatan gigi Anda</Text>
        </View>

        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Kunjungan Terakhir ke Dokter Gigi</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: profileData.lastDentalVisit ? '#8B5CF6' : '#E5E7EB' }}>
              <MaterialCommunityIcons name="calendar" size={20} color="#8B5CF6" style={{ marginRight: 12 }} />
              <TextInput 
                placeholder="MM/YYYY (contoh: 02/2020)" 
                value={profileData.lastDentalVisit} 
                onChangeText={(value) => {
                  // Auto-format date as user types for MM/YYYY
                  let formatted = value.replace(/\D/g, ''); // Remove non-digits
                  if (formatted.length >= 2) {
                    formatted = formatted.substring(0, 2) + '/' + formatted.substring(2, 6);
                  }
                  handleInputChange('lastDentalVisit', formatted);
                }}
                maxLength={7}
                keyboardType="numeric"
                style={{ flex: 1, fontSize: 16, color: '#374151' }} 
                placeholderTextColor="#9CA3AF" 
              />
            </View>
            <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>Format: MM/YYYY (bulan/tahun)</Text>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Masalah Gigi Saat Ini</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: profileData.currentDentalProblems ? '#8B5CF6' : '#E5E7EB' }}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#F59E0B" style={{ marginRight: 12, marginTop: 2 }} />
              <TextInput placeholder="Jelaskan masalah gigi yang sedang dialami" value={profileData.currentDentalProblems} onChangeText={(value) => handleInputChange('currentDentalProblems', value)} multiline numberOfLines={3} style={{ flex: 1, fontSize: 16, color: '#374151', textAlignVertical: 'top' }} placeholderTextColor="#9CA3AF" />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Riwayat Perawatan Gigi Sebelumnya</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: profileData.previousDentalTreatments ? '#8B5CF6' : '#E5E7EB' }}>
              <MaterialCommunityIcons name="history" size={20} color="#8B5CF6" style={{ marginRight: 12, marginTop: 2 }} />
              <TextInput placeholder="Daftar perawatan sebelumnya, operasi, dll." value={profileData.previousDentalTreatments} onChangeText={(value) => handleInputChange('previousDentalTreatments', value)} multiline numberOfLines={3} style={{ flex: 1, fontSize: 16, color: '#374151', textAlignVertical: 'top' }} placeholderTextColor="#9CA3AF" />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Keluhan Utama Gigi</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: profileData.dentalConcerns ? '#8B5CF6' : '#E5E7EB' }}>
              <MaterialCommunityIcons name="comment-question" size={20} color="#8B5CF6" style={{ marginRight: 12, marginTop: 2 }} />
              <TextInput placeholder="Apa yang membawa Anda ke dokter gigi?" value={profileData.dentalConcerns} onChangeText={(value) => handleInputChange('dentalConcerns', value)} multiline numberOfLines={2} style={{ flex: 1, fontSize: 16, color: '#374151', textAlignVertical: 'top' }} placeholderTextColor="#9CA3AF" />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Tingkat Kecemasan Perawatan Gigi</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['Rendah', 'Sedang', 'Tinggi', 'Sangat Tinggi'].map((level, index) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => handleInputChange('dentalAnxietyLevel', ['Low', 'Medium', 'High', 'Severe'][index])}
                  style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, borderColor: profileData.dentalAnxietyLevel === ['Low', 'Medium', 'High', 'Severe'][index] ? '#8B5CF6' : '#E5E7EB', backgroundColor: profileData.dentalAnxietyLevel === ['Low', 'Medium', 'High', 'Severe'][index] ? 'rgba(139, 92, 246, 0.1)' : '#FFFFFF', alignItems: 'center' }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: profileData.dentalAnxietyLevel === ['Low', 'Medium', 'High', 'Severe'][index] ? '#8B5CF6' : '#6B7280', fontSize: 14, fontWeight: '600' }}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderHealthInfo = () => (
    <Animated.View
      entering={FadeInRight.delay(200).duration(600)}
      style={{ marginBottom: 24 }}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={{ borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}
      >
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <MaterialCommunityIcons name="heart-pulse" size={40} color="#EF4444" style={{ marginBottom: 8 }} />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 }}>Informasi Kesehatan</Text>
          <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>Riwayat medis dan detail kesehatan Anda</Text>
        </View>

        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Alergi yang Diketahui</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: profileData.allergies ? '#EF4444' : '#E5E7EB' }}>
              <MaterialCommunityIcons name="alert" size={20} color="#EF4444" style={{ marginRight: 12, marginTop: 2 }} />
              <TextInput placeholder="Obat-obatan, bahan, makanan, dll." value={profileData.allergies} onChangeText={(value) => handleInputChange('allergies', value)} multiline numberOfLines={3} style={{ flex: 1, fontSize: 16, color: '#374151', textAlignVertical: 'top' }} placeholderTextColor="#9CA3AF" />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Obat yang Sedang Dikonsumsi</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: profileData.medications ? '#10B981' : '#E5E7EB' }}>
              <MaterialCommunityIcons name="pill" size={20} color="#10B981" style={{ marginRight: 12, marginTop: 2 }} />
              <TextInput placeholder="Daftar semua obat yang sedang dikonsumsi" value={profileData.medications} onChangeText={(value) => handleInputChange('medications', value)} multiline numberOfLines={2} style={{ flex: 1, fontSize: 16, color: '#374151', textAlignVertical: 'top' }} placeholderTextColor="#9CA3AF" />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Kondisi Medis</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: profileData.medicalConditions ? '#F59E0B' : '#E5E7EB' }}>
              <MaterialCommunityIcons name="hospital" size={20} color="#F59E0B" style={{ marginRight: 12, marginTop: 2 }} />
              <TextInput placeholder="Diabetes, penyakit jantung, hipertensi, dll." value={profileData.medicalConditions} onChangeText={(value) => handleInputChange('medicalConditions', value)} multiline numberOfLines={3} style={{ flex: 1, fontSize: 16, color: '#374151', textAlignVertical: 'top' }} placeholderTextColor="#9CA3AF" />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Status Merokok</Text>
              <View style={{ gap: 8 }}>
                {['Tidak Pernah', 'Dulu', 'Saat Ini'].map((status, index) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => handleInputChange('smokingStatus', ['Never', 'Former', 'Current'][index])}
                    style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, borderColor: profileData.smokingStatus === ['Never', 'Former', 'Current'][index] ? '#8B5CF6' : '#E5E7EB', backgroundColor: profileData.smokingStatus === ['Never', 'Former', 'Current'][index] ? 'rgba(139, 92, 246, 0.1)' : '#FFFFFF', alignItems: 'center' }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: profileData.smokingStatus === ['Never', 'Former', 'Current'][index] ? '#8B5CF6' : '#6B7280', fontSize: 12, fontWeight: '600' }}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Konsumsi Alkohol</Text>
              <View style={{ gap: 8 }}>
                {['Tidak Pernah', 'Jarang', 'Mingguan', 'Harian'].map((frequency, index) => (
                  <TouchableOpacity
                    key={frequency}
                    onPress={() => handleInputChange('alcoholConsumption', ['Never', 'Rarely', 'Weekly', 'Daily'][index])}
                    style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, borderColor: profileData.alcoholConsumption === ['Never', 'Rarely', 'Weekly', 'Daily'][index] ? '#8B5CF6' : '#E5E7EB', backgroundColor: profileData.alcoholConsumption === ['Never', 'Rarely', 'Weekly', 'Daily'][index] ? 'rgba(139, 92, 246, 0.1)' : '#FFFFFF', alignItems: 'center' }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: profileData.alcoholConsumption === ['Never', 'Rarely', 'Weekly', 'Daily'][index] ? '#8B5CF6' : '#6B7280', fontSize: 12, fontWeight: '600' }}>
                      {frequency}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderEmergencyContact = () => (
    <Animated.View
      entering={FadeInRight.delay(200).duration(600)}
      style={{ marginBottom: 24 }}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={{ borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}
      >
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <MaterialCommunityIcons name="account-group" size={40} color="#F59E0B" style={{ marginBottom: 8 }} />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 }}>Kontak Darurat</Text>
          <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>Seseorang yang dapat kami hubungi dalam keadaan darurat</Text>
        </View>

        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Nama Kontak *</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: profileData.emergencyContactName ? '#F59E0B' : '#E5E7EB' }}>
              <MaterialCommunityIcons name="account" size={20} color="#F59E0B" style={{ marginRight: 12 }} />
              <TextInput placeholder="Nama lengkap kontak darurat" value={profileData.emergencyContactName} onChangeText={(value) => handleInputChange('emergencyContactName', value)} style={{ flex: 1, fontSize: 16, color: '#374151' }} placeholderTextColor="#9CA3AF" />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Nomor Telepon *</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: profileData.emergencyContactPhone ? '#F59E0B' : '#E5E7EB' }}>
              <MaterialCommunityIcons name="phone" size={20} color="#F59E0B" style={{ marginRight: 12 }} />
              <TextInput placeholder="Nomor telepon kontak darurat" value={profileData.emergencyContactPhone} onChangeText={(value) => handleInputChange('emergencyContactPhone', value)} keyboardType="phone-pad" style={{ flex: 1, fontSize: 16, color: '#374151' }} placeholderTextColor="#9CA3AF" />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Hubungan</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: profileData.emergencyContactRelation ? '#F59E0B' : '#E5E7EB' }}>
              <MaterialCommunityIcons name="heart" size={20} color="#F59E0B" style={{ marginRight: 12 }} />
              <TextInput placeholder="Suami/istri, orang tua, saudara, teman, dll." value={profileData.emergencyContactRelation} onChangeText={(value) => handleInputChange('emergencyContactRelation', value)} style={{ flex: 1, fontSize: 16, color: '#374151' }} placeholderTextColor="#9CA3AF" />
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderPreferences = () => (
    <Animated.View
      entering={FadeInRight.delay(200).duration(600)}
      style={{ marginBottom: 24 }}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={{ borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}
      >
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <MaterialCommunityIcons name="cog" size={40} color="#10B981" style={{ marginBottom: 8 }} />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 }}>Preferensi & Asuransi</Text>
          <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>Preferensi perawatan dan informasi asuransi Anda</Text>
        </View>

        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 }}>Waktu Perawatan yang Disukai</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {['Pagi', 'Siang', 'Sore', 'Akhir Pekan'].map((time, index) => (
                <TouchableOpacity
                  key={time}
                  onPress={() => handleInputChange('preferredTreatmentTime', ['Morning', 'Afternoon', 'Evening', 'Weekend'][index])}
                  style={{ paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, borderWidth: 2, borderColor: profileData.preferredTreatmentTime === ['Morning', 'Afternoon', 'Evening', 'Weekend'][index] ? '#10B981' : '#E5E7EB', backgroundColor: profileData.preferredTreatmentTime === ['Morning', 'Afternoon', 'Evening', 'Weekend'][index] ? 'rgba(16, 185, 129, 0.1)' : '#FFFFFF' }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: profileData.preferredTreatmentTime === ['Morning', 'Afternoon', 'Evening', 'Weekend'][index] ? '#10B981' : '#6B7280', fontSize: 14, fontWeight: '600' }}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Penyedia Asuransi</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: profileData.insuranceProvider ? '#10B981' : '#E5E7EB' }}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#10B981" style={{ marginRight: 12 }} />
              <TextInput placeholder="Nama perusahaan asuransi Anda" value={profileData.insuranceProvider} onChangeText={(value) => handleInputChange('insuranceProvider', value)} style={{ flex: 1, fontSize: 16, color: '#374151' }} placeholderTextColor="#9CA3AF" />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Nomor Polis Asuransi</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: profileData.insuranceNumber ? '#10B981' : '#E5E7EB' }}>
              <MaterialCommunityIcons name="card-account-details" size={20} color="#10B981" style={{ marginRight: 12 }} />
              <TextInput placeholder="Nomor polis asuransi Anda" value={profileData.insuranceNumber} onChangeText={(value) => handleInputChange('insuranceNumber', value)} style={{ flex: 1, fontSize: 16, color: '#374151' }} placeholderTextColor="#9CA3AF" />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Tingkat Toleransi Nyeri</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['Rendah', 'Sedang', 'Tinggi'].map((tolerance, index) => (
                <TouchableOpacity
                  key={tolerance}
                  onPress={() => handleInputChange('painTolerance', ['Low', 'Medium', 'High'][index])}
                  style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, borderColor: profileData.painTolerance === ['Low', 'Medium', 'High'][index] ? '#10B981' : '#E5E7EB', backgroundColor: profileData.painTolerance === ['Low', 'Medium', 'High'][index] ? 'rgba(16, 185, 129, 0.1)' : '#FFFFFF', alignItems: 'center' }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: profileData.painTolerance === ['Low', 'Medium', 'High'][index] ? '#10B981' : '#6B7280', fontSize: 14, fontWeight: '600' }}>
                    {tolerance}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      // Scroll to top when moving to next step
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Scroll to top when moving to previous step
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate required fields
      const requiredFields = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        address: profileData.address,
        dateOfBirth: profileData.dateOfBirth,
        emergencyContactName: profileData.emergencyContactName,
        emergencyContactPhone: profileData.emergencyContactPhone,
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value || value.trim() === '')
        .map(([key]) => key);

      if (missingFields.length > 0) {
        Alert.alert(
          'Data Tidak Lengkap', 
          'Mohon lengkapi semua field yang wajib diisi: ' + missingFields.join(', ')
        );
        return;
      }

      // Validate date format
      const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!datePattern.test(profileData.dateOfBirth)) {
        Alert.alert(
          'Format Tanggal Salah',
          'Mohon masukkan tanggal lahir dengan format DD/MM/YYYY (contoh: 12/05/2000)'
        );
        return;
      }

      // Validate date is valid
      const [day, month, year] = profileData.dateOfBirth.split('/').map(Number);
      const birthDate = new Date(year, month - 1, day);
      if (birthDate.getDate() !== day || birthDate.getMonth() !== month - 1 || birthDate.getFullYear() !== year) {
        Alert.alert(
          'Tanggal Tidak Valid',
          'Mohon masukkan tanggal lahir yang valid'
        );
        return;
      }

      // Check if age is reasonable (between 1 and 120 years old)
      const today = new Date();
      const age = today.getFullYear() - year;
      if (age < 1 || age > 120) {
        Alert.alert(
          'Tanggal Lahir Tidak Valid',
          'Mohon masukkan tanggal lahir yang valid (umur antara 1-120 tahun)'
        );
        return;
      }

      // Validate last dental visit format if provided
      if (profileData.lastDentalVisit && profileData.lastDentalVisit.trim() !== '') {
        const lastVisitPattern = /^\d{2}\/\d{4}$/;
        if (!lastVisitPattern.test(profileData.lastDentalVisit)) {
          Alert.alert(
            'Format Tanggal Kunjungan Salah',
            'Mohon masukkan tanggal kunjungan terakhir dengan format MM/YYYY (contoh: 02/2020)'
          );
          return;
        }

        // Validate the month/year is reasonable
        const [visitMonth, visitYear] = profileData.lastDentalVisit.split('/').map(Number);
        if (visitMonth < 1 || visitMonth > 12) {
          Alert.alert(
            'Bulan Tidak Valid',
            'Mohon masukkan bulan yang valid (01-12)'
          );
          return;
        }

        if (visitYear < 1900 || visitYear > today.getFullYear()) {
          Alert.alert(
            'Tahun Tidak Valid',
            'Mohon masukkan tahun yang valid'
          );
          return;
        }
      }



      // Convert date format from DD/MM/YYYY to YYYY-MM-DD for backend
      const formatDateForBackend = (dateStr) => {
        if (!dateStr) return null;
        
        // If date is in DD/MM/YYYY format, convert to YYYY-MM-DD
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        
        return dateStr; // Return as-is if not in expected format
      };

      // Convert MM/YYYY format to proper date for backend
      const formatMonthYearForBackend = (dateStr) => {
        if (!dateStr || dateStr.trim() === '') return null;
        
        // If date is in MM/YYYY format, convert to YYYY-MM-01 (first day of month)
        const parts = dateStr.split('/');
        if (parts.length === 2) {
          const [month, year] = parts;
          return `${year}-${month.padStart(2, '0')}-01`;
        }
        
        return dateStr; // Return as-is if not in expected format
      };

      // Prepare profile data for API
      const apiProfileData = {
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        dateOfBirth: formatDateForBackend(profileData.dateOfBirth),
        phone: profileData.phone.trim(),
        address: profileData.address.trim(),
        emergencyContact: JSON.stringify({
          name: profileData.emergencyContactName.trim(),
          phone: profileData.emergencyContactPhone.trim(),
          relation: profileData.emergencyContactRelation || '',
        }),
        
        // Medical information
        allergies: profileData.allergies || '',
        medications: profileData.medications || '',
        medicalHistory: JSON.stringify({
          conditions: profileData.medicalConditions || '',
          smokingStatus: profileData.smokingStatus || '',
          alcoholConsumption: profileData.alcoholConsumption || '',
        }),
        insuranceInfo: JSON.stringify({
          provider: profileData.insuranceProvider || '',
          number: profileData.insuranceNumber || '',
        }),
        painTolerance: profileData.painTolerance || '',
        preferredLanguage: 'id', // Default to Indonesian
        dietaryRestrictions: '', // Can be added later
        smokingStatus: profileData.smokingStatus || '',
        
        // Dental specific
        dentalConcerns: profileData.dentalConcerns || '',
        previousDentalWork: profileData.previousDentalTreatments || '',
        lastDentalVisit: formatMonthYearForBackend(profileData.lastDentalVisit),
        
        // App-specific
        profilePicture: null,
      };


      console.log('Submitting profile data:', apiProfileData);

      // Submit profile to backend
      const response = await profileService.setupPatientProfile(apiProfileData);

      console.log('Profile submission response:', response);

      if (response.success) {
        console.log('🔍 Backend response data:', JSON.stringify(response.data, null, 2));
        
        // Get the actual profile data from response
        const newProfileData = response.data.data?.profile || response.data.profile;
        console.log('🔍 New profile data:', JSON.stringify(newProfileData, null, 2));
        
        // Create updated user object with complete profile data
        const updatedUser = {
          ...user,
          profileComplete: true,
          profile: {
            ...newProfileData, // Use complete backend data
            profileComplete: true
          }
        };

        console.log('🔍 Before Redux update - Current user:', JSON.stringify(user, null, 2));
        console.log('🔍 Updated user object:', JSON.stringify(updatedUser, null, 2));

        // Update Redux state with complete data
        dispatch(updateUser(updatedUser));
        dispatch(setProfileComplete(true));

        console.log('🔍 Redux actions dispatched - Profile Complete: true');

        // Persist updated user data to AsyncStorage
        try {
          await authService.storeUserData(updatedUser);
          console.log('✅ User data persisted to AsyncStorage');
          
          // Verify what was stored
          const storedData = await authService.getUserData();
          console.log('🔍 Verified stored data:', JSON.stringify(storedData, null, 2));
        } catch (storageError) {
          console.error('❌ Failed to persist user data:', storageError);
        }

        Alert.alert(
          'Berhasil!', 
          'Profil gigi Anda telah berhasil dibuat!',
          [
            {
              text: 'Selesai',
              onPress: () => {
                console.log('🔍 Profile completed, navigating to Profile tab');
                // Navigate back to the main app and focus on Profile tab
                navigation.reset({
                  index: 0,
                  routes: [{ 
                    name: 'PatientTabs',
                    state: {
                      routes: [
                        { name: 'PatientDashboard' },
                        { name: 'Messages' },
                        { name: 'PatientCamera' },
                        { name: 'PatientAppointments' },
                        { name: 'PatientProfile' }
                      ],
                      index: 4 // Focus on Profile tab (0-indexed)
                    }
                  }],
                });
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        console.error('Profile submission failed:', response);
        Alert.alert(
          'Error', 
          response.message || 'Gagal menyimpan profil. Silakan coba lagi.',
          response.errors ? [{ text: 'OK' }] : undefined
        );
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      Alert.alert('Error', 'Kesalahan jaringan. Periksa koneksi Anda dan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderDentalHistory();
      case 3:
        return renderHealthInfo();
      case 4:
        return renderEmergencyContact();
      case 5:
        return renderPreferences();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Modern Beautiful Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: Platform.OS === 'ios' ? 60 : 40,
          paddingBottom: 40,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          shadowColor: '#667eea',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 15
        }}
      >
        <Animated.View
          entering={FadeInUp.delay(100).duration(800)}
          style={{ alignItems: 'center' }}
        >
          {/* Profile Icon with Glow Effect */}
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
            borderWidth: 3,
            borderColor: 'rgba(255, 255, 255, 0.4)',
            shadowColor: '#FFFFFF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 15,
            elevation: 10
          }}>
            <MaterialCommunityIcons name="account-circle" size={45} color="#FFFFFF" />
          </View>
          
          {/* Modern Typography */}
          <Text style={{
            fontSize: 28,
            fontWeight: '800',
            color: '#FFFFFF',
            textAlign: 'center',
            marginBottom: 8,
            letterSpacing: 0.5,
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4
          }}>
            Lengkapi Profil Anda
          </Text>
          
          <Text style={{
            fontSize: 16,
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
            lineHeight: 24,
            paddingHorizontal: 20,
            fontWeight: '500',
            textShadowColor: 'rgba(0, 0, 0, 0.2)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2
          }}>
            Bantu kami memberikan perawatan terbaik dengan melengkapi informasi Anda
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* Content Area */}
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1 }}
        >
          <View style={{
            flex: 1,
            paddingTop: 30,
            paddingHorizontal: 24,
            backgroundColor: '#F8FAFC'
          }}>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Current Step Content */}
          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, marginBottom: 40, gap: 16 }}>
            {currentStep > 1 && (
              <TouchableOpacity
                onPress={handlePrevious}
                style={{ 
                  flex: 1, 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  paddingVertical: 18, 
                  paddingHorizontal: 28, 
                  borderRadius: 16, 
                  borderWidth: 2, 
                  borderColor: '#8B5CF6', 
                  backgroundColor: '#FFFFFF',
                  shadowColor: '#8B5CF6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="arrow-left" size={20} color="#8B5CF6" style={{ marginRight: 8 }} />
                <Text style={{ color: '#8B5CF6', fontSize: 16, fontWeight: '700' }}>Sebelumnya</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleNext}
              disabled={isSubmitting}
              style={{ flex: currentStep === 1 ? 1 : 1, opacity: isSubmitting ? 0.7 : 1 }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  paddingVertical: 18, 
                  paddingHorizontal: 28, 
                  borderRadius: 16,
                  shadowColor: '#8B5CF6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6
                }}
              >
                {isSubmitting ? (
                  <MaterialCommunityIcons name="loading" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                ) : currentStep === totalSteps ? (
                  <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                ) : (
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                )}
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                  {isSubmitting ? 'Menyimpan...' : currentStep === totalSteps ? 'Lengkapi Profil' : 'Selanjutnya'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default PatientProfileSetupScreen;
