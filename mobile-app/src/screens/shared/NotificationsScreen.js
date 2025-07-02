import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../components/common/ThemeProvider';
import Card from '../../components/common/Card';

const NotificationsScreen = () => {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.scheme.background }]}>
      <View style={styles.content}>
        <Card style={styles.placeholderCard}>
          <Icon name="notifications" size={60} color={theme.colors.info} style={styles.icon} />
          <Text style={[styles.title, { color: theme.scheme.text }]}>Notifications</Text>
          <Text style={[styles.description, { color: theme.scheme.textSecondary }]}>
            Notification management will be implemented here
          </Text>
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  placeholderCard: { alignItems: 'center', padding: 40 },
  icon: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  description: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});

export default NotificationsScreen;
