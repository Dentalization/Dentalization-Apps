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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.colors.primary + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <Icon
                name={isLoading ? 'hourglass-empty' : (verificationStatus.success ? 'check-circle' : 'error')}
                size={40}
                color={isLoading 
                  ? theme.colors.primary 
                  : (verificationStatus.success ? theme.colors.success : theme.colors.error)}
              />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {isLoading 
                ? 'Verifying Email' 
                : (verificationStatus.success ? 'Email Verified!' : 'Verification Failed')}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {isLoading 
                ? 'Please wait while we verify your email address...' 
                : verificationStatus.message}
            </Text>
          </View>

          <Card style={styles.card}>
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
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    marginBottom: 32,
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
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
  },
  resultText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EmailVerificationScreen;
