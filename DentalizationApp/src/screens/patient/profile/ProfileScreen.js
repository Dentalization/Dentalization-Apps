import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Alert 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../../../components/common/ThemeProvider';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { logoutUser } from '../../../store/slices/authSlice';

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Keluar',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Keluar', 
          style: 'destructive',
          onPress: () => dispatch(logoutUser())
        }
      ]
    );
  };

  const profileOptions = [
    {
      title: 'Lengkapi Profil',
      subtitle: user?.profile?.profileComplete ? 'Profil sudah lengkap' : 'Melengkapi informasi pribadi',
      icon: 'edit',
      color: user?.profile?.profileComplete ? theme.colors.success : theme.colors.warning,
      onPress: () => navigation.navigate('PatientProfileSetup'),
    },
    {
      title: 'Informasi Pribadi',
      subtitle: 'Lihat dan edit informasi dasar',
      icon: 'person',
      color: theme.colors.info,
      onPress: () => {
        // TODO: Navigate to basic info edit
        Alert.alert('Info', 'Fitur ini akan segera tersedia');
      },
    },
    {
      title: 'Riwayat Medis',
      subtitle: 'Kelola riwayat kesehatan gigi',
      icon: 'medical-services',
      color: theme.colors.patient.primary,
      onPress: () => {
        // TODO: Navigate to medical history
        Alert.alert('Info', 'Fitur ini akan segera tersedia');
      },
    },
    {
      title: 'Pengaturan',
      subtitle: 'Notifikasi, bahasa, dan preferensi',
      icon: 'settings',
      color: theme.colors.accent,
      onPress: () => {
        // TODO: Navigate to settings
        Alert.alert('Info', 'Fitur ini akan segera tersedia');
      },
    },
  ];

  const renderProfileOption = (option, index) => (
    <TouchableOpacity
      key={index}
      onPress={option.onPress}
      style={styles.optionContainer}
    >
      <Card style={[styles.optionCard, { borderLeftColor: option.color }]}>
        <View style={styles.optionContent}>
          <View style={[styles.optionIcon, { backgroundColor: `${option.color}20` }]}>
            <Icon name={option.icon} size={24} color={option.color} />
          </View>
          <View style={styles.optionText}>
            <Text style={[styles.optionTitle, { color: theme.scheme.text }]}>
              {option.title}
            </Text>
            <Text style={[styles.optionSubtitle, { color: theme.scheme.textSecondary }]}>
              {option.subtitle}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.scheme.textSecondary} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.scheme.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Card style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.patient.primary }]}>
              <Text style={styles.avatarText}>
                {(user?.profile?.firstName?.[0] || user?.name?.[0] || 'P').toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.scheme.text }]}>
                {user?.profile?.firstName && user?.profile?.lastName 
                  ? `${user.profile.firstName} ${user.profile.lastName}`
                  : user?.name || 'Pasien'
                }
              </Text>
              <Text style={[styles.userEmail, { color: theme.scheme.textSecondary }]}>
                {user?.email}
              </Text>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: user?.profile?.profileComplete ? theme.colors.success : theme.colors.warning }
                ]}>
                  <Text style={styles.statusText}>
                    {user?.profile?.profileComplete ? 'Profil Lengkap' : 'Profil Belum Lengkap'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Profile Options */}
        <View style={styles.optionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.scheme.text }]}>
            Kelola Profil
          </Text>
          {profileOptions.map(renderProfileOption)}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            title="Keluar"
            variant="outline"
            onPress={handleLogout}
            style={[styles.logoutButton, { borderColor: theme.colors.error }]}
            textStyle={{ color: theme.colors.error }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profileHeader: {
    marginBottom: 24,
    padding: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  optionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionContainer: {
    marginBottom: 12,
  },
  optionCard: {
    borderLeftWidth: 4,
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
  },
  logoutSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  logoutButton: {
    marginTop: 10,
  },
});

export default ProfileScreen;
