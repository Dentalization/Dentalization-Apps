import React, { useState } from 'react';
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

const ForgotPasswordScreen = ({ navigation }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);

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
                name="lock-reset"
                size={40}
                color={theme.colors.primary}
              />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Lupa Kata Sandi?
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Masukkan alamat email Anda dan kami akan mengirimkan instruksi untuk mereset kata sandi Anda
            </Text>
          </View>

          <Card style={styles.formCard}>
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
          </Card>

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
  sendButton: {
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
    marginTop: 8,
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

export default ForgotPasswordScreen;
