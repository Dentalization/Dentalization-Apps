import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  Alert
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ViewDetailsPatient = ({ navigation, route }) => {
  const { patientId } = route.params || {};
  const [isScrolled, setIsScrolled] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Mock patient data - in real app, this would come from API
  const [patients] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      lastVisit: '2024-01-15',
      status: 'Active',
      statusColor: '#10B981',
      phone: '+62 812-3456-7890',
      email: 'sarah.johnson@email.com',
      age: 28,
      gender: 'Female',
      address: 'Jl. Sudirman No. 123, Jakarta',
      nextAppointment: '2024-01-25',
      medicalHistory: [
        { date: '2024-01-15', treatment: 'Dental Cleaning', doctor: 'Dr. Smith', notes: 'Regular cleaning, good oral hygiene' },
        { date: '2024-01-01', treatment: 'Tooth Filling', doctor: 'Dr. Smith', notes: 'Filled cavity on upper left molar' },
        { date: '2023-12-15', treatment: 'Consultation', doctor: 'Dr. Smith', notes: 'Initial consultation and examination' }
      ],
      allergies: ['Penicillin', 'Latex'],
      emergencyContact: {
        name: 'John Johnson',
        relationship: 'Husband',
        phone: '+62 812-3456-7891'
      }
    },
    {
      id: 2,
      name: 'Michael Chen',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      lastVisit: '2024-01-12',
      status: 'Waiting',
      statusColor: '#F59E0B',
      phone: '+62 813-4567-8901',
      email: 'michael.chen@email.com',
      age: 35,
      gender: 'Male',
      address: 'Jl. Thamrin No. 456, Jakarta',
      nextAppointment: '2024-01-20',
      medicalHistory: [
        { date: '2024-01-12', treatment: 'Root Canal', doctor: 'Dr. Smith', notes: 'Root canal treatment on lower right molar' },
        { date: '2023-12-20', treatment: 'X-Ray', doctor: 'Dr. Smith', notes: 'Dental X-ray for diagnosis' }
      ],
      allergies: ['None'],
      emergencyContact: {
        name: 'Lisa Chen',
        relationship: 'Wife',
        phone: '+62 813-4567-8902'
      }
    },
    {
      id: 3,
      name: 'Emma Wilson',
      profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      lastVisit: '2024-01-10',
      status: 'Completed',
      statusColor: '#6B7280',
      phone: '+62 814-5678-9012',
      email: 'emma.wilson@email.com',
      age: 42,
      gender: 'Female',
      address: 'Jl. Gatot Subroto No. 789, Jakarta',
      nextAppointment: null,
      medicalHistory: [
        { date: '2024-01-10', treatment: 'Teeth Whitening', doctor: 'Dr. Smith', notes: 'Professional teeth whitening treatment completed' },
        { date: '2023-11-15', treatment: 'Dental Cleaning', doctor: 'Dr. Smith', notes: 'Regular cleaning and checkup' }
      ],
      allergies: ['Ibuprofen'],
      emergencyContact: {
        name: 'David Wilson',
        relationship: 'Brother',
        phone: '+62 814-5678-9013'
      }
    },
    {
      id: 4,
      name: 'David Rodriguez',
      profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      lastVisit: '2024-01-08',
      status: 'Active',
      statusColor: '#10B981',
      phone: '+62 815-6789-0123',
      email: 'david.rodriguez@email.com',
      age: 31,
      gender: 'Male',
      address: 'Jl. Kuningan No. 321, Jakarta',
      nextAppointment: '2024-01-22',
      medicalHistory: [
        { date: '2024-01-08', treatment: 'Dental Implant', doctor: 'Dr. Smith', notes: 'Dental implant procedure for missing tooth' },
        { date: '2023-12-01', treatment: 'Consultation', doctor: 'Dr. Smith', notes: 'Consultation for dental implant' }
      ],
      allergies: ['None'],
      emergencyContact: {
        name: 'Maria Rodriguez',
        relationship: 'Mother',
        phone: '+62 815-6789-0124'
      }
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      lastVisit: '2024-01-05',
      status: 'Waiting',
      statusColor: '#F59E0B',
      phone: '+62 816-7890-1234',
      email: 'lisa.anderson@email.com',
      age: 26,
      gender: 'Female',
      address: 'Jl. Senayan No. 654, Jakarta',
      nextAppointment: '2024-01-18',
      medicalHistory: [
        { date: '2024-01-05', treatment: 'Orthodontic Consultation', doctor: 'Dr. Smith', notes: 'Consultation for braces treatment' },
        { date: '2023-11-20', treatment: 'Dental Cleaning', doctor: 'Dr. Smith', notes: 'Regular cleaning and oral health assessment' }
      ],
      allergies: ['Aspirin'],
      emergencyContact: {
        name: 'Robert Anderson',
        relationship: 'Father',
        phone: '+62 816-7890-1235'
      }
    }
  ]);

  const patient = patients.find(p => p.id === patientId);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleCall = () => {
    Alert.alert('Call Patient', `Calling ${patient?.phone}`);
  };

  const handleMessage = () => {
    Alert.alert('Message Patient', `Send message to ${patient?.name}`);
  };

  const handleEditPatient = () => {
    Alert.alert('Edit Patient', 'Edit patient information');
  };

  const handleScheduleAppointment = () => {
    Alert.alert('Schedule Appointment', `Schedule new appointment for ${patient?.name}`);
  };

  if (!patient) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F1F8' }}>
        <Text style={{ fontSize: 18, color: '#6B7280' }}>Patient not found</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20, backgroundColor: '#483AA0', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F1F8' }}>
      <StatusBar barStyle="light-content" backgroundColor="#483AA0" />
      
      {/* Header Section */}
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
            paddingBottom: 16,
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
          
          {/* Header with Back Button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16
              }}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 24,
                fontWeight: '900',
                color: 'white',
                letterSpacing: -0.5
              }}>
                Patient Details
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={handleEditPatient}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Ionicons name="create-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: 140, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* Patient Profile Card */}
            <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 24,
                padding: 24,
                shadowColor: '#483AA0',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 8,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }}>
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <View style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    overflow: 'hidden',
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 5
                  }}>
                    <Image
                      source={{ uri: patient.profilePhoto }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                    <View style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 50,
                      borderWidth: 3,
                      borderColor: 'rgba(72, 58, 160, 0.2)'
                    }} />
                  </View>
                  
                  <Text style={{
                    fontSize: 24,
                    fontWeight: '800',
                    color: '#1F2937',
                    marginBottom: 8,
                    letterSpacing: -0.5
                  }}>
                    {patient.name}
                  </Text>
                  
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: `${patient.statusColor}15`,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: `${patient.statusColor}30`
                  }}>
                    <View style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: patient.statusColor,
                      marginRight: 8
                    }} />
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: patient.statusColor,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}>
                      {patient.status}
                    </Text>
                  </View>
                </View>
                
                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                  <TouchableOpacity
                    onPress={handleCall}
                    style={{
                      flex: 1,
                      backgroundColor: '#10B981',
                      borderRadius: 12,
                      paddingVertical: 12,
                      marginRight: 8,
                      alignItems: 'center',
                      shadowColor: '#10B981',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4
                    }}
                  >
                    <Ionicons name="call" size={20} color="white" style={{ marginBottom: 4 }} />
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>Call</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleMessage}
                    style={{
                      flex: 1,
                      backgroundColor: '#3B82F6',
                      borderRadius: 12,
                      paddingVertical: 12,
                      marginHorizontal: 4,
                      alignItems: 'center',
                      shadowColor: '#3B82F6',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4
                    }}
                  >
                    <Ionicons name="chatbubble" size={20} color="white" style={{ marginBottom: 4 }} />
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>Message</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleScheduleAppointment}
                    style={{
                      flex: 1,
                      backgroundColor: '#8B5CF6',
                      borderRadius: 12,
                      paddingVertical: 12,
                      marginLeft: 8,
                      alignItems: 'center',
                      shadowColor: '#8B5CF6',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4
                    }}
                  >
                    <Ionicons name="calendar" size={20} color="white" style={{ marginBottom: 4 }} />
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>Schedule</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            {/* Patient Information */}
            <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '800',
                color: '#1F2937',
                marginBottom: 16,
                letterSpacing: -0.3
              }}>
                Patient Information
              </Text>
              
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 20,
                padding: 20,
                shadowColor: '#483AA0',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4
              }}>
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 4 }}>AGE</Text>
                    <Text style={{ fontSize: 16, color: '#1F2937', fontWeight: '600' }}>{patient.age} years</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 4 }}>GENDER</Text>
                    <Text style={{ fontSize: 16, color: '#1F2937', fontWeight: '600' }}>{patient.gender}</Text>
                  </View>
                </View>
                
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 4 }}>PHONE</Text>
                  <Text style={{ fontSize: 16, color: '#1F2937', fontWeight: '600' }}>{patient.phone}</Text>
                </View>
                
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 4 }}>EMAIL</Text>
                  <Text style={{ fontSize: 16, color: '#1F2937', fontWeight: '600' }}>{patient.email}</Text>
                </View>
                
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 4 }}>ADDRESS</Text>
                  <Text style={{ fontSize: 16, color: '#1F2937', fontWeight: '600', lineHeight: 22 }}>{patient.address}</Text>
                </View>
                
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 4 }}>LAST VISIT</Text>
                    <Text style={{ fontSize: 16, color: '#1F2937', fontWeight: '600' }}>{formatDate(patient.lastVisit)}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 4 }}>NEXT APPOINTMENT</Text>
                    <Text style={{ fontSize: 16, color: '#1F2937', fontWeight: '600' }}>
                      {patient.nextAppointment ? formatDate(patient.nextAppointment) : 'Not scheduled'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Medical History */}
            <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '800',
                color: '#1F2937',
                marginBottom: 16,
                letterSpacing: -0.3
              }}>
                Medical History
              </Text>
              
              {patient.medicalHistory.map((record, index) => (
                <View key={index} style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  shadowColor: '#483AA0',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 2
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937' }}>{record.treatment}</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600' }}>{formatDate(record.date)}</Text>
                  </View>
                  <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>Doctor: {record.doctor}</Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 20 }}>{record.notes}</Text>
                </View>
              ))}
            </View>
            
            {/* Emergency Contact & Allergies */}
            <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '800',
                    color: '#1F2937',
                    marginBottom: 12,
                    letterSpacing: -0.3
                  }}>
                    Emergency Contact
                  </Text>
                  
                  <View style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: 16,
                    padding: 16,
                    shadowColor: '#483AA0',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 2
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 }}>
                      {patient.emergencyContact.name}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
                      {patient.emergencyContact.relationship}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#374151' }}>
                      {patient.emergencyContact.phone}
                    </Text>
                  </View>
                </View>
                
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '800',
                    color: '#1F2937',
                    marginBottom: 12,
                    letterSpacing: -0.3
                  }}>
                    Allergies
                  </Text>
                  
                  <View style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: 16,
                    padding: 16,
                    shadowColor: '#483AA0',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 2
                  }}>
                    {patient.allergies.map((allergy, index) => (
                      <View key={index} style={{
                        backgroundColor: allergy === 'None' ? '#10B98115' : '#EF444415',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 12,
                        marginBottom: index < patient.allergies.length - 1 ? 8 : 0,
                        borderWidth: 1,
                        borderColor: allergy === 'None' ? '#10B98130' : '#EF444430'
                      }}>
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: allergy === 'None' ? '#10B981' : '#EF4444',
                          textAlign: 'center'
                        }}>
                          {allergy}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

export default ViewDetailsPatient;