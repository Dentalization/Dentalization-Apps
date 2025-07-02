import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../../components/common/ThemeProvider';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { ROUTES } from '../../../shared/constants';

const ForgotPasswordScreen = ({ navigation }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendResetEmail = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEmailSent(true);
      Alert.alert(
        'Email Sent',
        'Password reset instructions have been sent to your email address.',
      );
      
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate(ROUTES.LOGIN);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.scheme.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Icon
            name="lock-reset"
            size={60}
            color={theme.colors.primary}
            style={styles.logo}
          />
          <Text style={[styles.title, { color: theme.scheme.text }]}>
            Forgot Password?
          </Text>
          <Text style={[styles.subtitle, { color: theme.scheme.textSecondary }]}>
            Enter your email address and we'll send you instructions to reset your password
          </Text>
        </View>

        <Card style={styles.formCard}>
          {!emailSent ? (
            <>
              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={
                  <Icon name="email" size={20} color={theme.colors.secondaryText} />
                }
              />

              <Button
                title="Send Reset Instructions"
                onPress={handleSendResetEmail}
                loading={isLoading}
                style={styles.sendButton}
              />
            </>
          ) : (
            <View style={styles.successContainer}>
              <Icon
                name="check-circle"
                size={60}
                color={theme.colors.success}
                style={styles.successIcon}
              />
              <Text style={[styles.successTitle, { color: theme.scheme.text }]}>
                Email Sent!
              </Text>
              <Text style={[styles.successText, { color: theme.scheme.textSecondary }]}>
                Check your email for password reset instructions. The link will expire in 24 hours.
              </Text>
            </View>
          )}
        </Card>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.scheme.textSecondary }]}>
            Remember your password?{' '}
          </Text>
          <Button
            title="Back to Sign In"
            variant="ghost"
            onPress={navigateToLogin}
            style={styles.backButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    marginBottom: 16,
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
  sendButton: {
    marginTop: 8,
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
});

export default ForgotPasswordScreen;
