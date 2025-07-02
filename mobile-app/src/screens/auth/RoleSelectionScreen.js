import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../../components/common/ThemeProvider';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { loginSuccess } from '../../store/slices/authSlice';
import { USER_ROLES } from '../../../shared/constants';

const RoleSelectionScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { userData } = route.params || {};
  
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    {
      id: USER_ROLES.PATIENT,
      title: 'Patient',
      description: 'Book appointments, upload photos, and consult with doctors',
      icon: 'person',
      color: theme.colors.patient.primary,
    },
    {
      id: USER_ROLES.DOCTOR,
      title: 'Doctor',
      description: 'Manage patients, diagnose conditions, and provide consultations',
      icon: 'local-hospital',
      color: theme.colors.doctor.primary,
    },
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) {
      Alert.alert('Error', 'Please select a role to continue');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call to complete registration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful registration with role
      const mockUser = {
        id: '1',
        email: userData?.email || 'user@example.com',
        role: selectedRole,
        name: `${userData?.firstName || 'John'} ${userData?.lastName || 'Doe'}`,
      };
      
      const mockToken = 'mock-jwt-token';
      
      dispatch(loginSuccess({ user: mockUser, token: mockToken }));
      
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleCard = (role) => (
    <TouchableOpacity
      key={role.id}
      onPress={() => handleRoleSelect(role.id)}
      activeOpacity={0.7}
    >
      <Card
        style={[
          styles.roleCard,
          selectedRole === role.id && {
            borderColor: role.color,
            borderWidth: 2,
            backgroundColor: `${role.color}10`,
          },
        ]}
      >
        <View style={styles.roleHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${role.color}20` }]}>
            <Icon name={role.icon} size={32} color={role.color} />
          </View>
          
          <View style={styles.roleInfo}>
            <Text style={[styles.roleTitle, { color: theme.scheme.text }]}>
              {role.title}
            </Text>
            <Text style={[styles.roleDescription, { color: theme.scheme.textSecondary }]}>
              {role.description}
            </Text>
          </View>
          
          {selectedRole === role.id && (
            <Icon name="check-circle" size={24} color={role.color} />
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.scheme.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Icon
            name="how-to-reg"
            size={60}
            color={theme.colors.primary}
            style={styles.logo}
          />
          <Text style={[styles.title, { color: theme.scheme.text }]}>
            Choose Your Role
          </Text>
          <Text style={[styles.subtitle, { color: theme.scheme.textSecondary }]}>
            Select how you'll be using Dentalization
          </Text>
        </View>

        <View style={styles.rolesContainer}>
          {roles.map(renderRoleCard)}
        </View>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            loading={isLoading}
            disabled={!selectedRole}
            style={styles.continueButton}
          />
          
          <Text style={[styles.footerNote, { color: theme.scheme.textSecondary }]}>
            You can change your role later in settings
          </Text>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  rolesContainer: {
    flex: 1,
    marginBottom: 32,
  },
  roleCard: {
    marginBottom: 16,
    padding: 20,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    marginBottom: 16,
  },
  footerNote: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default RoleSelectionScreen;
