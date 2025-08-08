import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  Animated
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../../components/common/ThemeProvider';
import Button from '../../../components/common/Button';
import { updateUser } from '../../../store/slices/authSlice';
import profileService from '../../../services/profileService';

const { width, height } = Dimensions.get('window');

const ProfessionalDetails = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isScrolled, setIsScrolled] = useState(false);
  const [documents, setDocuments] = useState({
    educationDegree: [], // Ijazah dan Gelar Pendidikan (S1 Wajib, S2, S3)
    skdg: [], // SKDG (Sertifikat Kompetensi Dokter Gigi)
    str: [], // STR (Surat Tanda Registrasi)
    sip: [], // SIP (Surat Izin Praktik)
    additionalCerts: [] // Sertifikat Tambahan (Pelatihan, Workshop, dll)
  });

  // Load existing documents from user profile
  useEffect(() => {
    if (user?.profile) {
      console.log('🔍 Loading existing documents from profile:', user.profile);
      // Filter out null values from existing documents
      const filterNulls = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.filter(item => item !== null && item !== undefined);
      };
      
      setDocuments({
        educationDegree: filterNulls(user.profile.educationDegree),
        skdg: filterNulls(user.profile.skdg),
        str: filterNulls(user.profile.str),
        sip: filterNulls(user.profile.sip),
        additionalCerts: filterNulls(user.profile.additionalCerts)
      });
    }
  }, [user]);

  useEffect(() => {
    console.log('Current documents state:', documents);
  }, [documents]);

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

  const openDocumentPicker = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: true // Allow multiple file selection
      });
      
      if (!result.canceled && result.assets) {
        // Validate each file
        const validFiles = [];
        for (const document of result.assets) {
          // Validate file size (max 10MB per file)
          if (document.size > 10 * 1024 * 1024) {
            Alert.alert('Error', `File ${document.name} is too large. Maximum size is 10MB.`);
            continue;
          }
          
          // Validate file type
          if (!document.name.toLowerCase().endsWith('.pdf')) {
            Alert.alert('Error', `File ${document.name} is not a PDF. Only PDF files are allowed.`);
            continue;
          }
          
          validFiles.push(document);
        }
        
        if (validFiles.length > 0) {
          setDocuments(prev => ({
            ...prev,
            [type]: [...prev[type], ...validFiles]
          }));
        }
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to select documents. Please try again.');
    }
  };

  const removeDocument = (type, index) => {
    setDocuments(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const uploadDocuments = async () => {
    const uploadedUrls = {
      educationDegree: [],
      skdg: [],
      str: [],
      sip: [],
      additionalCerts: []
    };

    // Process each document type
    for (const [type, docs] of Object.entries(documents)) {
      for (const doc of docs) {
        // Only upload new documents (those with uri property)
        if (doc.uri) {
          try {
            console.log(`📤 Uploading ${type}: ${doc.name}`);
            
            // Map document types to backend expected values
            const documentTypeMap = {
              educationDegree: 'education_degree',
              skdg: 'skdg',
              str: 'str',
              sip: 'sip',
              additionalCerts: 'certificate'
            };
            
            const response = await profileService.uploadDocument(
              doc.uri, 
              documentTypeMap[type], 
              user.id
            );
            
            if (response.success) {
              const documentUrl = response.data?.url || response.data?.data?.url;
              console.log(`✅ ${type} uploaded: ${documentUrl}`);
              if (documentUrl) {
                uploadedUrls[type].push(documentUrl);
              }
            } else {
              console.error(`❌ Failed to upload ${type}:`, response.message);
              Alert.alert('Upload Error', `Failed to upload ${doc.name}: ${response.message}`);
            }
          } catch (error) {
            console.error(`❌ Upload error for ${type}:`, error);
            Alert.alert('Upload Error', `Failed to upload ${doc.name}. Please try again.`);
          }
        } else {
          // For existing documents, keep the existing URL
          if (typeof doc === 'string') {
            uploadedUrls[type].push(doc);
          } else if (doc.url) {
            uploadedUrls[type].push(doc.url);
          }
        }
      }
    }

    console.log('📋 All uploaded URLs:', uploadedUrls);
    return uploadedUrls;
  };

  const handleSaveDocuments = async () => {
    try {
      setIsSubmitting(true);
      
      // Upload all documents and get URLs
      const uploadedUrls = await uploadDocuments();
      
      // Prepare profile data with uploaded document URLs
      const profileData = {
        ...uploadedUrls
      };
      
      console.log('📤 Updating profile with documents:', profileData);
      console.log('📤 Profile data JSON:', JSON.stringify(profileData, null, 2));
      
      // Update profile with document URLs
      const response = await profileService.updateProfile(profileData);
      console.log('📥 Update profile response:', response);
      
      if (response.success) {
        // Update Redux store
        dispatch(updateUser({
          ...user,
          profile: {
            ...user.profile,
            ...profileData
          }
        }));
        
        Alert.alert('Success', 'Professional documents saved successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.message || 'Failed to save documents');
      }
    } catch (error) {
      console.error('Save documents error:', error);
      Alert.alert('Error', error.message || 'Failed to save documents. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDocumentSection = (type, title, description, icon) => {
    const docs = documents[type] || [];
    
    return (
      <View style={[
        styles.sectionContainer,
        {
          backgroundColor: theme.colors.surface || 'rgba(255, 255, 255, 0.95)',
          borderColor: theme.colors.border || 'rgba(0, 0, 0, 0.05)',
          borderWidth: 1
        }
      ]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <MaterialCommunityIcons 
              name={icon} 
              size={20} 
              color={theme.colors.primary} 
            />
          </View>
          <View style={styles.sectionTitleContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {title}
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
              {description}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.uploadButton, 
            { 
              backgroundColor: theme.colors.primary + '15',
              borderWidth: 2,
              borderColor: theme.colors.primary + '40',
              borderStyle: 'dashed'
            }
          ]}
          onPress={() => openDocumentPicker(type)}
        >
          <Icon name="cloud-upload" size={24} color={theme.colors.primary} />
          <Text style={[styles.uploadButtonText, { color: theme.colors.primary }]}>
            Upload Documents
          </Text>
        </TouchableOpacity>
        
        {docs.length > 0 && (
          <View style={styles.documentsContainer}>
            {docs.map((doc, index) => (
              <View key={index} style={[
                styles.documentCard, 
                { 
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border || 'rgba(0, 0, 0, 0.08)'
                }
              ]}>
                <View style={styles.documentInfo}>
                  <Icon name="picture-as-pdf" size={24} color="#e53e3e" />
                  <View style={styles.documentText}>
                    <Text style={[styles.documentName, { color: theme.colors.text }]}>
                      {doc.name || `Document ${index + 1}`}
                    </Text>
                    <Text style={[styles.documentStatus, { color: theme.colors.textSecondary }]}>
                      {doc.uri ? 'Ready to upload' : 'Uploaded'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeDocument(type, index)}
                >
                  <Icon name="close" size={20} color="#e53e3e" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
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
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
          )}
          
          {/* Header Content */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                style={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: 22, 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  marginRight: 15 
                }}
              >
                <MaterialIcons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 4 }}>
                  Professional Documents
                </Text>
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                  Upload your professional documents to verify your credentials and complete your profile.
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
      
      <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 160 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
        <View style={styles.contentContainer}>
          
          {renderDocumentSection(
            'educationDegree',
            'Education Degree',
            'Upload your dental degree certificates (S1 required, S2, S3 optional)',
            'school'
          )}
          
          {renderDocumentSection(
            'skdg',
            'SKDG Certificate',
            'Sertifikat Kompetensi Dokter Gigi',
            'certificate'
          )}
          
          {renderDocumentSection(
            'str',
            'STR Certificate',
            'Surat Tanda Registrasi',
            'card-account-details'
          )}
          
          {renderDocumentSection(
            'sip',
            'SIP Certificate',
            'Surat Izin Praktik',
            'license'
          )}
          
          {renderDocumentSection(
            'additionalCerts',
            'Additional Certificates',
            'Training certificates, workshops, and other professional development',
            'trophy'
          )}
        </View>
      </ScrollView>
      
      <View style={[
        styles.submitContainer, 
        { 
          backgroundColor: theme.colors.surface || 'rgba(255, 255, 255, 0.95)',
          borderTopColor: theme.colors.border || 'rgba(0, 0, 0, 0.1)'
        }
      ]}>
        <Button
          title={isSubmitting ? 'Saving...' : 'Save Documents'}
          onPress={handleSaveDocuments}
          disabled={isSubmitting}
          style={[
            styles.submitButton,
            {
              backgroundColor: theme.colors.primary,
            }
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 100,
    backgroundColor: '#F8F9FF',
  },
  sectionContainer: {
    marginBottom: 32,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    minHeight: 56,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  documentsContainer: {
    gap: 12,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentText: {
    marginLeft: 16,
    flex: 1,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  documentStatus: {
    fontSize: 13,
    opacity: 0.7,
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(229, 62, 62, 0.1)',
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButton: {
    borderRadius: 12,
    minHeight: 52,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});

export default ProfessionalDetails;