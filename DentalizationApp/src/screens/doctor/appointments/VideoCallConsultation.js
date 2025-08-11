import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { wp, hp, spacing, fontSizes, borderRadius, iconSizes, responsiveDimensions } from '../../../utils/responsive';
import ResponsiveContainer from '../../../components/layouts/ResponsiveContainer';
import ResponsiveCard from '../../../components/layouts/ResponsiveCard';
import ResponsiveText from '../../../components/layouts/ResponsiveText';

const { width, height } = Dimensions.get('window');

const VideoCallConsultation = ({ route, navigation }) => {
  const { appointmentId, patientName, patientId } = route.params || {};
  
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState('good'); // good, fair, poor
  const [isPatientJoined, setIsPatientJoined] = useState(false);
  
  const callStartTime = useRef(null);
  const durationInterval = useRef(null);
  
  useEffect(() => {
    // Simulate patient joining after 3 seconds
    const joinTimer = setTimeout(() => {
      setIsPatientJoined(true);
      startCall();
    }, 3000);
    
    return () => {
      clearTimeout(joinTimer);
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);
  
  const startCall = () => {
    setIsCallActive(true);
    callStartTime.current = new Date();
    
    // Start duration counter
    durationInterval.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    // Simulate connection quality changes
    const qualityTimer = setInterval(() => {
      const qualities = ['good', 'fair', 'poor'];
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
      setConnectionQuality(randomQuality);
    }, 10000);
    
    return () => clearInterval(qualityTimer);
  };
  
  const endCall = () => {
    Alert.alert(
      'End Consultation',
      'Are you sure you want to end the consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => {
            if (durationInterval.current) {
              clearInterval(durationInterval.current);
            }
            
            const endTime = new Date();
            const actualDuration = Math.floor((endTime - callStartTime.current) / 1000);
            
            // Navigate to consultation complete form with call data
            navigation.replace('ConsultationCompleteForm', {
              appointmentId,
              patientName,
              patientId,
              callData: {
                startTime: callStartTime.current.toISOString(),
                endTime: endTime.toISOString(),
                actualDuration,
                duration: formatDuration(actualDuration),
                connectionQuality,
                patientJoined: isPatientJoined,
                patientJoinedOnTime: true // This would be calculated based on scheduled time
              }
            });
          }
        }
      ]
    );
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
  };
  
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getConnectionColor = () => {
    switch (connectionQuality) {
      case 'good': return '#10B981';
      case 'fair': return '#F59E0B';
      case 'poor': return '#EF4444';
      default: return '#10B981';
    }
  };
  
  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'good': return 'wifi';
      case 'fair': return 'wifi-outline';
      case 'poor': return 'close-circle';
      default: return 'wifi';
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header with call info */}
      <View style={styles.header}>
        <View style={styles.callInfo}>
          <Text style={styles.patientName}>{patientName}</Text>
          <View style={styles.statusRow}>
            {isCallActive ? (
              <>
                <Text style={styles.duration}>{formatDuration(callDuration)}</Text>
                <View style={styles.connectionIndicator}>
                  <Ionicons 
                    name={getConnectionIcon()} 
                    size={16} 
                    color={getConnectionColor()} 
                  />
                  <Text style={[styles.connectionText, { color: getConnectionColor() }]}>
                    {connectionQuality}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.waitingText}>
                {isPatientJoined ? 'Connecting...' : 'Waiting for patient to join...'}
              </Text>
            )}
          </View>
        </View>
      </View>
      
      {/* Video area */}
      <View style={styles.videoContainer}>
        {/* Patient video (main) */}
        <View style={styles.mainVideo}>
          {isPatientJoined ? (
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.videoPlaceholder}
            >
              <Ionicons name="person" size={80} color="#FFFFFF" />
              <Text style={styles.videoLabel}>Patient Video</Text>
              {isVideoOff && (
                <View style={styles.videoOffOverlay}>
                  <Ionicons name="videocam-off" size={40} color="#FFFFFF" />
                  <Text style={styles.videoOffText}>Video Off</Text>
                </View>
              )}
            </LinearGradient>
          ) : (
            <View style={styles.waitingVideo}>
              <Ionicons name="hourglass-outline" size={60} color="#9CA3AF" />
              <Text style={styles.waitingVideoText}>Waiting for patient...</Text>
            </View>
          )}
        </View>
        
        {/* Doctor video (small) */}
        <View style={styles.doctorVideo}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.doctorVideoContent}
          >
            <Ionicons name="medical" size={30} color="#FFFFFF" />
            <Text style={styles.doctorVideoLabel}>You</Text>
            {isVideoOff && (
              <View style={styles.videoOffOverlay}>
                <Ionicons name="videocam-off" size={20} color="#FFFFFF" />
              </View>
            )}
          </LinearGradient>
        </View>
      </View>
      
      {/* Control buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={toggleMute}
        >
          <Ionicons 
            name={isMuted ? 'mic-off' : 'mic'} 
            size={24} 
            color={isMuted ? '#EF4444' : '#FFFFFF'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, isVideoOff && styles.controlButtonActive]}
          onPress={toggleVideo}
        >
          <Ionicons 
            name={isVideoOff ? 'videocam-off' : 'videocam'} 
            size={24} 
            color={isVideoOff ? '#EF4444' : '#FFFFFF'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => Alert.alert('Chat', 'Chat feature would open here')}
        >
          <Ionicons name="chatbubble" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => Alert.alert('Screen Share', 'Screen sharing feature would activate here')}
        >
          <Ionicons name="desktop" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.endCallButton]}
          onPress={endCall}
          disabled={!isCallActive}
        >
          <Ionicons name="call" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Quick actions */}
      {isCallActive && (
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => Alert.alert('Notes', 'Quick notes feature would open here')}
          >
            <Ionicons name="document-text" size={20} color="#6366F1" />
            <Text style={styles.quickActionText}>Notes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => Alert.alert('Prescription', 'Quick prescription feature would open here')}
          >
            <Ionicons name="medical" size={20} color="#6366F1" />
            <Text style={styles.quickActionText}>Prescription</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => Alert.alert('Camera', 'Photo capture feature would open here')}
          >
            <Ionicons name="camera" size={20} color="#6366F1" />
            <Text style={styles.quickActionText}>Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#374151',
  },
  callInfo: {
    alignItems: 'center',
  },
  patientName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  duration: {
    fontSize: 16,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  waitingText: {
    fontSize: 16,
    color: '#F59E0B',
    fontWeight: '500',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  mainVideo: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  waitingVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 16,
  },
  waitingVideoText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 12,
  },
  doctorVideo: {
    position: 'absolute',
    top: 30,
    right: 30,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  doctorVideoContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  doctorVideoLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  videoOffOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOffText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#374151',
  },
  endCallButton: {
    backgroundColor: '#EF4444',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 80,
  },
  quickActionText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
    marginTop: 4,
  },
});

export default VideoCallConsultation;