import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_CONFIG } from '../../../constants/api';

const DoctorDashboard = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isScrolled, setIsScrolled] = useState(false);
  
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
        condition: 'Gingivitis',
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

  // Handle scroll for glassmorphism effect
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsScrolled(offsetY > 50);
      },
    }
  );

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

  // Enhanced Stats card component with animations
  const StatsCard = ({ title, value, icon, color, subtitle }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    
    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };
    
    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };
    
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
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
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 20,
            }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 32, fontWeight: '800', color: '#1A1A1A', marginBottom: 6, letterSpacing: -0.5 }}>{value}</Text>
              <Text style={{ fontSize: 15, color: '#666666', marginBottom: 4, fontWeight: '500' }}>{title}</Text>
              {subtitle && <Text style={{ fontSize: 13, color: color, fontWeight: '600' }}>{subtitle}</Text>}
            </View>
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: `${color}15`,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}>
              <MaterialIcons name={icon} size={28} color={color} />
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // Enhanced Action shortcut button with micro-interactions
  const ActionButton = ({ title, icon, color, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    
    const handlePressIn = () => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    };
    
    const handlePressOut = () => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    };
    
    const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '5deg'],
    });
    
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Animated.View style={[
          {
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 18,
            alignItems: 'center',
            shadowColor: color,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 6,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: `${color}08`,
          },
          { transform: [{ scale: scaleAnim }] }
        ]}>
          <LinearGradient
            colors={[`${color}08`, `${color}03`]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 20,
            }}
          />
          <Animated.View style={[
            {
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: `${color}15`,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10,
              shadowColor: color,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 3,
            },
            { transform: [{ rotate: rotation }] }
          ]}>
            <MaterialIcons name={icon} size={26} color={color} />
          </Animated.View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', letterSpacing: 0.2 }}>{title}</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FF' }}>
      <StatusBar barStyle="light-content" backgroundColor="#483AA0" />
      
      {/* Professional Header with Glassmorphism */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          opacity: scrollY.interpolate({
            inputRange: [0, 50, 100],
            outputRange: [1, 0.95, 0.9],
            extrapolate: 'clamp',
          }),
          transform: [{
            translateY: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [0, -10],
              extrapolate: 'clamp',
            }),
          }],
        }}
      >
        <LinearGradient
          colors={isScrolled ? 
            ['rgba(72, 58, 160, 0.65)', 'rgba(99, 102, 241, 0.65)'] : 
            ['#483AA0', '#6366F1']
          }
          style={{
            paddingTop: 70,
            paddingHorizontal: 20,
            paddingBottom: 23,
            borderBottomLeftRadius: isScrolled ? 0 : 25,
            borderBottomRightRadius: isScrolled ? 0 : 25,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: isScrolled ? 8 : 4 },
            shadowOpacity: isScrolled ? 0.3 : 0.1,
            shadowRadius: isScrolled ? 16 : 8,
            elevation: isScrolled ? 12 : 4,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Glassmorphism overlay when scrolled */}
          {isScrolled && (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }} />
          )}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={{ width: 55, height: 55, borderRadius: 27.5, overflow: 'hidden', marginRight: 15, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' }}>
              <Image
                source={{
                  uri: user?.profile?.profilePicture 
                    ? `${API_CONFIG.BASE_URL}${user.profile.profilePicture}`
                    : 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=110&h=110&fit=crop&crop=face'
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

      <SafeAreaView style={{ flex: 1 }}>
        <Animated.ScrollView
          style={{ flex: 1, backgroundColor: '#F8F9FF' }}
          contentContainerStyle={{ padding: 20, paddingTop: 180, paddingBottom: 40 }}
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

          {/* Today's Appointments - Enhanced */}
          <View style={{ marginBottom: 28 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <View>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.3 }}>Today's Appointments</Text>
                <Text style={{ fontSize: 14, color: '#666666', marginTop: 2 }}>{dashboardData.todayAppointments.length} appointments scheduled</Text>
              </View>
              <TouchableOpacity style={{
                backgroundColor: '#483AA0',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                shadowColor: '#483AA0',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}>
                <Text style={{ fontSize: 14, color: 'white', fontWeight: '600' }}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: 20,
              shadowColor: '#483AA0',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 20,
              elevation: 8,
              borderWidth: 1,
              borderColor: '#F0F0F0',
            }}>
              {dashboardData.todayAppointments.map((appointment, index) => (
                <TouchableOpacity key={appointment.id} activeOpacity={0.7}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    paddingHorizontal: 4,
                    borderBottomWidth: index < dashboardData.todayAppointments.length - 1 ? 1 : 0,
                    borderBottomColor: '#F8F8F8',
                    borderRadius: 12,
                    marginBottom: index < dashboardData.todayAppointments.length - 1 ? 8 : 0,
                  }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      overflow: 'hidden',
                      marginRight: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}>
                      <Image source={{ uri: appointment.avatar }} style={{ width: 48, height: 48 }} />
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
                        <TouchableOpacity style={{
                          backgroundColor: '#483AA0',
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          marginTop: 10,
                          shadowColor: '#483AA0',
                          shadowOffset: { width: 0, height: 3 },
                          shadowOpacity: 0.3,
                          shadowRadius: 6,
                          elevation: 3,
                        }}>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: 'white' }}>Start</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stats Overview - Enhanced */}
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

          {/* Notifications - Enhanced */}
          <View style={{ marginBottom: 28 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <View>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.3 }}>Recent Notifications</Text>
                <Text style={{ fontSize: 14, color: '#666666', marginTop: 2 }}>{dashboardData.notifications.length} new updates</Text>
              </View>
              <TouchableOpacity style={{
                backgroundColor: '#F8F9FA',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#E9ECEF',
              }}>
                <Text style={{ fontSize: 13, color: '#6C757D', fontWeight: '600' }}>Mark All Read</Text>
              </TouchableOpacity>
            </View>
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 20,
              elevation: 6,
              borderWidth: 1,
              borderColor: '#F0F0F0',
            }}>
              {dashboardData.notifications.map((notification, index) => (
                <TouchableOpacity key={notification.id} activeOpacity={0.7}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    paddingHorizontal: 4,
                    borderBottomWidth: index < dashboardData.notifications.length - 1 ? 1 : 0,
                    borderBottomColor: '#F8F8F8',
                    borderRadius: 12,
                    marginBottom: index < dashboardData.notifications.length - 1 ? 8 : 0,
                  }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: notification.type === 'cancelled' ? '#FFF5F5' : '#F0F8FF',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 16,
                      shadowColor: notification.type === 'cancelled' ? '#FF4757' : '#2196F3',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                      borderWidth: 1,
                      borderColor: notification.type === 'cancelled' ? '#FFE5E5' : '#E3F2FD',
                    }}>
                      <MaterialIcons name={notification.icon} size={22} color={notification.type === 'cancelled' ? '#FF4757' : '#2196F3'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, color: '#1A1A1A', marginBottom: 4, fontWeight: '600', lineHeight: 20 }}>{notification.message}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="schedule" size={12} color="#999999" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 13, color: '#999999', fontWeight: '500' }}>{notification.time}</Text>
                      </View>
                    </View>
                    <View style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: notification.type === 'cancelled' ? '#FF4757' : '#2196F3',
                    }} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Chat Summary - Enhanced */}
          <View style={{ marginBottom: 28 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <View>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.3 }}>Recent Messages</Text>
                <Text style={{ fontSize: 14, color: '#666666', marginTop: 2 }}>{dashboardData.chatSummary.filter(chat => chat.unread).length} unread messages</Text>
              </View>
              <TouchableOpacity style={{
                backgroundColor: '#483AA0',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                shadowColor: '#483AA0',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}>
                <Text style={{ fontSize: 14, color: 'white', fontWeight: '600' }}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: 20,
              shadowColor: '#483AA0',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 20,
              elevation: 6,
              borderWidth: 1,
              borderColor: '#F0F0F0',
            }}>
              {dashboardData.chatSummary.map((chat, index) => (
                <TouchableOpacity key={chat.id} activeOpacity={0.7}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    paddingHorizontal: 4,
                    borderBottomWidth: index < dashboardData.chatSummary.length - 1 ? 1 : 0,
                    borderBottomColor: '#F8F8F8',
                    borderRadius: 12,
                    marginBottom: index < dashboardData.chatSummary.length - 1 ? 8 : 0,
                    backgroundColor: chat.unread ? '#F8F9FF' : 'transparent',
                  }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      overflow: 'hidden',
                      marginRight: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                      borderWidth: chat.unread ? 2 : 1,
                      borderColor: chat.unread ? '#483AA0' : '#F0F0F0',
                    }}>
                      <Image source={{ uri: chat.avatar }} style={{ width: chat.unread ? 44 : 46, height: chat.unread ? 44 : 46 }} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 17,
                        fontWeight: chat.unread ? '700' : '600',
                        color: '#1A1A1A',
                        marginBottom: 4,
                        letterSpacing: -0.2
                      }}>{chat.patient}</Text>
                      <Text style={{
                        fontSize: 14,
                        color: chat.unread ? '#483AA0' : '#666666',
                        numberOfLines: 1,
                        fontWeight: chat.unread ? '600' : '500'
                      }}>{chat.message}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <MaterialIcons name="schedule" size={12} color="#999999" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 12, color: '#999999', fontWeight: '500' }}>{chat.time}</Text>
                      </View>
                      {chat.unread && (
                        <View style={{
                          backgroundColor: '#FF4757',
                          borderRadius: 10,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          minWidth: 20,
                          alignItems: 'center',
                        }}>
                          <Text style={{ fontSize: 10, color: 'white', fontWeight: '700' }}>NEW</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Shortcuts - Enhanced */}
          <View style={{ marginBottom: 28 }}>
            <View style={{ marginBottom: 18 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.3 }}>Quick Actions</Text>
              <Text style={{ fontSize: 14, color: '#666666', marginTop: 2 }}>Streamline your workflow</Text>
            </View>
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

          {/* AI Insights - Enhanced */}
          <View style={{ marginBottom: 32 }}>
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={{
                    width: 4,
                    height: 24,
                    borderRadius: 2,
                    marginRight: 12,
                  }}
                />
                <Text style={{ fontSize: 24, fontWeight: '900', color: '#1A1A1A', letterSpacing: -0.5 }}>AI-Powered Insights</Text>
              </View>
              <Text style={{ fontSize: 15, color: '#666666', marginLeft: 16, fontWeight: '500' }}>Latest diagnostic analysis powered by machine learning</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.95}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 28,
                padding: 28,
                shadowColor: '#667eea',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.15,
                shadowRadius: 24,
                elevation: 12,
                borderWidth: 1,
                borderColor: '#F0F4FF',
                transform: [{ scale: 1 }],
              }}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 28,
                  opacity: 0.08,
                }}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 18,
                    shadowColor: '#667eea',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  <MaterialIcons name="psychology" size={32} color="white" />
                  <View style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#4CAF50',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: 'white',
                  }}>
                    <MaterialIcons name="auto-awesome" size={12} color="white" />
                  </View>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 22, fontWeight: '900', color: '#1A1A1A', marginBottom: 8, letterSpacing: -0.4 }}>AI Diagnostic Analysis</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      backgroundColor: '#667eea',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      marginRight: 8,
                    }}>
                      <MaterialIcons name="schedule" size={12} color="white" />
                    </View>
                    <Text style={{ fontSize: 14, color: '#667eea', fontWeight: '600' }}>{dashboardData.aiInsights.latestDiagnosis.time}</Text>
                  </View>
                </View>
              </View>
              
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: 20,
                padding: 24,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: 'rgba(102, 126, 234, 0.1)',
                shadowColor: '#667eea',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
              }}>
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
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 16,
                        shadowColor: '#FF6B35',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
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
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 16,
                        shadowColor: '#4CAF50',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    >
                      <Text style={{ fontSize: 15, color: 'white', fontWeight: '700' }}>{dashboardData.aiInsights.latestDiagnosis.confidence}</Text>
                    </LinearGradient>
                  </View>
                </View>
                
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={{
                    borderRadius: 16,
                    padding: 20,
                    shadowColor: '#667eea',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <MaterialIcons name="lightbulb" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: 'white', letterSpacing: 0.5 }}>AI RECOMMENDATION</Text>
                  </View>
                  <Text style={{ fontSize: 16, color: 'white', lineHeight: 24, fontWeight: '500', opacity: 0.95 }}>{dashboardData.aiInsights.latestDiagnosis.recommendation}</Text>
                </LinearGradient>
              </View>
              
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    borderRadius: 18,
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    alignItems: 'center',
                    shadowColor: '#667eea',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 18,
                    }}
                  />
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="description" size={18} color="white" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 16, fontWeight: '700', color: 'white' }}>View Full Report</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: 18,
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: '#667eea',
                    shadowColor: '#667eea',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <MaterialIcons name="share" size={22} color="#667eea" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>

        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default DoctorDashboard;
