import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import apiService from './src/services/apiService';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider } from './src/components/common/ThemeProvider';

// Remove this debug screen when navigation is working properly
const DEBUG = false;

export default function App() {
  // Show the full navigation if DEBUG is false
  if (!DEBUG) {
    return (
      <Provider store={store}>
        <SafeAreaProvider>
          <ThemeProvider>
            <RootNavigator />
          </ThemeProvider>
        </SafeAreaProvider>
      </Provider>
    );
  }
  
  // Debug screen below (will only show if DEBUG is true)
  const [backendStatus, setBackendStatus] = useState({
    connected: false,
    loading: true,
    data: null,
  });

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    setBackendStatus(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await apiService.healthCheck();
      
      if (result.success) {
        setBackendStatus({
          connected: true,
          loading: false,
          data: result.data,
        });
        console.log('✅ Backend connected successfully:', result.data);
      } else {
        setBackendStatus({
          connected: false,
          loading: false,
          data: result.error,
        });
        console.error('❌ Backend connection failed:', result.error);
      }
    } catch (error) {
      setBackendStatus({
        connected: false,
        loading: false,
        data: error.message,
      });
      console.error('❌ Backend connection error:', error);
    }
  };

  const testDoctorDashboard = async () => {
    try {
      const result = await apiService.getDoctorDashboard();
      
      if (result.success) {
        Alert.alert(
          'Dashboard Data',
          JSON.stringify(result.data, null, 2),
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          `Failed to fetch dashboard data: ${result.error}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message, [{ text: 'OK' }]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>🦷 Dentalization App</Text>
      <Text style={styles.subtitle}>Integration with Backend API</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Backend Status:</Text>
        {backendStatus.loading ? (
          <Text style={styles.statusLoading}>Checking connection...</Text>
        ) : (
          <Text style={[
            styles.statusText,
            { color: backendStatus.connected ? '#4CAF50' : '#F44336' }
          ]}>
            {backendStatus.connected ? '✅ Connected' : '❌ Disconnected'}
          </Text>
        )}
        
        {backendStatus.data && (
          <Text style={styles.statusData}>
            {backendStatus.connected 
              ? `Server: ${backendStatus.data.service || 'Dentalization API'}`
              : `Error: ${backendStatus.data}`
            }
          </Text>
        )}
      </View>

      <TouchableOpacity 
        style={styles.testButton} 
        onPress={checkBackendConnection}
      >
        <Text style={styles.testButtonText}>🔄 Test Connection</Text>
      </TouchableOpacity>

      {backendStatus.connected && (
        <TouchableOpacity 
          style={[styles.testButton, styles.dashboardButton]} 
          onPress={testDoctorDashboard}
        >
          <Text style={styles.testButtonText}>📊 Test Dashboard API</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  statusContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusLoading: {
    fontSize: 16,
    color: '#FFA726',
    fontStyle: 'italic',
  },
  statusData: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  dashboardButton: {
    backgroundColor: '#4CAF50',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
