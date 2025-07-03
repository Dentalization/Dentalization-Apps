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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../../components/common/ThemeProvider';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { ROUTES } from '../../constants/routes';
import authService from '../../services/authService';

const ResetPasswordScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccessful, setResetSuccessful] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');
  
  // Extract token from route params or deep link
  useEffect(() => {
    if (route.params?.token) {
      setToken(route.params.token);
    }
  }, [route.params]);

  // Password validation
  const validatePassword = (password) => {
    if (password.length < 8) {
      return false;
    }
    
    // Check for at least one uppercase letter, one lowercase letter, and one number
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return hasUppercase && hasLowercase && hasNumber;
  };

  const handleResetPassword = async () => {
    // Reset any previous errors
    setError(null);
    
    // Validate fields
    if (!newPassword || !confirmPassword) {
      setError('Please enter both password fields.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (!validatePassword(newPassword)) {
      setError(
        'Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number.'
      );
      return;
    }
    
    if (!token) {
      setError('Invalid or missing reset token. Please use the link from your email.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authService.resetPassword(token, newPassword);
      
      if (response.success) {
        setResetSuccessful(true);
      } else {
        throw new Error(response.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError(
        error.message || 'Failed to reset password. The link might be expired or invalid.'
      );
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
                name={resetSuccessful ? 'check-circle' : 'lock-reset'}
                size={40}
                color={resetSuccessful ? theme.colors.success : theme.colors.primary}
              />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {resetSuccessful ? 'Password Reset Successful' : 'Reset Your Password'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {resetSuccessful 
                ? 'Your password has been reset successfully. You can now log in with your new password.'
                : 'Create a new secure password for your account'}
            </Text>
          </View>

          <Card style={styles.formCard}>
            {!resetSuccessful ? (
              <>
                <Input
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setError(null); // Clear error when user types
                  }}
                  secureTextEntry={!showPassword}
                  leftIcon="lock"
                  rightIcon={showPassword ? 'visibility-off' : 'visibility'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  editable={!isLoading}
                />

                <Input
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setError(null); // Clear error when user types
                  }}
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

                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <Button
                  title="Reset Password"
                  onPress={handleResetPassword}
                  loading={isLoading}
                  style={styles.resetButton}
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
                  Password Reset Successful!
                </Text>
                <Text style={[styles.successText, { color: theme.colors.textSecondary }]}>
                  Your password has been reset successfully. You can now log in with your new password.
                </Text>
                
                <Button
                  title="Login"
                  onPress={navigateToLogin}
                  style={{ marginTop: 24 }}
                />
              </View>
            )}
          </Card>

          {!resetSuccessful && (
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                Remember your password?{' '}
              </Text>
              <Button
                title="Back to Sign In"
                variant="ghost"
                onPress={navigateToLogin}
                style={styles.backButton}
              />
            </View>
          )}
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
  formCard: {
    marginBottom: 32,
  },
  resetButton: {
    marginTop: 16,
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
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 14,
  },
  backButton: {
    paddingHorizontal: 0,
    minHeight: 'auto',
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
});

export default ResetPasswordScreen;
