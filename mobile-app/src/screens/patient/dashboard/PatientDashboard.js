import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../../../components/common/ThemeProvider';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

const PatientDashboard = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useSelector(state => state.auth);

  const quickActions = [
    {
      title: 'Take Photo',
      icon: 'camera-alt',
      onPress: () => navigation.navigate('PatientCamera'),
      color: theme.colors.patient.primary,
    },
    {
      title: 'Book Appointment',
      icon: 'event',
      onPress: () => navigation.navigate('PatientAppointments'),
      color: theme.colors.accent,
    },
    {
      title: 'View History',
      icon: 'history',
      onPress: () => navigation.navigate('PatientHistory'),
      color: theme.colors.info,
    },
    {
      title: 'Chat with Doctor',
      icon: 'chat',
      onPress: () => navigation.navigate('Chat'),
      color: theme.colors.success,
    },
  ];

  const renderQuickAction = (action, index) => (
    <Card
      key={index}
      onPress={action.onPress}
      style={[styles.actionCard, { borderLeftColor: action.color }]}
    >
      <View style={styles.actionContent}>
        <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
          <Icon name={action.icon} size={24} color={action.color} />
        </View>
        <Text style={[styles.actionTitle, { color: theme.scheme.text }]}>
          {action.title}
        </Text>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.scheme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.scheme.text }]}>
            Hello, {user?.name || 'Patient'}!
          </Text>
          <Text style={[styles.subtitle, { color: theme.scheme.textSecondary }]}>
            How are you feeling today?
          </Text>
        </View>

        <Card style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <Icon name="favorite" size={24} color={theme.colors.error} />
            <Text style={[styles.healthTitle, { color: theme.scheme.text }]}>
              Health Status
            </Text>
          </View>
          <Text style={[styles.healthStatus, { color: theme.colors.success }]}>
            All Good! ✨
          </Text>
          <Text style={[styles.healthSubtitle, { color: theme.scheme.textSecondary }]}>
            No urgent dental issues detected
          </Text>
        </Card>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.scheme.text }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        <Card style={styles.reminderCard}>
          <View style={styles.reminderHeader}>
            <Icon name="schedule" size={24} color={theme.colors.warning} />
            <Text style={[styles.reminderTitle, { color: theme.scheme.text }]}>
              Upcoming Appointment
            </Text>
          </View>
          <Text style={[styles.reminderDate, { color: theme.scheme.textSecondary }]}>
            Dr. Smith - Tomorrow at 2:00 PM
          </Text>
          <Button
            title="View Details"
            variant="outline"
            size="sm"
            style={styles.reminderButton}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  healthCard: {
    marginBottom: 24,
    padding: 20,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  healthStatus: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  healthSubtitle: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  actionCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    borderLeftWidth: 4,
    padding: 16,
  },
  actionContent: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  reminderCard: {
    padding: 20,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reminderDate: {
    fontSize: 14,
    marginBottom: 12,
  },
  reminderButton: {
    alignSelf: 'flex-start',
  },
});

export default PatientDashboard;
