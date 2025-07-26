import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  FlatList,
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const DoctorDashboard = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Professional dental dashboard data
  const dashboardData = {
    todayAppointments: [
      { id: 1, time: '09:00', patient: 'Sarah Johnson', status: 'Waiting', type: 'Cleaning', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face' },
      { id: 2, time: '10:30', patient: 'Michael Chen', status: 'In Progress', type: 'Root Canal', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face' },
      { id: 3, time: '14:00', patient: 'Emma Wilson', status: 'Done', type: 'Checkup', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face' },
      { id: 4, time: '15:30', patient: 'David Brown', status: 'Waiting', type: 'Filling', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face' }
    ],
    stats: {
      totalPatientsToday: 8,
      monthlyConsultations: 156,
      patientRating: 4.8
    },
    notifications: [
      { id: 1, type: 'cancelled', message: 'John Doe cancelled 3:00 PM appointment', time: '15 min ago', icon: 'event-busy' },
      { id: 2, type: 'message', message: 'New message from Sarah Johnson', time: '1 hour ago', icon: 'chat' }
    ],
    chatSummary: [
      { id: 1, patient: 'Sarah Johnson', message: 'Thank you for the excellent treatment!', time: '2 min ago', unread: true, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face' },
      { id: 2, patient: 'Michael Chen', message: 'When is my next appointment?', time: '1 hour ago', unread: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' }
    ],
    aiInsights: {
      latestDiagnosis: {
        patient: 'Emma Wilson',
        condition: 'Early Stage Gingivitis',
        confidence: '92%',
        recommendation: 'Recommend deep cleaning and improved oral hygiene',
        time: '1 hour ago'
      }
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'Waiting': return { bg: '#FFF3CD', text: '#856404', border: '#FFEAA7' };
        case 'In Progress': return { bg: '#D1ECF1', text: '#0C5460', border: '#BEE5EB' };
        case 'Done': return { bg: '#D4EDDA', text: '#155724', border: '#C3E6CB' };
        default: return { bg: '#F8F9FA', text: '#6C757D', border: '#DEE2E6' };
      }
    };
    const colors = getStatusColor();
    return (
      <View style={{ backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>{status}</Text>
      </View>
    );
  };

  // Stats card component
  const StatsCard = ({ title, value, icon, color, subtitle }) => (
    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, borderLeftWidth: 4, borderLeftColor: color }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#333333', marginBottom: 4 }}>{value}</Text>
          <Text style={{ fontSize: 14, color: '#6E6E6E', marginBottom: 2 }}>{title}</Text>
          {subtitle && <Text style={{ fontSize: 12, color: color, fontWeight: '500' }}>{subtitle}</Text>}
        </View>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: `${color}15`, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name={icon} size={24} color={color} />
        </View>
      </View>
    </View>
  );

  // Action shortcut button
  const ActionButton = ({ title, icon, color, onPress }) => (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 12 }}>
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: `${color}15`, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#333333', textAlign: 'center' }}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F1F8' }}>
      <StatusBar barStyle="light-content" backgroundColor="#483AA0" />
      
      {/* Professional Header */}
      <LinearGradient
        colors={['#483AA0', '#6366F1']}
        style={{ paddingTop: 50, paddingHorizontal: 20, paddingBottom: 30, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={{ width: 55, height: 55, borderRadius: 27.5, overflow: 'hidden', marginRight: 15, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' }}>
              <Image
                source={{
                  uri: user?.profile?.profilePicture ||
                  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=110&h=110&fit=crop&crop=face'
                }}
                style={{ width: 49, height: 49 }}
              />
            </View>
            <View style={{ flex: 2 }}>
              <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', marginBottom: 2 }}>{getGreeting()}</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 4 }}>
                {user?.profile?.firstName ? user.profile.firstName : user?.name ? user.name : 'Dr. Sarah'}
              </Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{getCurrentDate()}</Text>
            </View>
          </View>
          <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
            <MaterialIcons name="notifications-none" size={22} color="white" />
            <View style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4757' }} />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 25, paddingHorizontal: 16, paddingVertical: 12 }}>
          <MaterialIcons name="search" size={20} color="rgba(255,255,255,0.8)" style={{ marginRight: 10 }} />
          <TextInput
            style={{ flex: 1, fontSize: 16, color: 'white', fontWeight: '400' }}
            placeholder="Search patient or anything..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 20, padding: 8, marginLeft: 10 }}>
            <MaterialIcons name="tune" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1, backgroundColor: '#F2F1F8' }}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#483AA0']}
              tintColor={'#483AA0'}
            />
          }>

          {/* Today's Appointments */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#333333' }}>Today's Appointments</Text>
              <TouchableOpacity>
                <Text style={{ fontSize: 14, color: '#483AA0', fontWeight: '500' }}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
              {dashboardData.todayAppointments.map((appointment, index) => (
                <View key={appointment.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: index < dashboardData.todayAppointments.length - 1 ? 1 : 0, borderBottomColor: '#F2F1F8' }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', marginRight: 12 }}>
                    <Image source={{ uri: appointment.avatar }} style={{ width: 40, height: 40 }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333333', marginBottom: 2 }}>{appointment.patient}</Text>
                    <Text style={{ fontSize: 14, color: '#6E6E6E' }}>{appointment.time} • {appointment.type}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <StatusBadge status={appointment.status} />
                    {appointment.status === 'Waiting' && (
                      <TouchableOpacity style={{ backgroundColor: '#483AA0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>Start</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Stats Overview */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#333333', marginBottom: 16 }}>Stats Overview</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
              <View style={{ width: '50%', paddingHorizontal: 6 }}>
                <StatsCard title="Total Patients Today" value={dashboardData.stats.totalPatientsToday} icon="people" color="#483AA0" />
              </View>
              <View style={{ width: '50%', paddingHorizontal: 6 }}>
                <StatsCard title="Monthly Consultations" value={dashboardData.stats.monthlyConsultations} icon="event" color="#A08A48" />
              </View>
              <View style={{ width: '100%', paddingHorizontal: 6 }}>
                <StatsCard title="Patient Rating" value={dashboardData.stats.patientRating} icon="star" color="#FFB300" subtitle="⭐ Excellent Rating" />
              </View>
            </View>
          </View>

          {/* Notifications */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#333333', marginBottom: 16 }}>Notifications</Text>
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
              {dashboardData.notifications.map((notification, index) => (
                <View key={notification.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: index < dashboardData.notifications.length - 1 ? 1 : 0, borderBottomColor: '#F2F1F8' }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: notification.type === 'cancelled' ? '#FFE5E5' : '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                    <MaterialIcons name={notification.icon} size={20} color={notification.type === 'cancelled' ? '#FF4757' : '#2196F3'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, color: '#333333', marginBottom: 2 }}>{notification.message}</Text>
                    <Text style={{ fontSize: 12, color: '#6E6E6E' }}>{notification.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Chat Summary */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#333333' }}>Recent Messages</Text>
              <TouchableOpacity>
                <Text style={{ fontSize: 14, color: '#483AA0', fontWeight: '500' }}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
              {dashboardData.chatSummary.map((chat, index) => (
                <View key={chat.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: index < dashboardData.chatSummary.length - 1 ? 1 : 0, borderBottomColor: '#F2F1F8' }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', marginRight: 12 }}>
                    <Image source={{ uri: chat.avatar }} style={{ width: 40, height: 40 }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333333', marginBottom: 2 }}>{chat.patient}</Text>
                    <Text style={{ fontSize: 14, color: '#6E6E6E', numberOfLines: 1 }}>{chat.message}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 12, color: '#6E6E6E', marginBottom: 4 }}>{chat.time}</Text>
                    {chat.unread && (
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4757' }} />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Action Shortcuts */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#333333', marginBottom: 16 }}>Quick Actions</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
              <View style={{ width: '25%', paddingHorizontal: 6 }}>
                <ActionButton title="Schedule" icon="schedule" color="#483AA0" onPress={() => navigation.navigate('DoctorSchedule')} />
              </View>
              <View style={{ width: '25%', paddingHorizontal: 6 }}>
                <ActionButton title="Patient List" icon="people" color="#A08A48" onPress={() => navigation.navigate('DoctorPatients')} />
              </View>
              <View style={{ width: '25%', paddingHorizontal: 6 }}>
                <ActionButton title="Messages" icon="chat" color="#2196F3" onPress={() => navigation.navigate('Chat')} />
              </View>
              <View style={{ width: '25%', paddingHorizontal: 6 }}>
                <ActionButton title="Record Treatment" icon="medical-services" color="#4CAF50" onPress={() => navigation.navigate('RecordTreatment')} />
              </View>
            </View>
          </View>

          {/* AI Insights */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#333333', marginBottom: 16 }}>Latest AI Diagnosis</Text>
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#E8F5E8', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <MaterialIcons name="psychology" size={24} color="#4CAF50" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#333333', marginBottom: 2 }}>{dashboardData.aiInsights.latestDiagnosis.patient}</Text>
                  <Text style={{ fontSize: 12, color: '#6E6E6E' }}>{dashboardData.aiInsights.latestDiagnosis.time}</Text>
                </View>
                <View style={{ backgroundColor: '#4CAF50', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>{dashboardData.aiInsights.latestDiagnosis.confidence}</Text>
                </View>
              </View>
              <View style={{ backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#483AA0', marginBottom: 8 }}>{dashboardData.aiInsights.latestDiagnosis.condition}</Text>
                <Text style={{ fontSize: 14, color: '#6E6E6E', lineHeight: 20 }}>{dashboardData.aiInsights.latestDiagnosis.recommendation}</Text>
              </View>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default DoctorDashboard;
