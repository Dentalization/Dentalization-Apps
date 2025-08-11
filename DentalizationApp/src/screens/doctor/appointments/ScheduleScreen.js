import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAppointments } from '../../../contexts/AppointmentContext';

const ScheduleScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('Today');
  const [appointments, setAppointments] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { getAppointmentsByFilter, updateAppointmentStatus } = useAppointments();

  // Get appointment data from context
  const mockAppointments = {
    Today: [
      {
        id: '1',
        patientName: 'Sarah Johnson',
        patientImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        time: '09:00 AM',
        date: 'Today',
        treatmentType: 'Dental Cleaning',
        status: 'Waiting',
        duration: '30 min',
        notes: 'Regular checkup and cleaning',
        patientDetails: {
          age: 28,
          phone: '+62 812-3456-7890',
          email: 'sarah.johnson@email.com',
          lastVisit: '3 months ago',
          allergies: ['Penicillin', 'Latex'],
          medicalHistory: ['Hypertension', 'No previous dental surgery'],
          emergencyContact: {
            name: 'John Johnson (Husband)',
            phone: '+62 812-3456-7891'
          },
          insurance: 'BPJS Kesehatan',
          bloodType: 'A+'
        }
      },
      {
        id: '2',
        patientName: 'Michael Chen',
        patientImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        time: '10:30 AM',
        date: 'Today',
        treatmentType: 'Tooth Filling',
        status: 'In Progress',
        duration: '45 min',
        notes: 'Cavity filling on upper molar',
        patientDetails: {
          age: 35,
          phone: '+62 813-4567-8901',
          email: 'michael.chen@email.com',
          lastVisit: '6 months ago',
          allergies: ['None'],
          medicalHistory: ['Diabetes Type 2', 'Previous root canal (2019)'],
          emergencyContact: {
            name: 'Lisa Chen (Wife)',
            phone: '+62 813-4567-8902'
          },
          insurance: 'Prudential',
          bloodType: 'B+'
        }
      },
      {
        id: '3',
        patientName: 'Emma Wilson',
        patientImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        time: '02:00 PM',
        date: 'Today',
        treatmentType: 'Root Canal',
        status: 'Waiting',
        duration: '90 min',
        notes: 'Root canal treatment'
      },
      {
        id: '4',
        patientName: 'David Brown',
        patientImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        time: '03:30 PM',
        date: 'Today',
        treatmentType: 'Consultation',
        status: 'Done',
        duration: '20 min',
        notes: 'Initial consultation completed'
      }
    ],
    Upcoming: [
      {
        id: '5',
        patientName: 'Lisa Anderson',
        patientImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        time: '09:00 AM',
        date: 'Tomorrow',
        treatmentType: 'Teeth Whitening',
        status: 'Waiting',
        duration: '60 min',
        notes: 'Professional whitening session'
      },
      {
        id: '6',
        patientName: 'James Miller',
        patientImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        time: '11:00 AM',
        date: 'Dec 28',
        treatmentType: 'Crown Placement',
        status: 'Waiting',
        duration: '75 min',
        notes: 'Ceramic crown installation'
      }
    ],
    Past: [
      {
        id: '7',
        patientName: 'Anna Garcia',
        patientImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
        time: '02:00 PM',
        date: 'Yesterday',
        treatmentType: 'Dental Cleaning',
        status: 'Done',
        duration: '30 min',
        notes: 'Routine cleaning completed'
      },
      {
        id: '8',
        patientName: 'Robert Taylor',
        patientImage: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face',
        time: '10:00 AM',
        date: 'Dec 24',
        treatmentType: 'Tooth Extraction',
        status: 'Cancelled',
        duration: '45 min',
        notes: 'Patient cancelled appointment'
      }
    ]
  };

  useEffect(() => {
    setAppointments(getAppointmentsByFilter(selectedFilter) || []);
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedFilter]);

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

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Waiting': return '#FF9500';
      case 'In Progress': return '#007AFF';
      case 'Done': return '#34C759';
      case 'Cancelled': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Waiting': return 'schedule';
      case 'In Progress': return 'play-circle';
      case 'Done': return 'check-circle';
      case 'Cancelled': return 'cancel';
      default: return 'help';
    }
  };

  const handleActionPress = (appointment, action) => {
    switch (action) {
      case 'start':
        Alert.alert(
          'Start Consultation',
          `Starting video consultation with ${appointment.patientName}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Start', 
              onPress: () => {
                // Navigate to video call consultation
                navigation.navigate('VideoCallConsultation', {
                  appointmentId: appointment.id,
                  patientName: appointment.patientName,
                  patientId: appointment.patientId || appointment.id
                });
              }
            }
          ]
        );
        break;
      case 'cancel':
        Alert.alert(
          'Cancel Appointment',
          `Are you sure you want to cancel the appointment with ${appointment.patientName}?`,
          [
            { text: 'No', style: 'cancel' },
            { text: 'Yes', style: 'destructive', onPress: () => {
              updateAppointmentStatus(appointment.id, 'Cancelled');
              setAppointments(getAppointmentsByFilter(selectedFilter));
            }}
          ]
        );
        break;
      case 'reschedule':
        Alert.alert('Reschedule', `Rescheduling appointment with ${appointment.patientName}`);
        break;
      case 'view':
        navigation.navigate('ViewDetailsPatient', { patientId: appointment.id });
        break;
      case 'complete':
        // Direct navigation to consultation complete form
        navigation.navigate('ConsultationCompleteForm', {
          appointmentId: appointment.id,
          patientName: appointment.patientName
        });
        break;
      default:
        break;
    }
  };

  const toggleCardExpansion = (appointmentId) => {
    setExpandedCards(prev => ({
      ...prev,
      [appointmentId]: !prev[appointmentId]
    }));
  };

  const renderAppointmentCard = (appointment) => {
    const isExpanded = expandedCards[appointment.id];
    
    return (
      <Animated.View
        key={appointment.id}
        style={{
          opacity: fadeAnim,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 16,
          marginHorizontal: 20,
          marginBottom: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
      {/* Patient Info Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Image
          source={{ uri: appointment.patientImage }}
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            marginRight: 12,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#1C1C1E',
            marginBottom: 2,
          }}>
            {appointment.patientName}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="access-time" size={14} color="#8E8E93" />
            <Text style={{
              fontSize: 14,
              color: '#8E8E93',
              marginLeft: 4,
            }}>
              {appointment.time} • {appointment.duration}
            </Text>
          </View>
        </View>
        <View style={{
          backgroundColor: getStatusColor(appointment.status),
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <MaterialIcons
            name={getStatusIcon(appointment.status)}
            size={12}
            color="white"
            style={{ marginRight: 4 }}
          />
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: 'white',
          }}>
            {appointment.status}
          </Text>
        </View>
      </View>

      {/* Treatment Info */}
      <View style={{
        backgroundColor: 'rgba(116, 116, 128, 0.08)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <MaterialIcons name="medical-services" size={16} color="#483AA0" />
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#483AA0',
              marginLeft: 6,
            }}>
              {appointment.treatmentType}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => toggleCardExpansion(appointment.id)}
            style={{
              backgroundColor: 'rgba(72, 58, 160, 0.1)',
              borderRadius: 8,
              padding: 6,
            }}
          >
            <MaterialIcons 
              name={isExpanded ? 'expand-less' : 'expand-more'} 
              size={20} 
              color="#483AA0" 
            />
          </TouchableOpacity>
        </View>
        <Text style={{
          fontSize: 13,
          color: '#6E6E6E',
          lineHeight: 18,
        }}>
          {appointment.notes}
        </Text>
      </View>

      {/* Patient Details - Expandable */}
      {isExpanded && appointment.patientDetails && (
        <View style={{
          backgroundColor: 'rgba(72, 58, 160, 0.05)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: 'rgba(72, 58, 160, 0.1)',
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#483AA0',
            marginBottom: 12,
          }}>
            Detail Pasien
          </Text>
          
          {/* Basic Info */}
          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, color: '#6E6E6E' }}>Umur:</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#1C1C1E' }}>{appointment.patientDetails.age} tahun</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, color: '#6E6E6E' }}>Golongan Darah:</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#1C1C1E' }}>{appointment.patientDetails.bloodType}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, color: '#6E6E6E' }}>Kunjungan Terakhir:</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#1C1C1E' }}>{appointment.patientDetails.lastVisit}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, color: '#6E6E6E' }}>Asuransi:</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#1C1C1E' }}>{appointment.patientDetails.insurance}</Text>
            </View>
          </View>

          {/* Contact Info */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#483AA0', marginBottom: 6 }}>Kontak</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <MaterialIcons name="phone" size={14} color="#6E6E6E" />
              <Text style={{ fontSize: 13, color: '#1C1C1E', marginLeft: 6 }}>{appointment.patientDetails.phone}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="email" size={14} color="#6E6E6E" />
              <Text style={{ fontSize: 13, color: '#1C1C1E', marginLeft: 6 }}>{appointment.patientDetails.email}</Text>
            </View>
          </View>

          {/* Medical History */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#483AA0', marginBottom: 6 }}>Riwayat Medis</Text>
            {appointment.patientDetails.medicalHistory.map((history, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#6E6E6E', marginRight: 8 }} />
                <Text style={{ fontSize: 13, color: '#1C1C1E', flex: 1 }}>{history}</Text>
              </View>
            ))}
          </View>

          {/* Allergies */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#FF9500', marginBottom: 6 }}>Alergi</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {appointment.patientDetails.allergies.map((allergy, index) => (
                <View key={index} style={{
                  backgroundColor: allergy === 'None' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 149, 0, 0.1)',
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  marginRight: 6,
                  marginBottom: 4,
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: allergy === 'None' ? '#34C759' : '#FF9500',
                  }}>
                    {allergy}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Emergency Contact */}
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#FF3B30', marginBottom: 6 }}>Kontak Darurat</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <MaterialIcons name="person" size={14} color="#6E6E6E" />
              <Text style={{ fontSize: 13, color: '#1C1C1E', marginLeft: 6 }}>{appointment.patientDetails.emergencyContact.name}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="phone" size={14} color="#6E6E6E" />
              <Text style={{ fontSize: 13, color: '#1C1C1E', marginLeft: 6 }}>{appointment.patientDetails.emergencyContact.phone}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {appointment.status === 'Waiting' && (
          <>
            <TouchableOpacity
              onPress={() => handleActionPress(appointment, 'start')}
              style={{
                flex: 1,
                backgroundColor: '#483AA0',
                borderRadius: 12,
                paddingVertical: 12,
                marginRight: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
                Start Consultation
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleActionPress(appointment, 'cancel')}
              style={{
                backgroundColor: 'rgba(255, 59, 48, 0.1)',
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                alignItems: 'center',
              }}
            >
              <MaterialIcons name="cancel" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </>
        )}
        {appointment.status === 'In Progress' && (
          <TouchableOpacity
            onPress={() => handleActionPress(appointment, 'view')}
            style={{
              flex: 1,
              backgroundColor: '#007AFF',
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
              View Details
            </Text>
          </TouchableOpacity>
        )}
        {(appointment.status === 'Done' || appointment.status === 'Cancelled') && (
          <TouchableOpacity
            onPress={() => handleActionPress(appointment, 'view')}
            style={{
              flex: 1,
              backgroundColor: 'rgba(116, 116, 128, 0.08)',
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#8E8E93', fontWeight: '600', fontSize: 14 }}>
              View Details
            </Text>
          </TouchableOpacity>
        )}
      </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingTop: 60,
    }}>
      <View style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
      }}>
        <MaterialIcons name="event-available" size={60} color="#483AA0" style={{ marginBottom: 16 }} />
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 8,
          textAlign: 'center',
          color: '#1C1C1E',
        }}>
          No Appointments {selectedFilter === 'Today' ? 'Today' : selectedFilter}
        </Text>
        <Text style={{
          fontSize: 14,
          textAlign: 'center',
          lineHeight: 20,
          color: '#6E6E6E',
        }}>
          {selectedFilter === 'Today'
            ? 'You have no appointments scheduled for today. Enjoy your free time!'
            : selectedFilter === 'Upcoming'
            ? 'No upcoming appointments scheduled.'
            : 'No past appointments to display.'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F1F8' }}>
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
          colors={isScrolled ? ['rgba(72, 58, 160, 0.65)', 'rgba(99, 102, 241, 0.65)'] : ['#483AA0', '#6366F1']}
          style={{
            paddingTop: 70,
            paddingBottom: 30,
            paddingHorizontal: 20,
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
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 4 }}>
                Schedule
              </Text>
              <Text style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.8)' }}>
                Manage your appointments
              </Text>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              <MaterialIcons name="calendar-today" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Filter Buttons */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 16,
            padding: 4,
          }}>
            {['Today', 'Upcoming', 'Past'].map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: selectedFilter === filter ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                  borderWidth: selectedFilter === filter ? 1 : 0,
                  borderColor: selectedFilter === filter ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                }}
              >
                <Text style={{
                  textAlign: 'center',
                  fontWeight: selectedFilter === filter ? '600' : '500',
                  color: selectedFilter === filter ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  fontSize: 14,
                }}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 220 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#483AA0"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: 20, paddingBottom: 100 }}>
          {appointments.length > 0 ? (
            appointments.map(renderAppointmentCard)
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ScheduleScreen;