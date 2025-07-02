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

const DoctorDashboard = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useSelector(state => state.auth);

  const quickStats = [
    {
      title: 'Today\'s Patients',
      value: '8',
      icon: 'people',
      color: theme.colors.doctor.primary,
    },
    {
      title: 'Pending Reviews',
      value: '3',
      icon: 'rate-review',
      color: theme.colors.warning,
    },
    {
      title: 'This Month',
      value: '142',
      icon: 'trending-up',
      color: theme.colors.info,
    },
    {
      title: 'Urgent Cases',
      value: '1',
      icon: 'priority-high',
      color: theme.colors.error,
    },
  ];

  const quickActions = [
    {
      title: 'View Patients',
      icon: 'people',
      onPress: () => navigation.navigate('DoctorPatients'),
      color: theme.colors.doctor.primary,
    },
    {
      title: 'Schedule',
      icon: 'schedule',
      onPress: () => navigation.navigate('DoctorAppointments'),
      color: theme.colors.accent,
    },
    {
      title: 'AI Diagnosis',
      icon: 'psychology',
      onPress: () => navigation.navigate('DoctorDiagnosis'),
      color: theme.colors.info,
    },
    {
      title: 'Messages',
      icon: 'chat',
      onPress: () => navigation.navigate('Chat'),
      color: theme.colors.success,
    },
  ];

  const renderStatCard = (stat, index) => (
    <Card key={index} style={[styles.statCard, { borderTopColor: stat.color }]}>
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
          <Icon name={stat.icon} size={20} color={stat.color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={[styles.statValue, { color: theme.scheme.text }]}>
            {stat.value}
          </Text>
          <Text style={[styles.statTitle, { color: theme.scheme.textSecondary }]}>
            {stat.title}
          </Text>
        </View>
      </View>
    </Card>
  );

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
            Good morning, Dr. {user?.name?.split(' ').pop() || 'Doctor'}!
          </Text>
          <Text style={[styles.subtitle, { color: theme.scheme.textSecondary }]}>
            Here's your practice overview
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.scheme.text }]}>
            Today's Overview
          </Text>
          <View style={styles.statsGrid}>
            {quickStats.map(renderStatCard)}
          </View>
        </View>

        <Card style={styles.urgentCard}>
          <View style={styles.urgentHeader}>
            <Icon name="warning" size={24} color={theme.colors.error} />
            <Text style={[styles.urgentTitle, { color: theme.scheme.text }]}>
              Urgent Case Alert
            </Text>
          </View>
          <Text style={[styles.urgentPatient, { color: theme.scheme.textSecondary }]}>
            John Doe - Severe tooth pain
          </Text>
          <Text style={[styles.urgentTime, { color: theme.scheme.textSecondary }]}>
            Submitted 30 minutes ago
          </Text>
          <Button
            title="Review Case"
            variant="primary"
            size="sm"
            style={styles.urgentButton}
          />
        </Card>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.scheme.text }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        <Card style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <Icon name="schedule" size={24} color={theme.colors.info} />
            <Text style={[styles.scheduleTitle, { color: theme.scheme.text }]}>
              Next Appointment
            </Text>
          </View>
          <Text style={[styles.schedulePatient, { color: theme.scheme.text }]}>
            Sarah Johnson
          </Text>
          <Text style={[styles.scheduleTime, { color: theme.scheme.textSecondary }]}>
            2:00 PM - Regular Checkup
          </Text>
          <Button
            title="View Schedule"
            variant="outline"
            size="sm"
            style={styles.scheduleButton}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    borderTopWidth: 3,
    padding: 16,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 12,
  },
  urgentCard: {
    marginBottom: 24,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#E53935',
  },
  urgentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  urgentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  urgentPatient: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  urgentTime: {
    fontSize: 12,
    marginBottom: 12,
  },
  urgentButton: {
    alignSelf: 'flex-start',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
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
  scheduleCard: {
    padding: 20,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  schedulePatient: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 14,
    marginBottom: 12,
  },
  scheduleButton: {
    alignSelf: 'flex-start',
  },
});

export default DoctorDashboard;
