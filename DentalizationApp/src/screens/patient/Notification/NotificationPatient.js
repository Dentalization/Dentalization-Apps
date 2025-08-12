import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Modal,
  Animated,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../constants/colors';

const NotificationPatient = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'booking_confirmed',
      title: 'Booking Confirmed! 😊',
      message: 'Dr. Sarah Johnson has confirmed your appointment for tomorrow at 2:00 PM',
      time: '5 min ago',
      date: 'Today',
      isNew: true,
      icon: 'event-available',
      color: '#4CAF50'
    },
    {
      id: 2,
      type: 'reminder',
      title: 'Appointment Reminder 📅',
      message: 'Don\'t forget! Your dental checkup is scheduled for today at 3:00 PM',
      time: '2 hours ago',
      date: 'Today',
      isNew: true,
      icon: 'schedule',
      color: '#2196F3'
    },
    {
      id: 3,
      type: 'prescription',
      title: 'Digital Prescription Ready 💊',
      message: 'Your prescription from Dr. Johnson is now available for download',
      time: '4 hours ago',
      date: 'Today',
      isNew: true,
      icon: 'medical-services',
      color: '#00BCD4'
    },
    {
      id: 4,
      type: 'message',
      title: 'Message from Dr. Johnson 💬',
      message: 'Please remember to take your medication as prescribed and avoid hard foods',
      time: '6 hours ago',
      date: 'Today',
      isNew: false,
      icon: 'chat-bubble',
      color: '#FF9800'
    },
    {
      id: 5,
      type: 'new_slots',
      title: 'New Schedule Slots Available! ⭐',
      message: 'Dr. Johnson has new appointment slots available for next week',
      time: '1 day ago',
      date: 'Yesterday',
      isNew: false,
      icon: 'event-note',
      color: '#9C27B0'
    },
    {
      id: 6,
      type: 'reminder',
      title: 'Pre-Appointment Reminder 🦷',
      message: 'Please brush your teeth before your appointment tomorrow at 10:00 AM',
      time: '1 day ago',
      date: 'Yesterday',
      isNew: false,
      icon: 'notifications-active',
      color: '#2196F3'
    },
    {
      id: 7,
      type: 'booking_confirmed',
      title: 'Follow-up Appointment Booked ✅',
      message: 'Your follow-up appointment has been scheduled for next Friday at 11:00 AM',
      time: '2 days ago',
      date: 'This Week',
      isNew: false,
      icon: 'check-circle',
      color: '#4CAF50'
    }
  ]);

  const filterOptions = [
    { key: 'all', label: 'All Notifications', count: notifications.length },
    { key: 'booking_confirmed', label: 'Bookings', count: notifications.filter(n => n.type === 'booking_confirmed').length },
    { key: 'reminder', label: 'Reminders', count: notifications.filter(n => n.type === 'reminder').length },
    { key: 'prescription', label: 'Prescriptions', count: notifications.filter(n => n.type === 'prescription').length },
    { key: 'message', label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
    { key: 'new_slots', label: 'New Slots', count: notifications.filter(n => n.type === 'new_slots').length },
  ];

  const filteredNotifications = selectedFilter === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.type === selectedFilter);

  const newNotificationsCount = notifications.filter(n => n.isNew).length;

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = notification.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {});

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

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isNew: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isNew: false }))
    );
  };

  const NotificationItem = ({ notification }) => (
    <TouchableOpacity 
      style={{ backgroundColor: '#FFFFFF', marginHorizontal: 16, marginVertical: 8, borderRadius: 28, padding: 22, shadowColor: notification.isNew ? notification.color : '#000', shadowOffset: { width: 0, height: notification.isNew ? 12 : 6 }, shadowOpacity: notification.isNew ? 0.3 : 0.15, shadowRadius: notification.isNew ? 20 : 12, elevation: notification.isNew ? 10 : 6, borderWidth: notification.isNew ? 2 : 0, borderColor: notification.isNew ? `${notification.color}25` : 'transparent', opacity: notification.isNew ? 1 : 0.88, transform: [{ scale: notification.isNew ? 1.03 : 1 }] }}
      onPress={() => markAsRead(notification.id)}
      activeOpacity={0.6}
    >
      <LinearGradient
        colors={notification.isNew ? [`${notification.color}12`, `${notification.color}05`, 'transparent'] : ['transparent', 'transparent']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 28
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: `${notification.color}18`, justifyContent: 'center', alignItems: 'center', marginRight: 18, shadowColor: notification.color, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6, borderWidth: 3, borderColor: `${notification.color}30` }}>
          <MaterialIcons name={notification.icon} size={30} color={notification.color} />
        </View>
        
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1A1A', flex: 1, lineHeight: 26 }}>
              {notification.title}
            </Text>
            {notification.isNew && (
              <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#FF5252', marginLeft: 10, shadowColor: '#FF5252', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 4 }} />
            )}
          </View>
          
          <Text style={{ fontSize: 15, color: '#555555', lineHeight: 23, marginBottom: 14, fontWeight: '400' }}>
            {notification.message}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ backgroundColor: `${notification.color}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: `${notification.color}25` }}>
              <Text style={{
                fontSize: 13,
                color: notification.color,
                fontWeight: '700'
              }}>
                {notification.time}
              </Text>
            </View>
            
            {notification.isNew && (
              <View style={{ backgroundColor: '#FF5252', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, shadowColor: '#FF5252', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 }}>
                <Text style={{
                  fontSize: 11,
                  color: '#FFFFFF',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8
                }}>
                  ✨ NEW
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const FilterModal = () => (
    <Modal
      visible={filterVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setFilterVisible(false)}
    >
      <TouchableOpacity 
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.65)',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onPress={() => setFilterVisible(false)}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F0F8FF', '#E8F4FD']}
          style={{
            borderRadius: 32,
            padding: 30,
            width: '90%',
            maxHeight: '75%',
            shadowColor: '#2196F3',
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.3,
            shadowRadius: 30,
            elevation: 20
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={{
            alignItems: 'center',
            marginBottom: 28
          }}>
            <View style={{
              width: 60,
              height: 6,
              backgroundColor: '#E3F2FD',
              borderRadius: 3,
              marginBottom: 20
            }} />
            <Text style={{
              fontSize: 24,
              fontWeight: '800',
              color: '#1A1A1A',
              textAlign: 'center'
            }}>
              🔍 Filter Notifications
            </Text>
            <Text style={{
              fontSize: 15,
              color: '#666666',
              textAlign: 'center',
              marginTop: 8,
              fontWeight: '500'
            }}>
              Choose what you'd like to see ✨
            </Text>
          </View>
          
          {filterOptions.map((option, index) => (
            <TouchableOpacity
              key={option.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 18,
                paddingHorizontal: 22,
                borderRadius: 20,
                backgroundColor: selectedFilter === option.key ? '#E3F2FD' : '#FFFFFF',
                marginBottom: 14,
                borderWidth: selectedFilter === option.key ? 2.5 : 1.5,
                borderColor: selectedFilter === option.key ? '#2196F3' : '#E8E8E8',
                shadowColor: selectedFilter === option.key ? '#2196F3' : '#000',
                shadowOffset: { width: 0, height: selectedFilter === option.key ? 6 : 3 },
                shadowOpacity: selectedFilter === option.key ? 0.2 : 0.08,
                shadowRadius: selectedFilter === option.key ? 12 : 6,
                elevation: selectedFilter === option.key ? 6 : 3,
                transform: [{ scale: selectedFilter === option.key ? 1.02 : 1 }]
              }}
              onPress={() => {
                setSelectedFilter(option.key);
                setFilterVisible(false);
              }}
              activeOpacity={0.6}
            >
              <Text style={{
                fontSize: 18,
                color: selectedFilter === option.key ? '#2196F3' : '#333333',
                fontWeight: selectedFilter === option.key ? '700' : '600'
              }}>
                {option.label}
              </Text>
              <View style={{
                backgroundColor: selectedFilter === option.key ? '#2196F3' : '#9E9E9E',
                borderRadius: 18,
                paddingHorizontal: 14,
                paddingVertical: 8,
                minWidth: 36,
                shadowColor: selectedFilter === option.key ? '#2196F3' : '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.25,
                shadowRadius: 6,
                elevation: 3
              }}>
                <Text style={{
                  fontSize: 14,
                  color: '#FFFFFF',
                  fontWeight: '800',
                  textAlign: 'center'
                }}>
                  {option.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </LinearGradient>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header with Glassmorphism Effect */}
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
            ['rgba(33, 150, 243, 0.45)', 'rgba(156, 39, 176, 0.45)'] :
            [Colors.primary, Colors.secondary]
          }
          style={{
            paddingTop: 50,
            paddingHorizontal: 20,
            paddingBottom: 30,
            borderBottomLeftRadius: isScrolled ? 0 : 25,
            borderBottomRightRadius: isScrolled ? 0 : 25,
            shadowColor: isScrolled ? '#2196F3' : '#000',
            shadowOffset: { width: 0, height: isScrolled ? 8 : 4 },
            shadowOpacity: isScrolled ? 0.3 : 0.1,
            shadowRadius: isScrolled ? 16 : 8,
            elevation: isScrolled ? 12 : 4,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Glassmorphism overlay */}
          {isScrolled && (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.35)',
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }} />
          )}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16
        }}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: 'white'
            }}>
              Notifications
            </Text>
            {newNotificationsCount > 0 && (
              <Text style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.8)',
                marginTop: 2
              }}>
                {newNotificationsCount} new notification{newNotificationsCount > 1 ? 's' : ''}
              </Text>
            )}
          </View>
          
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity 
              onPress={() => setFilterVisible(true)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 8
              }}
            >
              <MaterialIcons name="filter-list" size={20} color="white" />
            </TouchableOpacity>
            
            {newNotificationsCount > 0 && (
              <TouchableOpacity 
                onPress={markAllAsRead}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <MaterialIcons name="done-all" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Filter Indicator */}
        {selectedFilter !== 'all' && (
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
            alignSelf: 'flex-start'
          }}>
            <Text style={{
              fontSize: 12,
              color: 'white',
              fontWeight: '500'
            }}
           >
             Filtered: {filterOptions.find(f => f.key === selectedFilter)?.label}
           </Text>
         </View>
       )}
        </LinearGradient>
      </Animated.View>

      {/* Spacer for fixed header */}
      <View style={{ height: isScrolled ? 140 : 160 }} />

      {/* Notifications List with Date Grouping */}
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 16, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
            tintColor={'#2196F3'}
            progressViewOffset={isScrolled ? 140 : 160}
          />
        }
      >
        {Object.keys(groupedNotifications).length > 0 ? (
          Object.keys(groupedNotifications).map((date) => (
            <View key={date}>
              {/* Date Header */}
              <View style={{
                marginHorizontal: 20,
                marginVertical: 12,
                paddingBottom: 8
              }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}>
                  {date}
                </Text>
              </View>
              
              {/* Notifications for this date */}
              {groupedNotifications[date].map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </View>
          ))
        ) : (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 100,
            paddingHorizontal: 40
          }}>
            <LinearGradient
              colors={['#E3F2FD', '#F0F8FF', '#FFFFFF']}
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 28,
                shadowColor: '#2196F3',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
                elevation: 10,
                borderWidth: 3,
                borderColor: '#E3F2FD'
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="bell-sleep" size={64} color="#2196F3" />
            </LinearGradient>
            <Text style={{
              fontSize: 24,
              fontWeight: '800',
              color: '#1A1A1A',
              marginBottom: 14,
              textAlign: 'center'
            }}>
              All Caught Up! 🎉✨
            </Text>
            <Text style={{
              fontSize: 17,
              color: '#666666',
              textAlign: 'center',
              lineHeight: 26,
              fontWeight: '500'
            }}>
              You have no new notifications.{"\n"}We'll let you know when something important happens! 💙
            </Text>
          </View>
        )}
      </Animated.ScrollView>

      <FilterModal />
    </View>
  );
};

export default NotificationPatient;