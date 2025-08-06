import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const ConsultationCompleteForm = ({ route, navigation }) => {
  const { appointmentId, patientName } = route.params || {};
  
  // State untuk Hasil Pemeriksaan
  const [diagnosis, setDiagnosis] = useState('');
  const [oralCondition, setOralCondition] = useState('');
  const [examinedAreas, setExaminedAreas] = useState('');
  const [examinationPhotos, setExaminationPhotos] = useState([]);
  
  // State untuk Resep & Rekomendasi
  const [prescriptions, setPrescriptions] = useState([{
    medicine: '',
    dosage: '',
    instructions: ''
  }]);
  const [homeCareTips, setHomeCareTips] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [nextAppointment, setNextAppointment] = useState('');
  
  // State untuk Catatan Dokter
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalFindings, setClinicalFindings] = useState('');
  const [treatmentPerformed, setTreatmentPerformed] = useState('');
  const [patientResponse, setPatientResponse] = useState('');
  
  const addPrescription = () => {
    setPrescriptions([...prescriptions, {
      medicine: '',
      dosage: '',
      instructions: ''
    }]);
  };
  
  const removePrescription = (index) => {
    const newPrescriptions = prescriptions.filter((_, i) => i !== index);
    setPrescriptions(newPrescriptions);
  };
  
  const updatePrescription = (index, field, value) => {
    const newPrescriptions = [...prescriptions];
    newPrescriptions[index][field] = value;
    setPrescriptions(newPrescriptions);
  };
  
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera roll permissions are required to add photos.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setExaminationPhotos([...examinationPhotos, result.assets[0]]);
    }
  };
  
  const removePhoto = (index) => {
    const newPhotos = examinationPhotos.filter((_, i) => i !== index);
    setExaminationPhotos(newPhotos);
  };
  
  const handleSubmit = () => {
    // Validasi form
    if (!diagnosis.trim() || !chiefComplaint.trim()) {
      Alert.alert('Form Incomplete', 'Please fill in at least the diagnosis and chief complaint.');
      return;
    }
    
    const formData = {
      appointmentId,
      diagnosis,
      oralCondition,
      examinedAreas,
      examinationPhotos,
      prescriptions: prescriptions.filter(p => p.medicine.trim()),
      homeCareTips,
      dietaryRestrictions,
      nextAppointment,
      chiefComplaint,
      clinicalFindings,
      treatmentPerformed,
      patientResponse,
      completedAt: new Date().toISOString()
    };
    
    // TODO: Submit to backend
    console.log('Consultation form data:', formData);
    
    Alert.alert(
      'Form Submitted',
      'Consultation details have been saved successfully.',
      [{
        text: 'OK',
        onPress: () => navigation.goBack()
      }]
    );
  };
  
  const renderSection = (title, icon, children) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={24} color="#6366F1" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
  
  const renderTextInput = (placeholder, value, onChangeText, multiline = false) => (
    <TextInput
      style={[styles.input, multiline && styles.multilineInput]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      placeholderTextColor="#9CA3AF"
    />
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Consultation Complete</Text>
            <Text style={styles.headerSubtitle}>Patient: {patientName}</Text>
          </View>
        </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Hasil Pemeriksaan */}
          {renderSection('Hasil Pemeriksaan', 'medical', (
            <View>
              {renderTextInput('Diagnosis yang diberikan', diagnosis, setDiagnosis, true)}
              {renderTextInput('Kondisi gigi dan mulut yang ditemukan', oralCondition, setOralCondition, true)}
              {renderTextInput('Area yang diperiksa/dirawat', examinedAreas, setExaminedAreas, true)}
              
              <Text style={styles.inputLabel}>Foto/gambar hasil pemeriksaan</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoContainer}>
                {examinationPhotos.map((photo, index) => (
                  <View key={index} style={styles.photoWrapper}>
                    <Image source={{ uri: photo.uri }} style={styles.photo} />
                    <TouchableOpacity 
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                  <Ionicons name="camera" size={24} color="#6366F1" />
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          ))}
          
          {/* Resep & Rekomendasi */}
          {renderSection('Resep & Rekomendasi', 'medical-outline', (
            <View>
              <Text style={styles.inputLabel}>Obat yang diresepkan</Text>
              {prescriptions.map((prescription, index) => (
                <View key={index} style={styles.prescriptionCard}>
                  <View style={styles.prescriptionHeader}>
                    <Text style={styles.prescriptionNumber}>Obat {index + 1}</Text>
                    {prescriptions.length > 1 && (
                      <TouchableOpacity onPress={() => removePrescription(index)}>
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <TextInput
                    style={styles.prescriptionInput}
                    placeholder="Nama obat"
                    value={prescription.medicine}
                    onChangeText={(value) => updatePrescription(index, 'medicine', value)}
                    placeholderTextColor="#9CA3AF"
                  />
                  <TextInput
                    style={styles.prescriptionInput}
                    placeholder="Dosis (contoh: 500mg)"
                    value={prescription.dosage}
                    onChangeText={(value) => updatePrescription(index, 'dosage', value)}
                    placeholderTextColor="#9CA3AF"
                  />
                  <TextInput
                    style={styles.prescriptionInput}
                    placeholder="Cara pakai (contoh: 3x sehari setelah makan)"
                    value={prescription.instructions}
                    onChangeText={(value) => updatePrescription(index, 'instructions', value)}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              ))}
              
              <TouchableOpacity style={styles.addButton} onPress={addPrescription}>
                <Ionicons name="add" size={20} color="#6366F1" />
                <Text style={styles.addButtonText}>Tambah Obat</Text>
              </TouchableOpacity>
              
              {renderTextInput('Instruksi perawatan di rumah', homeCareTips, setHomeCareTips, true)}
              {renderTextInput('Pantangan makanan/minuman', dietaryRestrictions, setDietaryRestrictions, true)}
              {renderTextInput('Jadwal kontrol berikutnya', nextAppointment, setNextAppointment)}
            </View>
          ))}
          
          {/* Catatan Dokter */}
          {renderSection('Catatan Dokter', 'document-text', (
            <View>
              {renderTextInput('Keluhan utama pasien', chiefComplaint, setChiefComplaint, true)}
              {renderTextInput('Temuan klinis selama pemeriksaan', clinicalFindings, setClinicalFindings, true)}
              {renderTextInput('Tindakan yang dilakukan', treatmentPerformed, setTreatmentPerformed, true)}
              {renderTextInput('Respons pasien terhadap perawatan', patientResponse, setPatientResponse, true)}
            </View>
          ))}
          
          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Simpan Hasil Konsultasi</Text>
          </TouchableOpacity>
          
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  photoContainer: {
    marginBottom: 16,
  },
  photoWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#6366F1',
    marginTop: 4,
  },
  prescriptionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  prescriptionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  prescriptionInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#6366F1',
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});

export default ConsultationCompleteForm;