import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

import { useTheme } from '../../components/common/ThemeProvider';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { ROUTES } from '../../constants/routes';
import { API_CONFIG } from '../../constants/api';
import { AUTH_ENDPOINTS } from '../../constants/auth';
import authService from '../../services/authService';

const { width, height } = Dimensions.get('window');

const RegisterPatientScreen = ({ navigation }) => {
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const theme = useTheme();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.auth);
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    namaLengkap: '',
    role: 'PATIENT', // Default role
    phoneNumber: '',
    // Patient-specific fields / Data khusus pasien
    bpjsNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
    chronicConditions: '',
    medicalHistory: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Debug state
  const [showDebug, setShowDebug] = useState(false);
  const [payloadPreview, setPayloadPreview] = useState(null);
  const [isLoadingEmailCheck, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Clear previous registration errors when mounting
    dispatch(clearError());
  }, [dispatch]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    // Set showDatePicker to false for Android, keep it visible for iOS
    const isIOS = Platform?.OS === 'ios';
    setShowDatePicker(isIOS);
    
    if (selectedDate && datePickerField) {
      setFormData(prev => ({ ...prev, [datePickerField]: selectedDate }));
    }
    
    // Clear datePicker field on Android after selection
    if (!isIOS) {
      setDatePickerField(null);
    }
  };

  const validateForm = () => {
    // Check required fields
    if (!formData.namaLengkap.trim()) {
      Alert.alert('Error', 'Silakan masukkan nama lengkap Anda');
      return false;
    }
    
    // Make sure both first and last name are provided
    if (!formData.namaLengkap.includes(' ')) {
      Alert.alert('Error', 'Silakan masukkan nama depan dan belakang Anda (pisahkan dengan spasi)');
      return false;
    }
    
    // Check if the last name is at least 2 characters
    const nameParts = formData.namaLengkap.trim().split(' ');
    if (nameParts.length < 2 || nameParts[1].length < 2) {
      Alert.alert('Error', 'Nama belakang harus minimal 2 karakter');
      return false;
    }
    
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Silakan masukkan alamat email Anda');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Silakan masukkan alamat email yang valid');
      return false;
    }
    
    if (!formData.phoneNumber.trim()) {
      Alert.alert('Error', 'Silakan masukkan nomor telepon Anda');
      return false;
    }

    // Validate patient-specific fields
    // BPJS number is optional, but if provided, it should be numeric
    if (formData.bpjsNumber.trim() && isNaN(formData.bpjsNumber)) {
      Alert.alert('Error', 'Nomor BPJS harus berupa angka yang valid');
      return false;
    }
    
    // Emergency contact is required for patients
    if (!formData.emergencyContactName.trim()) {
      Alert.alert('Error', 'Silakan masukkan nama kontak darurat');
      return false;
    }
    
    if (!formData.emergencyContactPhone.trim()) {
      Alert.alert('Error', 'Silakan masukkan nomor telepon kontak darurat');
      return false;
    }
    
    if (!formData.password.trim()) {
      Alert.alert('Error', 'Silakan masukkan kata sandi');
      return false;
    }
    
    // Password validation
    if (formData.password.length < 8) {
      Alert.alert('Error', 'Kata sandi harus minimal 8 karakter');
      return false;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>\[\]])/.test(formData.password)) {
      Alert.alert('Error', 'Kata sandi harus mengandung minimal satu huruf besar, satu huruf kecil, satu angka, dan satu karakter khusus (!@#$%^&*(),.?":{}|<>[])');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Kata sandi tidak cocok');
      return false;
    }

    return true;
  };
  
  const handlePreviewPayload = () => {
    if (!validateForm()) return;
    
    // Split namaLengkap into firstName and lastName for backend compatibility
    let firstName = formData.namaLengkap.trim();
    let lastName = "Default"; // Default lastName value that passes validation
    
    // If the namaLengkap contains a space, split it into firstName and lastName
    if (formData.namaLengkap.includes(" ")) {
      const nameParts = formData.namaLengkap.trim().split(" ");
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(" ");
      // Make sure lastName meets the minimum length requirement
      if (lastName.length < 2) {
        lastName = lastName + " Surname"; // Ensure it meets the 2-character minimum
      }
    }
    
    const registrationData = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: formData.phoneNumber.trim(),
      role: formData.role,
      patientDetails: {
        bpjsNumber: formData.bpjsNumber || "",
        emergencyContact: {
          name: formData.emergencyContactName || "",
          phoneNumber: formData.emergencyContactPhone || ""
        },
        medicalInfo: {
          allergies: formData.allergies || "",
          chronicConditions: formData.chronicConditions || "",
          additionalInfo: formData.medicalHistory || ""
        }
      }
    };
    
    setPayloadPreview(registrationData);
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const email = formData.email.trim().toLowerCase();
      
      // Check if the email already exists before attempting registration
      try {
        const emailCheck = await authService.checkEmailExists(email);
        
        console.log('Email check result:', emailCheck);
        
        if (emailCheck.success && emailCheck.exists) {
          // Email already exists, show friendly message with options
          Alert.alert(
            'Email sudah terdaftar',
            'Email ini sudah digunakan. Silakan gunakan email lain atau masuk jika Anda sudah memiliki akun.',
            [
              { 
                text: 'Gunakan Email Lain',
                onPress: () => {
                  setFormData({...formData, email: ''});
                },
                style: 'default'
              },
              {
                text: 'Masuk',
                onPress: () => navigation.navigate(ROUTES.LOGIN),
                style: 'default'
              }
            ]
          );
          return;
        }
      } catch (emailCheckError) {
        console.log('Error while checking email:', emailCheckError);
        // If email check fails, continue with registration attempt
      }

      // Split namaLengkap into firstName and lastName for backend compatibility
      let firstName = formData.namaLengkap.trim();
      let lastName = "Default"; // Default lastName value that passes validation
      
      // If the namaLengkap contains a space, split it into firstName and lastName
      if (formData.namaLengkap.includes(" ")) {
        const nameParts = formData.namaLengkap.trim().split(" ");
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(" ");
        // Make sure lastName meets the minimum length requirement
        if (lastName.length < 2) {
          lastName = lastName + " Surname"; // Ensure it meets the 2-character minimum
        }
      }
      
      const registrationData = {
        email: email,
        password: formData.password,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: formData.phoneNumber.trim(),
        role: formData.role,
        patientDetails: {
          bpjsNumber: formData.bpjsNumber || "",
          emergencyContact: {
            name: formData.emergencyContactName || "",
            phoneNumber: formData.emergencyContactPhone || ""
          },
          medicalInfo: {
            allergies: formData.allergies || "",
            chronicConditions: formData.chronicConditions || "",
            additionalInfo: formData.medicalHistory || ""
          }
        }
      };

      console.log('Sending registration data:', JSON.stringify(registrationData, null, 2));
      const result = await dispatch(registerUser(registrationData)).unwrap();
      
      // Navigation will be handled by RootNavigator based on auth state
      Alert.alert('Berhasil', 'Akun berhasil dibuat!');
    } catch (error) {
      console.error('Registration error details:', error);
      
      // Provide more specific error message if available
      let errorMessage = 'Gagal melakukan pendaftaran';
      let detailedError = '';
      let errorButtons = [];
      
      if (error.response) {
        const statusCode = error.response.status;
        console.log(`Server returned status code: ${statusCode}`);
        
        if (statusCode === 400) {
          // Check specifically for the "email already exists" message
          if (error.response.data?.message && 
              typeof error.response.data.message === 'string' && 
              (error.response.data.message.toLowerCase().includes('email already exists') || 
               error.response.data.message.toLowerCase().includes('email sudah terdaftar') ||
               error.response.data.message.toLowerCase().includes('sudah digunakan'))) {
            
            errorMessage = 'Email sudah terdaftar';
            detailedError = 'Email ini sudah digunakan. Silakan gunakan email lain atau masuk jika Anda sudah memiliki akun.';
            
            errorButtons = [
              { 
                text: 'Gunakan Email Lain',
                onPress: () => {
                  setFormData({...formData, email: ''});
                },
                style: 'default'
              },
              {
                text: 'Masuk',
                onPress: () => navigation.navigate(ROUTES.LOGIN),
                style: 'default'
              }
            ];
          } else {
            errorMessage = 'Data pendaftaran tidak valid';
            
            if (error.response.data?.message) {
              if (typeof error.response.data.message === 'string') {
                detailedError = error.response.data.message;
              } else if (Array.isArray(error.response.data.message)) {
                detailedError = error.response.data.message.join('\n');
              } else {
                detailedError = JSON.stringify(error.response.data.message);
              }
            }
            
            if (error.response.data?.errors) {
              const errors = error.response.data.errors;
              detailedError = Array.isArray(errors) 
                ? errors.map(e => `${e.field || ''}: ${e.message || ''}`).join('\n') 
                : JSON.stringify(errors);
            }
          }
        } else if (statusCode === 409) {
          errorMessage = 'Email sudah terdaftar';
          detailedError = 'Silakan gunakan email lain atau lakukan reset password jika Anda sudah memiliki akun.';
          
          errorButtons = [
            { 
              text: 'Gunakan Email Lain',
              onPress: () => {
                setFormData({...formData, email: ''});
              },
              style: 'default'
            },
            {
              text: 'Masuk',
              onPress: () => navigation.navigate(ROUTES.LOGIN),
              style: 'default'
            }
          ];
        } else if (statusCode === 500) {
          errorMessage = 'Terjadi kesalahan pada server';
          
          // Check for specific Prisma errors
          if (error.response?.data?.message?.includes('PrismaClientValidationError') || 
              error.response?.data?.message?.includes('token')) {
            detailedError = 'Ada masalah konfigurasi pada server. Tim kami telah diberi tahu dan sedang memperbaiki masalah ini. Silakan coba lagi nanti.';
          } else {
            detailedError = 'Server sedang mengalami masalah. Silakan coba beberapa saat lagi atau hubungi dukungan teknis.';
          }
          
          // For 500 errors, we can suggest reporting the issue
          errorButtons = [
            { 
              text: 'OK',
              style: 'cancel'
            },
            {
              text: 'Coba Lagi dengan Data Lain',
              onPress: () => {
                // Create a slightly modified registration data
                const modifiedEmail = formData.email.split('@');
                if (modifiedEmail.length === 2) {
                  const newEmail = `${modifiedEmail[0]}${Math.floor(Math.random() * 100)}@${modifiedEmail[1]}`;
                  setFormData({...formData, email: newEmail});
                }
              },
              style: 'default'
            }
          ];
          
          // Add extra logging for 500 errors
          console.error('SERVER ERROR DETAILS:');
          console.error('Endpoint:', `${API_CONFIG.BASE_URL}${AUTH_ENDPOINTS.REGISTER}`);
          console.error('Request payload:', JSON.stringify(registrationData, null, 2));
          console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
          console.error('Response status:', error.response?.status);
          console.error('Response headers:', JSON.stringify(error.response?.headers, null, 2));
        } else {
          errorMessage = `Pendaftaran gagal (${statusCode})`;
          detailedError = error.response.data?.message || 'Terjadi kesalahan tidak terduga.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Tidak ada respon dari server';
        detailedError = 'Server tidak merespon. Silakan periksa koneksi internet Anda atau coba lagi nanti.';
      } else if (error.message) {
        // Something happened in setting up the request that triggered an Error
        errorMessage = 'Error';
        detailedError = error.message;
      } else {
        // Unknown error occurred
        errorMessage = 'Error tidak diketahui';
        detailedError = 'Terjadi kesalahan tidak terduga. Silakan coba lagi nanti.';
      }
      
      // Display error alert with custom buttons if available
      if (errorButtons.length > 0) {
        Alert.alert(errorMessage, detailedError, errorButtons);
      } else {
        Alert.alert(errorMessage, detailedError);
      }
    }
  };
  
  // Generate random patient data for testing
  const generateRandomPatient = () => {
    // Create truly unique email with random components
    const randomNum = Math.floor(Math.random() * 10000);
    const timestamp = Date.now(); // Add timestamp for uniqueness
    const randomString = Math.random().toString(36).substring(2, 8); // Random alphanumeric string
    
    // Format: pasien.test_[timestamp]_[random]_[randomString]@dentalization.com
    const uniqueEmail = `pasien.test_${timestamp}_${randomNum}_${randomString}@dentalization.com`;
    
    setFormData({
      email: uniqueEmail,
      password: 'Test1234!',
      confirmPassword: 'Test1234!',
      namaLengkap: `Pasien Test ${randomNum}`,
      role: 'PATIENT',
      phoneNumber: `08123456${randomNum}`,
      bpjsNumber: `${Math.floor(Math.random() * 10000000000)}`,
      emergencyContactName: 'Kontak Darurat Test',
      emergencyContactPhone: `08111222${randomNum}`,
      allergies: 'Tidak ada',
      chronicConditions: 'Tidak ada',
      medicalHistory: 'Tidak ada riwayat medis khusus',
    });
    
    console.log(`Generated unique test email: ${uniqueEmail}`);
  };
  
  const testServerConnection = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/health`, {
        timeout: 5000,
      });
      
      Alert.alert(
        'Status Server', 
        `Koneksi ke server berhasil!\nStatus: ${response.status}\nResponse: ${JSON.stringify(response.data, null, 2)}`
      );
    } catch (error) {
      console.error('Server connection test failed:', error);
      Alert.alert(
        'Koneksi Gagal', 
        `Gagal terhubung ke server: ${error.message}\n${error.response ? JSON.stringify(error.response.data, null, 2) : 'No response data'}`
      );
    }
  };

  // Test function to manually verify email existence check
  const testEmailCheck = async () => {
    try {
      const email = formData.email.trim().toLowerCase();
      
      if (!email) {
        Alert.alert('Error', 'Silakan masukkan alamat email untuk diperiksa');
        return;
      }
      
      console.log(`Testing email check for: ${email}`);
      
      // Start loading indicator
      setIsLoading(true);
      
      // Direct call to check email
      const response = await authService.checkEmailExists(email);
      
      console.log('Response from email check:', response);
      
      // Show result in alert
      Alert.alert(
        'Hasil Pemeriksaan Email',
        `Email: ${email}\n` +
        `Status: ${response.success ? 'Berhasil' : 'Gagal'}\n` +
        `Email terdaftar: ${response.exists ? 'Ya' : 'Tidak'}\n` +
        `Pesan: ${response.message || '-'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error testing email check:', error);
      Alert.alert('Error', `Gagal memeriksa email: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Hard-coded test function to verify direct server connectivity
  const testDirectServerConnectivity = async () => {
    try {
      // Try connecting to the health endpoint
      const healthResponse = await axios.get(`${API_CONFIG.BASE_URL}/health`, {
        timeout: 5000,
      });
      
      console.log('Health check result:', healthResponse.data);
      
      // Generate a unique test email
      const testEmail = `test_${Date.now()}_${Math.floor(Math.random() * 10000)}@dentalization.test`;
      const testPassword = 'Test1234!';
      
      // Create a minimal test user
      const testUser = {
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '08123456789',
        role: 'PATIENT',
        patientDetails: {
          bpjsNumber: '123456789',
          emergencyContact: {
            name: 'Emergency Contact',
            phoneNumber: '08123456789'
          },
          medicalInfo: {
            allergies: 'None',
            chronicConditions: 'None',
            additionalInfo: 'None'
          }
        }
      };
      
      // Try making a direct registration request
      console.log('Testing registration with payload:', testUser);
      const result = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/register`, testUser, {
        timeout: 10000
      });
      
      console.log('Registration result:', result.data);
      
      Alert.alert(
        'Test Berhasil', 
        `Berhasil terhubung ke server dan mendaftarkan pengguna tes.\n\nEmail: ${testEmail}\nPassword: ${testPassword}\n\nStatus: ${result.status}\nPesan: ${result.data.message || 'Berhasil'}`
      );
    } catch (error) {
      console.error('Direct server connectivity test failed:', error);
      
      let errorDetails = '';
      if (error.response) {
        errorDetails = `Status: ${error.response.status}\nData: ${JSON.stringify(error.response.data, null, 2)}`;
      } else if (error.request) {
        errorDetails = 'No response received from server';
      } else {
        errorDetails = error.message;
      }
      
      Alert.alert(
        'Test Gagal', 
        `Gagal terhubung ke server:\n${errorDetails}`
      );
    }
  };

  // Quick registration test with simplified payload
  const testQuickRegistration = async () => {
    try {
      const timestamp = Date.now();
      const testUser = {
        email: `quick.test.${timestamp}@dentalization.com`,
        password: 'Test1234!',
        firstName: 'Quick',
        lastName: 'Test',
        phoneNumber: '08123456789',
        role: 'PATIENT',
        patientDetails: {
          bpjsNumber: '123456789',
          emergencyContact: {
            name: 'Emergency Contact',
            phoneNumber: '08123456789'
          },
          medicalInfo: {
            allergies: 'None',
            chronicConditions: 'None',
            additionalInfo: 'None'
          }
        }
      };

      console.log('Testing quick registration with:', testUser);
      
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/register`, testUser, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Quick registration success:', response.data);
      
      Alert.alert(
        'Registrasi Berhasil!', 
        `Berhasil mendaftarkan akun dengan email: ${testUser.email}\n\nToken: ${response.data.data.token ? 'Diterima' : 'Tidak ada'}`
      );
    } catch (error) {
      console.error('Quick registration failed:', error);
      
      let errorMessage = 'Registrasi gagal';
      if (error.response) {
        errorMessage = `Status: ${error.response.status}\nPesan: ${JSON.stringify(error.response.data, null, 2)}`;
      } else if (error.request) {
        errorMessage = 'Tidak ada respon dari server';
      } else {
        errorMessage = error.message;
      }
      
      Alert.alert('Registrasi Gagal', errorMessage);
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform?.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{
              flex: 1,
              paddingHorizontal: 24,
              paddingVertical: 32,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }}>
            {/* Header */}
            <Animated.View style={{ 
              alignItems: 'center', 
              marginBottom: 40,
              transform: [{ scale: scaleAnim }]
            }}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 32,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}>
                <Icon name="person-add" size={50} color="#FFFFFF" />
              </View>
              <Text style={{
                fontSize: 32,
                fontWeight: '800',
                color: '#FFFFFF',
                marginBottom: 12,
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
                letterSpacing: 0.5,
                textAlign: 'center',
              }}>
                Buat Akun Pasien
              </Text>
              <Text style={{
                fontSize: 18,
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                fontWeight: '500',
                letterSpacing: 0.3,
                paddingHorizontal: 20,
              }}>
                Daftar untuk mendapatkan layanan dental terbaik
              </Text>
            </Animated.View>

            {/* Registration Form */}
            <Animated.View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 24,
              padding: 32,
              marginBottom: 32,
              backdropFilter: 'blur(20px)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.25,
              shadowRadius: 25,
              elevation: 15,
              opacity: fadeAnim,
            }}>
              <Text style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  marginBottom: 28,
                  textAlign: 'center',
                  letterSpacing: 0.5,
                }}>
                  Informasi Pribadi
                </Text>

              {/* Basic Information */}
              <View style={{ marginBottom: 24 }}>
                <Input
                  label="Nama Lengkap"
                  placeholder="Masukkan nama lengkap Anda"
                  value={formData.namaLengkap}
                  onChangeText={(text) => handleInputChange('namaLengkap', text)}
                  leftIcon="person"
                  autoCapitalize="words"
                  required
                  style={{ 
                    marginBottom: 20,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 16,
                    borderWidth: 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  placeholderTextColor="rgba(0, 0, 0, 0.6)"
                />

                <Input
                  label="Email"
                  placeholder="Masukkan alamat email Anda"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  leftIcon="email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  required
                  style={{ 
                    marginBottom: 20,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 16,
                    borderWidth: 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  placeholderTextColor="rgba(0, 0, 0, 0.6)"
                />

                <Input
                  label="Nomor Telepon"
                  placeholder="Masukkan nomor telepon Anda"
                  value={formData.phoneNumber}
                  onChangeText={(text) => handleInputChange('phoneNumber', text)}
                  leftIcon="phone"
                  keyboardType="phone-pad"
                  required
                  style={{ 
                    marginBottom: 20,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 16,
                    borderWidth: 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  placeholderTextColor="rgba(0, 0, 0, 0.6)"
                />
              </View>

              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: theme.colors.text,
                marginBottom: 24,
              }}>
                Informasi Medis
              </Text>

              {/* Patient-specific Information */}
              <View style={{ marginBottom: 24 }}>
                <Input
                  label="Nomor BPJS (opsional)"
                  placeholder="Masukkan nomor BPJS Anda jika ada"
                  value={formData.bpjsNumber}
                  onChangeText={(text) => handleInputChange('bpjsNumber', text)}
                  leftIcon="credit-card"
                  keyboardType="number-pad"
                />

                <Input
                  label="Nama Kontak Darurat"
                  placeholder="Masukkan nama kontak darurat"
                  value={formData.emergencyContactName}
                  onChangeText={(text) => handleInputChange('emergencyContactName', text)}
                  leftIcon="contacts"
                  required
                />

                <Input
                  label="Nomor Telepon Kontak Darurat"
                  placeholder="Masukkan nomor telepon kontak darurat"
                  value={formData.emergencyContactPhone}
                  onChangeText={(text) => handleInputChange('emergencyContactPhone', text)}
                  leftIcon="phone"
                  keyboardType="phone-pad"
                  required
                />

                <Input
                  label="Alergi (opsional)"
                  placeholder="Sebutkan alergi yang Anda miliki"
                  value={formData.allergies}
                  onChangeText={(text) => handleInputChange('allergies', text)}
                  leftIcon="error-outline"
                  multiline
                />

                <Input
                  label="Kondisi Kronis (opsional)"
                  placeholder="Sebutkan kondisi kronis yang Anda miliki"
                  value={formData.chronicConditions}
                  onChangeText={(text) => handleInputChange('chronicConditions', text)}
                  leftIcon="medical-services"
                  multiline
                />

                <Input
                  label="Riwayat Medis (opsional)"
                  placeholder="Berikan informasi tentang riwayat medis Anda"
                  value={formData.medicalHistory}
                  onChangeText={(text) => handleInputChange('medicalHistory', text)}
                  leftIcon="history"
                  multiline
                />
              </View>

              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: theme.colors.text,
                marginBottom: 24,
              }}>
                Kata Sandi
              </Text>

              {/* Password Fields */}
              <View style={{ marginBottom: 24 }}>
                <Input
                  label="Kata Sandi"
                  placeholder="Masukkan kata sandi Anda"
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  leftIcon="lock"
                  secureTextEntry={!showPassword}
                  rightIcon={showPassword ? 'visibility' : 'visibility-off'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  required
                />
                
                <Input
                  label="Konfirmasi Kata Sandi"
                  placeholder="Masukkan kembali kata sandi Anda"
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleInputChange('confirmPassword', text)}
                  leftIcon="lock"
                  secureTextEntry={!showConfirmPassword}
                  rightIcon={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  required
                />
                
                {/* Password Requirements */}
                <Text style={{
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  marginTop: 8,
                  marginBottom: 16,
                }}>
                  Kata sandi harus mengandung:
                </Text>
                <View style={{ marginLeft: 8 }}>
                  <Text style={{
                    fontSize: 12,
                    color: formData.password.length >= 8 ? theme.colors.success : theme.colors.textSecondary,
                    marginBottom: 4,
                  }}>
                    • Minimal 8 karakter
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: /[A-Z]/.test(formData.password) ? theme.colors.success : theme.colors.textSecondary,
                    marginBottom: 4,
                  }}>
                    • Minimal satu huruf besar (A-Z)
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: /[a-z]/.test(formData.password) ? theme.colors.success : theme.colors.textSecondary,
                    marginBottom: 4,
                  }}>
                    • Minimal satu huruf kecil (a-z)
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: /\d/.test(formData.password) ? theme.colors.success : theme.colors.textSecondary,
                    marginBottom: 4,
                  }}>
                    • Minimal satu angka (0-9)
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: /[!@#$%^&*(),.?":{}|<>\[\]]/.test(formData.password) ? theme.colors.success : theme.colors.textSecondary,
                  }}>
                    • Minimal satu karakter khusus {'(!@#$%^&*(),.?":{}|<>[])'}
                  </Text>
                </View>
              </View>
              
              {/* Form Actions */}
              <View style={{ gap: 12 }}>
                <Button
                  title="Periksa Data"
                  type="outline"
                  onPress={handlePreviewPayload}
                  leftIcon="fact-check"
                />
                
                <Button
                  title="Daftar Sekarang"
                  onPress={handleRegister}
                  loading={isLoading}
                  disabled={isLoading}
                  leftIcon="how-to-reg"
                  style={{ 
                    marginTop: 32,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    paddingVertical: 18,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                  textStyle={{
                    color: '#667eea',
                    fontSize: 18,
                    fontWeight: '700',
                    letterSpacing: 0.5,
                  }}
                />

                <TouchableOpacity
                  onPress={() => navigation.navigate(ROUTES.LOGIN)}
                  style={{ alignSelf: 'center', marginTop: 8, padding: 8 }}
                >
                  <Text style={{
                    fontSize: 14,
                    color: theme.colors.primary,
                  }}>
                    Sudah memiliki akun? Masuk di sini
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Debug Options */}
            <TouchableOpacity
              style={{ alignSelf: 'center', padding: 12, marginTop: 8 }}
              onPress={() => setShowDebug(!showDebug)}
            >
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                {showDebug ? 'Sembunyikan Opsi Debug' : 'Tampilkan Opsi Debug'}
              </Text>
            </TouchableOpacity>
            
            {showDebug && (
              <Animated.View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 20,
                padding: 20,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.15)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 15,
                elevation: 10,
              }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: theme.colors.text }}>
                  Opsi Debug
                </Text>
                <View style={{ gap: 8 }}>
                  <Button 
                    title="Isi Data Tes" 
                    type="outline" 
                    onPress={generateRandomPatient}
                    color={theme.colors.warning}
                    leftIcon="bug-report"
                  />
                  <Button 
                    title="Periksa Koneksi Server" 
                    type="outline" 
                    onPress={testServerConnection}
                    color={theme.colors.info}
                    leftIcon="wifi-tethering"
                  />
                  <Button 
                    title="Registrasi Cepat" 
                    type="outline" 
                    onPress={testQuickRegistration}
                    color={theme.colors.success}
                    leftIcon="flash-on"
                  />
                  <Button 
                    title="Uji Pendaftaran" 
                    type="outline" 
                    onPress={testDirectServerConnectivity}
                    color={theme.colors.warning}
                    leftIcon="assessment"
                  />
                  <Button 
                    title="Periksa Email" 
                    type="outline" 
                    onPress={testEmailCheck}
                    color={theme.colors.primary}
                    leftIcon="email"
                  />
                  <Button 
                    title="Cek Email Terdaftar" 
                    type="outline" 
                    onPress={testEmailCheck}
                    color={theme.colors.info}
                    leftIcon="email"
                    loading={isLoadingEmailCheck}
                    disabled={isLoadingEmailCheck}
                  />
                  <Button 
                    title="Tes Konektivitas Langsung" 
                    type="outline" 
                    onPress={testDirectServerConnectivity}
                    color={theme.colors.success}
                    leftIcon="check-circle"
                  />
                  <Button 
                    title="Uji Registrasi Cepat" 
                    type="outline" 
                    onPress={testQuickRegistration}
                    color={theme.colors.success}
                    leftIcon="check-circle"
                  />
                </View>
              </Animated.View>
            )}
            
            {/* Payload Preview Modal */}
            <Modal
              visible={!!payloadPreview}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setPayloadPreview(null)}
            >
              <View style={{
                flex: 1,
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: 16,
              }}>
                <Animated.View style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: 20,
                  padding: 24,
                  maxHeight: '80%',
                  backdropFilter: 'blur(20px)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 15 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  elevation: 20,
                }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
                    Preview Data Pendaftaran
                  </Text>
                  <ScrollView style={{ maxHeight: 400 }}>
                    <Text style={{ fontFamily: 'monospace' }}>
                      {JSON.stringify(payloadPreview, null, 2)}
                    </Text>
                  </ScrollView>
                  <View style={{ flexDirection: 'row', marginTop: 16, justifyContent: 'space-between' }}>
                    <Button 
                      title="Tutup" 
                      type="outline"
                      onPress={() => setPayloadPreview(null)}
                    />
                    <Button 
                      title="Daftar dengan Data Ini" 
                      onPress={() => {
                        setPayloadPreview(null);
                        handleRegister();
                      }}
                    />
                  </View>
                </Animated.View>
              </View>
            </Modal>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
        
        {/* Date Picker (shown conditionally) */}
        {showDatePicker && (
          <DateTimePicker
            value={formData[datePickerField] || new Date()}
            mode="date"
            display={Platform?.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default RegisterPatientScreen;
