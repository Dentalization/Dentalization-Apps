import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../components/common/ThemeProvider';
import Button from '../../components/common/Button';
import { loginSuccess } from '../../store/slices/authSlice';
import { USER_ROLES } from '../../constants/roles';
import { ROUTES } from '../../constants';

const RoleSelectionScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { userData } = route.params || {};
  
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
      <Animated.View
        style={[
          styles.roleCard,
          {
            backgroundColor: selectedRole === role.id 
              ? 'rgba(255, 255, 255, 0.25)' 
              : 'rgba(255, 255, 255, 0.15)',
            borderColor: selectedRole === role.id ? role.color : 'rgba(255, 255, 255, 0.3)',
            borderWidth: selectedRole === role.id ? 2 : 1,
          },
        ]}
      >
        <View style={styles.roleHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${role.color}20` }]}>
            <Icon name={role.icon} size={32} color={role.color} />
          </View>
          
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>
              {role.title}
            </Text>
            <Text style={styles.roleDescription}>
              {role.description}
            </Text>
          </View>
          
          {selectedRole === role.id && (
            <Icon name="check-circle" size={24} color={role.color} />
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
        <View style={styles.header}>
          <Icon
            name="how-to-reg"
            size={60}
            color="white"
            style={styles.logo}
          />
          <Text style={styles.title}>
            Pilih Peran Anda
          </Text>
          <Text style={styles.subtitle}>
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
            textStyle={{ color: '#333333' }}
          />
          
          <Text style={styles.footerNote}>
            Mohon di Pilih Peran dengan Bijak. Jika Anda Dokter Gigi, pastikan Anda memiliki lisensi yang valid.
          </Text>
        </View>
        </Animated.View>
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: 'white',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  rolesContainer: {
    flex: 1,
    marginBottom: 32,
  },
  roleCard: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
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
    color: 'white',
  },
  roleDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footer: {
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    marginBottom: 16,
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
  footerNote: {
    fontSize: 12,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
});

export default RoleSelectionScreen;
