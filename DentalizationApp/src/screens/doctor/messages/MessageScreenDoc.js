import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const MessageScreenDoc = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  // Sample patient data
  const patients = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      lastMessage: 'Thank you for the treatment plan',
      time: '2:30 PM',
      unread: 2,
      online: true,
      lastSeen: 'Online',
      status: 'active'
    },
    {
      id: 2,
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      lastMessage: 'When is my next appointment?',
      time: '1:45 PM',
      unread: 0,
      online: false,
      lastSeen: '2 hours ago',
      status: 'away'
    },
    {
      id: 3,
      name: 'Emily Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      lastMessage: 'The pain has reduced significantly',
      time: '11:20 AM',
      unread: 1,
      online: true,
      lastSeen: 'Online',
      status: 'active'
    },
    {
      id: 4,
      name: 'David Wilson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      lastMessage: 'Can we reschedule tomorrow\'s appointment?',
      time: '9:15 AM',
      unread: 0,
      online: false,
      lastSeen: '1 day ago',
      status: 'offline'
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80',
      lastMessage: 'Thank you for the quick response',
      time: 'Yesterday',
      unread: 0,
      online: false,
      lastSeen: '3 hours ago',
      status: 'away'
    }
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFilteredPatients = () => {
    switch (activeTab) {
      case 'Unread':
        return filteredPatients.filter(patient => patient.unread > 0);
      case 'Archived':
        return [];
      default:
        return filteredPatients;
    }
  };

  const renderPatientItem = (patient) => (
    <TouchableOpacity
      key={patient.id}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
      }}
      onPress={() => navigation.navigate('ChatDoc', {
        patientId: patient.id,
        patientName: patient.name,
        avatar: patient.avatar,
        online: patient.online,
        lastSeen: patient.lastSeen
      })}
    >
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: patient.avatar }}
          style={{ width: 56, height: 56, borderRadius: 28 }}
        />
        {patient.online && (
          <View style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#10B981',
            borderWidth: 2,
            borderColor: 'white'
          }} />
        )}
      </View>
      
      <View style={{ flex: 1, marginLeft: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
            {patient.name}
          </Text>
          <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
            {patient.time}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 14,
              color: patient.unread > 0 ? '#1F2937' : '#9CA3AF',
              fontWeight: patient.unread > 0 ? '500' : 'normal',
              flex: 1,
              marginRight: 8
            }}
            numberOfLines={1}
          >
            {patient.lastMessage}
          </Text>
          
          {patient.unread > 0 && (
            <View style={{
              backgroundColor: '#8B5CF6',
              borderRadius: 12,
              minWidth: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 6
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                {patient.unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={['#8B5CF6', '#667eea']}
        style={{ paddingBottom: 20 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView>
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity 
                  onPress={() => navigation.goBack()}
                  style={{ marginRight: 16, padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Icon name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>Messages</Text>
              </View>
            </View>
            
            {/* Search Bar */}
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 25, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20 }}>
              <Icon name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#1F2937' }}
                placeholder="Search patients..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginLeft: 8 }}>
                  <Icon name="close" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Tabs */}
      <View style={{ backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
          {['All', 'Unread', 'Archived'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25, marginRight: 12, minWidth: 80, alignItems: 'center' },
                activeTab === tab ? { backgroundColor: '#8B5CF6' } : { backgroundColor: '#F1F5F9' }
              ]}
            >
              <Text style={[
                { fontSize: 14, fontWeight: '600' },
                activeTab === tab ? { color: 'white' } : { color: '#64748B' }
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Patient List */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {getFilteredPatients().length > 0 ? (
          getFilteredPatients().map(renderPatientItem)
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
            <MaterialCommunityIcons name="message-outline" size={64} color="#D1D5DB" />
            <Text style={{ fontSize: 18, color: '#9CA3AF', marginTop: 16, textAlign: 'center' }}>
              {activeTab === 'Unread' ? 'No unread messages' : 
               activeTab === 'Archived' ? 'No archived conversations' : 
               searchQuery ? 'No patients found' : 'No conversations yet'}
            </Text>
            <Text style={{ fontSize: 14, color: '#D1D5DB', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
              {searchQuery ? 'Try adjusting your search terms' : 'Start a conversation with your patients'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default MessageScreenDoc;