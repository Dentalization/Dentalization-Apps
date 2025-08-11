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
  Switch,
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
import { wp, hp, spacing, fontSizes, borderRadius, iconSizes, responsiveDimensions } from '../../utils/responsive';
import ResponsiveContainer from '../../components/layouts/ResponsiveContainer';
import ResponsiveCard from '../../components/layouts/ResponsiveCard';
import ResponsiveText from '../../components/layouts/ResponsiveText';

const { width, height } = Dimensions.get('window');

const RegisterDoctorScreen = ({ navigation }) => {
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const theme = useTheme();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.auth);
  
  // Pilihan spesialisasi gigi untuk pendaftaran dokter
  const dentalSpecializations = [
    'Dokter Gigi Umum',
    'Ortodontis',
    'Periodontis',
    'Endodontis',
    'Bedah Mulut',
    'Prostodontis',
    'Dokter Gigi Anak',
    'Kedokteran Gigi Kosmetik',
    'Patologi Oral',
    'Radiologi Gigi',
    'Implantologi',
  ];
  
  // Pilihan kualifikasi pendidikan gigi
  const educationQualifications = [
    'drg (Dokter Gigi)',
    'Sp.KG (Spesialis Konservasi Gigi)',
    'Sp.Ort (Spesialis Ortodonti)',
    'Sp.Perio (Spesialis Periodonti)',
    'Sp.BM (Spesialis Bedah Mulut)',
    'Sp.Pros (Spesialis Prostodonti)',
    'Sp.KGA (Spesialis Kedokteran Gigi Anak)',
    'PhD (Doktor)',
    'Lainnya',
  ];
  
  // Layanan perawatan yang ditawarkan oleh dokter gigi
  const treatmentServices = [
    'Pemeriksaan Umum',
    'Pembersihan Gigi',
    'Tambal Gigi',
    'Perawatan Saluran Akar',
    'Mahkota & Jembatan Gigi',
    'Gigi Palsu',
    'Implan Gigi',
    'Kawat Gigi & Aligner',
    'Pemutihan Gigi',
    'Pencabutan Gigi',
    'Perawatan Gusi',
    'Kedokteran Gigi Anak',
  ];

  // Jenis konsultasi
  const consultationTypes = [
    'Tatap Muka',
    'Virtual',
    'Darurat',
    'Kunjungan Rumah'
  ];
  
  // Working hours state
  const [showWorkingHoursModal, setShowWorkingHoursModal] = useState(false);
  const [selectedDays, setSelectedDays] = useState({
    senin: { active: false, start: '09:00', end: '17:00' },
    selasa: { active: false, start: '09:00', end: '17:00' },
    rabu: { active: false, start: '09:00', end: '17:00' },
    kamis: { active: false, start: '09:00', end: '17:00' },
    jumat: { active: false, start: '09:00', end: '17:00' },
    sabtu: { active: false, start: '09:00', end: '14:00' },
    minggu: { active: false, start: '09:00', end: '14:00' }
  });
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    namaLengkap: '',
    role: 'DOCTOR', // Default role for this screen
    phoneNumber: '',
    // Doctor-specific fields
    title: '',
    licenseNumber: '',
    licenseIssuingBody: '',
    licenseExpiryDate: null,
    registrationNumber: '',
    primarySpecialization: '',
    educationQualification: '',
    yearsOfExperience: '',
    clinicName: '',
    clinicAddress: '',
    clinicWorkingHours: '',
    consultationFee: '',
    acceptsInsurance: false,
    acceptsBPJS: false,
    emergencyAvailability: false,
    consultationTypes: [],
    servicesOffered: [],
    about: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Debug state
  const [showDebug, setShowDebug] = useState(false);
  const [payloadPreview, setPayloadPreview] = useState(null);
  const [isLoadingEmailCheck, setIsLoadingEmailCheck] = useState(false);
  
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

  // Function to format working hours from selectedDays
  const formatWorkingHours = () => {
    const dayNames = {
      senin: 'Sen', selasa: 'Sel', rabu: 'Rab', kamis: 'Kam', 
      jumat: 'Jum', sabtu: 'Sab', minggu: 'Min'
    };
    
    const activeDays = Object.entries(selectedDays)
      .filter(([_, data]) => data.active)
      .map(([day, data]) => `${dayNames[day]}: ${data.start}-${data.end}`);
    
    return activeDays.length > 0 ? activeDays.join(', ') : '';
  };

  // Function to update working hours when modal closes
  const updateWorkingHours = () => {
    const formattedHours = formatWorkingHours();
    setFormData(prev => ({ ...prev, clinicWorkingHours: formattedHours }));
    setShowWorkingHoursModal(false);
  };

  // Function to toggle day selection
  const toggleDay = (day) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active }
    }));
  };

  // Function to update time for a specific day
  const updateDayTime = (day, field, value) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Function to format currency input
  const formatCurrency = (value) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Convert to number and format with thousands separators
    if (numericValue === '') return '';
    
    const number = parseInt(numericValue);
    return number.toLocaleString('id-ID');
  };

  // Function to parse currency back to number
  const parseCurrency = (formattedValue) => {
    if (!formattedValue) return '';
    return formattedValue.replace(/[^0-9]/g, '');
  };

  const handleCurrencyChange = (value) => {
    const formatted = formatCurrency(value);
    setFormData(prev => ({ ...prev, consultationFee: formatted }));
  };

  // Function to sanitize and prepare data for database
  const sanitizeDataForDatabase = (data) => {
    const sanitized = { ...data };
    
    // Ensure required fields are present and properly formatted
    if (sanitized.licenseNumber) sanitized.licenseNumber = sanitized.licenseNumber.trim();
    if (sanitized.phone) sanitized.phone = sanitized.phone.trim();
    
    // Ensure string fields are trimmed
    const stringFields = [
      'email', 'firstName', 'lastName', 'phone', 'licenseNumber',
      'specialization', 'education', 'clinicName', 'clinicAddress', 
      'workingHours', 'bio'
    ];
    
    stringFields.forEach(field => {
      if (sanitized[field] && typeof sanitized[field] === 'string') {
        sanitized[field] = sanitized[field].trim();
      }
    });
    
    // Ensure numeric fields are properly formatted
    if (sanitized.experience) {
      sanitized.experience = parseInt(sanitized.experience) || 0;
    }
    
    if (sanitized.consultationFee) {
      sanitized.consultationFee = parseFloat(sanitized.consultationFee) || null;
    }
    
    // Ensure arrays are properly formatted
    if (sanitized.services) {
      sanitized.services = Array.isArray(sanitized.services) 
        ? sanitized.services.filter(service => service && service.trim())
        : [];
    }
    
    return sanitized;
  };

  const toggleService = (service) => {
    setFormData(prev => {
      if (prev.servicesOffered.includes(service)) {
        return { ...prev, servicesOffered: prev.servicesOffered.filter(s => s !== service) };
      } else {
        return { ...prev, servicesOffered: [...prev.servicesOffered, service] };
      }
    });
  };
  
  const toggleConsultationType = (type) => {
    setFormData(prev => {
      if (prev.consultationTypes.includes(type)) {
        return { ...prev, consultationTypes: prev.consultationTypes.filter(t => t !== type) };
      } else {
        return { ...prev, consultationTypes: [...prev.consultationTypes, type] };
      }
    });
  };

  const showDatePickerDialog = (field) => {
    setDatePickerField(field);
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate && datePickerField) {
      setFormData(prev => ({ ...prev, [datePickerField]: selectedDate }));
    }
    
    // Clear datePicker field after selection
    if (Platform.OS === 'android') {
      setDatePickerField(null);
    }
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
    setDatePickerField(null);
  };

  // Function to format date in a more readable format
  const formatDateForDisplay = (date) => {
    if (!date) return 'Pilih tanggal';
    
    const options = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      weekday: 'long'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  // Function to get relative date info
  const getDateInfo = (date) => {
    if (!date) return null;
    
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    
    return {
      daysFromNow: diffDays,
      yearsFromNow: diffYears,
      isValid: diffDays > 0
    };
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

    // Validate doctor-specific fields
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Silakan masukkan gelar profesional Anda');
      return false;
    }
    
    if (!formData.licenseNumber.trim()) {
      Alert.alert('Error', 'Silakan masukkan nomor SIP Anda');
      return false;
    }
    
    if (!formData.licenseIssuingBody.trim()) {
      Alert.alert('Error', 'Silakan masukkan badan yang mengeluarkan SIP');
      return false;
    }
    
    if (!formData.licenseExpiryDate) {
      Alert.alert('Error', 'Silakan pilih tanggal berakhir SIP Anda');
      return false;
    }
    
    // Validate that license expiry date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    const expiryDate = new Date(formData.licenseExpiryDate);
    expiryDate.setHours(0, 0, 0, 0);
    
    if (expiryDate <= today) {
      Alert.alert('Error', 'Tanggal berakhir SIP harus di masa depan');
      return false;
    }
    
    if (!formData.registrationNumber.trim()) {
      Alert.alert('Error', 'Silakan masukkan nomor STR Anda');
      return false;
    }
    
    if (!formData.primarySpecialization) {
      Alert.alert('Error', 'Silakan pilih spesialisasi utama Anda');
      return false;
    }
    
    if (!formData.educationQualification) {
      Alert.alert('Error', 'Silakan pilih kualifikasi pendidikan Anda');
      return false;
    }
    
    if (!formData.yearsOfExperience.trim()) {
      Alert.alert('Error', 'Silakan masukkan tahun pengalaman Anda');
      return false;
    }
    
    // Validate years of experience is a number and reasonable
    const experience = parseInt(formData.yearsOfExperience);
    if (isNaN(experience) || experience < 0 || experience > 60) {
      Alert.alert('Error', 'Tahun pengalaman harus berupa angka yang valid (0-60 tahun)');
      return false;
    }
    
    // Validate clinic information
    if (!formData.clinicName.trim()) {
      Alert.alert('Error', 'Silakan masukkan nama klinik Anda');
      return false;
    }
    
    if (!formData.clinicAddress.trim()) {
      Alert.alert('Error', 'Silakan masukkan alamat klinik Anda');
      return false;
    }
    
    if (!formData.clinicWorkingHours.trim()) {
      Alert.alert('Error', 'Silakan atur jam praktik klinik Anda');
      return false;
    }
    
    // Validate consultation types
    if (formData.consultationTypes.length === 0) {
      Alert.alert('Error', 'Silakan pilih minimal satu jenis konsultasi');
      return false;
    }
    
    // Validate services offered
    if (formData.servicesOffered.length === 0) {
      Alert.alert('Error', 'Silakan pilih minimal satu layanan yang Anda tawarkan');
      return false;
    }
    
    // Validate consultation fee if provided
    if (formData.consultationFee.trim()) {
      const numericFee = parseCurrency(formData.consultationFee);
      if (!numericFee || isNaN(numericFee) || parseFloat(numericFee) < 0) {
        Alert.alert('Error', 'Biaya konsultasi harus berupa angka yang valid');
        return false;
      }
      
      // Check if fee is reasonable (between 10,000 and 10,000,000)
      const feeValue = parseFloat(numericFee);
      if (feeValue < 10000) {
        Alert.alert('Error', 'Biaya konsultasi minimal Rp 10.000');
        return false;
      }
      if (feeValue > 10000000) {
        Alert.alert('Error', 'Biaya konsultasi maksimal Rp 10.000.000');
        return false;
      }
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
      role: formData.role,
      // Only include fields that are confirmed to exist in DoctorProfile schema
      licenseNumber: formData.licenseNumber.trim(),
      phone: formData.phoneNumber.trim(),
      specialization: formData.primarySpecialization,
      experience: parseInt(formData.yearsOfExperience) || 0,
      education: formData.educationQualification,
      clinicName: formData.clinicName.trim(),
      clinicAddress: formData.clinicAddress.trim(),
      workingHours: formData.clinicWorkingHours.trim(),
      consultationFee: formData.consultationFee ? parseFloat(parseCurrency(formData.consultationFee)) : null,
      bio: formData.about || "",
      // Map to correct schema field names based on available options
      services: formData.servicesOffered,
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
        role: formData.role,
        // Only include fields that are confirmed to exist in DoctorProfile schema
        licenseNumber: formData.licenseNumber.trim(),
        phone: formData.phoneNumber.trim(),
        specialization: formData.primarySpecialization,
        experience: parseInt(formData.yearsOfExperience) || 0,
        education: formData.educationQualification,
        clinicName: formData.clinicName.trim(),
        clinicAddress: formData.clinicAddress.trim(),
        workingHours: formData.clinicWorkingHours.trim(),
        consultationFee: formData.consultationFee && formData.consultationFee.trim() 
          ? parseFloat(parseCurrency(formData.consultationFee)) 
          : null,
        bio: formData.about ? formData.about.trim() : "",
        // Map to correct schema field names based on available options
        services: Array.isArray(formData.servicesOffered) ? formData.servicesOffered : [],
      };

      // Sanitize data before sending
      const sanitizedData = sanitizeDataForDatabase(registrationData);

      console.log('Sending registration data:', JSON.stringify(sanitizedData, null, 2));
      
      // Additional logging for debugging
      console.log('🔍 Registration Debug Info:');
      console.log('- Email:', email);
      console.log('- License Expiry Date:', formData.licenseExpiryDate);
      console.log('- License Expiry ISO:', formData.licenseExpiryDate ? formData.licenseExpiryDate.toISOString() : 'null');
      console.log('- Consultation Types Count:', formData.consultationTypes.length);
      console.log('- Services Offered Count:', formData.servicesOffered.length);
      console.log('- Years of Experience:', parseInt(formData.yearsOfExperience) || 0);
      console.log('- Consultation Fee (formatted):', formData.consultationFee);
      console.log('- Consultation Fee (numeric):', formData.consultationFee ? parseFloat(parseCurrency(formData.consultationFee)) : null);
      
      const result = await dispatch(registerUser(sanitizedData)).unwrap();
      
      console.log('✅ Registration successful:', result);
      
      // Navigation will be handled by RootNavigator based on auth state
      Alert.alert('Berhasil', 'Akun dokter berhasil dibuat! Silakan tunggu verifikasi dari admin.', [
        {
          text: 'OK',
          onPress: () => {
            console.log('Registration completed, navigating to login');
            navigation.navigate(ROUTES.LOGIN);
          }
        }
      ]);
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
          detailedError = 'Server sedang mengalami masalah. Silakan coba beberapa saat lagi atau hubungi dukungan teknis.';
          
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
          console.error('Request payload:', JSON.stringify(sanitizedData, null, 2));
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
  
  // Generate random doctor data for testing
  const generateRandomDoctor = () => {
    // Create truly unique email with random components
    const randomNum = Math.floor(Math.random() * 10000);
    const timestamp = Date.now(); // Add timestamp for uniqueness
    const randomString = Math.random().toString(36).substring(2, 8); // Random alphanumeric string
    
    // Format: dokter.test_[timestamp]_[random]_[randomString]@dentalization.com
    const uniqueEmail = `dokter.test_${timestamp}_${randomNum}_${randomString}@dentalization.com`;
    
    // Set random working hours
    setSelectedDays({
      senin: { active: true, start: '09:00', end: '17:00' },
      selasa: { active: true, start: '09:00', end: '17:00' },
      rabu: { active: true, start: '09:00', end: '17:00' },
      kamis: { active: true, start: '09:00', end: '17:00' },
      jumat: { active: true, start: '09:00', end: '17:00' },
      sabtu: { active: true, start: '09:00', end: '14:00' },
      minggu: { active: false, start: '09:00', end: '14:00' }
    });
    
    setFormData({
      email: uniqueEmail,
      password: 'Test1234!',
      confirmPassword: 'Test1234!',
      namaLengkap: `Dr. Test ${randomNum}`,
      role: 'DOCTOR',
      phoneNumber: `08123456${randomNum}`,
      title: 'drg.',
      licenseNumber: `SIP-${randomNum}`,
      licenseIssuingBody: 'Dinas Kesehatan Jakarta',
      licenseExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
      registrationNumber: `STR-${randomNum}`,
      primarySpecialization: dentalSpecializations[Math.floor(Math.random() * dentalSpecializations.length)],
      educationQualification: educationQualifications[Math.floor(Math.random() * educationQualifications.length)],
      yearsOfExperience: `${Math.floor(Math.random() * 20) + 1}`,
      clinicName: `Klinik Gigi Test ${randomNum}`,
      clinicAddress: `Jalan Test No. ${randomNum}, Jakarta Selatan`,
      clinicWorkingHours: 'Sen-Jum: 09:00-17:00, Sab: 09:00-14:00',
      consultationFee: formatCurrency(`${(Math.floor(Math.random() * 500) + 100) * 1000}`),
      acceptsInsurance: Math.random() > 0.5,
      acceptsBPJS: Math.random() > 0.5,
      emergencyAvailability: Math.random() > 0.5,
      consultationTypes: ['Tatap Muka', 'Virtual'],
      servicesOffered: [
        'Pemeriksaan Umum',
        'Pembersihan Gigi',
        'Tambal Gigi'
      ],
      about: 'Dokter gigi dengan pengalaman dalam perawatan gigi secara komprehensif. Lulusan terbaik dari Fakultas Kedokteran Gigi Universitas Indonesia.',
    });
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
      Alert.alert(
        'Koneksi Gagal', 
        `Gagal terhubung ke server: ${error.message}\n${error.response ? JSON.stringify(error.response.data, null, 2) : ''}`
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
      setIsLoadingEmailCheck(true);
      
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
      setIsLoadingEmailCheck(false);
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
              marginBottom: 32,
              transform: [{ scale: scaleAnim }],
            }}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}>
                <Icon name="medical-services" size={50} color="white" />
              </View>
              <Text style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 12,
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 3,
                letterSpacing: 1,
              }}>
                Buat Akun Dokter Gigi
              </Text>
              <Text style={{
                fontSize: 18,
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                textShadowColor: 'rgba(0, 0, 0, 0.2)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
                letterSpacing: 0.5,
              }}>                 Bergabung dengan Dentalization untuk mengelola praktik gigi Anda
               </Text>
             </Animated.View>

            {/* Registration Form */}
            <Animated.View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 20,
              padding: 24,
              marginBottom: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
              opacity: fadeAnim,
            }}>
              <Text style={{
                fontSize: 22,
                fontWeight: '700',
                color: 'white',
                marginBottom: 24,
                textAlign: 'center',
                letterSpacing: 1,
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
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    marginBottom: 8,
                  }}
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
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    marginBottom: 8,
                  }}
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
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    marginBottom: 8,
                  }}
                />
              </View>

              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 24 }}>
                Informasi Profesional
              </Text>

              {/* Professional Information */}
              <View style={{ marginBottom: 24 }}>
                <Input
                  label="Gelar Profesional"
                  placeholder="Contoh: drg., Sp.Ort"
                  value={formData.title}
                  onChangeText={(text) => handleInputChange('title', text)}
                  leftIcon="school"
                  required
                />

                <Input
                  label="Nomor SIP (Surat Izin Praktik)"
                  placeholder="Masukkan nomor SIP Anda"
                  value={formData.licenseNumber}
                  onChangeText={(text) => handleInputChange('licenseNumber', text)}
                  leftIcon="card-membership"
                  required
                />

                <Input
                  label="Lembaga Penerbit SIP"
                  placeholder="Contoh: Dinas Kesehatan Provinsi DKI Jakarta"
                  value={formData.licenseIssuingBody}
                  onChangeText={(text) => handleInputChange('licenseIssuingBody', text)}
                  leftIcon="account-balance"
                  required
                />

                {/* License Expiry Date */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 8, marginLeft: 8 }}>
                    Tanggal Berakhir SIP: *
                  </Text>
                  <TouchableOpacity 
                    onPress={() => showDatePickerDialog('licenseExpiryDate')}
                    style={{ borderWidth: 1, borderColor: formData.licenseExpiryDate ? theme.colors.primary : '#E5E5E5', borderRadius: 8, backgroundColor: formData.licenseExpiryDate ? `${theme.colors.primary}05` : '#FFFFFF' }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: formData.licenseExpiryDate ? theme.colors.primary : '#E5E5E5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <Icon name="event" size={20} color={formData.licenseExpiryDate ? '#FFFFFF' : '#999'} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 }}>
                          Tanggal Berakhir SIP
                        </Text>
                        <Text style={{ fontSize: 16, fontWeight: '500', color: formData.licenseExpiryDate ? theme.colors.text : '#999' }}>
                          {formData.licenseExpiryDate ? formatDateForDisplay(formData.licenseExpiryDate) : 'Pilih tanggal berakhir SIP'}
                        </Text>
                      </View>
                      {formData.licenseExpiryDate ? (
                        <TouchableOpacity 
                          onPress={(e) => {
                            e.stopPropagation();
                            handleInputChange('licenseExpiryDate', null);
                          }}
                          style={{ padding: 8, borderRadius: 20, backgroundColor: '#FF6B6B20' }}
                        >
                          <Icon name="clear" size={16} color="#FF6B6B" />
                        </TouchableOpacity>
                      ) : (
                        <Icon name="chevron-right" size={24} color="#999" />
                      )}
                    </View>
                  </TouchableOpacity>
                  {formData.licenseExpiryDate && (
                    <View style={{ marginTop: 12, padding: 12, backgroundColor: `${theme.colors.success}10`, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: theme.colors.success }}>
                      <Text style={{ fontSize: 12, color: theme.colors.success, fontWeight: '600', marginBottom: 4 }}>
                        ✓ Tanggal berakhir SIP dipilih
                      </Text>
                      <Text style={{ fontSize: 14, color: theme.colors.text, marginBottom: 2 }}>
                        {formatDateForDisplay(formData.licenseExpiryDate)}
                      </Text>
                      {(() => {
                        const dateInfo = getDateInfo(formData.licenseExpiryDate);
                        if (dateInfo) {
                          return (
                            <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                              {dateInfo.yearsFromNow > 0 
                                ? `Berlaku ${dateInfo.yearsFromNow} tahun lagi`
                                : `Berlaku ${dateInfo.daysFromNow} hari lagi`
                              }
                            </Text>
                          );
                        }
                        return null;
                      })()}
                    </View>
                  )}
                </View>

                <Input
                  label="Nomor STR (Surat Tanda Registrasi)"
                  placeholder="Masukkan nomor STR Anda"
                  value={formData.registrationNumber}
                  onChangeText={(text) => handleInputChange('registrationNumber', text)}
                  leftIcon="assignment"
                  required
                />
                
                {/* Education Qualification */}
                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: theme.colors.text, marginTop: 16, marginLeft: 8 }}>
                  Kualifikasi Pendidikan:
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={{ paddingVertical: 8, marginBottom: 16 }}
                  contentContainerStyle={{ paddingRight: 24 }}
                >
                  {educationQualifications.map((qualification) => (
                    <TouchableOpacity
                      key={qualification}
                      onPress={() => handleInputChange('educationQualification', qualification)}
                      style={{ padding: 12, borderRadius: 8, marginLeft: 8, borderWidth: 2, borderColor: formData.educationQualification === qualification ? theme.colors.primary : '#E5E5E5', backgroundColor: formData.educationQualification === qualification ? `${theme.colors.primary}10` : theme.colors.background }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '500', color: formData.educationQualification === qualification ? theme.colors.primary : theme.colors.text }}>
                        {qualification}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                {/* Specialization */}
                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: theme.colors.text, marginLeft: 8 }}>
                  Spesialisasi Utama:
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={{ paddingVertical: 8, marginBottom: 16 }}
                  contentContainerStyle={{ paddingRight: 24 }}
                >
                  {dentalSpecializations.map((specialization) => (
                    <TouchableOpacity
                      key={specialization}
                      onPress={() => handleInputChange('primarySpecialization', specialization)}
                      style={{ padding: 12, borderRadius: 8, marginLeft: 8, borderWidth: 2, borderColor: formData.primarySpecialization === specialization ? theme.colors.primary : '#E5E5E5', backgroundColor: formData.primarySpecialization === specialization ? `${theme.colors.primary}10` : theme.colors.background }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '500', color: formData.primarySpecialization === specialization ? theme.colors.primary : theme.colors.text }}>
                        {specialization}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Input
                  label="Pengalaman (Tahun)"
                  placeholder="Contoh: 5"
                  value={formData.yearsOfExperience}
                  onChangeText={(text) => handleInputChange('yearsOfExperience', text)}
                  leftIcon="timeline"
                  keyboardType="numeric"
                  required
                />
              </View>

              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 24 }}>
                Informasi Klinik
              </Text>

              {/* Clinic Information */}
              <View style={{ marginBottom: 24 }}>
                <Input
                  label="Nama Klinik"
                  placeholder="Masukkan nama klinik tempat Anda praktik"
                  value={formData.clinicName}
                  onChangeText={(text) => handleInputChange('clinicName', text)}
                  leftIcon="business"
                  required
                />

                <Input
                  label="Alamat Klinik"
                  placeholder="Masukkan alamat lengkap klinik"
                  value={formData.clinicAddress}
                  onChangeText={(text) => handleInputChange('clinicAddress', text)}
                  leftIcon="location-on"
                  multiline
                  required
                />

                {/* Working Hours with Custom Picker */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 8, marginLeft: 8 }}>
                    Jam Praktik:
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setShowWorkingHoursModal(true)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, padding: 12, minHeight: 48 }}>
                      <Icon name="access-time" size={20} color={theme.colors.primary} style={{ marginRight: 10 }} />
                      <Text style={{ flex: 1, color: formData.clinicWorkingHours ? theme.colors.text : '#999', fontSize: 14 }}>
                        {formData.clinicWorkingHours || 'Pilih jam praktik'}
                      </Text>
                      <Icon name="chevron-right" size={20} color="#999" />
                    </View>
                  </TouchableOpacity>
                </View>

                <Input
                  label="Biaya Konsultasi (Opsional)"
                  placeholder="Contoh: 150.000"
                  value={formData.consultationFee}
                  onChangeText={handleCurrencyChange}
                  leftIcon="payments"
                  keyboardType="numeric"
                  prefix="Rp "
                />
                {formData.consultationFee && (
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 4, marginLeft: 8 }}>
                    Nilai: Rp {formData.consultationFee}
                  </Text>
                )}
              </View>

              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 16 }}>
                Opsi Pembayaran & Ketersediaan:
              </Text>

              {/* Payment & Availability Options */}
              <View style={{ marginBottom: 24 }}>
                {/* Accept Insurance */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 8, padding: 12, borderRadius: 8, backgroundColor: theme.colors.background }}>
                  <Text style={{ fontSize: 14, color: theme.colors.text }}>
                    Menerima Asuransi
                  </Text>
                  <Switch
                    value={formData.acceptsInsurance}
                    onValueChange={(value) => handleInputChange('acceptsInsurance', value)}
                    trackColor={{ false: theme.colors.textSecondary, true: theme.colors.primary }}
                    thumbColor={theme.colors.background}
                  />
                </View>

                {/* Accept BPJS */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 8, padding: 12, borderRadius: 8, backgroundColor: theme.colors.background }}>
                  <Text style={{ fontSize: 14, color: theme.colors.text }}>
                    Menerima BPJS
                  </Text>
                  <Switch
                    value={formData.acceptsBPJS}
                    onValueChange={(value) => handleInputChange('acceptsBPJS', value)}
                    trackColor={{ false: theme.colors.textSecondary, true: theme.colors.primary }}
                    thumbColor={theme.colors.background}
                  />
                </View>

                {/* Emergency Availability */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, padding: 12, borderRadius: 8, backgroundColor: theme.colors.background }}>
                  <Text style={{ fontSize: 14, color: theme.colors.text }}>
                    Tersedia untuk Keadaan Darurat
                  </Text>
                  <Switch
                    value={formData.emergencyAvailability}
                    onValueChange={(value) => handleInputChange('emergencyAvailability', value)}
                    trackColor={{ false: theme.colors.textSecondary, true: theme.colors.primary }}
                    thumbColor={theme.colors.background}
                  />
                </View>
              </View>

              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 8 }}>
                Jenis Konsultasi yang Ditawarkan:
              </Text>
              
              {/* Consultation Types */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 12, marginLeft: 8 }}>
                  Pilih semua jenis konsultasi yang Anda tawarkan:
                </Text>
                
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                  {consultationTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => toggleConsultationType(type)}
                      style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 2, borderColor: formData.consultationTypes.includes(type) ? theme.colors.primary : '#E5E5E5', backgroundColor: formData.consultationTypes.includes(type) ? `${theme.colors.primary}10` : theme.colors.background }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '500', color: formData.consultationTypes.includes(type) ? theme.colors.primary : theme.colors.text }}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 8 }}>
                Layanan yang Ditawarkan:
              </Text>
              
              {/* Services Offered */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 12, marginLeft: 8 }}>
                  Pilih semua layanan perawatan yang Anda sediakan:
                </Text>
                
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {treatmentServices.map((service) => (
                    <TouchableOpacity
                      key={service}
                      onPress={() => toggleService(service)}
                      style={{ padding: 12, borderRadius: 8, margin: 4, borderWidth: 2, borderColor: formData.servicesOffered.includes(service) ? theme.colors.primary : '#E5E5E5', backgroundColor: formData.servicesOffered.includes(service) ? `${theme.colors.primary}10` : theme.colors.background }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '500', color: formData.servicesOffered.includes(service) ? theme.colors.primary : theme.colors.text }}>
                        {service}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* About / Bio */}
              <View style={{ marginBottom: 24 }}>
                <Input
                  label="Biografi Profesional"
                  placeholder="Ceritakan kepada pasien Anda tentang pengalaman profesional, pendekatan perawatan gigi, atau informasi relevan lainnya..."
                  value={formData.about}
                  onChangeText={(text) => handleInputChange('about', text)}
                  leftIcon="description"
                  multiline
                  numberOfLines={3}
                />
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 4, marginLeft: 8 }}>
                  * Biografi ini akan ditampilkan pada profil publik Anda
                </Text>
              </View>

              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 24 }}>
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
                <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 8, marginBottom: 16 }}>
                  Kata sandi harus mengandung:
                </Text>
                <View style={{ marginLeft: 8 }}>
                  <Text style={{ fontSize: 12, color: formData.password.length >= 8 ? theme.colors.success : theme.colors.textSecondary, marginBottom: 4 }}>
                    • Minimal 8 karakter
                  </Text>
                  <Text style={{ fontSize: 12, color: /[A-Z]/.test(formData.password) ? theme.colors.success : theme.colors.textSecondary, marginBottom: 4 }}>
                    • Minimal satu huruf besar (A-Z)
                  </Text>
                  <Text style={{ fontSize: 12, color: /[a-z]/.test(formData.password) ? theme.colors.success : theme.colors.textSecondary, marginBottom: 4 }}>
                    • Minimal satu huruf kecil (a-z)
                  </Text>
                  <Text style={{ fontSize: 12, color: /\d/.test(formData.password) ? theme.colors.success : theme.colors.textSecondary, marginBottom: 4 }}>
                    • Minimal satu angka (0-9)
                  </Text>
                  <Text style={{ fontSize: 12, color: /[!@#$%^&*(),.?":{}|<>\[\]]/.test(formData.password) ? theme.colors.success : theme.colors.textSecondary }}>
                    • Minimal satu karakter khusus {'(!@#$%^&*(),.?":{}|<>[])'}
                  </Text>
                </View>
              </View>

              {/* Document Upload Notice */}
              <View style={{ marginBottom: 24, padding: 16, backgroundColor: `${theme.colors.warning}20`, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: theme.colors.warning }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.warning }}>
                  Upload Dokumen Diperlukan
                </Text>
                <Text style={{ fontSize: 13, marginTop: 4, color: theme.colors.warning }}>
                  Setelah pendaftaran, Anda perlu mengupload salinan SIP, STR, kartu identitas, dan ijazah untuk verifikasi.
                </Text>
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
                  title="Daftar sebagai Dokter"
                  onPress={handleRegister}
                  loading={isLoading}
                  disabled={isLoading}
                  leftIcon="how-to-reg"
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    paddingVertical: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 5,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  textStyle={{
                    color: theme.colors.primary,
                    fontSize: 16,
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}
                />

                <TouchableOpacity
                  onPress={() => navigation.navigate(ROUTES.LOGIN)}
                  style={{ alignSelf: 'center', marginTop: 8, padding: 8 }}
                >
                  <Text style={{ fontSize: 14, color: 'white', textDecorationLine: 'underline' }}>
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
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 20,
                padding: 16,
                marginBottom: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                opacity: fadeAnim,
              }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: 'white' }}>
                  Opsi Debug
                </Text>
                <View style={{ gap: 8 }}>
                  <Button 
                    title="Isi Data Tes" 
                    type="outline" 
                    onPress={generateRandomDoctor}
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
                    title="Periksa Email" 
                    type="outline" 
                    onPress={testEmailCheck}
                    color={theme.colors.primary}
                    leftIcon="email"
                  />
                </View>
              </Animated.View>
            )}
            
            {/* Date Picker Modal */}
            <Modal
              visible={showDatePicker}
              transparent={true}
              animationType="slide"
              onRequestClose={closeDatePicker}
            >
              <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 16 }}>
                <Card style={{ padding: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>
                      Pilih Tanggal Berakhir SIP
                    </Text>
                    <TouchableOpacity onPress={closeDatePicker} style={{ padding: 8 }}>
                      <Icon name="close" size={24} color="#999" />
                    </TouchableOpacity>
                  </View>
                  
                  <DateTimePicker
                    value={formData[datePickerField] || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    style={{ backgroundColor: 'transparent' }}
                  />
                  
                  {Platform.OS === 'ios' && (
                    <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', gap: 12 }}>
                      <Button 
                        title="Batal" 
                        type="outline"
                        onPress={closeDatePicker}
                        style={{ flex: 1 }}
                      />
                      <Button 
                        title="Pilih"
                        onPress={closeDatePicker}
                        style={{ flex: 1 }}
                      />
                    </View>
                  )}
                </Card>
              </View>
            </Modal>

            {/* Working Hours Modal */}
            <Modal
              visible={showWorkingHoursModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowWorkingHoursModal(false)}
            >
              <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 16 }}>
                <Card style={{ padding: 20, maxHeight: '90%' }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: theme.colors.text }}>
                    Atur Jam Praktik
                  </Text>
                  <ScrollView style={{ maxHeight: 400 }}>
                    {Object.entries(selectedDays).map(([day, data]) => {
                      const dayLabels = {
                        senin: 'Senin', selasa: 'Selasa', rabu: 'Rabu', kamis: 'Kamis',
                        jumat: 'Jumat', sabtu: 'Sabtu', minggu: 'Minggu'
                      };
                      
                      return (
                        <View key={day} style={{ marginBottom: 16, padding: 12, backgroundColor: data.active ? `${theme.colors.primary}10` : '#F9F9F9', borderRadius: 8, borderWidth: 1, borderColor: data.active ? theme.colors.primary : '#E5E5E5' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: data.active ? 12 : 0 }}>
                            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text }}>
                              {dayLabels[day]}
                            </Text>
                            <Switch
                              value={data.active}
                              onValueChange={() => toggleDay(day)}
                              trackColor={{ false: '#E5E5E5', true: theme.colors.primary }}
                              thumbColor="#FFFFFF"
                            />
                          </View>
                          
                          {data.active && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 }}>Jam Buka</Text>
                                <TouchableOpacity style={{ borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 6, padding: 8 }}>
                                  <Text style={{ fontSize: 14, color: theme.colors.text }}>{data.start}</Text>
                                </TouchableOpacity>
                              </View>
                              <Text style={{ fontSize: 16, color: theme.colors.textSecondary, marginTop: 16 }}>-</Text>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 }}>Jam Tutup</Text>
                                <TouchableOpacity style={{ borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 6, padding: 8 }}>
                                  <Text style={{ fontSize: 14, color: theme.colors.text }}>{data.end}</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </ScrollView>
                  
                  <View style={{ flexDirection: 'row', marginTop: 16, justifyContent: 'space-between', gap: 12 }}>
                    <Button 
                      title="Batal" 
                      type="outline"
                      onPress={() => setShowWorkingHoursModal(false)}
                      style={{ flex: 1 }}
                    />
                    <Button 
                      title="Simpan"
                      onPress={updateWorkingHours}
                      style={{ flex: 1 }}
                    />
                  </View>
                </Card>
              </View>
            </Modal>

            {/* Payload Preview Modal */}
            <Modal
              visible={!!payloadPreview}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setPayloadPreview(null)}
            >
              <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 16 }}>
                <Card style={{ padding: 16, maxHeight: '80%' }}>
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
                </Card>
              </View>
            </Modal>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
        
        {/* Remove standalone date picker - now handled in modal */}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default RegisterDoctorScreen;
