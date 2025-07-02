import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../../components/common/ThemeProvider';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { ROUTES } from '../../../shared/constants';

const RegisterScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'PATIENT', // Default role
    phoneNumber: '',
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

  const validateForm = () => {
    // Check required fields
    if (!formData.firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return false;
    }
    
    if (!formData.lastName.trim()) {
      Alert.alert('Error', 'Please enter your last name');
      return false;
    }
    
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (!formData.phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    
    if (!formData.password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    
    // Password validation
    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      Alert.alert('Error', 'Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
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
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        role: formData.role,
      };

      const result = await dispatch(registerUser(registrationData)).unwrap();
      
      // Navigation will be handled by RootNavigator based on auth state
      Alert.alert('Success', 'Account created successfully!');
    } catch (error) {
      Alert.alert('Registration Failed', error || 'An error occurred during registration');
    }
  };

  const roles = [
    {
      id: 'PATIENT',
      title: 'Patient',
      description: 'Book appointments and manage your dental health',
      icon: 'person',
    },
    {
      id: 'DOCTOR',
      title: 'Doctor',
      description: 'Manage patients and provide dental care',
      icon: 'local-hospital',
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
                <Icon name="person-add" size={40} color="#FFFFFF" />
              </View>
              <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: theme.colors.text,
                marginBottom: 8,
              }}>
                Create Account
              </Text>
              <Text style={{
                fontSize: 16,
                color: theme.colors.textSecondary,
                textAlign: 'center',
              }}>
                Join Dentalization to get started
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
                I am a:
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
                      borderColor: selectedRole === role.id ? theme.colors.primary : '#E5E5E5',
                      backgroundColor: selectedRole === role.id ? `${theme.colors.primary}10` : '#FFFFFF',
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
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Input
                  placeholder="First Name"
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  autoCapitalize="words"
                  leftIcon="person"
                  editable={!isLoading}
                  style={{ flex: 1 }}
                />
                
                <Input
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  autoCapitalize="words"
                  leftIcon="person"
                  editable={!isLoading}
                  style={{ flex: 1 }}
                />
              </View>

              <Input
                placeholder="Email Address"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="email"
                editable={!isLoading}
                style={{ marginTop: 16 }}
              />

              <Input
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                keyboardType="phone-pad"
                leftIcon="phone"
                editable={!isLoading}
                style={{ marginTop: 16 }}
              />
              
              <Input
                placeholder="Password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                leftIcon="lock"
                rightIcon={showPassword ? 'visibility-off' : 'visibility'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                editable={!isLoading}
                style={{ marginTop: 16 }}
              />

              <Input
                placeholder="Confirm Password"
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
                backgroundColor: '#F8F9FA',
                borderRadius: 8,
              }}>
                <Text style={{
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  fontWeight: '500',
                  marginBottom: 4,
                }}>
                  Password Requirements:
                </Text>
                <Text style={{
                  fontSize: 11,
                  color: theme.colors.textSecondary,
                  lineHeight: 16,
                }}>
                  • At least 8 characters{'\n'}
                  • One uppercase letter{'\n'}
                  • One lowercase letter{'\n'}
                  • One number
                </Text>
              </View>

              {/* Register Button */}
              <Button
                title="Create Account"
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
                  borderLeftColor: '#EF4444',
                }}>
                  <Text style={{
                    color: '#EF4444',
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
                Already have an account?{' '}
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
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
