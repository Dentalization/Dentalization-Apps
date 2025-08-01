import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../../components/common/ThemeProvider';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import { updateUser, setProfileComplete } from '../../../store/slices/authSlice';
import profileService from '../../../services/profileService';

const { width } = Dimensions.get('window');

const DoctorProfileSetupScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
  const [profileData, setProfileData] = useState({
    // Professional Information
    medicalLicense: '',
    licenseNumber: '',
    licenseExpiry: '',
    dentalSchool: '',
    graduationYear: '',
    
    // Specializations
    specializations: [],
    yearsOfExperience: '',
    
    // Clinic Information
    clinicName: '',
    clinicAddress: '',
    clinicPhone: '',
    clinicEmail: '',
    
    // Schedule & Availability
    workingDays: [],
    workingHours: {
      start: '',
      end: '',
    },
    consultationFee: '',
    
    // Professional Documents
    profilePhoto: null,
    licenseDocument: null,
    diplomaCertificate: null,
    specialistCertificates: [],
    
    // Services Offered
    dentalServices: [],
    treatmentTypes: [],
    
    // Professional Bio
    biography: '',
    languagesSpoken: [],
    
    // Insurance & Payment
    acceptedInsurance: [],
    paymentMethods: [],
    
    // Contact & Social
    website: '',
    socialMedia: {
      instagram: '',
      facebook: '',
      linkedin: '',
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  useEffect(() => {
    // Animate content when step changes
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const dentalSpecializations = [
    'General Dentistry',
    'Orthodontics',
    'Periodontics',
    'Endodontics',
    'Oral Surgery',
    'Prosthodontics',
    'Pediatric Dentistry',
    'Oral Pathology',
    'Dental Implants',
    'Cosmetic Dentistry',
    'Oral Medicine',
  ];

  const dentalServices = [
    'Routine Cleaning',
    'Dental Filling',
    'Root Canal Treatment',
    'Tooth Extraction',
    'Dental Crowns',
    'Dental Bridges',
    'Teeth Whitening',
    'Dental Implants',
    'Orthodontic Braces',
    'Invisalign',
    'Periodontal Treatment',
    'Emergency Dental Care',
    'Oral Surgery',
    'Dental Veneers',
    'Dentures',
  ];

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleImagePicker = (type) => {
    Alert.alert(
      'Select Document',
      'Choose how you would like to upload this document',
      [
        { text: 'Camera', onPress: () => openCamera(type) },
        { text: 'Photo Library', onPress: () => openImageLibrary(type) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = (type) => {
    const options = {
      mediaType: 'photo',
      quality: 0.9,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchCamera(options, (response) => {
      if (response.assets && response.assets[0]) {
        setProfileData(prev => ({
          ...prev,
          [type]: response.assets[0]
        }));
      }
    });
  };

  const openImageLibrary = (type) => {
    const options = {
      mediaType: 'photo',
      quality: 0.9,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        setProfileData(prev => ({
          ...prev,
          [type]: response.assets[0]
        }));
      }
    });
  };

  const renderStepIndicator = () => {
    const stepTitles = ['Personal Info', 'Practice Details', 'Documents'];
    
    return (
      <View style={{ paddingVertical: 24, paddingHorizontal: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
          {[1, 2, 3].map((step, index) => (
            <View key={step} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Animated.View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: step <= currentStep ? theme.colors.primary : '#F5F5F5',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: step <= currentStep ? theme.colors.primary : '#E0E0E0',
                shadowColor: step <= currentStep ? theme.colors.primary : '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: step <= currentStep ? 0.25 : 0.05,
                shadowRadius: 6,
                elevation: step <= currentStep ? 5 : 2,
                transform: [{ scale: step === currentStep ? 1.1 : 1 }],
              }}>
                {step < currentStep ? (
                  <MaterialCommunityIcons name="check" size={24} color="#FFFFFF" />
                ) : step === currentStep ? (
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFFFFF' }} />
                ) : (
                  <Text style={{ color: '#A0A0A0', fontSize: 18, fontWeight: '600' }}>
                    {step}
                  </Text>
                )}
              </Animated.View>
              {index < 2 && (
                <View style={{ width: 60, height: 3, backgroundColor: step < currentStep ? theme.colors.primary : '#E8E8E8', marginHorizontal: 12, borderRadius: 2 }} />
              )}
            </View>
          ))}
        </View>
        
        {/* Step Title */}
        <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 4 }}>
          {stepTitles[currentStep - 1]}
        </Text>
        
        <Text style={{ textAlign: 'center', fontSize: 14, color: theme.colors.textSecondary }}>
          Step {currentStep} of 3
        </Text>
      </View>
    );
  };

  const renderProfessionalInfo = () => (
    <Card>
      <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 16 }}>
        Professional Information
      </Text>

      {/* Profile Photo */}
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <TouchableOpacity
          onPress={() => handleImagePicker('profilePhoto')}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: profileData.profilePhoto ? 'transparent' : '#F8F9FA',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: profileData.profilePhoto ? 0 : 3,
            borderColor: theme.colors.primary,
            borderStyle: profileData.profilePhoto ? 'solid' : 'dashed',
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            position: 'relative',
          }}
        >
          {profileData.profilePhoto ? (
            <>
              <Image
                source={{ uri: profileData.profilePhoto.uri }}
                style={{ width: 120, height: 120, borderRadius: 60 }}
              />
              <View style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: '#FFFFFF',
              }}>
                <Icon name="edit" size={16} color="#FFFFFF" />
              </View>
            </>
          ) : (
            <>
              <LinearGradient
                colors={[`${theme.colors.primary}20`, `${theme.colors.primary}10`]}
                style={{ width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}
              >
                <Icon name="add-a-photo" size={28} color={theme.colors.primary} />
              </LinearGradient>
            </>
          )}
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, textAlign: 'center', marginBottom: 4 }}>
          Professional Profile Photo
        </Text>
        <Text style={{ fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center' }}>
          {profileData.profilePhoto ? 'Tap to change photo' : 'Tap to upload your professional photo'}
        </Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 8 }}>
          Medical License Number *
        </Text>
        <View style={{ borderWidth: 2, borderColor: profileData.licenseNumber ? theme.colors.primary : '#E8E8E8', borderRadius: 12, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
          <TextInput
            style={{ padding: 16, fontSize: 16, color: theme.colors.text }}
            value={profileData.licenseNumber}
            onChangeText={(value) => handleInputChange('licenseNumber', value)}
            placeholder="Enter your medical license number"
            placeholderTextColor="#A0A0A0"
          />
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.text,
          marginBottom: 8,
        }}>
          License Expiry Date
        </Text>
        <View style={{
          borderWidth: 2,
          borderColor: profileData.licenseExpiry ? theme.colors.primary : '#E8E8E8',
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}>
          <TextInput
            style={{ padding: 16, fontSize: 16, color: theme.colors.text }}
            value={profileData.licenseExpiry}
            onChangeText={(value) => handleInputChange('licenseExpiry', value)}
            placeholder="MM/YYYY"
            placeholderTextColor="#A0A0A0"
          />
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.text,
          marginBottom: 8,
        }}>
          Dental School/University *
        </Text>
        <View style={{
          borderWidth: 2,
          borderColor: profileData.dentalSchool ? theme.colors.primary : '#E8E8E8',
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}>
          <TextInput
            style={{ padding: 16, fontSize: 16, color: theme.colors.text }}
            value={profileData.dentalSchool}
            onChangeText={(value) => handleInputChange('dentalSchool', value)}
            placeholder="Enter your dental school"
            placeholderTextColor="#A0A0A0"
          />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 8 }}>
            Graduation Year
          </Text>
          <View style={{
            borderWidth: 2,
            borderColor: profileData.graduationYear ? theme.colors.primary : '#E8E8E8',
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <TextInput
              style={{ padding: 16, fontSize: 16, color: theme.colors.text }}
              value={profileData.graduationYear}
              onChangeText={(value) => handleInputChange('graduationYear', value)}
              placeholder="YYYY"
              placeholderTextColor="#A0A0A0"
              keyboardType="numeric"
            />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 8,
          }}>
            Years of Experience *
          </Text>
          <View style={{
            borderWidth: 2,
            borderColor: profileData.yearsOfExperience ? theme.colors.primary : '#E8E8E8',
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <TextInput
              style={{ padding: 16, fontSize: 16, color: theme.colors.text }}
              value={profileData.yearsOfExperience}
              onChangeText={(value) => handleInputChange('yearsOfExperience', value)}
              placeholder="Years"
              placeholderTextColor="#A0A0A0"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
    </Card>
  );

  const renderSpecializations = () => (
    <Card>
      <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 16 }}>
        Dental Specializations
      </Text>

      <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginBottom: 12 }}>
        Select your areas of specialization:
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {dentalSpecializations.map((specialization) => (
          <TouchableOpacity
            key={specialization}
            onPress={() => handleArrayToggle('specializations', specialization)}
            style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: profileData.specializations.includes(specialization) ? theme.colors.primary : '#E5E5E5', backgroundColor: profileData.specializations.includes(specialization) ? `${theme.colors.primary}10` : '#FFFFFF' }}
          >
            <Text style={{ color: profileData.specializations.includes(specialization) ? theme.colors.primary : theme.colors.textSecondary, fontSize: 12, fontWeight: '500' }}>
              {specialization}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        placeholder="Professional Biography"
        value={profileData.biography}
        onChangeText={(value) => handleInputChange('biography', value)}
        multiline
        numberOfLines={4}
        leftIcon="info"
        style={{ marginTop: 16 }}
      />
    </Card>
  );

  const renderClinicInfo = () => (
    <Card>
      <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 16 }}>
        Clinic Information
      </Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 8 }}>
          Clinic/Practice Name *
        </Text>
        <View style={{ borderWidth: 2, borderColor: profileData.clinicName ? theme.colors.primary : '#E8E8E8', borderRadius: 12, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
          <TextInput
            style={{
              padding: 16,
              fontSize: 16,
              color: theme.colors.text,
            }}
            value={profileData.clinicName}
            onChangeText={(value) => handleInputChange('clinicName', value)}
            placeholder="Enter clinic/practice name"
            placeholderTextColor="#A0A0A0"
          />
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 8 }}>
          Clinic Address *
        </Text>
        <View style={{ borderWidth: 2, borderColor: profileData.clinicAddress ? theme.colors.primary : '#E8E8E8', borderRadius: 12, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
          <TextInput
            style={{ padding: 16, fontSize: 16, color: theme.colors.text, minHeight: 80 }}
            value={profileData.clinicAddress}
            onChangeText={(value) => handleInputChange('clinicAddress', value)}
            placeholder="Enter complete clinic address"
            placeholderTextColor="#A0A0A0"
            multiline
            textAlignVertical="top"
          />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 8 }}>
            Clinic Phone
          </Text>
          <View style={{ borderWidth: 2, borderColor: profileData.clinicPhone ? theme.colors.primary : '#E8E8E8', borderRadius: 12, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
            <TextInput
              style={{
                padding: 16,
                fontSize: 16,
                color: theme.colors.text,
              }}
              value={profileData.clinicPhone}
              onChangeText={(value) => handleInputChange('clinicPhone', value)}
              placeholder="Phone number"
              placeholderTextColor="#A0A0A0"
              keyboardType="phone-pad"
            />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 8 }}>
            Clinic Email
          </Text>
          <View style={{ borderWidth: 2, borderColor: profileData.clinicEmail ? theme.colors.primary : '#E8E8E8', borderRadius: 12, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
            <TextInput
              style={{
                padding: 16,
                fontSize: 16,
                color: theme.colors.text,
              }}
              value={profileData.clinicEmail}
              onChangeText={(value) => handleInputChange('clinicEmail', value)}
              placeholder="Email address"
              placeholderTextColor="#A0A0A0"
              keyboardType="email-address"
            />
          </View>
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 8 }}>
          Website URL (optional)
        </Text>
        <View style={{ borderWidth: 2, borderColor: profileData.website ? theme.colors.primary : '#E8E8E8', borderRadius: 12, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
          <TextInput
            style={{
              padding: 16,
              fontSize: 16,
              color: theme.colors.text,
            }}
            value={profileData.website}
            onChangeText={(value) => handleInputChange('website', value)}
            placeholder="https://www.example.com"
            placeholderTextColor="#A0A0A0"
            keyboardType="url"
          />
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 8 }}>
          Consultation Fee (IDR) *
        </Text>
        <View style={{
          borderWidth: 2,
          borderColor: profileData.consultationFee ? theme.colors.primary : '#E8E8E8',
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 16 }}>
            <Text style={{ fontSize: 16, color: theme.colors.textSecondary, marginRight: 8 }}>
              Rp
            </Text>
            <TextInput
              style={{ flex: 1, padding: 16, paddingLeft: 0, fontSize: 16, color: theme.colors.text }}
              value={profileData.consultationFee}
              onChangeText={(value) => handleInputChange('consultationFee', value)}
              placeholder="Enter consultation fee"
              placeholderTextColor="#A0A0A0"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
    </Card>
  );

  const renderSchedule = () => (
    <Card>
      <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 16 }}>
        Working Schedule
      </Text>

      <Text style={{ fontSize: 14, fontWeight: '500', color: theme.colors.text, marginBottom: 8 }}>
        Working Days
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
          <TouchableOpacity
            key={day}
            onPress={() => handleArrayToggle('workingDays', day)}
            style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: profileData.workingDays.includes(day) ? theme.colors.primary : '#E5E5E5', backgroundColor: profileData.workingDays.includes(day) ? `${theme.colors.primary}10` : '#FFFFFF' }}
          >
            <Text style={{ color: profileData.workingDays.includes(day) ? theme.colors.primary : theme.colors.textSecondary, fontSize: 12, fontWeight: '500' }}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={{
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.text,
        marginBottom: 8,
      }}>
        Working Hours
      </Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Input
          placeholder="Start Time (08:00)"
          value={profileData.workingHours.start}
          onChangeText={(value) => handleInputChange('workingHours', {
            ...profileData.workingHours,
            start: value
          })}
          leftIcon="schedule"
          style={{ flex: 1 }}
        />
        <Input
          placeholder="End Time (17:00)"
          value={profileData.workingHours.end}
          onChangeText={(value) => handleInputChange('workingHours', {
            ...profileData.workingHours,
            end: value
          })}
          leftIcon="schedule"
          style={{ flex: 1 }}
        />
      </View>
    </Card>
  );

  const renderServices = () => (
    <Card>
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 16,
      }}>
        Dental Services Offered
      </Text>

      <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginBottom: 12 }}>
        Select the dental services you provide:
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {dentalServices.map((service) => (
          <TouchableOpacity
            key={service}
            onPress={() => handleArrayToggle('dentalServices', service)}
            style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: profileData.dentalServices.includes(service) ? theme.colors.primary : '#E5E5E5', backgroundColor: profileData.dentalServices.includes(service) ? `${theme.colors.primary}10` : '#FFFFFF' }}
          >
            <Text style={{ color: profileData.dentalServices.includes(service) ? theme.colors.primary : theme.colors.textSecondary, fontSize: 12, fontWeight: '500' }}>
              {service}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: 24 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: theme.colors.text, marginBottom: 8 }}>
          Languages Spoken
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {['Indonesian', 'English', 'Mandarin', 'Javanese', 'Sundanese'].map((language) => (
            <TouchableOpacity
              key={language}
              onPress={() => handleArrayToggle('languagesSpoken', language)}
              style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: profileData.languagesSpoken.includes(language) ? theme.colors.primary : '#E5E5E5', backgroundColor: profileData.languagesSpoken.includes(language) ? `${theme.colors.primary}10` : '#FFFFFF' }}
            >
              <Text style={{ color: profileData.languagesSpoken.includes(language) ? theme.colors.primary : theme.colors.textSecondary, fontSize: 12, fontWeight: '500' }}>
                {language}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Card>
  );

  const renderDocuments = () => (
    <Card>
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 16,
      }}>
        Professional Documents
      </Text>

      <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginBottom: 16 }}>
        Upload your professional credentials for verification:
      </Text>

      {/* Medical License */}
      <TouchableOpacity
        onPress={() => handleImagePicker('licenseDocument')}
        style={{
          padding: 20,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: profileData.licenseDocument ? theme.colors.primary : '#E8E8E8',
          borderStyle: profileData.licenseDocument ? 'solid' : 'dashed',
          alignItems: 'center',
          marginBottom: 20,
          backgroundColor: profileData.licenseDocument ? `${theme.colors.primary}08` : '#FAFAFA',
          shadowColor: profileData.licenseDocument ? theme.colors.primary : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: profileData.licenseDocument ? 0.15 : 0.05,
          shadowRadius: 8,
          elevation: profileData.licenseDocument ? 4 : 2,
        }}
      >
        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: profileData.licenseDocument ? theme.colors.primary : '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
          <Icon 
            name={profileData.licenseDocument ? 'verified' : 'upload-file'} 
            size={28} 
            color={profileData.licenseDocument ? '#FFFFFF' : '#888888'} 
          />
        </View>
        <Text style={{ fontSize: 16, fontWeight: '600', color: profileData.licenseDocument ? theme.colors.primary : theme.colors.text, marginBottom: 4 }}>
          {profileData.licenseDocument ? 'Medical License Uploaded' : 'Upload Medical License'}
        </Text>
        <Text style={{ fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center' }}>
          {profileData.licenseDocument ? 'Document ready for verification' : 'Required for verification • PDF, JPG, PNG'}
        </Text>
        {profileData.licenseDocument && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: `${theme.colors.primary}15`, borderRadius: 20 }}>
            <Icon name="check-circle" size={16} color={theme.colors.primary} />
            <Text style={{ fontSize: 12, color: theme.colors.primary, fontWeight: '500', marginLeft: 4 }}>
              Ready for verification
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Diploma Certificate */}
      <TouchableOpacity
        onPress={() => handleImagePicker('diplomaCertificate')}
        style={{
          padding: 20,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: profileData.diplomaCertificate ? theme.colors.primary : '#E8E8E8',
          borderStyle: profileData.diplomaCertificate ? 'solid' : 'dashed',
          alignItems: 'center',
          marginBottom: 20,
          backgroundColor: profileData.diplomaCertificate ? `${theme.colors.primary}08` : '#FAFAFA',
          shadowColor: profileData.diplomaCertificate ? theme.colors.primary : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: profileData.diplomaCertificate ? 0.15 : 0.05,
          shadowRadius: 8,
          elevation: profileData.diplomaCertificate ? 4 : 2,
        }}
      >
        <View style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: profileData.diplomaCertificate ? theme.colors.primary : '#F0F0F0',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 12,
        }}>
          <MaterialCommunityIcons 
            name={profileData.diplomaCertificate ? 'certificate' : 'file-upload-outline'} 
            size={28} 
            color={profileData.diplomaCertificate ? '#FFFFFF' : '#888888'} 
          />
        </View>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: profileData.diplomaCertificate ? theme.colors.primary : theme.colors.text,
          marginBottom: 4,
        }}>
          {profileData.diplomaCertificate ? 'Diploma Certificate Uploaded' : 'Upload Diploma Certificate'}
        </Text>
        <Text style={{
          fontSize: 13,
          color: theme.colors.textSecondary,
          textAlign: 'center',
        }}>
          {profileData.diplomaCertificate ? 'Document ready for verification' : 'Dental school graduation certificate • Optional'}
        </Text>
        {profileData.diplomaCertificate && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: `${theme.colors.primary}15`,
            borderRadius: 20,
          }}>
            <Icon name="check-circle" size={16} color={theme.colors.primary} />
            <Text style={{
              fontSize: 12,
              color: theme.colors.primary,
              fontWeight: '500',
              marginLeft: 4,
            }}>
              Ready for verification
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Payment Methods */}
      <View style={{ marginTop: 16 }}>
        <Text style={{
          fontSize: 14,
          fontWeight: '500',
          color: theme.colors.text,
          marginBottom: 8,
        }}>
          Accepted Payment Methods
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Insurance', 'BPJS'].map((method) => (
            <TouchableOpacity
              key={method}
              onPress={() => handleArrayToggle('paymentMethods', method)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: profileData.paymentMethods.includes(method) 
                  ? theme.colors.primary 
                  : '#E5E5E5',
                backgroundColor: profileData.paymentMethods.includes(method) 
                  ? `${theme.colors.primary}10` 
                  : '#FFFFFF',
              }}
            >
              <Text style={{ color: profileData.paymentMethods.includes(method) ? theme.colors.primary : theme.colors.textSecondary, fontSize: 12, fontWeight: '500' }}>
                {method}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Card>
  );

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Enhanced Validation
      const requiredFields = {
        licenseNumber: 'License Number',
        dentalSchool: 'Dental School',
        primarySpecialization: 'Primary Specialization',
        yearsExperience: 'Years of Experience',
        clinicName: 'Clinic Name',
        clinicAddress: 'Clinic Address',
        consultationFee: 'Consultation Fee'
      };

      const missingFields = [];
      Object.entries(requiredFields).forEach(([key, label]) => {
        if (!profileData[key] || profileData[key].toString().trim() === '') {
          missingFields.push(label);
        }
      });

      if (missingFields.length > 0) {
        Alert.alert(
          'Missing Required Information', 
          `Please fill in the following required fields:\n\n${missingFields.join('\n')}`
        );
        setIsSubmitting(false);
        return;
      }

      if (!profileData.licenseDocument) {
        Alert.alert('Error', 'Please upload your medical license for verification.');
        setIsSubmitting(false);
        return;
      }

      // Validate consultation fee is a valid number
      const consultationFee = parseFloat(profileData.consultationFee);
      if (isNaN(consultationFee) || consultationFee < 0) {
        Alert.alert('Error', 'Please enter a valid consultation fee.');
        setIsSubmitting(false);
        return;
      }

      // Validate years of experience is a valid number
      const yearsExp = parseInt(profileData.yearsExperience);
      if (isNaN(yearsExp) || yearsExp < 0 || yearsExp > 50) {
        Alert.alert('Error', 'Please enter valid years of experience (0-50).');
        setIsSubmitting(false);
        return;
      }

      // First, upload profile photo if exists
      let profilePictureUrl = null;
      if (profileData.profilePhoto) {
        const photoResponse = await profileService.uploadProfilePhoto(
          profileData.profilePhoto.uri, 
          user.id
        );
        
        if (photoResponse.success) {
          profilePictureUrl = photoResponse.data.url;
        } else {
          Alert.alert('Warning', 'Failed to upload profile photo, but profile will be saved without it.');
        }
      }

      // Upload license document
      let licenseDocumentUrl = null;
      if (profileData.licenseDocument) {
        const docResponse = await profileService.uploadDocument(
          profileData.licenseDocument.uri,
          'license',
          user.id
        );
        
        if (docResponse.success) {
          licenseDocumentUrl = docResponse.data.url;
        } else {
          Alert.alert('Error', 'Failed to upload license document. Please try again.');
          return;
        }
      }

      // Upload additional documents
      const uploadedDocs = [];
      for (const doc of profileData.additionalDocuments || []) {
        const docResponse = await profileService.uploadDocument(
          doc.uri,
          doc.type || 'credential',
          user.id
        );
        
        if (docResponse.success) {
          uploadedDocs.push(docResponse.data.url);
        }
      }

      // Prepare profile data for API
      const apiProfileData = {
        firstName: profileData.firstName || user.firstName || '',
        lastName: profileData.lastName || user.lastName || '',
        phone: profileData.phone || '',
        
        // Professional information
        licenseNumber: profileData.licenseNumber,
        specialization: profileData.primarySpecialization,
        subspecialties: profileData.subspecializations || [],
        experience: parseInt(profileData.yearsExperience) || 0,
        education: JSON.stringify({
          dentalSchool: profileData.dentalSchool,
          graduationYear: profileData.graduationYear,
          postgraduate: profileData.postgraduateTraining,
        }),
        certifications: profileData.certifications || [],
        
        // Clinic information
        clinicName: profileData.clinicName,
        clinicAddress: profileData.clinicAddress,
        clinicPhone: profileData.clinicPhone,
        clinicWebsite: profileData.clinicWebsite,
        
        // Services and scheduling
        services: profileData.services || [],
        workingHours: JSON.stringify(profileData.workingHours || {}),
        appointmentDuration: parseInt(profileData.defaultAppointmentDuration) || 30,
        
        // Financial
        consultationFee: parseFloat(profileData.consultationFee) || 0,
        acceptedInsurance: profileData.acceptedInsurance || [],
        paymentMethods: profileData.paymentMethods || [],
        
        // Verification documents
        verificationDocs: [licenseDocumentUrl, ...uploadedDocs].filter(Boolean),
        
        // App-specific
        profilePicture: profilePictureUrl,
        bio: profileData.biography || '',
      };

      // Log the data being sent to backend for debugging
      console.log('🔄 Submitting doctor profile data:', {
        userId: user.id,
        profileDataKeys: Object.keys(apiProfileData),
        hasLicenseDoc: !!licenseDocumentUrl,
        hasProfilePicture: !!profilePictureUrl,
        additionalDocsCount: uploadedDocs.length
      });

      // Submit profile to backend
      const response = await profileService.setupDoctorProfile(apiProfileData);

      console.log('📡 Backend response:', {
        success: response.success,
        message: response.message,
        hasData: !!response.data,
        profileId: response.data?.profile?.id
      });

      if (response.success) {
        console.log('✅ Profile setup successful, updating Redux state');
        
        // Update Redux state
        dispatch(setProfileComplete(true));
        dispatch(updateUser({
          profileComplete: true,
          doctorProfile: response.data.profile,
        }));

        console.log('🔄 Redux state updated - profileComplete: true');

        Alert.alert(
          'Success!', 
          'Your professional profile has been submitted successfully! Your credentials will be verified within 24-48 hours.',
          [
            {
              text: 'Continue',
              onPress: () => {
                console.log('🏠 Navigating to dashboard after profile completion');
                // Navigation will be handled automatically by RootNavigator
                // since profileComplete is now true
              }
            }
          ]
        );
      } else {
        console.error('❌ Profile setup failed:', response.message, response.errors);
        Alert.alert(
          'Error', 
          response.message || 'Failed to save profile. Please try again.',
          response.errors ? [{ text: 'OK' }] : undefined
        );
      }
    } catch (error) {
      console.error('Doctor profile setup error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderProfessionalInfo();
      case 2:
        return renderSpecializations();
      case 3:
        return renderClinicInfo();
      case 4:
        return renderSchedule();
      case 5:
        return renderServices();
      case 6:
        return renderDocuments();
      default:
        return renderProfessionalInfo();
    }
  };

  const getStepTitle = () => {
    const titles = [
      'Professional Information',
      'Specializations & Bio',
      'Clinic Information',
      'Working Schedule',
      'Services & Languages',
      'Documents & Verification'
    ];
    return titles[currentStep - 1];
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 24 }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Icon name="medical-services" size={48} color={theme.colors.primary} />
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: theme.colors.text,
              marginTop: 16,
              marginBottom: 8,
            }}>
              Doctor Profile Setup
            </Text>
            <Text style={{
              fontSize: 16,
              color: theme.colors.textSecondary,
              textAlign: 'center',
            }}>
              Complete your professional profile to start accepting patients
            </Text>
            <Text style={{
              fontSize: 14,
              color: theme.colors.primary,
              textAlign: 'center',
              marginTop: 8,
              fontWeight: '500',
            }}>
              Step {currentStep} of {totalSteps}: {getStepTitle()}
            </Text>
          </View>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Current Step Content */}
          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 32,
            paddingHorizontal: 20,
            gap: 16,
          }}>
            {currentStep > 1 && (
              <TouchableOpacity
                onPress={() => setCurrentStep(currentStep - 1)}
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: theme.colors.primary,
                  backgroundColor: 'transparent',
                  alignItems: 'center',
                  shadowColor: theme.colors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="chevron-left" size={20} color={theme.colors.primary} />
                  <Text style={{
                    color: theme.colors.primary,
                    fontSize: 16,
                    fontWeight: '600',
                    marginLeft: 4,
                  }}>
                    Previous
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            
            {currentStep < totalSteps ? (
              <TouchableOpacity
                onPress={() => setCurrentStep(currentStep + 1)}
                style={{
                  flex: currentStep > 1 ? 1 : 2,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 16,
                  backgroundColor: theme.colors.primary,
                  alignItems: 'center',
                  shadowColor: theme.colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: '600',
                    marginRight: 4,
                  }}>
                    Next Step
                  </Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 16,
                  backgroundColor: isSubmitting ? '#CCCCCC' : theme.colors.primary,
                  alignItems: 'center',
                  shadowColor: isSubmitting ? '#000' : theme.colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isSubmitting ? 0.1 : 0.3,
                  shadowRadius: 12,
                  elevation: isSubmitting ? 2 : 6,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {isSubmitting && (
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                      borderTopColor: 'transparent',
                      marginRight: 8,
                    }}>
                      {/* Loading animation would go here */}
                    </View>
                  )}
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                    {isSubmitting ? 'Setting up...' : 'Submit for Verification'}
                  </Text>
                  {!isSubmitting && (
                    <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" style={{ marginLeft: 4 }} />
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Verification Notice */}
          {currentStep === totalSteps && (
            <View style={{ marginTop: 16, padding: 12, backgroundColor: '#E8F4FD', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: theme.colors.primary }}>
              <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '500', textAlign: 'center' }}>
                📋 Your profile will be reviewed and verified by our team within 24-48 hours. You'll receive an email notification once verified.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DoctorProfileSetupScreen;
