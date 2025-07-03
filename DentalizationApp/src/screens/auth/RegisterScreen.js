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
  Switch,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useTheme } from '../../components/common/ThemeProvider';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { ROUTES } from '../../constants/routes';

const RegisterScreen = ({ navigation }) => {
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
    // Doctor-specific fields / Data khusus dokter
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
  const [selectedRole, setSelectedRole] = useState('PATIENT');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setFormData(prev => ({ ...prev, role }));
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
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate && datePickerField) {
      setFormData(prev => ({ ...prev, [datePickerField]: selectedDate }));
    }
    if (Platform.OS === 'android') {
      setDatePickerField(null);
    }
  };

  const validateForm = () => {
    // Check required fields
    if (!formData.namaLengkap.trim()) {
      Alert.alert('Error', 'Silakan masukkan nama lengkap Anda');
      return false;
    }
    
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Silakan masukkan alamat email Anda');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Silakan masukkan alamat email yang valid');
      return false;
    }
    
    if (!formData.phoneNumber.trim()) {
      Alert.alert('Error', 'Silakan masukkan nomor telepon Anda');
      return false;
    }
    
    // Validate doctor-specific fields if doctor role is selected
    if (formData.role === 'DOCTOR') {
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
      
      // Validate years of experience is a number
      if (isNaN(formData.yearsOfExperience) || parseInt(formData.yearsOfExperience) < 0) {
        Alert.alert('Error', 'Tahun pengalaman harus berupa angka yang valid');
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
        Alert.alert('Error', 'Silakan masukkan jam praktik klinik Anda');
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
      if (formData.consultationFee.trim() && (isNaN(formData.consultationFee) || parseFloat(formData.consultationFee) < 0)) {
        Alert.alert('Error', 'Biaya konsultasi harus berupa angka yang valid');
        return false;
      }
    }
    
    // Validate patient-specific fields if patient role is selected
    if (formData.role === 'PATIENT') {
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
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/.test(formData.password)) {
      Alert.alert('Error', 'Kata sandi harus mengandung minimal satu huruf besar, satu huruf kecil, dan satu angka');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Kata sandi tidak cocok');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const registrationData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        namaLengkap: formData.namaLengkap.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        role: formData.role,
      };

      // Add role-specific details to registration data
      if (formData.role === 'DOCTOR') {
        registrationData.professionalDetails = {
          title: formData.title,
          licenseNumber: formData.licenseNumber,
          licenseIssuingBody: formData.licenseIssuingBody,
          licenseExpiryDate: formData.licenseExpiryDate,
          registrationNumber: formData.registrationNumber,
          primarySpecialization: formData.primarySpecialization,
          educationQualification: formData.educationQualification,
          yearsOfExperience: parseInt(formData.yearsOfExperience),
          clinicName: formData.clinicName,
          clinicAddress: formData.clinicAddress,
          clinicWorkingHours: formData.clinicWorkingHours,
          acceptsInsurance: formData.acceptsInsurance,
          acceptsBPJS: formData.acceptsBPJS,
          emergencyAvailability: formData.emergencyAvailability,
          consultationTypes: formData.consultationTypes,
          servicesOffered: formData.servicesOffered,
          consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : null,
          about: formData.about,
        };
      } else if (formData.role === 'PATIENT') {
        registrationData.patientDetails = {
          bpjsNumber: formData.bpjsNumber,
          emergencyContact: {
            name: formData.emergencyContactName,
            phoneNumber: formData.emergencyContactPhone,
          },
          medicalInfo: {
            allergies: formData.allergies,
            chronicConditions: formData.chronicConditions,
            additionalInfo: formData.medicalHistory,
          },
        };
      }

      const result = await dispatch(registerUser(registrationData)).unwrap();
      
      // Navigation will be handled by RootNavigator based on auth state
      Alert.alert('Berhasil', 'Akun berhasil dibuat!');
    } catch (error) {
      Alert.alert('Registration Failed', error || 'An error occurred during registration');
    }
  };

  const roles = [
    {
      id: 'PATIENT',
      title: 'Pasien',
      description: 'Buat janji dan kelola kesehatan gigi Anda',
      icon: 'person',
    },
    {
      id: 'DOCTOR',
      title: 'Profesional Gigi',
      description: 'Dokter gigi atau spesialis gigi berlisensi',
      icon: 'medical-services',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: theme.colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
              }}>
                <Icon name="person-add" size={40} color={theme.colors.background} />
              </View>
              <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: theme.colors.text,
                marginBottom: 8,
              }}>
                Buat Akun
              </Text>
              <Text style={{
                fontSize: 16,
                color: theme.colors.textSecondary,
                textAlign: 'center',
              }}>
                Bergabung dengan Dentalization untuk memulai
              </Text>
            </View>

            {/* Role Selection */}
            <Card style={{ marginBottom: 24 }}>
              <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme.colors.text,
                  marginBottom: 16,
                }}>
                  Saya adalah:
                </Text>
              
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {roles.map((role) => (
                  <TouchableOpacity
                    key={role.id}
                    onPress={() => handleRoleSelection(role.id)}
                    style={{
                      flex: 1,
                      padding: 16,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: selectedRole === role.id ? theme.colors.primary : theme.colors.textSecondary,
                      backgroundColor: selectedRole === role.id ? `${theme.colors.primary}10` : theme.colors.background,
                    }}
                  >
                    <Icon
                      name={role.icon}
                      size={32}
                      color={selectedRole === role.id ? theme.colors.primary : theme.colors.textSecondary}
                      style={{ alignSelf: 'center', marginBottom: 8 }}
                    />
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: selectedRole === role.id ? theme.colors.primary : theme.colors.text,
                      textAlign: 'center',
                      marginBottom: 4,
                    }}>
                      {role.title}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                      textAlign: 'center',
                    }}>
                      {role.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Registration Form */}
            <Card style={{ marginBottom: 24 }}>
              <View style={{ marginBottom: 16 }}>
                <Input
                  placeholder="Nama Lengkap"
                  value={formData.namaLengkap}
                  onChangeText={(value) => handleInputChange('namaLengkap', value)}
                  autoCapitalize="words"
                  leftIcon="person"
                  editable={!isLoading}
                />
              </View>

              <Input
                placeholder="Alamat Email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="email"
                editable={!isLoading}
                style={{ marginTop: 16 }}
              />

              <Input
                placeholder="Nomor Telepon"
                value={formData.phoneNumber}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                keyboardType="phone-pad"
                leftIcon="phone"
                editable={!isLoading}
                style={{ marginTop: 16 }}
              />
              
              {/* Patient-specific fields */}
              {selectedRole === 'PATIENT' && (
                <View style={{ marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: theme.colors.text,
                    marginBottom: 16,
                  }}>
                    Informasi Pasien
                  </Text>
                  
                  <Input
                    placeholder="BPJS Number (Optional)"
                    value={formData.bpjsNumber}
                    onChangeText={(value) => handleInputChange('bpjsNumber', value)}
                    leftIcon="credit-card"
                    keyboardType="numeric"
                    editable={!isLoading}
                  />
                  
                  <View style={{ marginTop: 16 }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: theme.colors.text,
                      marginBottom: 12,
                    }}>
                      Kontak Darurat
                    </Text>
                    
                    <Input
                      placeholder="Nama Kontak"
                      value={formData.emergencyContactName}
                      onChangeText={(value) => handleInputChange('emergencyContactName', value)}
                      autoCapitalize="words"
                      leftIcon="contact-phone"
                      editable={!isLoading}
                    />
                    
                    <Input
                      placeholder="Nomor Telepon Kontak"
                      value={formData.emergencyContactPhone}
                      onChangeText={(value) => handleInputChange('emergencyContactPhone', value)}
                      keyboardType="phone-pad"
                      leftIcon="phone"
                      editable={!isLoading}
                      style={{ marginTop: 12 }}
                    />
                  </View>
                  
                  <View style={{ marginTop: 16 }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: theme.colors.text,
                      marginBottom: 12,
                    }}>
                      Riwayat Medis (Opsional)
                    </Text>
                    
                    <Input
                      placeholder="Alergi (jika ada)"
                      value={formData.allergies}
                      onChangeText={(value) => handleInputChange('allergies', value)}
                      leftIcon="error"
                      editable={!isLoading}
                      multiline={true}
                      numberOfLines={2}
                    />
                    
                    <Input
                      placeholder="Kondisi Kronis (jika ada)"
                      value={formData.chronicConditions}
                      onChangeText={(value) => handleInputChange('chronicConditions', value)}
                      leftIcon="medical-services"
                      editable={!isLoading}
                      multiline={true}
                      numberOfLines={2}
                      style={{ marginTop: 12 }}
                    />
                    
                    <Input
                      placeholder="Informasi Medis Tambahan"
                      value={formData.medicalHistory}
                      onChangeText={(value) => handleInputChange('medicalHistory', value)}
                      leftIcon="notes"
                      editable={!isLoading}
                      multiline={true}
                      numberOfLines={3}
                      style={{ marginTop: 12 }}
                    />
                  </View>
                </View>
              )}
              
              {/* Doctor-specific fields */}
              {selectedRole === 'DOCTOR' && (
                <View style={{ marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: theme.colors.text,
                    marginBottom: 16,
                  }}>
                    Informasi Profesional
                  </Text>
                  
                  <Input
                    placeholder="Professional Title (e.g., dr., Sp.Ort)"
                    value={formData.title}
                    onChangeText={(value) => handleInputChange('title', value)}
                    leftIcon="school"
                    editable={!isLoading}
                  />
                  
                  <Input
                    placeholder="Dental License Number"
                    value={formData.licenseNumber}
                    onChangeText={(value) => handleInputChange('licenseNumber', value)}
                    leftIcon="card-membership"
                    editable={!isLoading}
                    style={{ marginTop: 16 }}
                  />
                  
                  <Input
                    placeholder="License Issuing Body"
                    value={formData.licenseIssuingBody}
                    onChangeText={(value) => handleInputChange('licenseIssuingBody', value)}
                    leftIcon="account-balance"
                    editable={!isLoading}
                    style={{ marginTop: 16 }}
                  />
                  
                  {/* License Expiry Date */}
                  <TouchableOpacity 
                    onPress={() => showDatePickerDialog('licenseExpiryDate')}
                    style={{ marginTop: 16 }}
                    disabled={isLoading}
                  >
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#E5E5E5',
                      borderRadius: 8,
                      padding: 12,
                    }}>
                      <Icon name="event" size={20} color={theme.colors.primary} style={{ marginRight: 10 }} />
                      <Text style={{ flex: 1, color: formData.licenseExpiryDate ? theme.colors.text : '#999' }}>
                        {formData.licenseExpiryDate
                          ? `Tanggal Berakhir SIP: ${formData.licenseExpiryDate.toLocaleDateString()}`
                          : 'Tanggal Berakhir SIP'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  <Input
                    placeholder="Dental Registration Number"
                    value={formData.registrationNumber}
                    onChangeText={(value) => handleInputChange('registrationNumber', value)}
                    leftIcon="assignment"
                    editable={!isLoading}
                    style={{ marginTop: 16 }}
                  />
                  
                  {/* Education Qualification */}
                  <View style={{ marginTop: 16 }}>
                    <Text style={{ 
                      fontSize: 14, 
                      marginBottom: 8, 
                      color: theme.colors.textSecondary,
                      marginLeft: 8
                    }}>
                      Education Qualification
                    </Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      style={{ 
                        paddingVertical: 8,
                      }}
                      contentContainerStyle={{
                        paddingRight: 24,
                      }}
                    >
                      {educationQualifications.map((qualification) => (
                        <TouchableOpacity
                          key={qualification}
                          onPress={() => handleInputChange('educationQualification', qualification)}
                          style={{
                            padding: 12,
                            borderRadius: 8,
                            marginLeft: 8,
                            borderWidth: 2,
                            borderColor: formData.educationQualification === qualification 
                              ? theme.colors.primary 
                              : '#E5E5E5',
                            backgroundColor: formData.educationQualification === qualification 
                              ? `${theme.colors.primary}10` 
                              : theme.colors.background,
                          }}
                        >
                          <Text style={{
                            fontSize: 14,
                            fontWeight: '500',
                            color: formData.educationQualification === qualification 
                              ? theme.colors.primary 
                              : theme.colors.text,
                          }}>
                            {qualification}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  
                  {/* Specialization */}
                  <View style={{ marginTop: 16 }}>
                    <Text style={{ 
                      fontSize: 14, 
                      marginBottom: 8, 
                      color: theme.colors.textSecondary,
                      marginLeft: 8
                    }}>
                      Primary Specialization
                    </Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      style={{ 
                        paddingVertical: 8,
                      }}
                      contentContainerStyle={{
                        paddingRight: 24,
                      }}
                    >
                      {dentalSpecializations.map((specialization) => (
                        <TouchableOpacity
                          key={specialization}
                          onPress={() => handleInputChange('primarySpecialization', specialization)}
                          style={{
                            padding: 12,
                            borderRadius: 8,
                            marginLeft: 8,
                            borderWidth: 2,
                            borderColor: formData.primarySpecialization === specialization 
                              ? theme.colors.primary 
                              : '#E5E5E5',
                            backgroundColor: formData.primarySpecialization === specialization 
                              ? `${theme.colors.primary}10` 
                              : theme.colors.background,
                          }}
                        >
                          <Text style={{
                            fontSize: 14,
                            fontWeight: '500',
                            color: formData.primarySpecialization === specialization 
                              ? theme.colors.primary 
                              : theme.colors.text,
                          }}>
                            {specialization}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  
                  <Input
                    placeholder="Years of Experience"
                    value={formData.yearsOfExperience}
                    onChangeText={(value) => handleInputChange('yearsOfExperience', value)}
                    keyboardType="numeric"
                    leftIcon="timeline"
                    editable={!isLoading}
                    style={{ marginTop: 16 }}
                  />

                  {/* Clinic Information */}
                  <View style={{ marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: theme.colors.text,
                      marginBottom: 16,
                    }}>
                      Informasi Klinik
                    </Text>

                    <Input
                      placeholder="Nama Klinik"
                      value={formData.clinicName}
                      onChangeText={(value) => handleInputChange('clinicName', value)}
                      leftIcon="business"
                      editable={!isLoading}
                    />

                    <Input
                      placeholder="Alamat Klinik"
                      value={formData.clinicAddress}
                      onChangeText={(value) => handleInputChange('clinicAddress', value)}
                      leftIcon="location-on"
                      editable={!isLoading}
                      multiline={true}
                      numberOfLines={2}
                      style={{ marginTop: 16 }}
                    />
                    
                    <Input
                      placeholder="Jam Praktik (contoh: Sen-Jum: 9.00-17.00)"
                      value={formData.clinicWorkingHours}
                      onChangeText={(value) => handleInputChange('clinicWorkingHours', value)}
                      leftIcon="access-time"
                      editable={!isLoading}
                      style={{ marginTop: 16 }}
                    />

                    <Input
                      placeholder="Biaya Konsultasi (opsional)"
                      value={formData.consultationFee}
                      onChangeText={(value) => handleInputChange('consultationFee', value)}
                      leftIcon="attach-money"
                      keyboardType="numeric"
                      editable={!isLoading}
                      style={{ marginTop: 16 }}
                    />

                    {/* Accept Insurance */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 16,
                      paddingHorizontal: 8,
                    }}>
                      <Text style={{ fontSize: 16, color: theme.colors.text }}>
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
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 12,
                      paddingHorizontal: 8,
                    }}>
                      <Text style={{ fontSize: 16, color: theme.colors.text }}>
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
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 12,
                      paddingHorizontal: 8,
                    }}>
                      <Text style={{ fontSize: 16, color: theme.colors.text }}>
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
                  
                  {/* Consultation Types */}
                  <View style={{ marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: theme.colors.text,
                      marginBottom: 16,
                    }}>
                      Jenis Konsultasi yang Ditawarkan
                    </Text>
                    
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                      {consultationTypes.map((type) => (
                        <TouchableOpacity
                          key={type}
                          onPress={() => toggleConsultationType(type)}
                          style={{
                            paddingVertical: 10,
                            paddingHorizontal: 16,
                            borderRadius: 8,
                            borderWidth: 2,
                            borderColor: formData.consultationTypes.includes(type) 
                              ? theme.colors.primary 
                              : '#E5E5E5',
                            backgroundColor: formData.consultationTypes.includes(type) 
                              ? `${theme.colors.primary}10` 
                              : theme.colors.background,
                          }}
                        >
                          <Text style={{
                            fontSize: 14,
                            fontWeight: '500',
                            color: formData.consultationTypes.includes(type) 
                              ? theme.colors.primary 
                              : theme.colors.text,
                          }}>
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Services Offered */}
                  <View style={{ marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: theme.colors.text,
                      marginBottom: 16,
                    }}>
                      Layanan yang Ditawarkan
                    </Text>
                    
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {treatmentServices.map((service) => (
                        <TouchableOpacity
                          key={service}
                          onPress={() => toggleService(service)}
                          style={{
                            padding: 12,
                            borderRadius: 8,
                            margin: 4,
                            borderWidth: 2,
                            borderColor: formData.servicesOffered.includes(service) 
                              ? theme.colors.primary 
                              : '#E5E5E5',
                            backgroundColor: formData.servicesOffered.includes(service) 
                              ? `${theme.colors.primary}10` 
                              : theme.colors.background,
                          }}
                        >
                          <Text style={{
                            fontSize: 14,
                            fontWeight: '500',
                            color: formData.servicesOffered.includes(service) 
                              ? theme.colors.primary 
                              : theme.colors.text,
                          }}>
                            {service}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* About Me / Professional Bio */}
                  <View style={{ marginTop: 24 }}>
                    <Text style={{
                      fontSize: 14,
                      marginBottom: 8,
                      color: theme.colors.textSecondary,
                      marginLeft: 8
                    }}>
                      Biografi Profesional
                    </Text>
                    <Input
                      value={formData.about}
                      onChangeText={(value) => handleInputChange('about', value)}
                      leftIcon="description"
                      editable={!isLoading}
                      multiline={true}
                      numberOfLines={4}
                      placeholder="Ceritakan kepada pasien Anda tentang pengalaman profesional, pendekatan perawatan gigi, atau informasi relevan lainnya..."
                    />
                  </View>
                  
                  {/* Document Upload Notice */}
                  <View                  style={{ 
                    marginTop: 16,
                    padding: 16,
                    backgroundColor: `${theme.colors.warning}20`,
                    borderRadius: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: theme.colors.warning
                  }}>
                    <Text style={{ 
                      fontSize: 14,
                      fontWeight: '500',
                      color: theme.colors.warning
                    }}>
                      Upload Dokumen Diperlukan
                    </Text>
                    <Text style={{ 
                      fontSize: 13,
                      marginTop: 4,
                      color: theme.colors.warning
                    }}>
                      Setelah pendaftaran, Anda perlu mengupload salinan SIP, STR, kartu identitas, dan ijazah untuk verifikasi.
                    </Text>
                  </View>
                </View>
              )}
              
              {/* Security section */}
              <View style={{ marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme.colors.text,
                  marginBottom: 16,
                }}>
                  Keamanan Akun
                </Text>
                
                <Input
                  placeholder="Kata Sandi"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  leftIcon="lock"
                  rightIcon={showPassword ? 'visibility-off' : 'visibility'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  editable={!isLoading}
                />

                <Input
                  placeholder="Konfirmasi Kata Sandi"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  leftIcon="lock"
                  rightIcon={showConfirmPassword ? 'visibility-off' : 'visibility'}
                  onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  editable={!isLoading}
                  style={{ marginTop: 16 }}
                />

                {/* Password Requirements */}
                <View style={{
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: theme.colors.background,
                  borderRadius: 8,
                }}>
                  <Text style={{
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    fontWeight: '500',
                    marginBottom: 4,
                  }}>
                    Persyaratan Kata Sandi:
                  </Text>
                  <Text style={{
                    fontSize: 11,
                    color: theme.colors.textSecondary,
                    lineHeight: 16,
                  }}>
                    • Minimal 8 karakter{'\n'}
                    • Satu huruf besar{'\n'}
                    • Satu huruf kecil{'\n'}
                    • Satu angka
                  </Text>
                </View>
              </View>

              {/* Register Button */}
              <Button
                title="Buat Akun"
                onPress={handleRegister}
                loading={isLoading}
                style={{ marginTop: 24 }}
              />

              {/* Error Message */}
              {error && (
                <View style={{
                  marginTop: 16,
                  padding: 12,
                  backgroundColor: '#FEF2F2',
                  borderRadius: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: theme.colors.error,
                }}>
                  <Text style={{
                    color: theme.colors.error,
                    fontSize: 14,
                    fontWeight: '500',
                  }}>
                    {error}
                  </Text>
                </View>
              )}
            </Card>

            {/* Sign In Link */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{
                fontSize: 16,
                color: theme.colors.textSecondary,
              }}>
                Sudah memiliki akun?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.LOGIN)}
                disabled={isLoading}
              >
                <Text style={{
                  fontSize: 16,
                  color: theme.colors.primary,
                  fontWeight: '600',
                }}>
                  Masuk
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Date Picker for iOS */}
      {Platform.OS === 'ios' && showDatePicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
        >
          <View style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}>
            <View style={{
              backgroundColor: 'white',
              padding: 16,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={{ color: theme.colors.primary, fontSize: 16 }}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  handleDateChange(null, new Date());
                  setShowDatePicker(false);
                }}>
                  <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 16 }}>Selesai</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={formData[datePickerField] || new Date()}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                style={{ height: 200 }}
              />
            </View>
          </View>
        </Modal>
      )}
      
      {/* Date Picker for Android */}
      {Platform.OS === 'android' && showDatePicker && datePickerField && (
        <DateTimePicker
          value={formData[datePickerField] || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </SafeAreaView>
  );
};

export default RegisterScreen;
