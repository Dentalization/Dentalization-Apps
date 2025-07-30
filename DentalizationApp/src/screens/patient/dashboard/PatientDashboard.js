import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, Dimensions, Animated, StatusBar, } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { ROUTES } from '../../../constants';

const { width } = Dimensions.get('window');
const PatientDashboard = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = React.useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true, }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true, }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 600, useNativeDriver: true, }),
    ]).start();

    // Set initial position to middle set for infinite scroll
    setTimeout(() => {
      if (scrollViewRef.current) {
        const cardWidth = width - 60;
        scrollViewRef.current.scrollTo({ 
          x: featuredDoctors.length * cardWidth, 
          animated: false 
        });
        setCurrentIndex(0);
      }
    }, 100);
  }, []);

  // Medical categories to match the screenshot
  const categories = [
    { id: 'all', name: 'All', icon: 'check-circle', gradient: ['#667eea', '#764ba2'] },
    { id: 'orthodontic', name: 'Orthodontic', icon: 'straighten', gradient: ['#f093fb', '#f5576c'] },
    { id: 'periodontic', name: 'Periodontic', icon: 'favorite', gradient: ['#4facfe', '#00f2fe'] },
    { id: 'endodontic', name: 'Endodontic', icon: 'healing', gradient: ['#43e97b', '#38f9d7'] },
  ];

  // Featured doctors carousel data
  const featuredDoctors = [
    {
      id: 1,
      name: 'Dr. Kriss Hemsworth',
      specialty: 'Periodontic Specialist',
      experience: '6 yrs',
      rating: 4.9,
      reviews: 234,
      price: 90,
      status: 'Starts in 30 min',
      nextSlot: '2:30 PM',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
      verified: true,
      languages: ['English', 'Spanish'],
      treatments: ['Braces', 'Invisalign', 'Retainers'],
    },
    {
      id: 2,
      name: 'Dr. Amanda Hemsworth',
      specialty: 'Orthodontic Specialist',
      experience: '8 years',
      rating: 4.9,
      reviews: 234,
      price: 120,
      status: 'Available Now',
      nextSlot: '2:30 PM',
      image: 'https://images.unsplash.com/photo-1594824846003-5cee7a0e0f85?w=400&h=400&fit=crop&crop=face',
      verified: true,
      languages: ['English', 'Spanish'],
      treatments: ['Braces', 'Invisalign', 'Retainers'],
    },
    {
      id: 3,
      name: 'Dr. Sarah Mitchell',
      specialty: 'Pediatric Dentist',
      experience: '5 years',
      rating: 4.8,
      reviews: 189,
      price: 100,
      status: 'Available Today',
      nextSlot: '4:15 PM',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
      verified: true,
      languages: ['English'],
      treatments: ['Kids Dental', 'Cleaning', 'Fluoride'],
    },
  ];

  // Enhanced top doctors data
  const topDoctors = [
    {
      id: 1,
      name: 'Dr. Thomas Mitchell',
      specialty: 'Orthodontic Specialist',
      rating: 5.0,
      reviews: 412,
      experience: '10 years',
      price: 150,
      available: true,
      nextSlot: '3:00 PM',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
      verified: true,
      distance: '2.5 km',
    },
    {
      id: 2,
      name: 'Dr. Sarah Johnson',
      specialty: 'Pediatric Dentist',
      rating: 4.8,
      reviews: 328,
      experience: '7 years',
      price: 100,
      available: true,
      nextSlot: '4:15 PM',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
      verified: true,
      distance: '1.8 km',
    },
  ];

  // Enhanced dental specialists
  const dentists = [
    {
      id: 1,
      name: 'Dr. Taylor Green',
      specialty: 'Oral Surgeon',
      price: 200,
      rating: 4.9,
      reviews: 156,
      available: 'Available Remotely',
      nextSlot: '5:00 PM',
      verified: true,
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
      experience: '12 years',
      treatments: ['Wisdom Teeth', 'Implants', 'Extractions'],
    },
    {
      id: 2,
      name: 'Dr. Michael Roberts',
      specialty: 'Periodontist',
      price: 180,
      rating: 4.7,
      reviews: 203,
      available: 'Available Today',
      nextSlot: '6:30 PM',
      verified: true,
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
      experience: '9 years',
      treatments: ['Gum Disease', 'Deep Cleaning', 'Gum Surgery'],
    },
  ];

  const handleCategoryPress = (categoryName) => {
    setSelectedCategory(categoryName);
    // Add haptic feedback here if needed
  };

  // Handle scroll for glassmorphism effect
  const handleMainScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsScrolled(offsetY > 50);
      },
    }
  );

  // Handle scroll for infinite loop with better calculation
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
         const contentOffset = event.nativeEvent.contentOffset;
         const cardWidth = width - 60; // Consistent with snapToInterval
         const pageNum = Math.round(contentOffset.x / cardWidth);
         const actualIndex = pageNum % featuredDoctors.length;
         setCurrentIndex(actualIndex < 0 ? featuredDoctors.length + actualIndex : actualIndex);
       },
    }
  );

  const onMomentumScrollEnd = (event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const cardWidth = width - 60;
    const pageNum = Math.round(contentOffset.x / cardWidth);
    
    // Create infinite loop effect with consistent positioning
    // Always reset to middle section to maintain consistency
    if (pageNum >= featuredDoctors.length * 2) {
      const targetIndex = pageNum % featuredDoctors.length;
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({ 
          x: (featuredDoctors.length + targetIndex) * cardWidth, 
          animated: false 
        });
      });
    } else if (pageNum < featuredDoctors.length) {
      const targetIndex = pageNum < 0 ? 0 : pageNum;
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({ 
          x: (featuredDoctors.length + targetIndex) * cardWidth, 
          animated: false 
        });
      });
    }
  };

  // Create infinite data array for smooth infinite scrolling
  // Always start from the first doctor to ensure consistency
  const infiniteDoctors = [...featuredDoctors, ...featuredDoctors, ...featuredDoctors];
  
  // Ensure we always start from the middle section for consistent infinite scrolling
  useEffect(() => {
    if (scrollViewRef.current) {
      const cardWidth = width - 60;
      // Start from the middle section (second copy) to allow smooth infinite scrolling
      const initialPosition = featuredDoctors.length * cardWidth;
      // Reset currentIndex to 0 for consistency
      setCurrentIndex(0);
      setTimeout(() => {
        scrollViewRef.current.scrollTo({ x: initialPosition, animated: false });
      }, 100);
    }
  }, []);

  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    console.log('🔍 Dashboard - Calculating completion for user:', JSON.stringify(user, null, 2));
    
    if (!user?.profile) {
      console.log('🔍 Dashboard - No profile data found');
      return 0;
    }
    
    const requiredFields = [
      'firstName', 'lastName', 'phone', 'address', 'dateOfBirth',
      'emergencyContactName', 'emergencyContactPhone'
    ];
    
    let completed = 0;
    console.log('🔍 Dashboard - Checking required fields:');
    requiredFields.forEach(field => {
      let value = user.profile[field];
      
      // Handle emergencyContact parsing
      if (field === 'emergencyContactName' || field === 'emergencyContactPhone') {
        if (user.profile.emergencyContact) {
          try {
            const emergencyContact = typeof user.profile.emergencyContact === 'string' 
              ? JSON.parse(user.profile.emergencyContact) 
              : user.profile.emergencyContact;
            
            if (field === 'emergencyContactName') {
              value = emergencyContact?.name;
            } else if (field === 'emergencyContactPhone') {
              value = emergencyContact?.phone;
            }
          } catch {
            // Fallback: try to parse old format "Name - Phone"
            if (typeof user.profile.emergencyContact === 'string' && user.profile.emergencyContact.includes(' - ')) {
              const parts = user.profile.emergencyContact.split(' - ');
              if (field === 'emergencyContactName') {
                value = parts[0];
              } else if (field === 'emergencyContactPhone') {
                value = parts[1];
              }
            }
          }
        }
      }
      
      // Clean up null/undefined string values
      if (value === 'null' || value === 'undefined' || value === null || value === undefined) {
        value = '';
      }
      
      const hasValue = value && value.toString().trim() !== '';
      console.log(`  ${field}: "${value}" -> ${hasValue ? 'COMPLETE' : 'MISSING'}`);
      if (hasValue) {
        completed += 1;
      }
    });
    
    const percentage = Math.round((completed / requiredFields.length) * 100);
    console.log(`🔍 Dashboard - Completion: ${completed}/${requiredFields.length} = ${percentage}%`);
    
    return percentage;
  };

  const isProfileComplete = user?.profileComplete || user?.profile?.profileComplete;
  const completionPercentage = calculateProfileCompletion();
  
  console.log('🔍 Dashboard - isProfileComplete:', isProfileComplete);
  console.log('🔍 Dashboard - completionPercentage:', completionPercentage);

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#F8FAFC',
    }}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Enhanced Gradient Header with Glassmorphism */}
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
            ['rgba(139, 92, 246, 0.75)', 'rgba(102, 126, 234, 0.75)'] : 
            ['#8B5CF6', '#667eea']
          }
          style={{
            paddingTop: 70,
            paddingHorizontal: 20,
            paddingBottom: 10,
            borderBottomLeftRadius: isScrolled ? 0 : 30,
            borderBottomRightRadius: isScrolled ? 0 : 30,
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
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
            }} />
          )}
          {/* Profile Section */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 25 }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, overflow: 'hidden', marginRight: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' }}>
              <Image
                source={{
                  uri: user?.profile?.profilePicture ||
                  'https://images.unsplash.com/photo-1494790108755-2616b612b830?w=100&h=100&fit=crop&crop=face'
                }}
                style={{ width: 46, height: 46 }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 2 }}>Welcome Back</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
                {user?.profile?.firstName || user?.name || 'Siren.uix'} 👋
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
              style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}
            >
              <Icon name="notifications-none" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={{ flexDirection: 'row', marginBottom: 20, alignItems: 'center' }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 25, paddingHorizontal: 18, paddingVertical: 12, marginRight: 12 }}>
              <Icon name="search" size={20} color="#9CA3AF" />
              <TextInput 
                style={{ flex: 1, fontSize: 14, color: '#333', marginLeft: 12 }}
                placeholder="Search doctor or anything..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <TouchableOpacity style={{ width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 22, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="tune-variant" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Category Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategoryPress(category.name)}
                style={{ marginRight: 12 }}
                activeOpacity={0.8}
              >
                <View style={{ backgroundColor: selectedCategory === category.name ? 'white' : 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', borderWidth: selectedCategory === category.name ? 0 : 1, borderColor: 'rgba(255,255,255,0.3)' }}>
                  <Icon name={category.icon} size={16} color={selectedCategory === category.name ? '#667eea' : 'white'} style={{ marginRight: category.name !== 'All' ? 6 : 0 }} />
                  {category.name !== 'All' && (
                    <Text style={{ fontSize: 14, fontWeight: '600', color: selectedCategory === category.name ? '#667eea' : 'white' }}>
                      {category.name}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>
      </Animated.View>
      
      {/* Enhanced Scrollable Content */}
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.ScrollView 
          style={{
            flex: 1,
            backgroundColor: '#F8FAFC',
            opacity: fadeAnim,
          }} 
          showsVerticalScrollIndicator={false}
          bounces={true}
          onScroll={handleMainScroll}
          scrollEventThrottle={16}
        >
          
          {/* Profile Completion Banner */}
          {!isProfileComplete && (
            <View style={{ marginHorizontal: 20, marginTop: 20, marginBottom: 15 }}>
              <TouchableOpacity 
                onPress={() => navigation.navigate('PatientProfileSetup')}
                style={{ 
                  backgroundColor: 'white',
                  borderRadius: 15,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                  borderLeftWidth: 4,
                  borderLeftColor: completionPercentage >= 50 ? '#F59E0B' : '#EF4444'
                }}
              >
                <View style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 20, 
                  backgroundColor: completionPercentage >= 50 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <MaterialCommunityIcons 
                    name={completionPercentage >= 50 ? 'account-clock' : 'account-alert'} 
                    size={20} 
                    color={completionPercentage >= 50 ? '#F59E0B' : '#EF4444'} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 2 }}>
                    {completionPercentage >= 50 ? 'Profil Hampir Selesai!' : 'Lengkapi Profil Anda'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>
                    {completionPercentage}% selesai • Tap untuk melengkapi data profil
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Enhanced Featured Doctor Cards Carousel */}
          <View style={{ marginTop: 25, marginBottom: 30, paddingTop: 180 }}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled={false}
              decelerationRate={0.98}
              snapToInterval={width - 60}
              snapToAlignment="start"
              contentContainerStyle={{ paddingHorizontal: 10 }}
              disableIntervalMomentum={true}
              onScroll={handleScroll}
              onMomentumScrollEnd={onMomentumScrollEnd}
              scrollEventThrottle={1}
              bounces={false}
            >
              {infiniteDoctors.map((doctor, index) => {
                const cardWidth = width - 60; // Match snapToInterval
                const inputRange = [
                  (index - 1) * cardWidth,
                  index * cardWidth,
                  (index + 1) * cardWidth,
                ];
                
                return (
                  <Animated.View 
                    key={`${doctor.id}-${Math.floor(index / featuredDoctors.length)}`}
                    style={{ 
                      width: width - 80, 
                      marginHorizontal: 10,
                      transform: [
                        {
                          scale: scrollX.interpolate({
                            inputRange,
                            outputRange: [0.85, 1, 0.85],
                            extrapolate: 'clamp',
                          }),
                        },
                        {
                          translateY: scrollX.interpolate({
                            inputRange,
                            outputRange: [20, 0, 20],
                            extrapolate: 'clamp',
                          }),
                        },
                      ],
                      opacity: scrollX.interpolate({
                        inputRange,
                        outputRange: [0.6, 1, 0.6],
                        extrapolate: 'clamp',
                      }),
                    }}
                  >
                  <LinearGradient
                     colors={['#667eea', '#764ba2']}
                     style={{ 
                       borderRadius: 25, 
                       padding: 0, 
                       overflow: 'hidden', 
                       shadowColor: '#667eea', 
                       shadowOffset: { width: 0, height: 12 }, 
                       shadowOpacity: 0.3, 
                       shadowRadius: 20, 
                       elevation: 15,
                       height: 220
                     }}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                   >
                     <View style={{ padding: 25, position: 'relative', flex: 1, justifyContent: 'space-between' }}>
                      {/* Floating elements for visual appeal */}
                      <View style={{ position: 'absolute', top: -10, right: -10, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                      <View style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)' }} />
                      
                      {/* Doctor Info Section */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, overflow: 'hidden', borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 }}>
                          <Image source={{ uri: doctor.image }} style={{ width: 74, height: 74 }} />
                        </View>
                        
                        <View style={{ flex: 1, marginLeft: 20 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                             <Text 
                               style={{ 
                                 fontSize: 20, 
                                 fontWeight: 'bold', 
                                 color: 'white', 
                                 flex: 1, 
                                 textShadowColor: 'rgba(0,0,0,0.1)', 
                                 textShadowOffset: { width: 0, height: 1 }, 
                                 textShadowRadius: 2,
                                 marginRight: 10
                               }}
                               numberOfLines={1}
                               ellipsizeMode="tail"
                             >
                               {doctor.name}
                             </Text>
                             <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white', textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>${doctor.price}</Text>
                           </View>
                          
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                             <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15, marginBottom: 4 }}>
                               <MaterialCommunityIcons name="brain" size={14} color="rgba(255,255,255,0.9)" />
                               <Text 
                                 style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', marginLeft: 6, fontWeight: '500' }}
                                 numberOfLines={1}
                                 ellipsizeMode="tail"
                               >
                                 {doctor.specialty}
                               </Text>
                             </View>
                             <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                               <MaterialCommunityIcons name="clock-outline" size={14} color="rgba(255,255,255,0.9)" />
                               <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', marginLeft: 4 }}>{doctor.experience}</Text>
                             </View>
                           </View>
                          
                          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 8 }}>
                             <MaterialCommunityIcons name="clock-outline" size={14} color="white" />
                             <Text style={{ fontSize: 13, color: 'white', marginLeft: 6, fontWeight: '500' }}>{doctor.status}</Text>
                             <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF6B6B', marginLeft: 8 }} />
                           </View>
                        </View>
                      </View>
                      
                      {/* Action button */}
                       <TouchableOpacity style={{ backgroundColor: 'white', borderRadius: 25, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 }}>
                         <MaterialCommunityIcons name="video" size={18} color="#667eea" />
                         <Text style={{ color: '#667eea', fontWeight: 'bold', marginLeft: 8, fontSize: 15 }}>Join Call</Text>
                       </TouchableOpacity>
                    </View>
                  </LinearGradient>
                  </Animated.View>
                );
              })}
            </ScrollView>
            
            {/* Pagination Dots */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 15 }}>
              {featuredDoctors.map((_, index) => (
                <View 
                  key={index} 
                  style={{ 
                    width: index === currentIndex ? 20 : 8, 
                    height: 8, 
                    borderRadius: 4, 
                    backgroundColor: index === currentIndex ? '#667eea' : '#E5E7EB', 
                    marginHorizontal: 3,
                    transition: 'all 0.3s ease'
                  }} 
                />
              ))}
            </View>
          </View>

          {/* Enhanced Top Rated Doctors */}
          <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 6 }}>Top Rated Doctors</Text>
                <Text style={{ fontSize: 16, color: '#6B7280', fontWeight: '500' }}>Best dental specialists near you</Text>
              </View>
              <TouchableOpacity style={{ backgroundColor: '#F3F4F6', borderRadius: 12, padding: 8 }}>
                <Icon name="more-horiz" size={24} color="#667eea" />
              </TouchableOpacity>
            </View>

            {topDoctors.map((doctor, index) => (
              <Animated.View key={doctor.id} style={{ transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [50 * (index + 1), 0] }) }], opacity: fadeAnim }}>
                <TouchableOpacity style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#667eea', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 8, borderWidth: 1, borderColor: 'rgba(102, 126, 234, 0.1)' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, }}>
                    <View style={{ width: 70, height: 70, borderRadius: 35, overflow: 'hidden', borderWidth: 3, borderColor: '#667eea', shadowColor: '#667eea', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}>
                      <Image source={{ uri: doctor.image }} style={{ width: 64, height: 64 }} />
                    </View>
                    
                    <View style={{ flex: 1, marginLeft: 15 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', flex: 1 }}>
                          {doctor.name}
                        </Text>
                      </View>
                      
                     <Text style={{ fontSize: 15, color: '#667eea', marginBottom: 8, fontWeight: '600' }}>
                     {doctor.specialty}
                   </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {[...Array(5)].map((_, i) => (
                          <Icon 
                            key={i} 
                            name="star" 
                            size={16} 
                            color={i < Math.floor(doctor.rating) ? "#FFD700" : "#E5E7EB"} 
                          />
                        ))}
                        <Text style={{ fontSize: 14, color: '#6B7280', marginLeft: 8, fontWeight: '500' }}>
                          {doctor.rating} ({doctor.reviews})
                        </Text>

                      </View>
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="map-marker" size={14} color="#9CA3AF" />
                        <Text style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 4 }}>{doctor.distance}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                  <View>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937' }}>${doctor.price}</Text>
                    <Text style={{ fontSize: 12, color: '#9CA3AF' }}>Next: {doctor.nextSlot}</Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={{ backgroundColor: '#F3F4F6', borderRadius: 15, paddingHorizontal: 16, paddingVertical: 10, marginRight: 10 }}>
                      <MaterialCommunityIcons name="message-text" size={18} color="#667eea" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={{ backgroundColor: '#667eea', borderRadius: 15, paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#667eea', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}>
                      <MaterialCommunityIcons name="calendar-check" size={16} color="white" />
                      <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 14 }}>Book</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Enhanced Specialists Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937' }}>All Orthodontist (22)</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
              <MaterialCommunityIcons name="sort" size={16} color="#667eea" />
              <Text style={{ fontSize: 14, color: '#667eea', marginHorizontal: 8, fontWeight: '600' }}>Sort</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color="#667eea" />
            </TouchableOpacity>
          </View>

          {dentists.map((doctor, index) => (
            <Animated.View key={doctor.id} style={{ transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30 * (index + 1), 0] }) }], opacity: fadeAnim }}>
              <TouchableOpacity style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#667eea', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 6, borderWidth: 1, borderColor: 'rgba(102, 126, 234, 0.1)' }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ width: 65, height: 65, borderRadius: 32.5, overflow: 'hidden', borderWidth: 2, borderColor: '#667eea', marginRight: 15 }}>
                    <Image source={{ uri: doctor.image }} style={{ width: 61, height: 61 }} />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', flex: 1 }}>{doctor.name}</Text>
                      {doctor.verified && (
                        <Icon name="verified" size={18} color="#4ECDC4" />
                      )}
                    </View>
                    
                    <Text style={{ fontSize: 15, color: '#667eea', marginBottom: 10, fontWeight: '600' }}>{doctor.specialty}</Text>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <MaterialCommunityIcons name="check-circle" size={14} color="#4ECDC4" />
                      <Text style={{ fontSize: 13, color: '#4ECDC4', marginLeft: 6, fontWeight: '600' }}>{doctor.available}</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      {[...Array(5)].map((_, i) => (
                        <Icon 
                          key={i} 
                          name="star" 
                          size={14} 
                          color={i < Math.floor(doctor.rating) ? "#FFD700" : "#E5E7EB"} 
                        />
                      ))}
                      <Text style={{ fontSize: 13, color: '#6B7280', marginLeft: 6 }}>
                        {doctor.rating} ({doctor.reviews} reviews)
                      </Text>
                    </View>
                    
                    {/* Treatment specialties */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }}>
                      {doctor.treatments.slice(0, 2).map((treatment, idx) => (
                        <View key={idx} style={{ backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6, marginBottom: 4 }}>
                          <Text style={{ fontSize: 11, color: '#667eea', fontWeight: '500' }}>{treatment}</Text>
                        </View>
                      ))}
                    </View>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text style={{
                          fontSize: 20,
                          fontWeight: 'bold',
                          color: '#1F2937',
                        }}>${doctor.price}</Text>
                        <Text style={{
                          fontSize: 12,
                          color: '#9CA3AF',
                        }}>Next: {doctor.nextSlot}</Text>
                      </View>
                      
                      <TouchableOpacity style={{ backgroundColor: '#667eea', borderRadius: 15, paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#667eea', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}>
                        <MaterialCommunityIcons name="calendar-plus" size={16} color="white" />
                        <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 14 }}>Book Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default PatientDashboard;