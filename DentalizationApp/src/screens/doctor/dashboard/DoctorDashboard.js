import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_CONFIG } from '../../../constants/api';
import { useAppointments } from '../../../contexts/AppointmentContext';
import { wp, hp, spacing, fontSizes, borderRadius, iconSizes } from '../../../utils/responsive';
import ResponsiveContainer from '../../../components/layouts/ResponsiveContainer';

// ---------- Helpers ----------
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const getCurrentDate = () => {
  const d = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};



const DoctorDashboard = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isScrolled, setIsScrolled] = useState(false);
  const { getTodayAppointments } = useAppointments();

  const todayAppointments = getTodayAppointments?.() || [];

  const greeting = useMemo(() => getGreeting(), []);
  const currentDate = useMemo(() => getCurrentDate(), []);
  const displayName = user?.profile?.firstName || user?.name || 'Doctor';



  const dashboardData = {
    todayAppointments,
    stats: { totalPatientsToday: 8, monthlyConsultations: 156, patientRating: 4.8 },
    chatSummary: [
      { id: 1, patient: 'Sarah Johnson', message: 'Thank you for the excellent treatment!', time: '2 min ago', unread: true, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face' },
      { id: 2, patient: 'Michael Chen', message: 'When is my next appointment?', time: '1 hour ago', unread: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' }
    ],
    aiInsights: {
      latestDiagnosis: {
        patient: 'Emma Wilson',
        condition: 'Gingivitis',
        confidence: '92%',
        recommendation: 'Recommend deep cleaning and improved oral hygiene',
        time: '1 hour ago'
      }
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (e) => setIsScrolled(e.nativeEvent.contentOffset.y > 50),
    }
  );

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

  const StatsCard = ({ title, value, icon, color, subtitle }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
    };
    const handlePressOut = () => {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    };

    return (
      <TouchableOpacity activeOpacity={0.8} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[
          {
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 20,
            marginBottom: 12,
            shadowColor: color,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8,
            borderWidth: 1,
            borderColor: `${color}10`,
          },
          { transform: [{ scale: scaleAnim }] }
        ]}>
          <LinearGradient
            colors={[`${color}08`, `${color}03`]}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 32, fontWeight: '800', color: '#1A1A1A', marginBottom: 6, letterSpacing: -0.5 }}>{String(value)}</Text>
              <Text style={{ fontSize: 15, color: '#666666', marginBottom: 4, fontWeight: '500' }}>{title}</Text>
              {subtitle ? <Text style={{ fontSize: 13, color: color, fontWeight: '600' }}>{subtitle}</Text> : null}
            </View>
            <View style={{
              width: 56, height: 56, borderRadius: 28, backgroundColor: `${color}15`,
              justifyContent: 'center', alignItems: 'center',
              shadowColor: color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
            }}>
              <MaterialIcons name={icon} size={28} color={color} />
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <ResponsiveContainer safeArea={false} backgroundColor="#F8F9FF" padding={0}>
      <StatusBar barStyle="light-content" backgroundColor="#483AA0" />

      {/* Header */}
      <Animated.View
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
          opacity: scrollY.interpolate({ inputRange: [0, 50, 100], outputRange: [1, 0.95, 0.9], extrapolate: 'clamp' }),
          transform: [{ translateY: scrollY.interpolate({ inputRange: [0, 100], outputRange: [0, -10], extrapolate: 'clamp' }) }]
        }}
      >
        <LinearGradient
          colors={isScrolled ? ['rgba(72, 58, 160, 0.65)', 'rgba(99, 102, 241, 0.65)'] : ['#483AA0', '#6366F1']}
          style={{
            paddingTop: hp(8.5),
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.lg,
            borderBottomLeftRadius: isScrolled ? 0 : borderRadius.xl,
            borderBottomRightRadius: isScrolled ? 0 : borderRadius.xl,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: isScrolled ? 8 : 4 },
            shadowOpacity: isScrolled ? 0.3 : 0.1,
            shadowRadius: isScrolled ? 16 : 8,
            elevation: isScrolled ? 12 : 4
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          
          {isScrolled && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
          )}
          {/* Glassmorphism overlay when scrolled */}
          {isScrolled && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
          )}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={{ width: 55, height: 55, borderRadius: 27.5, overflow: 'hidden', marginRight: 15, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' }}>
              {user?.profile?.profilePicture && !user.profile.profilePicture.includes('undefined') && !user.profile.profilePicture.includes('null') ? (
                <Image
                  source={{
                    uri: user.profile.profilePicture.startsWith('http') 
                      ? user.profile.profilePicture
                      : `${API_CONFIG.BASE_URL}${user.profile.profilePicture}`,
                    timeout: 10000
                  }}
                  style={{ width: 49, height: 49, borderRadius: 24.5 }}
                  resizeMode="cover"
                  defaultSource={require('../../../assets/images/default-avatar.svg')}
                  onError={(error) => {
                    console.log('❌ Dashboard image loading error:', error.nativeEvent.error);
                  }}
                />
              ) : (
                <View style={{
                  width: 49,
                  height: 49,
                  borderRadius: 24.5,
                  backgroundColor: '#F0F0FF',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#483AA0',
                  }}>
                    {(user?.profile?.firstName?.[0] || user?.name?.[0] || 'D').toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ flex: 2 }}>
              <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', marginBottom: 2 }}>{getGreeting()}</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 4 }}>
                {user?.profile?.firstName ? user.profile.firstName : user?.name ? user.name : 'Dr. Sarah'}
              </Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{getCurrentDate()}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.navigate('MessageScreenDoc')} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <MaterialIcons name="chat-bubble-outline" size={22} color="white" />
              <View style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4757' }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('NotificationDoctor')} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
              <MaterialIcons name="notifications-none" size={22} color="white" />
              <View style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4757' }} />
            </TouchableOpacity>
          </View>
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
      </Animated.View>

      {/* Content */}
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.ScrollView
          style={{ flex: 1, backgroundColor: '#F8F9FF' }}
          contentContainerStyle={{ padding: spacing.lg, paddingTop: hp(22), paddingBottom: spacing.xl }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#483AA0']}
              tintColor={'#483AA0'}
              progressViewOffset={isScrolled ? 140 : 160}
            />
          }>

          {/* Today's Appointments */}
          <View style={{ marginBottom: 28 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <View>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.3 }}>Today's Appointments</Text>
                <Text style={{ fontSize: 14, color: '#666666', marginTop: 2 }}>{todayAppointments.length} appointments scheduled</Text>
              </View>
              <TouchableOpacity style={{ backgroundColor: '#483AA0', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, shadowColor: '#483AA0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}>
                <Text style={{ fontSize: 14, color: 'white', fontWeight: '600' }}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, shadowColor: '#483AA0', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 8, borderWidth: 1, borderColor: '#F0F0F0' }}>
              {todayAppointments.map((appointment, index) => (
                <TouchableOpacity key={appointment.id || `${appointment.patient}-${index}`} activeOpacity={0.7}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 4, borderBottomWidth: index < todayAppointments.length - 1 ? 1 : 0, borderBottomColor: '#F8F8F8', borderRadius: 12, marginBottom: index < todayAppointments.length - 1 ? 8 : 0 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, overflow: 'hidden', marginRight: 16 }}>
                      <Image
                        source={{ uri: appointment.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face' }}
                        style={{ width: 48, height: 48 }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 4, letterSpacing: -0.2 }}>{appointment.patient}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="access-time" size={14} color="#666666" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 14, color: '#666666', fontWeight: '500' }}>{appointment.time}</Text>
                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#CCCCCC', marginHorizontal: 8 }} />
                        <Text style={{ fontSize: 14, color: '#666666', fontWeight: '500' }}>{appointment.type}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <StatusBadge status={appointment.status} />
                      {appointment.status === 'Waiting' && (
                        <TouchableOpacity style={{ backgroundColor: '#483AA0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginTop: 10 }}>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: 'white' }}>Start</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* AI Insights */}
          <View style={{ marginBottom: 32 }}>
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={{ width: 4, height: 24, borderRadius: 2, marginRight: 12 }} />
                <Text style={{ fontSize: 24, fontWeight: '900', color: '#1A1A1A', letterSpacing: -0.5 }}>AI-Powered Insights</Text>
              </View>
              <Text style={{ fontSize: 15, color: '#666666', marginLeft: 16, fontWeight: '500' }}>Latest diagnostic analysis powered by machine learning</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.95}
              style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 28, shadowColor: '#667eea', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 12, borderWidth: 1, borderColor: '#F0F4FF' }}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 28, opacity: 0.08 }}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={{ width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginRight: 18 }}
                >
                  <MaterialIcons name="psychology" size={32} color="white" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 22, fontWeight: '900', color: '#1A1A1A', marginBottom: 8, letterSpacing: -0.4 }}>AI Diagnostic Analysis</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ backgroundColor: '#667eea', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 8 }}>
                      <MaterialIcons name="schedule" size={12} color="white" />
                    </View>
                    <Text style={{ fontSize: 14, color: '#667eea', fontWeight: '600' }}>{dashboardData.aiInsights.latestDiagnosis.time}</Text>
                  </View>
                </View>
              </View>

              <View style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(102, 126, 234, 0.1)' }}>
                <View style={{ marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialIcons name="person" size={18} color="#667eea" style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#667eea' }}>Patient</Text>
                    </View>
                    <Text style={{ fontSize: 17, color: '#1A1A1A', fontWeight: '800' }}>{dashboardData.aiInsights.latestDiagnosis.patient}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialIcons name="medical-services" size={18} color="#667eea" style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#667eea' }}>Condition</Text>
                    </View>
                    <LinearGradient
                      colors={['#FF6B35', '#F7931E']}
                      style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 }}
                    >
                      <Text style={{ fontSize: 15, color: 'white', fontWeight: '700' }}>{dashboardData.aiInsights.latestDiagnosis.condition}</Text>
                    </LinearGradient>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialIcons name="trending-up" size={18} color="#667eea" style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#667eea' }}>Confidence</Text>
                    </View>
                    <LinearGradient
                      colors={['#4CAF50', '#45A049']}
                      style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 }}
                    >
                      <Text style={{ fontSize: 15, color: 'white', fontWeight: '700' }}>{dashboardData.aiInsights.latestDiagnosis.confidence}</Text>
                    </LinearGradient>
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{ flex: 1, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center' }}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 18 }}
                  />
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="description" size={18} color="white" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 16, fontWeight: '700', color: 'white' }}>View Full Report</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 18, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center', borderWidth: 2, borderColor: '#667eea' }}
                >
                  <MaterialIcons name="share" size={22} color="#667eea" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>

          {/* Stats Overview */}
          <View style={{ marginBottom: 28 }}>
            <View style={{ marginBottom: 18 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.3 }}>Performance Overview</Text>
              <Text style={{ fontSize: 14, color: '#666666', marginTop: 2 }}>Your practice insights at a glance</Text>
            </View>
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

          {/* Chat Summary */}
          <View style={{ marginBottom: 28 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <View>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.3 }}>Recent Messages</Text>
                <Text style={{ fontSize: 14, color: '#666666', marginTop: 2 }}>
                  {`${dashboardData.chatSummary.filter(chat => chat.unread).length} unread messages`}
                </Text>
              </View>
              <TouchableOpacity style={{ backgroundColor: '#483AA0', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                <Text style={{ fontSize: 14, color: 'white', fontWeight: '600' }}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F0F0F0' }}>
              {dashboardData.chatSummary.map((chat, index) => (
                <TouchableOpacity key={chat.id} activeOpacity={0.7}>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 4,
                    borderBottomWidth: index < dashboardData.chatSummary.length - 1 ? 1 : 0, borderBottomColor: '#F8F8F8',
                    borderRadius: 12, marginBottom: index < dashboardData.chatSummary.length - 1 ? 8 : 0,
                    backgroundColor: chat.unread ? '#F8F9FF' : 'transparent'
                  }}>
                    <View style={{
                      width: 48, height: 48, borderRadius: 24, overflow: 'hidden', marginRight: 16,
                      borderWidth: chat.unread ? 2 : 1, borderColor: chat.unread ? '#483AA0' : '#F0F0F0',
                    }}>
                      <Image source={{ uri: chat.avatar }} style={{ width: chat.unread ? 44 : 46, height: chat.unread ? 44 : 46 }} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 17, fontWeight: chat.unread ? '700' : '600', color: '#1A1A1A', marginBottom: 4, letterSpacing: -0.2 }}>{chat.patient}</Text>
                      <Text style={{ fontSize: 14, color: chat.unread ? '#483AA0' : '#666666' }} numberOfLines={1}>{chat.message}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <MaterialIcons name="schedule" size={12} color="#999999" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 12, color: '#999999', fontWeight: '500' }}>{chat.time}</Text>
                      </View>
                      {chat.unread && (
                        <View style={{ backgroundColor: '#FF4757', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, minWidth: 20, alignItems: 'center' }}>
                          <Text style={{ fontSize: 10, color: 'white', fontWeight: '700' }}>NEW</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Premium Advertising Section - Card 1 */}
          <View style={{ marginBottom: 32 }}>
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={async () => {
                try {
                  const url = 'https://www.dentaleconomics.com/science-tech/article/14203440/revolutionary-dental-implant-technology';
                  const supported = await Linking.canOpenURL(url);
                  if (supported) {
                    await Linking.openURL(url);
                  } else {
                    Alert.alert('Error', 'Cannot open this link');
                  }
                } catch (error) {
                  Alert.alert('Error', 'Failed to open link');
                }
              }}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 28,
                overflow: 'hidden',
                shadowColor: '#FF6B35',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.15,
                shadowRadius: 24,
                elevation: 12,
                borderWidth: 1,
                borderColor: '#FFF0ED'
              }}
            >
              <View style={{
                height: 200,
                backgroundColor: '#1A1A1A',
                position: 'relative',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' }}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                  resizeMode="cover"
                />
                
                <LinearGradient
                  colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.4)']}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                
                <View style={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                  <MaterialIcons name="article" size={14} color="#4CAF50" style={{ marginRight: 6 }} />
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>ARTICLE</Text>
                </View>
                
                <View style={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12
                }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>5 min read</Text>
                </View>
                
                <View style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                  <MaterialIcons name="open-in-new" size={14} color="#FF6B35" style={{ marginRight: 4 }} />
                  <Text style={{ color: '#FF6B35', fontSize: 12, fontWeight: '700' }}>TAP TO READ</Text>
                </View>
              </View>
              
              <View style={{ padding: 24 }}>
                <LinearGradient
                  colors={['#FF6B35', '#F7931E']}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05 }}
                />
                
                <View style={{ marginBottom: 20 }}>
                  <Text style={{
                    fontSize: 22,
                    fontWeight: '900',
                    color: '#1A1A1A',
                    marginBottom: 8,
                    letterSpacing: -0.4
                  }}>
                    Revolutionary Dental Implant Technology
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: '#666666',
                    lineHeight: 24,
                    fontWeight: '500'
                  }}>
                    Discover the latest breakthrough in dental implant procedures that reduces healing time by 50% and improves patient comfort.
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 20,
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(255, 107, 53, 0.1)'
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#FF6B35',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12
                    }}>
                      <MaterialIcons name="business" size={20} color="white" />
                    </View>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A' }}>DentalTech Pro</Text>
                      <Text style={{ fontSize: 12, color: '#666666' }}>Sponsored Content</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Premium Advertising Section - Card 2 */}
          <View style={{ marginBottom: 32 }}>
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={async () => {
                try {
                  const url = 'https://www.dentistrytoday.com/digital-dentistry-innovations';
                  const supported = await Linking.canOpenURL(url);
                  if (supported) {
                    await Linking.openURL(url);
                  } else {
                    Alert.alert('Error', 'Cannot open this link');
                  }
                } catch (error) {
                  Alert.alert('Error', 'Failed to open link');
                }
              }}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 28,
                overflow: 'hidden',
                shadowColor: '#2196F3',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.15,
                shadowRadius: 24,
                elevation: 12,
                borderWidth: 1,
                borderColor: '#E3F2FD'
              }}
            >
              <View style={{
                height: 200,
                backgroundColor: '#1A1A1A',
                position: 'relative',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' }}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                  resizeMode="cover"
                />
                
                <LinearGradient
                  colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.4)']}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                
                <View style={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                  <MaterialIcons name="computer" size={14} color="#2196F3" style={{ marginRight: 6 }} />
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>TECH</Text>
                </View>
                
                <View style={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12
                }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>7 min read</Text>
                </View>
                
                <View style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                  <MaterialIcons name="open-in-new" size={14} color="#2196F3" style={{ marginRight: 4 }} />
                  <Text style={{ color: '#2196F3', fontSize: 12, fontWeight: '700' }}>TAP TO read</Text>
                </View>
              </View>
              
              <View style={{ padding: 24 }}>
                <LinearGradient
                  colors={['#2196F3', '#1976D2']}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05 }}
                />
                
                <View style={{ marginBottom: 20 }}>
                  <Text style={{
                    fontSize: 22,
                    fontWeight: '900',
                    color: '#1A1A1A',
                    marginBottom: 8,
                    letterSpacing: -0.4
                  }}>
                    Digital Dentistry Innovations
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: '#666666',
                    lineHeight: 24,
                    fontWeight: '500'
                  }}>
                    Explore how AI and digital scanning are transforming modern dental practices and improving patient outcomes.
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 20,
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(33, 150, 243, 0.1)'
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#2196F3',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12
                    }}>
                      <MaterialIcons name="computer" size={20} color="white" />
                    </View>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A' }}>DigitalDental</Text>
                      <Text style={{ fontSize: 12, color: '#666666' }}>Sponsored Content</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Premium Advertising Section - Card 3 */}
          <View style={{ marginBottom: 32 }}>
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={async () => {
                try {
                  const url = 'https://www.oralhealthgroup.com/features/oral-health-prevention-strategies';
                  const supported = await Linking.canOpenURL(url);
                  if (supported) {
                    await Linking.openURL(url);
                  } else {
                    Alert.alert('Error', 'Cannot open this link');
                  }
                } catch (error) {
                  Alert.alert('Error', 'Failed to open link');
                }
              }}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 28,
                overflow: 'hidden',
                shadowColor: '#4CAF50',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.15,
                shadowRadius: 24,
                elevation: 12,
                borderWidth: 1,
                borderColor: '#E8F5E8'
              }}
            >
              <View style={{
                height: 200,
                backgroundColor: '#1A1A1A',
                position: 'relative',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' }}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                  resizeMode="cover"
                />
                
                <LinearGradient
                  colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.4)']}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                
                <View style={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                  <MaterialIcons name="health-and-safety" size={14} color="#4CAF50" style={{ marginRight: 6 }} />
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>HEALTH</Text>
                </View>
                
                <View style={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12
                }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>4 min read</Text>
                </View>
                
                <View style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                  <MaterialIcons name="open-in-new" size={14} color="#4CAF50" style={{ marginRight: 4 }} />
                  <Text style={{ color: '#4CAF50', fontSize: 12, fontWeight: '700' }}>TAP TO read</Text>
                </View>
              </View>
              
              <View style={{ padding: 24 }}>
                <LinearGradient
                  colors={['#4CAF50', '#388E3C']}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05 }}
                />
                
                <View style={{ marginBottom: 20 }}>
                  <Text style={{
                    fontSize: 22,
                    fontWeight: '900',
                    color: '#1A1A1A',
                    marginBottom: 8,
                    letterSpacing: -0.4
                  }}>
                    Oral Health Prevention Strategies
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: '#666666',
                    lineHeight: 24,
                    fontWeight: '500'
                  }}>
                    Learn evidence-based approaches to preventive dentistry that can reduce patient treatment needs by up to 70%.
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 20,
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(76, 175, 80, 0.1)'
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#4CAF50',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12
                    }}>
                      <MaterialIcons name="health-and-safety" size={20} color="white" />
                    </View>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A' }}>HealthFirst</Text>
                      <Text style={{ fontSize: 12, color: '#666666' }}>Sponsored Content</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

        </Animated.ScrollView>
      </SafeAreaView>
    </ResponsiveContainer>
  );
};

export default DoctorDashboard;
