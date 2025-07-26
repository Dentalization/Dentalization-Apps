import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const DiagnosisScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F1F8' }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, alignItems: 'center', padding: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
          <MaterialIcons name="psychology" size={60} color="#483AA0" style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', color: '#333333' }}>AI Diagnosis</Text>
          <Text style={{ fontSize: 14, textAlign: 'center', lineHeight: 20, color: '#6E6E6E' }}>
            AI-powered dental diagnosis and analysis tools will be implemented here
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DiagnosisScreen;
