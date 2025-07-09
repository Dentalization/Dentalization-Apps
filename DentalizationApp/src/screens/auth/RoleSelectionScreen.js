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
import { USER_ROLES } from '../../constants/roles';
import { ROUTES } from '../../constants';

const RoleSelectionScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { userData } = route.params || {};
  
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    {
      id: USER_ROLES.PATIENT,
      title: 'Pasien',
      description: 'Saya mencari dokter gigi atau memerlukan perawatan gigi',
      icon: 'person',
      color: theme.colors.patient.primary,
      route: ROUTES.REGISTER_PATIENT,
    },
    {
      id: USER_ROLES.DOCTOR,
      title: 'Dokter Gigi',
      description: 'Saya adalah dokter gigi yang ingin bergabung dengan platform ini',
      icon: 'local-hospital',
      color: theme.colors.doctor.primary,
      route: ROUTES.REGISTER_DOCTOR,
    },
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) {
      Alert.alert('Error', 'Silakan pilih jenis akun untuk melanjutkan');
      return;
    }

    const selectedRoleObj = roles.find(role => role.id === selectedRole);
    if (selectedRoleObj && selectedRoleObj.route) {
      navigation.navigate(selectedRoleObj.route);
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
            Pilih Peran Anda
          </Text>
          <Text style={[styles.subtitle, { color: theme.scheme.textSecondary }]}>
            Pilih bagaimana Anda akan menggunakan Dentalization
          </Text>
        </View>

        <View style={styles.rolesContainer}>
          {roles.map(renderRoleCard)}
        </View>

        <View style={styles.footer}>
          <Button
            title="Lanjutkan"
            onPress={handleContinue}
            loading={isLoading}
            disabled={!selectedRole}
            style={styles.continueButton}
          />
          
          <Text style={[styles.footerNote, { color: theme.scheme.textSecondary }]}>
            Mohon di Pilih Peran dengan Bijak. Jika Anda Dokter Gigi, pastikan Anda memiliki lisensi yang valid.
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
