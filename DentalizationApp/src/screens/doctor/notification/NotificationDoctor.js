import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StatusBar, Modal, Animated, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';

const NotificationDoctor = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showArchivePopup, setShowArchivePopup] = useState(false);
  const [notificationToArchive, setNotificationToArchive] = useState(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'appointment',
      title: 'New Appointment Booked',
      message: 'Sarah Johnson has booked an appointment for tomorrow at 2:00 PM',
      time: '5 min ago',
      isNew: true,
      icon: 'event',
      color: Colors.primary
    },
    {
      id: 2,
      type: 'reminder',
      title: 'Today\'s Consultation Reminder',
      message: 'You have 3 consultations scheduled for today starting at 9:00 AM',
      time: '30 min ago',
      isNew: true,
      icon: 'schedule',
      color: Colors.info
    },
    {
      id: 3,
      type: 'cancellation',
      title: 'Appointment Cancelled',
      message: 'Michael Chen has cancelled his 4:00 PM appointment today',
      time: '1 hour ago',
      isNew: false,
      icon: 'event-busy',
      color: Colors.error
    },
    {
      id: 4,
      type: 'message',
      title: 'New Message from Patient',
      message: 'Emma Wilson: "Thank you for the excellent treatment yesterday!"',
      time: '2 hours ago',
      isNew: true,
      icon: 'chat',
      color: Colors.success
    },
    {
      id: 5,
      type: 'feedback',
      title: 'Patient Feedback Received',
      message: 'David Brown left a 5-star review: "Professional and caring service"',
      time: '3 hours ago',
      isNew: false,
      icon: 'star',
      color: Colors.warning
    },
    {
      id: 6,
      type: 'appointment',
      title: 'Appointment Rescheduled',
      message: 'Lisa Anderson moved her appointment from 3:00 PM to 4:30 PM',
      time: '4 hours ago',
      isNew: false,
      icon: 'update',
      color: '#A08A48'
    },
    {
      id: 7,
      type: 'reminder',
      title: 'Weekly Schedule Ready',
      message: 'Your schedule for next week is now available for review',
      time: '1 day ago',
      isNew: false,
      icon: 'calendar-today',
      color: Colors.secondary
    }
  ]);

  const filterOptions = [
    { key: 'all', label: 'All Notifications', count: notifications.length },
    { key: 'appointment', label: 'Appointments', count: notifications.filter(n => n.type === 'appointment').length },
    { key: 'message', label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
    { key: 'reminder', label: 'Reminders', count: notifications.filter(n => n.type === 'reminder').length },
    { key: 'feedback', label: 'Feedback', count: notifications.filter(n => n.type === 'feedback').length },
  ];

  const filteredNotifications = selectedFilter === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.type === selectedFilter);

  const newNotificationsCount = notifications.filter(n => n.isNew).length;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

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

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const archiveNotification = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, archived: true }
          : notification
      )
    );
  };

  const NotificationItem = ({ notification }) => {
    const translateX = new Animated.Value(0);
    const [showActions, setShowActions] = useState(false);

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Swipe ke kanan untuk archive (positive dx)
        if (gestureState.dx > 0) {
          translateX.setValue(Math.min(gestureState.dx, 100));
        }
        // Swipe ke kiri untuk delete (negative dx)
        else if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -100));
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Swipe ke kanan untuk archive
        if (gestureState.dx > 30) {
          setNotificationToArchive(notification.id);
          setShowArchivePopup(true);
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
        // Swipe ke kiri untuk delete
        else if (gestureState.dx < -30) {
          Animated.timing(translateX, {
            toValue: -400,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            deleteNotification(notification.id);
          });
        }
        // Kembali ke posisi semula jika swipe tidak cukup jauh
        else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    });



    return (
      <View style={{
        marginHorizontal: 16,
        marginVertical: 8,
        position: 'relative',
      }}>


        {/* Notification Content */}
        <Animated.View
          style={{
            transform: [{ translateX }],
          }}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: 20,
              shadowColor: notification.isNew ? notification.color : '#000',
              shadowOffset: { width: 0, height: notification.isNew ? 8 : 4 },
              shadowOpacity: notification.isNew ? 0.25 : 0.12,
              shadowRadius: notification.isNew ? 16 : 8,
              elevation: notification.isNew ? 8 : 4,
              borderWidth: notification.isNew ? 1.5 : 0,
              borderColor: notification.isNew ? `${notification.color}30` : 'transparent',
              opacity: notification.isNew ? 1 : 0.85,
              transform: [{ scale: notification.isNew ? 1.02 : 1 }]
            }}
            onPress={() => markAsRead(notification.id)}
            activeOpacity={0.7}
          >
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 24,
        backgroundColor: notification.isNew ? `${notification.color}08` : 'transparent'
      }} />
      
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: `${notification.color}15`,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 16,
          shadowColor: notification.color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
          borderWidth: 2,
          borderColor: `${notification.color}25`
        }}>
          <MaterialIcons name={notification.icon} size={28} color={notification.color} />
        </View>
        
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Text style={{
              fontSize: 17,
              fontWeight: '700',
              color: Colors.text,
              flex: 1,
              lineHeight: 24
            }}>
              {notification.title}
            </Text>
            {notification.isNew && (
              <View style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: Colors.error,
                marginLeft: 8,
                shadowColor: Colors.error,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
                elevation: 3
              }} />
            )}
          </View>
          
          <Text style={{
            fontSize: 15,
            color: Colors.secondaryText,
            lineHeight: 22,
            marginBottom: 12,
            fontWeight: '400'
          }}>
            {notification.message}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{
              fontSize: 13,
              color: notification.color,
              fontWeight: '600',
              backgroundColor: `${notification.color}10`,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12
            }}>
              {notification.time}
            </Text>
            
            {notification.isNew && (
              <View style={{
                backgroundColor: `${notification.color}15`,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: `${notification.color}30`
              }}>
                <Text style={{
                  fontSize: 11,
                  color: notification.color,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}>
                  NEW
                </Text>
              </View>
            )}
          </View>
            </View>
          </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

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
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onPress={() => setFilterVisible(false)}
      >
        <View
          style={{
            borderRadius: 28,
            padding: 28,
            width: '88%',
            maxHeight: '70%',
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 15 },
            shadowOpacity: 0.25,
            shadowRadius: 25,
            elevation: 15
          }}
        >
          <View style={{
            alignItems: 'center',
            marginBottom: 24
          }}>
            <View style={{
              width: 50,
              height: 5,
              backgroundColor: '#E0E0E0',
              borderRadius: 3,
              marginBottom: 16
            }} />
            <Text style={{
              fontSize: 22,
              fontWeight: '800',
              color: Colors.text,
              textAlign: 'center'
            }}>
            Filter Notifications
            </Text>
            <Text style={{
              fontSize: 14,
              color: Colors.secondaryText,
              textAlign: 'center',
              marginTop: 6
            }}>
              Choose what you want to see
            </Text>
          </View>
          
          {filterOptions.map((option, index) => (
            <TouchableOpacity
              key={option.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderRadius: 18,
                backgroundColor: selectedFilter === option.key ? `${Colors.primary}12` : '#F8F9FA',
                marginBottom: 12,
                borderWidth: selectedFilter === option.key ? 2 : 1,
                borderColor: selectedFilter === option.key ? Colors.primary : '#E8E8E8',
                shadowColor: selectedFilter === option.key ? Colors.primary : '#000',
                shadowOffset: { width: 0, height: selectedFilter === option.key ? 4 : 2 },
                shadowOpacity: selectedFilter === option.key ? 0.15 : 0.05,
                shadowRadius: selectedFilter === option.key ? 8 : 4,
                elevation: selectedFilter === option.key ? 4 : 2
              }}
              onPress={() => {
                setSelectedFilter(option.key);
                setFilterVisible(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={{
                fontSize: 17,
                color: selectedFilter === option.key ? Colors.primary : Colors.text,
                fontWeight: selectedFilter === option.key ? '700' : '500'
              }}>
                {option.label}
              </Text>
              <View style={{
                backgroundColor: selectedFilter === option.key ? Colors.primary : '#6C757D',
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 6,
                minWidth: 32,
                shadowColor: selectedFilter === option.key ? Colors.primary : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2
              }}>
                <Text style={{
                  fontSize: 13,
                  color: Colors.white,
                  fontWeight: '700',
                  textAlign: 'center'
                }}>
                  {option.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Header */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <LinearGradient
          colors={['#8B5CF6', '#667eea']}
          style={{
            paddingTop: 70,
            paddingHorizontal: 20,
            paddingBottom: 10,
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
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
            }}>
              Filtered: {filterOptions.find(f => f.key === selectedFilter)?.label}
            </Text>
          </View>
        )}
        </LinearGradient>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={{ flex: 1, backgroundColor: '#F5F5F5' }}
        contentContainerStyle={{ paddingVertical: 16, paddingTop: 140 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
            progressViewOffset={160}
          />
        }
      >
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        ) : (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 80,
            paddingHorizontal: 40
          }}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
                backgroundColor: `${Colors.primary}15`,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 8
              }}
            >
              <MaterialIcons name="notifications-none" size={56} color={Colors.primary} />
            </View>
            <Text style={{
              fontSize: 22,
              fontWeight: '700',
              color: Colors.text,
              marginBottom: 12,
              textAlign: 'center'
            }}>
              All Caught Up! 🎉
            </Text>
            <Text style={{
              fontSize: 16,
              color: Colors.secondaryText,
              textAlign: 'center',
              lineHeight: 24,
              fontWeight: '400'
            }}>
              You're doing great! New notifications will appear here when they arrive.
            </Text>
          </View>
        )}
      </ScrollView>

      <FilterModal />
      
      {/* Archive Popup */}
      {showArchivePopup && (
        <Modal
          visible={showArchivePopup}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowArchivePopup(false)}
        >
          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.3)',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              paddingRight: 20,
              paddingBottom: 100
            }}
            onPress={() => setShowArchivePopup(false)}
          >
            <View
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(20px)',
                borderRadius: 20,
                padding: 20,
                minWidth: 200,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 20,
                elevation: 10,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }}
            >
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: '#333',
                marginBottom: 15,
                textAlign: 'center'
              }}>
                Archive Notification
              </Text>
              
              <Text style={{
                fontSize: 14,
                color: '#666',
                marginBottom: 20,
                textAlign: 'center',
                lineHeight: 20
              }}>
                Move this notification to archive?
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(108, 117, 125, 0.2)',
                    paddingVertical: 12,
                    borderRadius: 12,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(108, 117, 125, 0.3)'
                  }}
                  onPress={() => setShowArchivePopup(false)}
                >
                  <Text style={{
                    color: '#666',
                    fontWeight: '600',
                    textAlign: 'center',
                    fontSize: 14
                  }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255, 193, 7, 0.3)',
                    paddingVertical: 12,
                    borderRadius: 12,
                    marginLeft: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 193, 7, 0.5)'
                  }}
                  onPress={() => {
                    if (notificationToArchive) {
                      archiveNotification(notificationToArchive);
                    }
                    setShowArchivePopup(false);
                    setNotificationToArchive(null);
                  }}
                >
                  <Text style={{
                    color: '#B8860B',
                    fontWeight: '700',
                    textAlign: 'center',
                    fontSize: 14
                  }}>
                    Archive
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

export default NotificationDoctor;