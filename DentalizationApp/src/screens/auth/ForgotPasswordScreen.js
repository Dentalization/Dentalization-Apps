import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../components/common/ThemeProvider';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { ROUTES } from '../../constants/routes';
import authService from '../../services/authService';

const ForgotPasswordScreen = ({ navigation }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendResetEmail = async () => {
    // Reset any previous error
    setError(null);
    
    // Validate email
    if (!email) {
      setError('Silakan masukkan alamat email Anda');
      return;
    }

    if (!validateEmail(email)) {
      setError('Silakan masukkan alamat email yang valid');
      return;
    }

    setIsLoading(true);

    try {
      // Call the API to send reset email using our authService instance
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        setEmailSent(true);
        // Success feedback
        Alert.alert(
          'Email Terkirim',
          'Instruksi reset kata sandi telah dikirim ke alamat email Anda.',
        );
      } else {
        // Handle error from service
        throw new Error(response.message || 'Gagal mengirim email reset. Silakan coba lagi.');
      }
    } catch (error) {
      setError(error.message || 'Terjadi kesalahan saat mengirim email reset. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate(ROUTES.LOGIN);
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View 
              style={[
                styles.animatedContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Icon
                  name="lock-reset"
                  size={40}
                  color="white"
                />
              </View>
              <Text style={styles.title}>
                Lupa Kata Sandi?
              </Text>
              <Text style={styles.subtitle}>
                Masukkan alamat email Anda dan kami akan mengirimkan instruksi untuk mereset kata sandi Anda
              </Text>
            </View>

            <Animated.View style={styles.formCard}>
            {!emailSent ? (
              <>
                <Input
                  placeholder="Alamat Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null); // Clear error when user types
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="email"
                  editable={!isLoading}
                />

                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <Button
                  title="Kirim Instruksi Reset"
                  onPress={handleSendResetEmail}
                  loading={isLoading}
                  style={styles.sendButton}
                  textStyle={{ color: '#333333' }}
                />
              </>
            ) : (
              <View style={styles.successContainer}>
                <Icon
                  name="check-circle"
                  size={60}
                  color={theme.colors.success || '#4CAF50'}
                  style={styles.successIcon}
                />
                <Text style={[styles.successTitle, { color: theme.colors.text }]}>
                  Email Terkirim!
                </Text>
                <Text style={[styles.successText, { color: theme.colors.textSecondary }]}>
                  Periksa email Anda untuk instruksi reset kata sandi. Tautan akan kedaluwarsa dalam 24 jam.
                </Text>
                
                <Button
                  title="Kembali ke Halaman Masuk"
                  onPress={navigateToLogin}
                  variant="outline"
                  style={{ marginTop: 20 }}
                />
              </View>
            )}
            </Animated.View>

          {!emailSent && (
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                Ingat kata sandi Anda?{' '}
              </Text>
              <Button
                title="Kembali ke Halaman Masuk"
                variant="ghost"
                onPress={navigateToLogin}
                style={styles.backButton}
              />
            </View>
          )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: 'white',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  formCard: {
    marginBottom: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sendButton: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: 'white',
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  backButton: {
    paddingHorizontal: 0,
    minHeight: 'auto',
  },
  errorContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
  },
});

export default ForgotPasswordScreen;
