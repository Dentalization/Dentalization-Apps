import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../components/common/ThemeProvider';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { ROUTES } from '../../constants/routes';
import authService from '../../services/authService';

const EmailVerificationScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState({
    success: false,
    message: '',
  });
  const [token, setToken] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Extract token from route params or deep link
  useEffect(() => {
    if (route.params?.token) {
      setToken(route.params.token);
      verifyEmail(route.params.token);
    } else {
      setIsLoading(false);
      setVerificationStatus({
        success: false,
        message: 'No verification token found. Please check your email for the verification link.',
      });
    }
  }, [route.params]);

  useEffect(() => {
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
    ]).start();
  }, [fadeAnim, slideAnim]);

  const verifyEmail = async (verificationToken) => {
    setIsLoading(true);
    
    try {
      const response = await authService.verifyEmail(verificationToken);
      
      setVerificationStatus({
        success: response.success,
        message: response.message || 'Email verification successful!',
      });
    } catch (error) {
      console.error('Email verification error:', error);
      
      setVerificationStatus({
        success: false,
        message: error.message || 'Email verification failed. The link might be expired or invalid.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate(ROUTES.LOGIN);
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
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
                    name={isLoading ? 'hourglass-empty' : (verificationStatus.success ? 'check-circle' : 'error')}
                    size={40}
                    color="white"
                  />
                </View>
                <Text style={styles.title}>
                  {isLoading 
                    ? 'Verifying Email' 
                    : (verificationStatus.success ? 'Email Verified!' : 'Verification Failed')}
                </Text>
                <Text style={styles.subtitle}>
                  {isLoading 
                    ? 'Please wait while we verify your email address...' 
                    : verificationStatus.message}
                </Text>
              </View>

              <Animated.View style={styles.formCard}>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                      Verifying your email...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.resultContainer}>
                    <Icon
                      name={verificationStatus.success ? 'check-circle' : 'error'}
                      size={60}
                      color={verificationStatus.success ? theme.colors.success : theme.colors.error}
                      style={styles.resultIcon}
                    />
                    
                    <Text style={[styles.resultTitle, { 
                      color: verificationStatus.success ? theme.colors.success : theme.colors.error 
                    }]}>
                      {verificationStatus.success ? 'Success!' : 'Verification Failed'}
                    </Text>
                    
                    <Text style={[styles.resultText, { color: theme.colors.textSecondary }]}>
                      {verificationStatus.success 
                        ? 'Your email has been successfully verified. You can now log in to your account.'
                        : 'We were unable to verify your email. The link may have expired or is invalid.'}
                    </Text>
                    
                    <Button
                      title="Continue to Login"
                      onPress={navigateToLogin}
                      style={{ marginTop: 24 }}
                    />
                  </View>
                )}
              </Animated.View>
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  resultContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  resultIcon: {
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: 'white',
  },
  resultText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  verifyButton: {
    marginTop: 16,
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
  resendContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    marginBottom: 8,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  resendButton: {
    paddingHorizontal: 0,
    minHeight: 'auto',
  },
  continueButton: {
    marginTop: 24,
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
  backButton: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
});

export default EmailVerificationScreen;
