import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

import { useTheme } from '../../../components/common/ThemeProvider';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import { updateUser, setProfileComplete } from '../../../store/slices/authSlice';
import profileService from '../../../services/profileService';

const DoctorProfileSetupScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const renderStepIndicator = () => (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    }}>
      {[1, 2, 3, 4, 5, 6].map((step) => (
        <View key={step} style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: step <= currentStep ? theme.colors.primary : '#E5E5E5',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{
              color: step <= currentStep ? '#FFFFFF' : '#888888',
              fontSize: 14,
              fontWeight: '600',
            }}>
              {step}
            </Text>
          </View>
          {step < 6 && (
            <View style={{
              width: 20,
              height: 2,
              backgroundColor: step < currentStep ? theme.colors.primary : '#E5E5E5',
              marginHorizontal: 4,
            }} />
          )}
        </View>
      ))}
    </View>
  );

  const renderProfessionalInfo = () => (
    <Card>
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 16,
      }}>
        Professional Information
      </Text>

      {/* Profile Photo */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <TouchableOpacity
          onPress={() => handleImagePicker('profilePhoto')}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: '#F5F5F5',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: theme.colors.primary,
            borderStyle: 'dashed',
            marginBottom: 8,
          }}
        >
          {profileData.profilePhoto ? (
            <Image
              source={{ uri: profileData.profilePhoto.uri }}
              style={{ width: 96, height: 96, borderRadius: 48 }}
            />
          ) : (
            <Icon name="add-a-photo" size={32} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
        <Text style={{
          fontSize: 14,
          color: theme.colors.textSecondary,
          textAlign: 'center',
        }}>
          Professional Profile Photo
        </Text>
      </View>

      <Input
        placeholder="Medical License Number"
        value={profileData.licenseNumber}
        onChangeText={(value) => handleInputChange('licenseNumber', value)}
        leftIcon="card-membership"
      />

      <Input
        placeholder="License Expiry Date (MM/YYYY)"
        value={profileData.licenseExpiry}
        onChangeText={(value) => handleInputChange('licenseExpiry', value)}
        leftIcon="event"
        style={{ marginTop: 16 }}
      />

      <Input
        placeholder="Dental School/University"
        value={profileData.dentalSchool}
        onChangeText={(value) => handleInputChange('dentalSchool', value)}
        leftIcon="school"
        style={{ marginTop: 16 }}
      />

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <Input
          placeholder="Graduation Year"
          value={profileData.graduationYear}
          onChangeText={(value) => handleInputChange('graduationYear', value)}
          keyboardType="numeric"
          leftIcon="calendar-today"
          style={{ flex: 1 }}
        />
        <Input
          placeholder="Years of Experience"
          value={profileData.yearsOfExperience}
          onChangeText={(value) => handleInputChange('yearsOfExperience', value)}
          keyboardType="numeric"
          leftIcon="work"
          style={{ flex: 1 }}
        />
      </View>
    </Card>
  );

  const renderSpecializations = () => (
    <Card>
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 16,
      }}>
        Dental Specializations
      </Text>

      <Text style={{
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 12,
      }}>
        Select your areas of specialization:
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {dentalSpecializations.map((specialization) => (
          <TouchableOpacity
            key={specialization}
            onPress={() => handleArrayToggle('specializations', specialization)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: profileData.specializations.includes(specialization) 
                ? theme.colors.primary 
                : '#E5E5E5',
              backgroundColor: profileData.specializations.includes(specialization) 
                ? `${theme.colors.primary}10` 
                : '#FFFFFF',
            }}
          >
            <Text style={{
              color: profileData.specializations.includes(specialization) 
                ? theme.colors.primary 
                : theme.colors.textSecondary,
              fontSize: 12,
              fontWeight: '500',
            }}>
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
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 16,
      }}>
        Clinic Information
      </Text>

      <Input
        placeholder="Clinic/Practice Name"
        value={profileData.clinicName}
        onChangeText={(value) => handleInputChange('clinicName', value)}
        leftIcon="local-hospital"
      />

      <Input
        placeholder="Clinic Address"
        value={profileData.clinicAddress}
        onChangeText={(value) => handleInputChange('clinicAddress', value)}
        multiline
        numberOfLines={2}
        leftIcon="location-on"
        style={{ marginTop: 16 }}
      />

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <Input
          placeholder="Clinic Phone"
          value={profileData.clinicPhone}
          onChangeText={(value) => handleInputChange('clinicPhone', value)}
          keyboardType="phone-pad"
          leftIcon="phone"
          style={{ flex: 1 }}
        />
        <Input
          placeholder="Clinic Email"
          value={profileData.clinicEmail}
          onChangeText={(value) => handleInputChange('clinicEmail', value)}
          keyboardType="email-address"
          leftIcon="email"
          style={{ flex: 1 }}
        />
      </View>

      <Input
        placeholder="Website URL (optional)"
        value={profileData.website}
        onChangeText={(value) => handleInputChange('website', value)}
        keyboardType="url"
        leftIcon="web"
        style={{ marginTop: 16 }}
      />

      <Input
        placeholder="Consultation Fee (IDR)"
        value={profileData.consultationFee}
        onChangeText={(value) => handleInputChange('consultationFee', value)}
        keyboardType="numeric"
        leftIcon="attach-money"
        style={{ marginTop: 16 }}
      />
    </Card>
  );

  const renderSchedule = () => (
    <Card>
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 16,
      }}>
        Working Schedule
      </Text>

      <Text style={{
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.text,
        marginBottom: 8,
      }}>
        Working Days
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
          <TouchableOpacity
            key={day}
            onPress={() => handleArrayToggle('workingDays', day)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: profileData.workingDays.includes(day) 
                ? theme.colors.primary 
                : '#E5E5E5',
              backgroundColor: profileData.workingDays.includes(day) 
                ? `${theme.colors.primary}10` 
                : '#FFFFFF',
            }}
          >
            <Text style={{
              color: profileData.workingDays.includes(day) 
                ? theme.colors.primary 
                : theme.colors.textSecondary,
              fontSize: 12,
              fontWeight: '500',
            }}>
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

      <Text style={{
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 12,
      }}>
        Select the dental services you provide:
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {dentalServices.map((service) => (
          <TouchableOpacity
            key={service}
            onPress={() => handleArrayToggle('dentalServices', service)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: profileData.dentalServices.includes(service) 
                ? theme.colors.primary 
                : '#E5E5E5',
              backgroundColor: profileData.dentalServices.includes(service) 
                ? `${theme.colors.primary}10` 
                : '#FFFFFF',
            }}
          >
            <Text style={{
              color: profileData.dentalServices.includes(service) 
                ? theme.colors.primary 
                : theme.colors.textSecondary,
              fontSize: 12,
              fontWeight: '500',
            }}>
              {service}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: 24 }}>
        <Text style={{
          fontSize: 14,
          fontWeight: '500',
          color: theme.colors.text,
          marginBottom: 8,
        }}>
          Languages Spoken
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {['Indonesian', 'English', 'Mandarin', 'Javanese', 'Sundanese'].map((language) => (
            <TouchableOpacity
              key={language}
              onPress={() => handleArrayToggle('languagesSpoken', language)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: profileData.languagesSpoken.includes(language) 
                  ? theme.colors.primary 
                  : '#E5E5E5',
                backgroundColor: profileData.languagesSpoken.includes(language) 
                  ? `${theme.colors.primary}10` 
                  : '#FFFFFF',
              }}
            >
              <Text style={{
                color: profileData.languagesSpoken.includes(language) 
                  ? theme.colors.primary 
                  : theme.colors.textSecondary,
                fontSize: 12,
                fontWeight: '500',
              }}>
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

      <Text style={{
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 16,
      }}>
        Upload your professional credentials for verification:
      </Text>

      {/* Medical License */}
      <TouchableOpacity
        onPress={() => handleImagePicker('licenseDocument')}
        style={{
          padding: 16,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: profileData.licenseDocument ? theme.colors.primary : '#E5E5E5',
          borderStyle: 'dashed',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Icon 
          name={profileData.licenseDocument ? 'check-circle' : 'upload-file'} 
          size={32} 
          color={profileData.licenseDocument ? theme.colors.primary : '#888888'} 
        />
        <Text style={{
          marginTop: 8,
          fontSize: 14,
          fontWeight: '500',
          color: profileData.licenseDocument ? theme.colors.primary : theme.colors.textSecondary,
        }}>
          {profileData.licenseDocument ? 'Medical License Uploaded' : 'Upload Medical License'}
        </Text>
        <Text style={{
          fontSize: 12,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginTop: 4,
        }}>
          Required for verification
        </Text>
      </TouchableOpacity>

      {/* Diploma Certificate */}
      <TouchableOpacity
        onPress={() => handleImagePicker('diplomaCertificate')}
        style={{
          padding: 16,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: profileData.diplomaCertificate ? theme.colors.primary : '#E5E5E5',
          borderStyle: 'dashed',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Icon 
          name={profileData.diplomaCertificate ? 'check-circle' : 'upload-file'} 
          size={32} 
          color={profileData.diplomaCertificate ? theme.colors.primary : '#888888'} 
        />
        <Text style={{
          marginTop: 8,
          fontSize: 14,
          fontWeight: '500',
          color: profileData.diplomaCertificate ? theme.colors.primary : theme.colors.textSecondary,
        }}>
          {profileData.diplomaCertificate ? 'Diploma Certificate Uploaded' : 'Upload Diploma Certificate'}
        </Text>
        <Text style={{
          fontSize: 12,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginTop: 4,
        }}>
          Dental school graduation certificate
        </Text>
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
              <Text style={{
                color: profileData.paymentMethods.includes(method) 
                  ? theme.colors.primary 
                  : theme.colors.textSecondary,
                fontSize: 12,
                fontWeight: '500',
              }}>
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

      // Validation
      if (!profileData.licenseNumber || !profileData.dentalSchool) {
        Alert.alert('Error', 'Please fill in all required professional information.');
        return;
      }

      if (!profileData.licenseDocument) {
        Alert.alert('Error', 'Please upload your medical license for verification.');
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

      // Submit profile to backend
      const response = await profileService.setupDoctorProfile(apiProfileData);

      if (response.success) {
        // Update Redux state
        dispatch(setProfileComplete(true));
        dispatch(updateUser({
          profileComplete: true,
          doctorProfile: response.data.profile,
        }));

        Alert.alert(
          'Success!', 
          'Your professional profile has been submitted successfully! Your credentials will be verified within 24-48 hours.',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Navigation will be handled automatically by RootNavigator
                // since profileComplete is now true
              }
            }
          ]
        );
      } else {
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
            marginTop: 24,
            gap: 12,
          }}>
            <Button
              title="Previous"
              variant="outline"
              onPress={handlePrevious}
              disabled={currentStep === 1}
              style={{ flex: 1 }}
            />
            <Button
              title={currentStep === totalSteps ? 'Submit for Verification' : 'Next'}
              onPress={handleNext}
              loading={isSubmitting}
              style={{ flex: 1 }}
            />
          </View>

          {/* Verification Notice */}
          {currentStep === totalSteps && (
            <View style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: '#E8F4FD',
              borderRadius: 8,
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.primary,
            }}>
              <Text style={{
                color: theme.colors.primary,
                fontSize: 12,
                fontWeight: '500',
                textAlign: 'center',
              }}>
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
