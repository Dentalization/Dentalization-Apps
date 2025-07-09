import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const PatientDashboard = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText, setSearchText] = useState('');

  // Categories exactly as shown in design
  const categories = [
    { id: 'all', name: 'All', color: '#6366F1' },
    { id: 'neurologic', name: 'Neurologic', color: '#8B5CF6' },
    { id: 'general', name: 'General', color: '#EC4899' },
    { id: 'radio', name: 'Radio', color: '#F59E0B' },
  ];

  // Featured doctor data matching design
  const featuredDoctor = {
    name: 'Dr. Kriss Hemsworth',
    specialty: 'Brain specialist',
    experience: '6 yrs',
    price: '$90',
    status: 'Starts in 30 min',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  };

  // Top doctors data
  const topDoctors = [
    {
      id: 1,
      name: 'Dr. Thomas Mitchell',
      specialty: 'Brain, Spinal Specialist',
      rating: 5.0,
      reviews: '12k reviews',
      experience: '6 yrs',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
    },
    {
      id: 2,
      name: 'Dr. Sarah Johnson', 
      specialty: 'Cardiologist',
      rating: 4.8,
      reviews: '8k reviews',
      experience: '8 yrs',
      image: 'https://images.unsplash.com/photo-1594824694996-cfd0d9f11d8f?w=400&h=400&fit=crop&crop=face',
    },
  ];

  // Cardiologists data
  const cardiologists = [
    {
      id: 1,
      name: 'Dr. Taylor Green',
      specialty: 'Cardiologist',
      price: '$90/hr',
      rating: 4.8,
      reviews: '1.2k',
      available: 'Available Remotely',
      verified: true,
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
    },
    {
      id: 2,
      name: 'Dr. Michael Roberts',
      specialty: 'Cardiologist',
      price: '$85/hr',
      rating: 4.9,
      reviews: '2.1k',
      available: 'Available Today',
      verified: true,
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Purple Gradient Header */}
      <LinearGradient
        colors={['#8B5CF6', '#A855F7']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Profile and Notification */}
        <View style={styles.headerTop}>
          <View style={styles.profileSection}>
            <Image
              source={{
                uri: user?.profile?.profilePicture || 
                     'https://images.unsplash.com/photo-1494790108755-2616b612b830?w=100&h=100&fit=crop&crop=face'
              }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.userName}>
                {user?.profile?.firstName || user?.name || 'Siren.uix'} 👋
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications-none" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctor or anything..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="tune" size={20} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {/* Category Pills */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryPill,
                selectedCategory === category.name && styles.selectedCategoryPill
              ]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category.name && styles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Featured Doctor Card */}
        <View style={styles.featuredContainer}>
          <LinearGradient
            colors={['#6366F1', '#3B82F6']}
            style={styles.featuredCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.featuredContent}>
              <Image 
                source={{ uri: featuredDoctor.image }} 
                style={styles.featuredDoctorImage} 
              />
              <View style={styles.featuredInfo}>
                <Text style={styles.featuredPrice}>{featuredDoctor.price}</Text>
                <Text style={styles.featuredName}>{featuredDoctor.name}</Text>
                <View style={styles.featuredDetails}>
                  <View style={styles.detailRow}>
                    <Icon name="local-hospital" size={12} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.detailText}>{featuredDoctor.specialty}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="access-time" size={12} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.detailText}>{featuredDoctor.experience}</Text>
                  </View>
                </View>
                <View style={styles.statusRow}>
                  <Icon name="access-time" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.statusText}>{featuredDoctor.status}</Text>
                  <Text style={styles.statusIcon}>☁️</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.joinButton}>
              <Icon name="videocam" size={16} color="#6366F1" />
              <Text style={styles.joinButtonText}>Join Call</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Top Rated Doctors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Top Rated Doctors</Text>
              <Text style={styles.sectionSubtitle}>Best physicians in your area</Text>
            </View>
            <TouchableOpacity>
              <Icon name="more-horiz" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          
          {topDoctors.map((doctor) => (
            <TouchableOpacity key={doctor.id} style={styles.doctorCard}>
              <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <View style={styles.doctorSpecialty}>
                  <Icon name="local-hospital" size={14} color="#9CA3AF" />
                  <Text style={styles.specialtyText}>{doctor.specialty}</Text>
                </View>
                <View style={styles.ratingRow}>
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} name="star" size={14} color="#F59E0B" />
                  ))}
                  <Text style={styles.reviewText}>({doctor.reviews})</Text>
                </View>
              </View>
              <View style={styles.doctorActions}>
                <TouchableOpacity style={styles.consultButton}>
                  <Icon name="chat" size={16} color="#6366F1" />
                  <Text style={styles.consultText}>Consult</Text>
                </TouchableOpacity>
                <View style={styles.experienceTag}>
                  <Icon name="access-time" size={12} color="#9CA3AF" />
                  <Text style={styles.experienceText}>{doctor.experience}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* All Cardiologist */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Cardiologist (22)</Text>
            <TouchableOpacity style={styles.sortButton}>
              <Icon name="sort" size={16} color="#6366F1" />
              <Text style={styles.sortText}>Top Cardiologist</Text>
              <Icon name="keyboard-arrow-down" size={16} color="#6366F1" />
            </TouchableOpacity>
          </View>

          {cardiologists.map((doctor) => (
            <TouchableOpacity key={doctor.id} style={styles.cardiologistCard}>
              <Image source={{ uri: doctor.image }} style={styles.cardiologistImage} />
              <View style={styles.cardiologistInfo}>
                <View style={styles.cardiologistHeader}>
                  <Text style={styles.cardiologistName}>{doctor.name}</Text>
                  {doctor.verified && (
                    <Icon name="verified" size={16} color="#6366F1" />
                  )}
                </View>
                <View style={styles.cardiologistSpecialty}>
                  <Icon name="access-time" size={14} color="#9CA3AF" />
                  <Text style={styles.specialtyText}>{doctor.specialty}</Text>
                </View>
                <View style={styles.availabilityRow}>
                  <Icon name="check-circle" size={14} color="#6366F1" />
                  <Text style={styles.availabilityText}>{doctor.available}</Text>
                </View>
                <View style={styles.ratingRow}>
                  {[...Array(4)].map((_, i) => (
                    <Icon key={i} name="star" size={14} color="#F59E0B" />
                  ))}
                  <Icon name="star" size={14} color="#E5E7EB" />
                  <Text style={styles.ratingText}>4.8 {doctor.reviews}</Text>
                </View>
              </View>
              <View style={styles.priceContainer}>
                <Icon name="account-balance-wallet" size={16} color="#333" />
                <Text style={styles.priceText}>{doctor.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoriesContainer: {
    marginBottom: 4,
  },
  categoriesContent: {
    paddingRight: 20,
  },
  categoryPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedCategoryPill: {
    backgroundColor: 'white',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  selectedCategoryText: {
    color: '#6366F1',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  featuredContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
  },
  featuredCard: {
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    minHeight: 160,
  },
  featuredContent: {
    flexDirection: 'row',
    flex: 1,
  },
  featuredDoctorImage: {
    width: 100,
    height: 120,
    borderRadius: 16,
    marginRight: 16,
  },
  featuredInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  featuredPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'right',
    marginBottom: 8,
  },
  featuredName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  featuredDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 6,
    marginRight: 6,
  },
  statusIcon: {
    fontSize: 14,
  },
  joinButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 6,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 14,
    color: '#6366F1',
    marginHorizontal: 4,
    fontWeight: '500',
  },
  doctorCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  doctorSpecialty: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  specialtyText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  doctorActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  consultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  consultText: {
    fontSize: 12,
    color: '#6366F1',
    marginLeft: 4,
    fontWeight: '600',
  },
  experienceTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experienceText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  cardiologistCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardiologistImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  cardiologistInfo: {
    flex: 1,
  },
  cardiologistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardiologistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 6,
  },
  cardiologistSpecialty: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityText: {
    fontSize: 12,
    color: '#6366F1',
    marginLeft: 4,
    fontWeight: '600',
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 4,
  },
});

export default PatientDashboard;
