import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert, TouchableOpacity, Image, Animated, Dimensions, TextInput, Platform, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../../components/common/ThemeProvider';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import { updateUser, setProfileComplete } from '../../../store/slices/authSlice';
import profileService from '../../../services/profileService';

const { width, height } = Dimensions.get('window');

const DoctorProfileSetupScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef(null);
  
  const [profileData, setProfileData] = useState({
    medicalLicense: '', licenseNumber: '', licenseExpiry: '', dentalSchool: '', graduationYear: '',
    specializations: [], yearsOfExperience: '', clinicName: '', clinicAddress: '', clinicPhone: '', clinicEmail: '',
    workingDays: [], workingHours: { start: '', end: '' }, consultationFee: '', appointmentDuration: '',
    licenseDocument: null, diplomaCertificate: null, specialistCertificates: [],
    dentalServices: [], treatmentTypes: [], biography: '', languagesSpoken: [],
    acceptedInsurance: [], paymentMethods: [], website: '',
    socialMedia: { instagram: '', facebook: '', linkedin: '' }
  });

  const dentalSpecializations = ['General Dentistry', 'Orthodontics', 'Periodontics', 'Endodontics', 'Oral Surgery', 'Prosthodontics', 'Pediatric Dentistry', 'Oral Pathology', 'Dental Implants', 'Cosmetic Dentistry', 'Oral Medicine'];
  const dentalServices = ['Routine Cleaning', 'Dental Filling', 'Root Canal Treatment', 'Tooth Extraction', 'Dental Crowns', 'Dental Bridges', 'Teeth Whitening', 'Dental Implants', 'Orthodontic Braces', 'Invisalign', 'Periodontal Treatment', 'Emergency Dental Care', 'Oral Surgery', 'Dental Veneers', 'Dentures'];
  const workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const languages = ['English', 'Indonesian', 'Mandarin', 'Arabic', 'Spanish', 'French', 'German', 'Japanese', 'Korean'];
  const insuranceTypes = ['BPJS Kesehatan', 'Prudential', 'Allianz', 'AXA Mandiri', 'Great Eastern', 'Cigna', 'Asuransi Sinar Mas', 'BNI Life', 'Sequis', 'FWD Insurance'];
  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'E-Wallet (GoPay)', 'E-Wallet (OVO)', 'E-Wallet (DANA)', 'QRIS', 'Installment'];

  // Animate step transitions and scroll to top
  useEffect(() => {
    // Scroll to top when step changes
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
    
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true })
    ]).start();
  }, [currentStep]);

  const handleInputChange = (field, value) => {
    // Auto-format date fields
    if (field === 'licenseExpiry') {
      // Handle MM/YYYY format with slash
      if (value.includes('/')) {
        const parts = value.split('/');
        if (parts.length === 2) {
          const month = parts[0].replace(/[^0-9]/g, '').slice(0, 2);
          const year = parts[1].replace(/[^0-9]/g, '').slice(0, 4);
          
          // Validate month
          if (month && (parseInt(month) < 1 || parseInt(month) > 12)) {
            return;
          }
          
          // Always allow year input up to 4 digits, validate only when complete
          if (year.length === 4) {
            const currentYear = new Date().getFullYear();
            const yearNum = parseInt(year);
            // Only reject if year is clearly invalid (too far in past/future)
            if (yearNum < 1900 || yearNum > currentYear + 100) {
              return;
            }
          }
          
          value = month + (year ? '/' + year : '');
        }
      } else {
        // Only allow numbers for initial input
        const cleaned = value.replace(/[^0-9]/g, '');
        
        if (cleaned.length <= 2) {
          value = cleaned;
        } else if (cleaned.length <= 6) {
          const month = cleaned.slice(0, 2);
          const year = cleaned.slice(2);
          
          // Validate month
          if (parseInt(month) < 1 || parseInt(month) > 12) {
            return;
          }
          
          // Always allow year input up to 4 digits, validate only when complete
          if (year.length === 4) {
            const currentYear = new Date().getFullYear();
            const yearNum = parseInt(year);
            // Only reject if year is clearly invalid (too far in past/future)
            if (yearNum < 1900 || yearNum > currentYear + 100) {
              return;
            }
          }
          
          value = month + '/' + year;
        } else {
          return;
        }
      }
    } else if (field === 'graduationYear') {
      // Only allow 4 digits for year with validation
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      if (cleaned.length === 4) {
        const currentYear = new Date().getFullYear();
        const yearNum = parseInt(cleaned);
        // Allow graduation years from 1950 to current year
        if (yearNum < 1950 || yearNum > currentYear) {
          return; // Don't update if invalid year
        }
      }
      value = cleaned;
    } else if (field === 'yearsOfExperience') {
       // Only allow numbers and limit to reasonable range (0-70)
       const cleaned = value.replace(/\D/g, '');
       const experience = parseInt(cleaned);
       if (cleaned && (experience < 0 || experience > 70)) {
         return; // Don't update if invalid experience
       }
       value = cleaned;
     } else if (field === 'consultationFee') {
       // Only allow numbers, validate range only when complete
       const cleaned = value.replace(/\D/g, '');
       if (cleaned.length > 0) {
         const fee = parseInt(cleaned);
         // Only reject if clearly invalid (too high), allow building up the number
         if (fee > 100000000) { // 100 million IDR max
           return;
         }
       }
       value = cleaned;
     }
    
    setProfileData(prev => ({ ...prev, [field]: value }));
  };
  const handleArrayToggle = (field, value) => setProfileData(prev => ({ ...prev, [field]: prev[field].includes(value) ? prev[field].filter(item => item !== value) : [...prev[field], value] }));
  const handleNestedInputChange = (parent, field, value) => {
    // Validate working hours format (HH:MM)
    if (parent === 'workingHours' && (field === 'start' || field === 'end')) {
      // Auto-format time HH:MM
      const cleaned = value.replace(/[^0-9]/g, '');
      if (cleaned.length <= 2) {
        // Validate hour (00-23)
        const hour = parseInt(cleaned);
        if (cleaned.length === 2 && hour > 23) {
          return; // Don't update if invalid hour
        }
        value = cleaned;
      } else if (cleaned.length <= 4) {
        const hour = cleaned.slice(0, 2);
        const minute = cleaned.slice(2);
        
        // Validate hour and minute
        if (parseInt(hour) > 23 || parseInt(minute) > 59) {
          return; // Don't update if invalid time
        }
        
        value = hour + ':' + minute;
      }
    }
    
    setProfileData(prev => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }));
  };

  const handleImagePicker = (type) => {
    // For documents (licenseDocument, diplomaCertificate), use document picker for PDF only
    openDocumentPicker(type);
  };



  const openDocumentPicker = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const document = result.assets[0];
        // Validate file size (max 10MB)
        if (document.size > 10 * 1024 * 1024) {
          Alert.alert('Error', 'File size must be less than 10MB');
          return;
        }
        
        setProfileData(prev => ({ ...prev, [type]: document }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select document. Please try again.');
      console.error('Document picker error:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(prev => prev + 1);
    else handleSubmit();
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {

      
      // Debug: Check if documents exist
      console.log('🔍 Documents check:', {
        hasLicenseDocument: !!profileData.licenseDocument,
        licenseDocumentUri: profileData.licenseDocument?.uri,
        licenseDocumentData: profileData.licenseDocument,
        hasDiplomaDocument: !!profileData.diplomaCertificate,
        diplomaDocumentUri: profileData.diplomaCertificate?.uri,
        diplomaDocumentData: profileData.diplomaCertificate
      });
      
      // Upload documents if they exist
      const documentUrls = {};
      
      if (profileData.licenseDocument && profileData.licenseDocument.uri) {
        console.log('📄 Starting license document upload...');
        const licenseResponse = await profileService.uploadDocument(
          profileData.licenseDocument.uri,
          'license',
          user.id
        );
        
        if (!licenseResponse.success) {
          console.log('❌ License document upload failed:', licenseResponse.message);
          Alert.alert('Error', licenseResponse.message || 'Failed to upload license document');
          setIsSubmitting(false);
          return;
        }
        documentUrls.licenseDocument = licenseResponse.data.url;
        console.log('📄 License document uploaded successfully:', documentUrls.licenseDocument);
      } else {
        console.log('⚠️ No license document to upload');
      }
      
      if (profileData.diplomaCertificate && profileData.diplomaCertificate.uri) {
        console.log('🎓 Starting diploma certificate upload...');
        const diplomaResponse = await profileService.uploadDocument(
          profileData.diplomaCertificate.uri,
          'diploma',
          user.id
        );
        
        if (!diplomaResponse.success) {
          console.log('❌ Diploma certificate upload failed:', diplomaResponse.message);
          Alert.alert('Error', diplomaResponse.message || 'Failed to upload diploma certificate');
          setIsSubmitting(false);
          return;
        }
        documentUrls.diplomaCertificate = diplomaResponse.data.url;
        console.log('🎓 Diploma certificate uploaded successfully:', documentUrls.diplomaCertificate);
      } else {
        console.log('⚠️ No diploma certificate to upload');
      }
      
      // Prepare profile data without file objects for main profile update
      const profileDataForSubmit = { ...profileData };
      
      // Add user's first and last name from registration
      console.log('🔍 User object:', user);
      console.log('🔍 User profile:', user.profile);
      profileDataForSubmit.firstName = user.profile?.firstName || user.firstName;
      profileDataForSubmit.lastName = user.profile?.lastName || user.lastName;
      console.log('📝 Added firstName:', profileDataForSubmit.firstName, 'lastName:', profileDataForSubmit.lastName);
      
      // Convert workingHours object to string format expected by backend
      console.log('🕐 workingHours before conversion:', profileDataForSubmit.workingHours, typeof profileDataForSubmit.workingHours);
      if (profileDataForSubmit.workingHours && typeof profileDataForSubmit.workingHours === 'object') {
        profileDataForSubmit.workingHours = `${profileDataForSubmit.workingHours.start}-${profileDataForSubmit.workingHours.end}`;
      }
      console.log('🕐 workingHours after conversion:', profileDataForSubmit.workingHours, typeof profileDataForSubmit.workingHours);
      
      // Convert consultationFee from string to number
      console.log('💰 consultationFee before conversion:', profileDataForSubmit.consultationFee, typeof profileDataForSubmit.consultationFee);
      if (profileDataForSubmit.consultationFee && profileDataForSubmit.consultationFee !== '') {
        const feeValue = parseFloat(profileDataForSubmit.consultationFee);
        profileDataForSubmit.consultationFee = isNaN(feeValue) ? null : feeValue;
      } else {
        profileDataForSubmit.consultationFee = null;
      }
      console.log('💰 consultationFee after conversion:', profileDataForSubmit.consultationFee, typeof profileDataForSubmit.consultationFee);
      
      // Convert appointmentDuration from string to number
      console.log('⏰ appointmentDuration before conversion:', profileDataForSubmit.appointmentDuration, typeof profileDataForSubmit.appointmentDuration);
      if (profileDataForSubmit.appointmentDuration && profileDataForSubmit.appointmentDuration !== '') {
        const durationValue = parseInt(profileDataForSubmit.appointmentDuration);
        profileDataForSubmit.appointmentDuration = isNaN(durationValue) ? null : durationValue;
      } else {
        profileDataForSubmit.appointmentDuration = null;
      }
      console.log('⏰ appointmentDuration after conversion:', profileDataForSubmit.appointmentDuration, typeof profileDataForSubmit.appointmentDuration);
      
      // Convert experience to number if it exists
      if (profileDataForSubmit.yearsOfExperience && profileDataForSubmit.yearsOfExperience !== '') {
        const expValue = parseInt(profileDataForSubmit.yearsOfExperience);
        profileDataForSubmit.experience = isNaN(expValue) ? null : expValue;
      } else {
        profileDataForSubmit.experience = null;
      }
      // Remove the original field name
      delete profileDataForSubmit.yearsOfExperience;
      console.log('📊 experience after conversion:', profileDataForSubmit.experience, typeof profileDataForSubmit.experience);
      
      // Map field names to match backend expectations
      profileDataForSubmit.clinicWebsite = profileDataForSubmit.website || null;
      profileDataForSubmit.services = profileDataForSubmit.dentalServices || [];
      profileDataForSubmit.bio = profileDataForSubmit.biography || null;
      profileDataForSubmit.specialization = profileDataForSubmit.specializations && profileDataForSubmit.specializations.length > 0 ? profileDataForSubmit.specializations[0] : null;
      profileDataForSubmit.subspecialties = profileDataForSubmit.specializations && profileDataForSubmit.specializations.length > 1 ? profileDataForSubmit.specializations.slice(1) : [];
      

      
      // Remove file objects and keep only necessary data
      const fieldsToRemove = ['licenseDocument', 'diplomaCertificate', 'specialistCertificates', 'website', 'dentalServices', 'biography', 'specializations', 'workingDays', 'treatmentTypes', 'languagesSpoken', 'socialMedia'];
      fieldsToRemove.forEach(field => {
        if (profileDataForSubmit[field]) {
          delete profileDataForSubmit[field];
        }
      });
      
      // Add document URLs to verification docs array
      const verificationDocs = [];
      if (documentUrls.licenseDocument) verificationDocs.push(documentUrls.licenseDocument);
      if (documentUrls.diplomaCertificate) verificationDocs.push(documentUrls.diplomaCertificate);
      
      console.log('📋 Verification docs array:', verificationDocs);
      
      if (verificationDocs.length > 0) {
        profileDataForSubmit.verificationDocs = verificationDocs;
        console.log('✅ Added verificationDocs to submission:', profileDataForSubmit.verificationDocs);
      } else {
        console.log('⚠️ No verification docs to add');
      }
      
      // Submit main profile data
      console.log('🗺️ Field mapping - website to clinicWebsite:', profileDataForSubmit.clinicWebsite);
      console.log('🗺️ Field mapping - dentalServices to services:', profileDataForSubmit.services);
      console.log('💳 PaymentMethods check:', {
        hasPaymentMethods: !!profileDataForSubmit.paymentMethods,
        paymentMethodsType: typeof profileDataForSubmit.paymentMethods,
        paymentMethodsLength: profileDataForSubmit.paymentMethods?.length || 0,
        paymentMethodsData: profileDataForSubmit.paymentMethods
      });
      console.log('🏥 AcceptedInsurance check:', {
        hasAcceptedInsurance: !!profileDataForSubmit.acceptedInsurance,
        acceptedInsuranceType: typeof profileDataForSubmit.acceptedInsurance,
        acceptedInsuranceLength: profileDataForSubmit.acceptedInsurance?.length || 0,
        acceptedInsuranceData: profileDataForSubmit.acceptedInsurance
      });
      console.log('📤 Final profileDataForSubmit:', JSON.stringify(profileDataForSubmit, null, 2));
      console.log('🔍 Checking specific fields in submission:');
      console.log('  - profilePicture:', profileDataForSubmit.profilePicture);
      console.log('  - verificationDocs:', profileDataForSubmit.verificationDocs);
      console.log('  - verificationDocs length:', profileDataForSubmit.verificationDocs?.length || 0);
      console.log('  - paymentMethods:', profileDataForSubmit.paymentMethods);
      console.log('  - acceptedInsurance:', profileDataForSubmit.acceptedInsurance);
      
      const response = await profileService.setupDoctorProfile(profileDataForSubmit);
      
      if (response.success) {
        dispatch(updateUser(response.data));
        dispatch(setProfileComplete(true));
        
        // Navigate immediately to dashboard
        navigation.replace('DoctorTabs');
        
        // Show success message after navigation
        setTimeout(() => {
          Alert.alert('Success', 'Profile completed successfully!');
        }, 500);
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackPress = () => {
    if (currentStep > 1) {
      handlePrevious();
    } else {
      Alert.alert(
        'Exit Setup',
        'Are you sure you want to exit profile setup? Your progress will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  const renderStepIndicator = () => {
    const stepTitles = ['Personal Info', 'Specializations', 'Practice Details', 'Schedule', 'Services'];
    
    return (
      <View>
        {/* Back Button */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity 
            onPress={handleBackPress}
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16
            }}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '600', color: 'white', flex: 1, textAlign: 'center', marginRight: 56 }}>Profile Setup</Text>
        </View>
        
        {/* Progress Bar */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ height: 4, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 2, overflow: 'hidden' }}>
            <View style={{ height: '100%', borderRadius: 2, width: `${(currentStep / totalSteps) * 100}%`, backgroundColor: 'rgba(255, 255, 255, 0.8)' }} />
          </View>
          <Text style={{ textAlign: 'center', marginTop: 8, fontSize: 13, fontWeight: '600', color: 'rgba(255, 255, 255, 0.9)' }}>Step {currentStep} of {totalSteps}</Text>
        </View>
        
        {/* Step Circles */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          {[1, 2, 3, 4, 5].map((step) => (
            <View key={step} style={{ alignItems: 'center', flex: 1 }}>
              <Animated.View style={{ width: step === currentStep ? 36 : 28, height: step === currentStep ? 36 : 28, borderRadius: step === currentStep ? 18 : 14, backgroundColor: step <= currentStep ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: step <= currentStep ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.4)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                {step < currentStep ? (
                  <MaterialCommunityIcons name="check" size={16} color="#667eea" />
                ) : step === currentStep ? (
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#667eea' }} />
                ) : (
                  <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, fontWeight: '700' }}>{step}</Text>
                )}
              </Animated.View>
            </View>
          ))}
        </View>
        
        {/* Step Title */}
        <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 }}>{stepTitles[currentStep - 1]}</Text>
        <Text style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>Complete your professional profile</Text>
      </View>
    );
  };

  const renderGlassCard = (children, style = {}) => (
    <View style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
      borderRadius: 16, 
      padding: 24,
      marginBottom: 20,
      marginHorizontal: 8,
      borderWidth: 1, 
      borderColor: 'rgba(255, 255, 255, 0.1)', 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.1, 
      shadowRadius: 12, 
      elevation: 5,
      width: '110%',
      alignSelf: 'center',
      ...style 
    }}>
      {children}
    </View>
  );

  const renderInput = (label, value, onChangeText, placeholder, options = {}) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#2D3748', marginBottom: 6 }}>{label}</Text>
      <View style={{ borderWidth: 1.5, borderColor: value ? '#667eea' : 'rgba(0, 0, 0, 0.1)', borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.9)', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 }}>
        <TextInput style={{ padding: 14, fontSize: 15, color: '#2D3748' }} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#A0AEC0" {...options} />
      </View>
    </View>
  );

  const renderToggleButton = (label, isSelected, onPress) => (
    <TouchableOpacity onPress={onPress} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: isSelected ? '#667eea' : 'rgba(0, 0, 0, 0.1)', backgroundColor: isSelected ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.8)', marginRight: 8, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
      <Text style={{ color: isSelected ? '#667eea' : '#4A5568', fontSize: 13, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );

  const renderImagePicker = (label, imageData, onPress, required = false) => {
    const isDocument = label.includes('License') || label.includes('Diploma');
    const isProfilePhoto = label === 'Professional Profile Photo';
    
    return (
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <TouchableOpacity onPress={onPress} style={{ width: isProfilePhoto ? 100 : 80, height: isProfilePhoto ? 100 : 80, borderRadius: isProfilePhoto ? 50 : 12, backgroundColor: imageData ? 'transparent' : 'rgba(102, 126, 234, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: imageData ? 0 : 2, borderColor: '#667eea', borderStyle: imageData ? 'solid' : 'dashed', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
          {imageData ? (
            isDocument ? (
              <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', borderRadius: 12, backgroundColor: '#f7fafc' }}>
                <MaterialCommunityIcons name="file-pdf-box" size={32} color="#e53e3e" />
                <Text style={{ fontSize: 10, color: '#2d3748', marginTop: 4, textAlign: 'center' }} numberOfLines={2}>{imageData.name}</Text>
              </View>
            ) : (
              <Image source={{ uri: imageData.uri }} style={{ width: '100%', height: '100%', borderRadius: isProfilePhoto ? 50 : 12 }} />
            )
          ) : (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name={isDocument ? "file-pdf-box" : "camera-plus"} size={24} color="#667eea" />
              {isDocument && <Text style={{ fontSize: 10, color: '#667eea', marginTop: 4 }}>PDF Only</Text>}
            </View>
          )}
        </TouchableOpacity>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#2D3748', textAlign: 'center', marginBottom: 2 }}>{label} {required && '*'}</Text>
        <Text style={{ fontSize: 11, color: '#718096', textAlign: 'center' }}>{imageData ? 'Tap to change' : 'Tap to upload'}</Text>
      </View>
    );
  };

  const renderProfessionalInfo = () => (
    <View>
      {renderGlassCard(
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <MaterialCommunityIcons name="account-tie" size={20} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#2D3748' }}>Professional Information</Text>
              <Text style={{ fontSize: 12, color: '#FFFFFF', marginTop: 1 }}>Tell us about your medical background</Text>
            </View>
          </View>
          {renderInput('Medical License Number *', profileData.licenseNumber, (value) => handleInputChange('licenseNumber', value), 'Enter your medical license number')}
          {renderInput('License Expiry Date', profileData.licenseExpiry, (value) => handleInputChange('licenseExpiry', value), 'MM/YYYY (e.g., 12/2030)', { keyboardType: 'numeric', maxLength: 7 })}
          {renderInput('Dental School/University *', profileData.dentalSchool, (value) => handleInputChange('dentalSchool', value), 'Enter your dental school')}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              {renderInput('Graduation Year', profileData.graduationYear, (value) => handleInputChange('graduationYear', value), 'YYYY (e.g., 2020)', { keyboardType: 'numeric' })}
            </View>
            <View style={{ flex: 1 }}>
              {renderInput('Years of Experience *', profileData.yearsOfExperience, (value) => handleInputChange('yearsOfExperience', value), 'Years', { keyboardType: 'numeric' })}
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderSpecializations = () => (
    <View>
      {renderGlassCard(
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <MaterialCommunityIcons name="medical-bag" size={20} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#2D3748' }}>Dental Specializations</Text>
              <Text style={{ fontSize: 12, color: '#FFFFFF', marginTop: 1 }}>Select your areas of expertise</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
            {dentalSpecializations.map((specialization) => (
              <View key={specialization}>
                {renderToggleButton(specialization, profileData.specializations.includes(specialization), () => handleArrayToggle('specializations', specialization))}
              </View>
            ))}
          </View>
          {renderInput('Professional Biography', profileData.biography, (value) => handleInputChange('biography', value), 'Tell us about your professional experience and approach...', { multiline: true, numberOfLines: 4, textAlignVertical: 'top' })}
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#2D3748', marginBottom: 8 }}>Languages Spoken</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {languages.map((language) => (
              <View key={language}>
                {renderToggleButton(language, profileData.languagesSpoken.includes(language), () => handleArrayToggle('languagesSpoken', language))}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderPracticeDetails = () => (
    <View>
      {renderGlassCard(
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <MaterialCommunityIcons name="hospital-building" size={20} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#2D3748' }}>Practice Information</Text>
              <Text style={{ fontSize: 12, color: '#FFFFFF', marginTop: 1 }}>Details about your clinic or practice</Text>
            </View>
          </View>
          {renderInput('Clinic/Practice Name *', profileData.clinicName, (value) => handleInputChange('clinicName', value), 'Enter your clinic name')}
          {renderInput('Clinic Address *', profileData.clinicAddress, (value) => handleInputChange('clinicAddress', value), 'Enter complete address', { multiline: true, numberOfLines: 3, textAlignVertical: 'top' })}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              {renderInput('Clinic Phone', profileData.clinicPhone, (value) => handleInputChange('clinicPhone', value), '+62 xxx-xxxx-xxxx', { keyboardType: 'phone-pad' })}
            </View>
            <View style={{ flex: 1 }}>
              {renderInput('Clinic Email', profileData.clinicEmail, (value) => handleInputChange('clinicEmail', value), 'clinic@example.com', { keyboardType: 'email-address' })}
            </View>
          </View>
          {renderInput('Website (Optional)', profileData.website, (value) => handleInputChange('website', value), 'https://yourwebsite.com')}
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#2D3748', marginBottom: 8 }}>Social Media (Optional)</Text>
          {renderInput('Instagram', profileData.socialMedia.instagram, (value) => handleNestedInputChange('socialMedia', 'instagram', value), '@username')}
          {renderInput('Facebook', profileData.socialMedia.facebook, (value) => handleNestedInputChange('socialMedia', 'facebook', value), 'Facebook page URL')}
          {renderInput('LinkedIn', profileData.socialMedia.linkedin, (value) => handleNestedInputChange('socialMedia', 'linkedin', value), 'LinkedIn profile URL')}
        </View>
      )}
    </View>
  );

  const renderSchedule = () => (
    <View>
      {renderGlassCard(
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <MaterialCommunityIcons name="calendar-clock" size={20} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#2D3748' }}>Schedule & Availability</Text>
              <Text style={{ fontSize: 12, color: '#FFFFFF', marginTop: 1 }}>Set your working days and hours</Text>
            </View>
          </View>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#2D3748', marginBottom: 8 }}>Working Days *</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
            {workingDays.map((day) => (
              <View key={day}>
                {renderToggleButton(day, profileData.workingDays.includes(day), () => handleArrayToggle('workingDays', day))}
              </View>
            ))}
          </View>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#2D3748', marginBottom: 8 }}>Working Hours</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              {renderInput('Start Time', profileData.workingHours.start, (value) => handleNestedInputChange('workingHours', 'start', value), '09:00')}
            </View>
            <View style={{ flex: 1 }}>
              {renderInput('End Time', profileData.workingHours.end, (value) => handleNestedInputChange('workingHours', 'end', value), '17:00')}
            </View>
          </View>
          {renderInput('Consultation Fee (IDR)', profileData.consultationFee, (value) => handleInputChange('consultationFee', value), 'e.g., 500000', { keyboardType: 'numeric' })}
          {renderInput('Appointment Duration (minutes)', profileData.appointmentDuration, (value) => handleInputChange('appointmentDuration', value), 'e.g., 30', { keyboardType: 'numeric' })}
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#2D3748', marginBottom: 8 }}>Accepted Insurance</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
            {insuranceTypes.map((insurance) => (
              <View key={insurance}>
                {renderToggleButton(insurance, profileData.acceptedInsurance.includes(insurance), () => handleArrayToggle('acceptedInsurance', insurance))}
              </View>
            ))}
          </View>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#2D3748', marginBottom: 8 }}>Payment Methods</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {paymentMethods.map((method) => (
              <View key={method}>
                {renderToggleButton(method, profileData.paymentMethods.includes(method), () => handleArrayToggle('paymentMethods', method))}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderServices = () => (
    <View>
      {renderGlassCard(
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <MaterialCommunityIcons name="tooth" size={20} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#2D3748' }}>Services Offered</Text>
              <Text style={{ fontSize: 12, color: '#FFFFFF', marginTop: 1 }}>Select the dental services you provide</Text>
            </View>
          </View>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#2D3748', marginBottom: 8 }}>Dental Services *</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {dentalServices.map((service) => (
              <View key={service}>
                {renderToggleButton(service, profileData.dentalServices.includes(service), () => handleArrayToggle('dentalServices', service))}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );



  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderProfessionalInfo();
      case 2: return renderSpecializations();
      case 3: return renderPracticeDetails();
      case 4: return renderSchedule();
      case 5: return renderServices();
      default: return renderProfessionalInfo();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FF' }}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Fixed Header with Camera Wrapper */}
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={{ paddingTop: 70, paddingHorizontal: 20, paddingBottom: 23, borderBottomLeftRadius: 25, borderBottomRightRadius: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {renderStepIndicator()}
        </LinearGradient>
      </Animated.View>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          ref={scrollViewRef}
          style={{ flex: 1, backgroundColor: '#F8F9FF' }} 
          contentContainerStyle={{ paddingTop: 230, paddingHorizontal: 20, paddingBottom: 40 }} 
          showsVerticalScrollIndicator={false}
        >
          {/* Form Content */}
          <Animated.View style={{ opacity: fadeAnim, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 16, padding: 16 }}>
            {renderCurrentStep()}
          </Animated.View>

          {/* Navigation Buttons - Now inside ScrollView */}
          <View style={{ marginTop: 24, paddingHorizontal: 0, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingHorizontal: 20 }}>
              {currentStep > 1 && (
                <TouchableOpacity onPress={handlePrevious} style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1.5, borderColor: '#667eea', backgroundColor: 'transparent', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="chevron-left" size={18} color="#667eea" style={{ marginRight: 4 }} />
                    <Text style={{ color: '#667eea', fontSize: 14, fontWeight: '600' }}>Previous</Text>
                  </View>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity onPress={handleNext} disabled={isSubmitting} style={{ flex: currentStep === 1 ? 1 : 1, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, backgroundColor: isSubmitting ? '#A0AEC0' : '#667eea', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 5 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginRight: 4 }}>
                    {isSubmitting ? 'Submitting...' : currentStep === totalSteps ? 'Complete Profile' : 'Next Step'}
                  </Text>
                  {!isSubmitting && <MaterialCommunityIcons name={currentStep === totalSteps ? 'check' : 'chevron-right'} size={18} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default DoctorProfileSetupScreen;
