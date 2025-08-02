import React, { useState, useRef, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Image, TextInput, StatusBar, Alert, Modal, Dimensions, KeyboardAvoidingView, Platform, } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

const ChatScreen = ({ navigation, route }) => {
  console.log('ChatScreen route params:', route.params);
  
  const { doctorId, doctorName, specialty, avatar, isOnline, verified } = route.params || {};
  
  // Fallback values in case params are missing
  const safeParams = {
    doctorId: doctorId || 1,
    doctorName: doctorName || 'Dr. Unknown',
    specialty: specialty || 'General Dentist',
    avatar: avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    isOnline: isOnline || false,
    verified: verified || false
  };
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! Thank you for booking an appointment with me. How can I help you today?',
      sender: 'doctor',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
    },
    {
      id: '2',
      text: 'Hi Dr. Mitchell! I have some concerns about my dental health after my last cleaning.',
      sender: 'patient',
      timestamp: new Date(Date.now() - 3500000),
      type: 'text',
    },
    {
      id: '3',
      text: 'I understand your concern. Could you please describe the specific issues you\'re experiencing?',
      sender: 'doctor',
      timestamp: new Date(Date.now() - 3400000),
      type: 'text',
    },
    {
      id: '4',
      text: 'My gums have been bleeding when I brush my teeth, and I notice some sensitivity.',
      sender: 'patient',
      timestamp: new Date(Date.now() - 3300000),
      type: 'text',
    },
    {
      id: '5',
      text: 'Thank you for sharing that information. Could you please take a clear photo of your gums so I can assess the situation better?',
      sender: 'doctor',
      timestamp: new Date(Date.now() - 3200000),
      type: 'request',
      requestType: 'photo',
    },
    {
      id: '6',
      text: '',
      sender: 'patient',
      timestamp: new Date(Date.now() - 3100000),
      type: 'image',
      imageUri: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&h=300&fit=crop',
      caption: 'Here\'s the photo of my gums as requested',
    },
    {
      id: '7',
      text: 'Thank you for the photo. I can see some mild inflammation. Here\'s your treatment summary:',
      sender: 'doctor',
      timestamp: new Date(Date.now() - 3000000),
      type: 'summary',
      summary: {
        title: 'Gum Inflammation Assessment',
        diagnosis: 'Mild Gingivitis',
        recommendations: [
          'Use soft-bristled toothbrush',
          'Rinse with prescribed mouthwash twice daily',
          'Schedule follow-up in 2 weeks'
        ],
        prescriptions: [
          {
            medication: 'Antibacterial Mouthwash',
            dosage: 'Twice daily for 14 days',
            instructions: 'Rinse for 30 seconds after brushing'
          }
        ]
      }
    },
    {
      id: '8',
      text: 'Your next appointment is scheduled for next Tuesday at 2:00 PM. Please bring the X-rays from your previous dentist.',
      sender: 'doctor',
      timestamp: new Date(Date.now() - 2900000),
      type: 'appointment',
      appointment: {
        date: 'Tuesday, July 15, 2025',
        time: '2:00 PM',
        duration: '45 minutes',
        type: 'Follow-up Consultation',
        location: 'Dentalization Clinic - Room 203',
        preparations: ['Bring previous X-rays', 'Avoid eating 2 hours before']
      }
    }
  ]);
  
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Simulate doctor typing
    const typingTimeout = setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }, 1000);

    return () => clearTimeout(typingTimeout);
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'patient',
        timestamp: new Date(),
        type: 'text',
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const newMessage = {
          id: Date.now().toString(),
          text: '',
          sender: 'patient',
          timestamp: new Date(),
          type: 'image',
          imageUri: result.assets[0].uri,
          caption: 'Photo shared',
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const newMessage = {
          id: Date.now().toString(),
          text: '',
          sender: 'patient',
          timestamp: new Date(),
          type: 'image',
          imageUri: result.assets[0].uri,
          caption: 'Photo taken',
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to share a photo',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const renderMessage = ({ item, index }) => {
    const isPatient = item.sender === 'patient';
    const showAvatar = !isPatient && (index === 0 || messages[index - 1]?.sender !== item.sender);
    
    return (
      <View style={[{ marginVertical: 2, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'flex-end' }, isPatient && { flexDirection: 'row-reverse' }]}>
        {!isPatient && showAvatar && (
          <Image source={{ uri: safeParams.avatar }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10, alignSelf: 'flex-end' }} />
        )}
        
        <View style={[
          { maxWidth: '75%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, marginHorizontal: 4 },
          isPatient ? { backgroundColor: '#8B5CF6', borderBottomRightRadius: 4 } : { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
          !isPatient && !showAvatar && { marginLeft: 42 }
        ]}>
          {item.type === 'text' && (
            <Text style={[
              { fontSize: 16, lineHeight: 20 },
              isPatient ? { color: 'white' } : { color: '#1F2937' }
            ]}>
              {item.text}
            </Text>
          )}
          
          {item.type === 'request' && (
            <View style={{ backgroundColor: '#FEF3C7', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#F59E0B' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MaterialCommunityIcons name="camera" size={20} color="#F59E0B" />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#92400E', marginLeft: 8 }}>Photo Request</Text>
              </View>
              <Text style={{ fontSize: 14, color: '#92400E', marginBottom: 12 }}>{item.text}</Text>
              <View style={{ alignItems: 'flex-start' }}>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B5CF6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }} onPress={showImageOptions}>
                  <MaterialCommunityIcons name="camera-plus" size={16} color="white" />
                  <Text style={{ color: 'white', fontWeight: '600', marginLeft: 6 }}>Share Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {item.type === 'image' && item.imageUri && (
            <View style={{ overflow: 'hidden' }}>
              <TouchableOpacity onPress={() => {
                if (item.imageUri) {
                  setSelectedImage(item.imageUri);
                  setShowImageModal(true);
                }
              }}>
                <Image source={{ uri: item.imageUri }} style={{ width: 200, height: 200, borderRadius: 12, resizeMode: 'cover' }} />
              </TouchableOpacity>
              {item.caption && (
                <Text style={{ fontSize: 14, color: isPatient ? 'rgba(255,255,255,0.9)' : '#6B7280', marginTop: 8 }}>{item.caption}</Text>
              )}
            </View>
          )}
          
          {item.type === 'summary' && (
            <View style={{ backgroundColor: '#F0FDF4', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#10B981' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <MaterialCommunityIcons name="file-document" size={20} color="#10B981" />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#065F46', marginLeft: 8 }}>{item.summary.title}</Text>
              </View>
              
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#065F46', marginBottom: 4 }}>Diagnosis:</Text>
                <Text style={{ fontSize: 14, color: '#064E3B', marginBottom: 12 }}>{item.summary.diagnosis}</Text>
                
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#065F46', marginBottom: 4 }}>Recommendations:</Text>
                {item.summary.recommendations.map((rec, idx) => (
                  <Text key={idx} style={{ fontSize: 14, color: '#064E3B', marginBottom: 2 }}>• {rec}</Text>
                ))}
                
                {item.summary.prescriptions && (
                  <>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#065F46', marginBottom: 4, marginTop: 12 }}>Prescriptions:</Text>
                    {item.summary.prescriptions.map((presc, idx) => (
                      <View key={idx} style={{ backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#D1FAE5' }}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#065F46' }}>{presc.medication}</Text>
                        <Text style={{ fontSize: 13, color: '#047857', marginTop: 2 }}>{presc.dosage}</Text>
                        <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, fontStyle: 'italic' }}>{presc.instructions}</Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            </View>
          )}
          
          {item.type === 'appointment' && (
            <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#8B5CF6' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <MaterialCommunityIcons name="calendar-check" size={20} color="#8B5CF6" />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#5B21B6', marginLeft: 8 }}>Appointment Scheduled</Text>
              </View>
              
              <View style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="event" size={16} color="#6B7280" />
                  <Text style={{ fontSize: 14, color: '#374151', marginLeft: 8 }}>{item.appointment.date}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="access-time" size={16} color="#6B7280" />
                  <Text style={{ fontSize: 14, color: '#374151', marginLeft: 8 }}>{item.appointment.time} ({item.appointment.duration})</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="local-hospital" size={16} color="#6B7280" />
                  <Text style={{ fontSize: 14, color: '#374151', marginLeft: 8 }}>{item.appointment.type}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="location-on" size={16} color="#6B7280" />
                  <Text style={{ fontSize: 14, color: '#374151', marginLeft: 8 }}>{item.appointment.location}</Text>
                </View>
                
                {item.appointment.preparations && (
                  <View style={{ marginTop: 12, padding: 12, backgroundColor: '#E0E7FF', borderRadius: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#3730A3', marginBottom: 6 }}>Preparations:</Text>
                    {item.appointment.preparations.map((prep, idx) => (
                      <Text key={idx} style={{ fontSize: 13, color: '#312E81', marginBottom: 2 }}>• {prep}</Text>
                    ))}
                  </View>
                )}
                
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B5CF6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginTop: 12, justifyContent: 'center' }}>
                  <MaterialCommunityIcons name="calendar-plus" size={16} color="white" />
                  <Text style={{ color: 'white', fontWeight: '600', marginLeft: 6 }}>Add to Calendar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          <Text style={[
            { fontSize: 11, marginTop: 4, alignSelf: isPatient ? 'flex-end' : 'flex-start' },
            isPatient ? { color: 'rgba(139,92,246,0.7)' } : { color: '#9CA3AF' }
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => (
    <View style={{ flexDirection: 'row', paddingHorizontal: 15, marginBottom: 15 }}>
      <Image source={{ uri: safeParams.avatar }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10 }} />
      <View style={{ backgroundColor: 'white', borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 15, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#9CA3AF', marginHorizontal: 2 }} />
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#9CA3AF', marginHorizontal: 2 }} />
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#9CA3AF', marginHorizontal: 2 }} />
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#F8F9FA' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#667eea']}
        style={{ paddingTop: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
            <TouchableOpacity 
              style={{ padding: 8, marginRight: 12 }} 
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ position: 'relative', marginRight: 12 }}>
                <Image source={{ uri: safeParams.avatar }} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' }} />
                {safeParams.isOnline && <View style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#10B981', borderWidth: 2, borderColor: 'white' }} />}
                {safeParams.verified && (
                  <View style={{ position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="verified" size={12} color="white" />
                  </View>
                )}
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{safeParams.doctorName}</Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{safeParams.specialty}</Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                  {safeParams.isOnline ? 'Online now' : 'Usually responds within 1 hour'}
                </Text>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity style={{ padding: 8, marginLeft: 8 }}>
                <MaterialCommunityIcons name="phone" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 8, marginLeft: 8 }}>
                <MaterialCommunityIcons name="video" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 8, marginLeft: 8 }}>
                <MaterialCommunityIcons name="dots-vertical" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Security Notice */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, backgroundColor: '#F0FDF4', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
        <MaterialCommunityIcons name="shield-check" size={14} color="#10B981" />
        <Text style={{ fontSize: 12, color: '#065F46', marginLeft: 4, fontWeight: '500' }}>End-to-end encrypted</Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={{ flex: 1, backgroundColor: '#F8F9FA' }}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={isTyping ? renderTypingIndicator : null}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input */}
      <View style={{ backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#F3F4F6', borderRadius: 24, paddingHorizontal: 12, paddingVertical: 8, minHeight: 44 }}>
          <TouchableOpacity style={{ padding: 8, marginRight: 8 }} onPress={showImageOptions}>
            <MaterialCommunityIcons name="camera-plus" size={24} color="#8B5CF6" />
          </TouchableOpacity>
          
          <TextInput
            style={{ flex: 1, fontSize: 16, color: '#1F2937', maxHeight: 100, paddingVertical: 4 }}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            placeholderTextColor="#9CA3AF"
          />
          
          <TouchableOpacity 
            style={[{ padding: 8, marginLeft: 8, borderRadius: 20, minWidth: 40, alignItems: 'center', justifyContent: 'center' }, message.trim() && { backgroundColor: '#8B5CF6' }]} 
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <Icon name="send" size={20} color={message.trim() ? "white" : "#9CA3AF"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity 
            style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => setShowImageModal(false)}
          >
            {selectedImage && <Image source={{ uri: selectedImage }} style={{ width: width * 0.9, height: height * 0.7, resizeMode: 'contain' }} />}
            <TouchableOpacity 
              style={{ position: 'absolute', top: 50, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}
              onPress={() => setShowImageModal(false)}
            >
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
