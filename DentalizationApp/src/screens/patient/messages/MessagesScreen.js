import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../../constants';

const MessagesScreen = ({ navigation }) => {
  const conversations = [
    {
      id: 1,
      doctorName: 'Dr. Sarah Wilson',
      specialty: 'Neurologist',
      lastMessage: 'Hasil pemeriksaan sudah siap...',
      time: '10:30',
      unread: 2,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      doctorName: 'Dr. Michael Chen',
      specialty: 'General Practitioner',
      lastMessage: 'Terima kasih atas konsultasinya',
      time: '09:15',
      unread: 0,
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      doctorName: 'Dr. Emily Johnson',
      specialty: 'Cardiologist',
      lastMessage: 'Jangan lupa kontrol minggu depan',
      time: 'Yesterday',
      unread: 0,
      avatar: 'https://images.unsplash.com/photo-1594824846003-5cee7a0e0f85?w=150&h=150&fit=crop&crop=face'
    },
  ];

  const renderConversationItem = (conversation) => (
    <TouchableOpacity
      key={conversation.id}
      style={styles.conversationItem}
      onPress={() => navigation.navigate('Chat', { doctorId: conversation.id })}
    >
      <Image source={{ uri: conversation.avatar }} style={styles.avatar} />
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.doctorName}>{conversation.doctorName}</Text>
          <Text style={styles.time}>{conversation.time}</Text>
        </View>
        <Text style={styles.specialty}>{conversation.specialty}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {conversation.lastMessage}
        </Text>
      </View>
      {conversation.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{conversation.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pesan</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="search" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.conversationsList}>
          {conversations.map(renderConversationItem)}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  searchButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  conversationsList: {
    paddingTop: 10,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  time: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  specialty: {
    fontSize: 12,
    color: '#6B46C1',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default MessagesScreen;
