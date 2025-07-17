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

const MessagesScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('recent'); // recent, appointments, archived
  
  const conversations = [
    {
      id: 1,
      doctorName: 'Dr. Sarah Mitchell',
      specialty: 'Orthodontic Specialist',
      lastMessage: 'X-ray results look good. Your teeth are healing well 🦷',
      time: '2 min ago',
      unread: 2,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      isOnline: true,
      messageType: 'text',
      verified: true,
      lastActivity: 'Active now'
    },
    {
      id: 2,
      doctorName: 'Dr. Michael Chen',
      specialty: 'Periodontic Specialist',
      lastMessage: 'Please upload a photo of your gums after using the prescribed medication',
      time: '1 hour ago',
      unread: 0,
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      isOnline: false,
      messageType: 'request',
      verified: true,
      lastActivity: '2 hours ago'
    },
    {
      id: 3,
      doctorName: 'Dr. Emily Johnson',
      specialty: 'Dental Surgeon',
      lastMessage: 'Your next appointment is scheduled for tomorrow at 2:00 PM',
      time: 'Yesterday',
      unread: 0,
      avatar: 'https://images.unsplash.com/photo-1594824846003-5cee7a0e0f85?w=150&h=150&fit=crop&crop=face',
      isOnline: false,
      messageType: 'appointment',
      verified: true,
      lastActivity: 'Yesterday'
    },
    {
      id: 4,
      doctorName: 'Dr. Amanda Wilson',
      specialty: 'Endodontic Specialist',
      lastMessage: 'Treatment summary has been sent to your email',
      time: '2 days ago',
      unread: 1,
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
      isOnline: true,
      messageType: 'summary',
      verified: true,
      lastActivity: 'Active now'
    },
  ];

  const appointments = [
    {
      id: 5,
      doctorName: 'Dr. Sarah Mitchell',
      specialty: 'Orthodontic Specialist',
      lastMessage: 'Appointment reminder: Tomorrow at 10:00 AM',
      time: 'Tomorrow',
      unread: 0,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      isOnline: true,
      messageType: 'reminder',
      verified: true,
      appointmentStatus: 'upcoming'
    },
  ];

  const getMessageIcon = (messageType) => {
    switch (messageType) {
      case 'request':
        return { name: 'camera', color: '#F59E0B' };
      case 'appointment':
        return { name: 'calendar-today', color: '#8B5CF6' };
      case 'summary':
        return { name: 'description', color: '#10B981' };
      case 'reminder':
        return { name: 'schedule', color: '#EF4444' };
      default:
        return null;
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'appointments':
        return appointments;
      case 'archived':
        return [];
      default:
        return conversations;
    }
  };

  const renderConversationItem = (conversation) => {
    const messageIcon = getMessageIcon(conversation.messageType);
    
    return (
      <TouchableOpacity
        key={conversation.id}
        style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 16, marginHorizontal: 15, marginVertical: 4, borderRadius: 16, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.1)' }}
        onPress={() => {
          console.log('Navigating to Chat with params:', {
            doctorId: conversation.id,
            doctorName: conversation.doctorName,
            specialty: conversation.specialty,
            avatar: conversation.avatar,
            isOnline: conversation.isOnline,
            verified: conversation.verified
          });
          navigation.navigate('Chat', { 
            doctorId: conversation.id,
            doctorName: conversation.doctorName,
            specialty: conversation.specialty,
            avatar: conversation.avatar,
            isOnline: conversation.isOnline,
            verified: conversation.verified
          });
        }}
        activeOpacity={0.7}
      >
        <View style={{ position: 'relative', marginRight: 15 }}>
          <Image source={{ uri: conversation.avatar }} style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#E5E7EB' }} />
          {conversation.isOnline && <View style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: 'white' }} />}
          {conversation.verified && (
            <View style={{ position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white' }}>
              <Icon name="verified" size={12} color="white" />
            </View>
          )}
        </View>
        
        <View style={{ flex: 1 }}>
          <View style={{ marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937', flex: 1 }}>{conversation.doctorName}</Text>
              <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '500' }}>{conversation.time}</Text>
            </View>
          </View>
          
          <Text style={{ fontSize: 13, color: '#8B5CF6', marginBottom: 6, fontWeight: '600' }}>{conversation.specialty}</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            {messageIcon && (
              <Icon 
                name={messageIcon.name} 
                size={14} 
                color={messageIcon.color} 
                style={{ marginRight: 6 }} 
              />
            )}
            <Text 
              style={[
                { fontSize: 14, color: '#6B7280', flex: 1, lineHeight: 20 },
                conversation.unread > 0 && { fontWeight: '600', color: '#1F2937' }
              ]} 
              numberOfLines={1}
            >
              {conversation.lastMessage}
            </Text>
          </View>
          
          {conversation.lastActivity && (
            <Text style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>{conversation.lastActivity}</Text>
          )}
        </View>
        
        <View style={{ alignItems: 'center', justifyContent: 'flex-start', marginLeft: 10 }}>
          {conversation.unread > 0 && (
            <View style={{ backgroundColor: '#EF4444', borderRadius: 12, minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, marginBottom: 10 }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>{conversation.unread}</Text>
            </View>
          )}
          
          <TouchableOpacity style={{ padding: 4 }}>
            <MaterialCommunityIcons name="dots-vertical" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

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
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>Messages</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={{ marginLeft: 15, padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <MaterialCommunityIcons name="video-plus" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={{ marginLeft: 15, padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <Icon name="search" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Search Bar */}
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 25, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20 }}>
              <Icon name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={{ flex: 1, marginLeft: 10, fontSize: 16, color: '#1F2937' }}
                placeholder="Search conversations..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#9CA3AF"
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Icon name="clear" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Tab Navigation */}
            <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 25, padding: 4 }}>
              {[
                { key: 'recent', label: 'Recent', icon: 'chat' },
                { key: 'appointments', label: 'Appointments', icon: 'schedule' },
                { key: 'archived', label: 'Archived', icon: 'archive' }
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
                    activeTab === tab.key && { backgroundColor: 'white' }
                  ]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Icon 
                    name={tab.icon} 
                    size={16} 
                    color={activeTab === tab.key ? '#8B5CF6' : 'rgba(255,255,255,0.7)'} 
                  />
                  <Text style={[
                    { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginLeft: 6 },
                    activeTab === tab.key && { color: '#8B5CF6' }
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Security Notice */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', marginHorizontal: 20, marginTop: 15, marginBottom: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#10B981' }}>
          <MaterialCommunityIcons name="shield-check" size={16} color="#10B981" />
          <Text style={{ fontSize: 12, color: '#059669', marginLeft: 8, fontWeight: '500' }}>
            End-to-end encrypted • HIPAA compliant • Secure medical communication
          </Text>
        </View>
        
        <View style={{ paddingTop: 10 }}>
          {getCurrentData().length > 0 ? (
            getCurrentData().map(renderConversationItem)
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 }}>
              <MaterialCommunityIcons name="message-outline" size={48} color="#9CA3AF" />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 16, marginBottom: 8 }}>No conversations yet</Text>
              <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 }}>
                Start a conversation with your dentist
              </Text>
            </View>
          )}
        </View>
        
        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 }}>
          <TouchableOpacity style={{ marginBottom: 12, borderRadius: 16, overflow: 'hidden', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 20 }}
            >
              <MaterialCommunityIcons name="calendar-plus" size={20} color="white" />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 10 }}>Book Appointment</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={{ marginBottom: 12, borderRadius: 16, overflow: 'hidden', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 20 }}
            >
              <MaterialCommunityIcons name="help-circle" size={20} color="white" />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 10 }}>Emergency Contact</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default MessagesScreen;
