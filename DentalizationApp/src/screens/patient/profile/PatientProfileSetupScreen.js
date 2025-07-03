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

const PatientProfileSetupScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [profileData, setProfileData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    height: '',
    weight: '',
    
    // Dental Medical History
    previousDentalTreatments: '',
    currentDentalProblems: '',
    lastDentalVisit: '',
    dentalConcerns: '',
    
    // Allergies & Health
    allergies: '',
    medications: '',
    medicalConditions: '',
    smokingStatus: '',
    alcoholConsumption: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    
    // Dental Preferences
    preferredTreatmentTime: '',
    dentalAnxietyLevel: '',
    painTolerance: '',
    insuranceProvider: '',
    insuranceNumber: '',
    
    // Profile Photo
    profilePhoto: null,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Select Profile Photo',
      'Choose how you would like to select your profile picture',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Photo Library', onPress: openImageLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
    };

    launchCamera(options, (response) => {
      if (response.assets && response.assets[0]) {
        setProfileData(prev => ({
          ...prev,
          profilePhoto: response.assets[0]
        }));
      }
    });
  };

  const openImageLibrary = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
    };

    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        setProfileData(prev => ({
          ...prev,
          profilePhoto: response.assets[0]
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
      {[1, 2, 3, 4, 5].map((step) => (
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
          {step < 5 && (
            <View style={{
              width: 24,
              height: 2,
              backgroundColor: step < currentStep ? theme.colors.primary : '#E5E5E5',
              marginHorizontal: 4,
            }} />
          )}
        </View>
      ))}
    </View>
  );

  const renderPersonalInfo = () => (
    <Card>
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 16,
      }}>
        Personal Information
      </Text>

      {/* Profile Photo */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <TouchableOpacity
          onPress={handleImagePicker}
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
          Tap to add profile photo
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <Input
          placeholder="First Name"
          value={profileData.firstName}
          onChangeText={(value) => handleInputChange('firstName', value)}
          leftIcon="person"
          style={{ flex: 1 }}
        />
        <Input
          placeholder="Last Name"
          value={profileData.lastName}
          onChangeText={(value) => handleInputChange('lastName', value)}
          leftIcon="person"
          style={{ flex: 1 }}
        />
      </View>

      <Input
        placeholder="Phone Number"
        value={profileData.phone}
        onChangeText={(value) => handleInputChange('phone', value)}
        keyboardType="phone-pad"
        leftIcon="phone"
      />

      <Input
        placeholder="Address"
        value={profileData.address}
        onChangeText={(value) => handleInputChange('address', value)}
        multiline
        numberOfLines={2}
        leftIcon="home"
        style={{ marginTop: 16 }}
      />

      <Input
        placeholder="Date of Birth (DD/MM/YYYY)"
        value={profileData.dateOfBirth}
        onChangeText={(value) => handleInputChange('dateOfBirth', value)}
        leftIcon="cake"
        style={{ marginTop: 16 }}
      />

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.text,
            marginBottom: 8,
          }}>
            Gender
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['Male', 'Female', 'Other'].map((gender) => (
              <TouchableOpacity
                key={gender}
                onPress={() => handleInputChange('gender', gender)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: profileData.gender === gender ? theme.colors.primary : '#E5E5E5',
                  backgroundColor: profileData.gender === gender ? `${theme.colors.primary}10` : '#FFFFFF',
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: profileData.gender === gender ? theme.colors.primary : theme.colors.textSecondary,
                  fontSize: 12,
                  fontWeight: '500',
                }}>
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <Input
          placeholder="Height (cm)"
          value={profileData.height}
          onChangeText={(value) => handleInputChange('height', value)}
          keyboardType="numeric"
          leftIcon="height"
          style={{ flex: 1 }}
        />
        <Input
          placeholder="Weight (kg)"
          value={profileData.weight}
          onChangeText={(value) => handleInputChange('weight', value)}
          keyboardType="numeric"
          leftIcon="monitor-weight"
          style={{ flex: 1 }}
        />
      </View>

      <Input
        placeholder="Blood Type (A+, B-, O+, etc.)"
        value={profileData.bloodType}
        onChangeText={(value) => handleInputChange('bloodType', value)}
        leftIcon="bloodtype"
        style={{ marginTop: 16 }}
      />
    </Card>
  );

  const renderDentalHistory = () => (
    <Card>
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 16,
      }}>
        Dental Medical History
      </Text>

      <Input
        placeholder="Last Dental Visit (MM/YYYY)"
        value={profileData.lastDentalVisit}
        onChangeText={(value) => handleInputChange('lastDentalVisit', value)}
        leftIcon="event"
      />

      <Input
        placeholder="Current Dental Problems"
        value={profileData.currentDentalProblems}
        onChangeText={(value) => handleInputChange('currentDentalProblems', value)}
        multiline
        numberOfLines={3}
        leftIcon="warning"
        style={{ marginTop: 16 }}
      />

      <Input
        placeholder="Previous Dental Treatments"
        value={profileData.previousDentalTreatments}
        onChangeText={(value) => handleInputChange('previousDentalTreatments', value)}
        multiline
        numberOfLines={3}
        leftIcon="history"
        style={{ marginTop: 16 }}
      />

      <Input
        placeholder="Main Dental Concerns"
        value={profileData.dentalConcerns}
        onChangeText={(value) => handleInputChange('dentalConcerns', value)}
        multiline
        numberOfLines={2}
        leftIcon="psychology"
        style={{ marginTop: 16 }}
      />

      <View style={{ marginTop: 16 }}>
        <Text style={{
          fontSize: 14,
          fontWeight: '500',
          color: theme.colors.text,
          marginBottom: 8,
        }}>
          Dental Anxiety Level
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['Low', 'Medium', 'High', 'Severe'].map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => handleInputChange('dentalAnxietyLevel', level)}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: profileData.dentalAnxietyLevel === level ? theme.colors.primary : '#E5E5E5',
                backgroundColor: profileData.dentalAnxietyLevel === level ? `${theme.colors.primary}10` : '#FFFFFF',
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: profileData.dentalAnxietyLevel === level ? theme.colors.primary : theme.colors.textSecondary,
                fontSize: 12,
                fontWeight: '500',
              }}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Card>
  );

  const renderHealthInfo = () => (
    <Card>
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 16,
      }}>
        Health Information & Allergies
      </Text>

      <Input
        placeholder="Known Allergies (medications, materials, etc.)"
        value={profileData.allergies}
        onChangeText={(value) => handleInputChange('allergies', value)}
        multiline
        numberOfLines={3}
        leftIcon="warning"
      />

      <Input
        placeholder="Current Medications"
        value={profileData.medications}
        onChangeText={(value) => handleInputChange('medications', value)}
        multiline
        numberOfLines={2}
        leftIcon="medication"
        style={{ marginTop: 16 }}
      />

      <Input
        placeholder="Medical Conditions (diabetes, heart disease, etc.)"
        value={profileData.medicalConditions}
        onChangeText={(value) => handleInputChange('medicalConditions', value)}
        multiline
        numberOfLines={3}
        leftIcon="local-hospital"
        style={{ marginTop: 16 }}
      />

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.text,
            marginBottom: 8,
          }}>
            Smoking Status
          </Text>
          <View style={{ gap: 8 }}>
            {['Never', 'Former', 'Current'].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => handleInputChange('smokingStatus', status)}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: profileData.smokingStatus === status ? theme.colors.primary : '#E5E5E5',
                  backgroundColor: profileData.smokingStatus === status ? `${theme.colors.primary}10` : '#FFFFFF',
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: profileData.smokingStatus === status ? theme.colors.primary : theme.colors.textSecondary,
                  fontSize: 12,
                  fontWeight: '500',
                }}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.text,
            marginBottom: 8,
          }}>
            Alcohol Consumption
          </Text>
          <View style={{ gap: 8 }}>
            {['Never', 'Rarely', 'Weekly', 'Daily'].map((frequency) => (
              <TouchableOpacity
                key={frequency}
                onPress={() => handleInputChange('alcoholConsumption', frequency)}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: profileData.alcoholConsumption === frequency ? theme.colors.primary : '#E5E5E5',
                  backgroundColor: profileData.alcoholConsumption === frequency ? `${theme.colors.primary}10` : '#FFFFFF',
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: profileData.alcoholConsumption === frequency ? theme.colors.primary : theme.colors.textSecondary,
                  fontSize: 12,
                  fontWeight: '500',
                }}>
                  {frequency}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Card>
  );

  const renderEmergencyContact = () => (
    <Card>
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 16,
      }}>
        Emergency Contact Information
      </Text>

      <Input
        placeholder="Emergency Contact Name"
        value={profileData.emergencyContactName}
        onChangeText={(value) => handleInputChange('emergencyContactName', value)}
        leftIcon="person"
      />

      <Input
        placeholder="Emergency Contact Phone"
        value={profileData.emergencyContactPhone}
        onChangeText={(value) => handleInputChange('emergencyContactPhone', value)}
        keyboardType="phone-pad"
        leftIcon="phone"
        style={{ marginTop: 16 }}
      />

      <Input
        placeholder="Relationship (spouse, parent, sibling, etc.)"
        value={profileData.emergencyContactRelation}
        onChangeText={(value) => handleInputChange('emergencyContactRelation', value)}
        leftIcon="family-restroom"
        style={{ marginTop: 16 }}
      />
    </Card>
  );

  const renderPreferences = () => (
    <Card>
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 16,
      }}>
        Dental Preferences & Insurance
      </Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={{
          fontSize: 14,
          fontWeight: '500',
          color: theme.colors.text,
          marginBottom: 8,
        }}>
          Preferred Treatment Time
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {['Morning', 'Afternoon', 'Evening', 'Weekend'].map((time) => (
            <TouchableOpacity
              key={time}
              onPress={() => handleInputChange('preferredTreatmentTime', time)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: profileData.preferredTreatmentTime === time ? theme.colors.primary : '#E5E5E5',
                backgroundColor: profileData.preferredTreatmentTime === time ? `${theme.colors.primary}10` : '#FFFFFF',
              }}
            >
              <Text style={{
                color: profileData.preferredTreatmentTime === time ? theme.colors.primary : theme.colors.textSecondary,
                fontSize: 12,
                fontWeight: '500',
              }}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Input
        placeholder="Insurance Provider"
        value={profileData.insuranceProvider}
        onChangeText={(value) => handleInputChange('insuranceProvider', value)}
        leftIcon="shield"
      />

      <Input
        placeholder="Insurance Policy Number"
        value={profileData.insuranceNumber}
        onChangeText={(value) => handleInputChange('insuranceNumber', value)}
        leftIcon="confirmation-number"
        style={{ marginTop: 16 }}
      />

      <View style={{ marginTop: 16 }}>
        <Text style={{
          fontSize: 14,
          fontWeight: '500',
          color: theme.colors.text,
          marginBottom: 8,
        }}>
          Pain Tolerance Level
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['Low', 'Medium', 'High'].map((tolerance) => (
            <TouchableOpacity
              key={tolerance}
              onPress={() => handleInputChange('painTolerance', tolerance)}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: profileData.painTolerance === tolerance ? theme.colors.primary : '#E5E5E5',
                backgroundColor: profileData.painTolerance === tolerance ? `${theme.colors.primary}10` : '#FFFFFF',
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: profileData.painTolerance === tolerance ? theme.colors.primary : theme.colors.textSecondary,
                fontSize: 12,
                fontWeight: '500',
              }}>
                {tolerance}
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

      // Prepare profile data for API
      const apiProfileData = {
        firstName: profileData.firstName || user.firstName || '',
        lastName: profileData.lastName || user.lastName || '',
        dateOfBirth: profileData.dateOfBirth,
        phone: profileData.phone || '',
        address: profileData.address || '',
        emergencyContact: JSON.stringify({
          name: profileData.emergencyContactName,
          phone: profileData.emergencyContactPhone,
          relation: profileData.emergencyContactRelation,
        }),
        
        // Medical information
        allergies: profileData.allergies,
        medications: profileData.medications,
        medicalHistory: JSON.stringify({
          conditions: profileData.medicalConditions,
          smokingStatus: profileData.smokingStatus,
          alcoholConsumption: profileData.alcoholConsumption,
        }),
        insuranceInfo: JSON.stringify({
          provider: profileData.insuranceProvider,
          number: profileData.insuranceNumber,
        }),
        painTolerance: profileData.painTolerance,
        preferredLanguage: 'id', // Default to Indonesian
        dietaryRestrictions: '', // Can be added later
        smokingStatus: profileData.smokingStatus,
        
        // Dental specific
        dentalConcerns: profileData.dentalConcerns,
        previousDentalWork: profileData.previousDentalTreatments,
        lastDentalVisit: profileData.lastDentalVisit ? new Date(profileData.lastDentalVisit) : null,
        
        // App-specific
        profilePicture: profilePictureUrl,
      };

      // Submit profile to backend
      const response = await profileService.setupPatientProfile(apiProfileData);

      if (response.success) {
        // Update Redux state
        dispatch(setProfileComplete(true));
        dispatch(updateUser({
          profileComplete: true,
          patientProfile: response.data.profile,
        }));

        Alert.alert(
          'Success!', 
          'Your dental profile has been created successfully!',
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
      console.error('Profile setup error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 24 }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Icon name="assignment-ind" size={48} color={theme.colors.primary} />
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: theme.colors.text,
              marginTop: 16,
              marginBottom: 8,
            }}>
              Complete Your Dental Profile
            </Text>
            <Text style={{
              fontSize: 16,
              color: theme.colors.textSecondary,
              textAlign: 'center',
            }}>
              Help us provide you with the best dental care by completing your medical profile
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
              title={currentStep === totalSteps ? 'Complete Profile' : 'Next'}
              onPress={handleNext}
              loading={isSubmitting}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PatientProfileSetupScreen;
