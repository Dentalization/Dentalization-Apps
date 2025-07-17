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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../../components/common/ThemeProvider';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import {
  loginUser, 
  loginWithBiometric, 
  clearError,
  setBiometricAvailable,
  setBiometricEnabled 
} from '../../store/slices/authSlice';
import biometricService from '../../services/biometricService';
import { ROUTES } from '../../constants';
import { getReadableError } from '../../utils/errorHandler';

const LoginScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { isLoading, error, biometricAvailable, biometricEnabled } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricType, setBiometricType] = useState(null);

  useEffect(() => {
    initializeBiometric();
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const initializeBiometric = async () => {
    // Biometrics disabled in development mode
    setBiometricType(null);
    dispatch(setBiometricAvailable(false));
    dispatch(setBiometricEnabled(false));
    console.log('Biometrics disabled in development mode');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Silakan masukkan alamat email Anda');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Silakan masukkan alamat email yang valid');
      return false;
    }
    
    if (!formData.password.trim()) {
      Alert.alert('Error', 'Silakan masukkan kata sandi Anda');
      return false;
    }
    
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Kata sandi minimal harus 6 karakter');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const result = await dispatch(loginUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        rememberMe: rememberMe,
      })).unwrap();

      // Navigation will be handled by RootNavigator based on auth state
    } catch (error) {
      const errorMessage = getReadableError(error, 'Terjadi kesalahan saat proses masuk');
      
      // Show different actions based on error type
      if (errorMessage.includes('Email belum terdaftar') || errorMessage.includes('email atau kata sandi')) {
        Alert.alert(
          'Gagal Masuk', 
          errorMessage,
          [
            { text: 'Coba Lagi', style: 'cancel' },
            { 
              text: 'Daftar Sekarang', 
              onPress: () => navigation.navigate(ROUTES.ROLE_SELECTION),
              style: 'default'
            }
          ]
        );
      } else {
        Alert.alert('Gagal Masuk', errorMessage);
      }
    }
  };

  const handleBiometricLogin = async () => {
    Alert.alert('Login Biometrik Dinonaktifkan', 'Autentikasi biometrik dinonaktifkan dalam mode pengembangan');
    return;
    
    /* Original code disabled for development:
    try {
      const result = await dispatch(loginWithBiometric()).unwrap();
      // Navigation will be handled by RootNavigator based on auth state
    } catch (error) {
      Alert.alert('Login Biometrik Gagal', getReadableError(error, 'Autentikasi biometrik gagal'));
    }
    */
  };

  const getBiometricIcon = () => {
    switch (biometricType) {
      case 'FaceID':
        return 'face';
      case 'TouchID':
      case 'Fingerprint':
        return 'fingerprint';
      default:
        return 'security';
    }
  };

  const getBiometricText = () => {
    switch (biometricType) {
      case 'FaceID':
        return 'Login with Face ID';
      case 'TouchID':
        return 'Login with Touch ID';
      case 'Fingerprint':
        return 'Login with Fingerprint';
      default:
        return 'Login with Biometric';
    }
  };

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
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 48 }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: theme.colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
              }}>
                <Icon name="local-hospital" size={40} color="#FFFFFF" />
              </View>
              <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: theme.colors.text,
                marginBottom: 8,
              }}>
                Selamat Datang Kembali
              </Text>
              <Text style={{
                fontSize: 16,
                color: theme.colors.textSecondary,
                textAlign: 'center',
              }}>
                Masuk untuk melanjutkan ke Dentalization
              </Text>
            </View>

            {/* Login Form */}
            <Card style={{ marginBottom: 24 }}>
              <Input
                placeholder="Alamat Email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="email"
                editable={!isLoading}
              />
              
              <Input
                placeholder="Kata Sandi"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                leftIcon="lock"
                rightIcon={showPassword ? 'visibility-off' : 'visibility'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                editable={!isLoading}
                style={{ marginTop: 16 }}
              />

              {/* Remember Me & Forgot Password */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 16,
              }}>
                <TouchableOpacity
                  onPress={() => setRememberMe(!rememberMe)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  disabled={isLoading}
                >
                  <Icon
                    name={rememberMe ? 'check-box' : 'check-box-outline-blank'}
                    size={20}
                    color={rememberMe ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <Text style={{
                    marginLeft: 8,
                    fontSize: 14,
                    color: theme.colors.text,
                  }}>
                    Ingat saya
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
                  disabled={isLoading}
                >
                  <Text style={{
                    fontSize: 14,
                    color: theme.colors.primary,
                    fontWeight: '500',
                  }}>
                    Lupa Kata Sandi?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <Button
                title="Masuk"
                onPress={handleLogin}
                loading={isLoading}
                style={{ marginTop: 24 }}
              />

              {/* Biometric Login - Disabled for Development */}
              {false && ( // biometricAvailable && biometricEnabled - always false in dev mode
                <Button
                  title="Login Biometrik (Dinonaktifkan dalam Mode Dev)"
                  onPress={handleBiometricLogin}
                  variant="outline"
                  leftIcon="security"
                  loading={isLoading}
                  disabled={true}
                  style={{ marginTop: 16, opacity: 0.5 }}
                />
              )}

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

            {/* Sign Up Link */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{
                fontSize: 16,
                color: theme.colors.textSecondary,
              }}>
                Belum punya akun?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.ROLE_SELECTION)}
                disabled={isLoading}
              >
                <Text style={{
                  fontSize: 16,
                  color: theme.colors.primary,
                  fontWeight: '600',
                }}>
                  Daftar
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
