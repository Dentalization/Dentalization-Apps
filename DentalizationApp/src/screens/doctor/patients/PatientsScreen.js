import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  Dimensions,
  Alert,
  StatusBar
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const PatientsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'status'
  const [isScrolled, setIsScrolled] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Mock patient data
  const [patients] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      lastVisit: '2024-01-15',
      status: 'Active',
      statusColor: '#10B981',
      phone: '+62 812-3456-7890',
      nextAppointment: '2024-01-25'
    },
    {
      id: 2,
      name: 'Michael Chen',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      lastVisit: '2024-01-12',
      status: 'Waiting',
      statusColor: '#F59E0B',
      phone: '+62 813-4567-8901',
      nextAppointment: '2024-01-20'
    },
    {
      id: 3,
      name: 'Emma Wilson',
      profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      lastVisit: '2024-01-10',
      status: 'Completed',
      statusColor: '#6B7280',
      phone: '+62 814-5678-9012',
      nextAppointment: null
    },
    {
      id: 4,
      name: 'David Rodriguez',
      profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      lastVisit: '2024-01-08',
      status: 'Active',
      statusColor: '#10B981',
      phone: '+62 815-6789-0123',
      nextAppointment: '2024-01-22'
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      lastVisit: '2024-01-05',
      status: 'Waiting',
      statusColor: '#F59E0B',
      phone: '+62 816-7890-1234',
      nextAppointment: '2024-01-18'
    }
  ]);

  React.useEffect(() => {
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

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return new Date(b.lastVisit) - new Date(a.lastVisit);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const handleSortFilter = () => {
    Alert.alert(
      'Sort & Filter',
      'Choose sorting option',
      [
        { text: 'By Name', onPress: () => setSortBy('name') },
        { text: 'By Visit Date', onPress: () => setSortBy('date') },
        { text: 'By Status', onPress: () => setSortBy('status') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleAddPatient = () => {
    Alert.alert('Add Patient', 'This feature will be implemented soon');
  };

  const handlePatientPress = (patient) => {
    navigation.navigate('ViewDetailsPatient', { patientId: patient.id });
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderPatientCard = (patient, index) => {
    const cardAnim = useRef(new Animated.Value(0)).current;
    
    React.useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        key={patient.id}
        style={{
          opacity: cardAnim,
          transform: [{ translateY: cardAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0]
          }) }],
          marginBottom: 16
        }}
      >
        <TouchableOpacity
          onPress={() => handlePatientPress(patient)}
          activeOpacity={0.7}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 20,
            padding: 20,
            shadowColor: '#483AA0',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 8,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)'
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Profile Photo */}
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              overflow: 'hidden',
              marginRight: 16,
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
                borderRadius: 30,
                borderWidth: 2,
                borderColor: 'rgba(72, 58, 160, 0.2)'
               }} />
             </View>

            {/* Patient Info */}
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: '#1F2937',
                marginBottom: 4,
                letterSpacing: -0.3
              }}>
                {patient.name}
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text style={{
                  fontSize: 14,
                  color: '#6B7280',
                  marginLeft: 6,
                  fontWeight: '500'
                }}>
                  Last visit: {formatDate(patient.lastVisit)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: `${patient.statusColor}15`,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
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
                    fontSize: 12,
                    fontWeight: '600',
                    color: patient.statusColor,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}>
                    {patient.status}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handlePatientPress(patient)}
                  style={{
                    backgroundColor: 'rgba(72, 58, 160, 0.1)',
                    borderRadius: 12,
                    padding: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(72, 58, 160, 0.2)'
                  }}
                >
                  <Ionicons name="chevron-forward" size={16} color="#483AA0" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

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
          {/* Title */}
          <View style={{ marginBottom: 20, paddingHorizontal: 24 }}>
            <Text style={{
              fontSize: 32,
              fontWeight: '900',
              color: 'white',
              letterSpacing: -1,
              textAlign: 'center'
            }}>
              My Patients
            </Text>
            <View style={{
              alignSelf: 'center',
              marginTop: 8,
              width: 60,
              height: 4,
              borderRadius: 2
            }}>
              <LinearGradient
                colors={['#483AA0', '#6B5CE7', '#483AA0']}
                style={{ flex: 1, borderRadius: 2 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>

          {/* Search Bar */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 25,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginBottom: 16,
            marginHorizontal: 24
          }}>
            <MaterialIcons name="search" size={20} color="rgba(255,255,255,0.8)" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Search patients by name..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                fontSize: 16,
                color: 'white',
                fontWeight: '400'
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={20} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter & Sort Button */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24 }}>
            <TouchableOpacity
              onPress={handleSortFilter}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Ionicons name="filter" size={16} color="rgba(255,255,255,0.9)" style={{ marginRight: 8 }} />
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: 'rgba(255,255,255,0.9)',
                textTransform: 'capitalize'
              }}>
                Sort by {sortBy}
              </Text>
            </TouchableOpacity>

            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
               borderWidth: 1,
               borderColor: 'rgba(255, 255, 255, 0.3)',
               shadowColor: '#000',
               shadowOffset: { width: 0, height: 2 },
               shadowOpacity: 0.1,
               shadowRadius: 4,
               elevation: 2
            }}>
              <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.9)'
                }}>
                {sortedPatients.length} patients
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={{
          flex: 1,
          transform: [{ translateY: slideAnim }]
        }}>
          {/* Patient List */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 24, paddingTop: 200, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
          {sortedPatients.length > 0 ? (
            sortedPatients.map((patient, index) => renderPatientCard(patient, index))
          ) : (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 60
            }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(72, 58, 160, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}>
                <Ionicons name="people-outline" size={40} color="#483AA0" />
              </View>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#6B7280',
                marginBottom: 8
              }}>
                No patients found
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#9CA3AF',
                textAlign: 'center',
                lineHeight: 20
              }}>
                {searchQuery ? 'Try adjusting your search terms' : 'Add your first patient to get started'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <View style={{
          position: 'absolute',
          bottom: 30,
          right: 24,
          zIndex: 1000
        }}>
          <TouchableOpacity
            onPress={handleAddPatient}
            activeOpacity={0.8}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              shadowColor: '#483AA0',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 12
            }}
          >
            <LinearGradient
              colors={['#483AA0', '#6B5CE7', '#8B7ED8']}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 32,
                alignItems: 'center',
                justifyContent: 'center'
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add" size={28} color="#FFFFFF" style={{
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4
              }} />
            </LinearGradient>
          </TouchableOpacity>
          
          {/* FAB Label */}
          <View style={{
            position: 'absolute',
            right: 72,
            top: '50%',
            transform: [{ translateY: -12 }],
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8
          }}>
            <Text style={{
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}>
              New Patient
            </Text>
          </View>
        </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

export default PatientsScreen;
