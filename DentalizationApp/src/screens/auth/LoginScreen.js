import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../components/common/ThemeProvider';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
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

const { width, height } = Dimensions.get('window');

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
  const [customError, setCustomError] = useState(null);
  const [showErrorActions, setShowErrorActions] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    initializeBiometric();
    
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
      
      // Show custom error message
      setCustomError(errorMessage);
      
      // Show action buttons for specific error types
      if (errorMessage.includes('Email belum terdaftar') || errorMessage.includes('email atau kata sandi')) {
        setShowErrorActions(true);
      } else {
        setShowErrorActions(false);
      }
      
      // Auto hide error after 8 seconds
      setTimeout(() => {
        setCustomError(null);
        setShowErrorActions(false);
      }, 8000);
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
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{
              flex: 1,
              justifyContent: 'center',
              paddingHorizontal: 24,
              paddingVertical: 32,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }}>
            {/* Header */}
            <Animated.View style={{ 
              alignItems: 'center', 
              marginBottom: 48,
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
                <Icon name="local-hospital" size={50} color="#FFFFFF" />
              </View>
              <Text style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: '#FFFFFF',
                marginBottom: 10,
                letterSpacing: 0.3,
                lineHeight: 38,
                textShadowColor: 'rgba(0, 0, 0, 0.25)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}>
                Halo, Selamat Datang!
              </Text>
              <Text style={{
                fontSize: 18,
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                fontWeight: '500',
                letterSpacing: 0.3,
                lineHeight: 24,
              }}>
                Masuk ke akun Anda untuk mengakses layanan kesehatan gigi terbaik
              </Text>
            </Animated.View>

            {/* Login Form */}
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
              <Input
                  placeholder="Alamat Email"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="email"
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
                  placeholder="Kata Sandi"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  leftIcon="lock"
                  rightIcon={showPassword ? 'visibility-off' : 'visibility'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  style={{ 
                    marginBottom: 24,
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

              {/* Remember Me & Forgot Password */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 24,
                  marginBottom: 8,
                }}>
                <TouchableOpacity
                  onPress={() => setRememberMe(!rememberMe)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  disabled={isLoading}
                >
                  <View style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    backgroundColor: rememberMe ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}>
                    {rememberMe && (
                      <Icon name="check" size={14} color="#667eea" />
                    )}
                  </View>
                  <Text style={{
                    fontSize: 16,
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '500',
                  }}>
                    Ingat saya
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
                  disabled={isLoading}
                  style={{
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '600',
                    textDecorationLine: 'underline',
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

              {/* Custom Error Message */}
              {customError && (
                <Animated.View style={{
                  marginTop: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 107, 107, 0.3)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 8,
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <Icon name="error-outline" size={24} color="#FF6B6B" />
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: '#FFFFFF',
                      marginLeft: 8,
                    }}>Gagal Masuk</Text>
                  </View>
                  <Text style={{
                    fontSize: 14,
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 20,
                    marginBottom: showErrorActions ? 16 : 0,
                  }}>{customError}</Text>
                  
                  {showErrorActions && (
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}>
                      <TouchableOpacity 
                        style={{
                          flex: 1,
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: 12,
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        }}
                        onPress={() => {
                          setCustomError(null);
                          setShowErrorActions(false);
                        }}
                      >
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: 'rgba(255, 255, 255, 0.9)',
                        }}>Coba Lagi</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={{
                          flex: 1,
                          backgroundColor: '#FFFFFF',
                          borderRadius: 12,
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          alignItems: 'center',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.2,
                          shadowRadius: 8,
                          elevation: 4,
                        }}
                        onPress={() => {
                          setCustomError(null);
                          setShowErrorActions(false);
                          navigation.navigate(ROUTES.ROLE_SELECTION);
                        }}
                      >
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '700',
                          color: '#667eea',
                        }}>Daftar Sekarang</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  <TouchableOpacity 
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      padding: 4,
                    }}
                    onPress={() => {
                      setCustomError(null);
                      setShowErrorActions(false);
                    }}
                  >
                    <Icon name="close" size={20} color="rgba(255, 255, 255, 0.7)" />
                  </TouchableOpacity>
                </Animated.View>
              )}


            </Animated.View>

            {/* Sign Up Link */}
              <Animated.View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 32,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                opacity: fadeAnim,
              }}>
                <Text style={{
                  fontSize: 16,
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: '500',
                }}>
                  Belum punya akun?
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate(ROUTES.ROLE_SELECTION)}
                  style={{ 
                    marginLeft: 12,
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    color: '#FFFFFF',
                    fontWeight: '700',
                    textDecorationLine: 'underline',
                  }}>
                    Daftar Sekarang
                  </Text>
                </TouchableOpacity>
              </Animated.View>

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;
