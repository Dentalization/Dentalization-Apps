import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert, Image, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import aiAgentService from '../../../services/aiAgentService';
import AIAgentOfflineModal from '../../../components/modals/AIAgentOfflineModal';

const AgentChatAi = () => {
  const route = useRoute(); const navigation = useNavigation();
  const { sessionId, imageId, initialMessage, imageUri } = route.params || {};
  const [chatMessages, setChatMessages] = useState([]); const [currentMessage, setCurrentMessage] = useState(''); const [isAnalyzing, setIsAnalyzing] = useState(false); const [showOfflineModal, setShowOfflineModal] = useState(false); const [agentServerStatus, setAgentServerStatus] = useState('checking'); const [currentImageId, setCurrentImageId] = useState(imageId); const [modalVisible, setModalVisible] = useState(false); const [selectedImage, setSelectedImage] = useState(null);
  const scrollViewRef = useRef(null); const insets = useSafeAreaInsets();
  const openImageModal = (src)=>{ setSelectedImage(src); setModalVisible(true); }; const closeImageModal=()=>{ setModalVisible(false); setSelectedImage(null); };

  useEffect(()=>{ checkAgentServerStatus(); if(initialMessage && imageId && sessionId){ startInitialAnalysis(); } },[]);
  useEffect(()=>{ if(scrollViewRef.current){ scrollViewRef.current.scrollToEnd({ animated:true }); } },[chatMessages]);

  const checkAgentServerStatus = async () => { try{ const healthCheck = await aiAgentService.healthCheck(); if(healthCheck.success){ setAgentServerStatus('online'); setShowOfflineModal(false);} else { setAgentServerStatus('offline'); setShowOfflineModal(true);} } catch{ setAgentServerStatus('offline'); setShowOfflineModal(true);} };

  const restartAnalysis = async () => { if(!initialMessage||!imageId||!sessionId) return; setChatMessages([]); setCurrentMessage(''); await checkAgentServerStatus(); if(agentServerStatus==='online'||agentServerStatus==='checking'){ await startInitialAnalysis(); } };

  const startInitialAnalysis = async () => {
    if(!initialMessage||!imageId||!sessionId) return; setIsAnalyzing(true);
    const userMessage = { id: Date.now()+'_user', type:'user', content: initialMessage, timestamp: new Date().toISOString(), hasImage:true };
    setChatMessages([userMessage]);
    try{
      const chatResult = await aiAgentService.chatWithAgentAndImage(initialMessage, imageId, sessionId);
      if(chatResult.success){
        let processedContent = chatResult.data.assistant_message?.content || chatResult.data.assistantMessage;
        if(typeof processedContent === 'object' && processedContent !== null){ processedContent = processedContent.content || processedContent.message || processedContent.text || processedContent.response || 'Tidak ada respons yang dapat ditampilkan'; }
        if(typeof processedContent !== 'string'){ processedContent = 'Tidak ada respons yang dapat ditampilkan'; }
        const assistantMessage = { id: Date.now()+'_assistant', type:'assistant', content: processedContent, timestamp: new Date().toISOString(), resources: chatResult.data.resources || [], analysis: chatResult.data.analysis };
        if(chatResult.data && chatResult.data.visualizations && chatResult.data.visualizations.length>0){
          const visualizationsWithImages = [];
          for(const viz of chatResult.data.visualizations){
            try{ const imageResponse = await aiAgentService.getVisualization(viz.resourceId); if(imageResponse.data && imageResponse.data.data){ const base64Data = String(imageResponse.data.data).replace(/\s/g,''); visualizationsWithImages.push({ resourceId: viz.resourceId, id: viz.resourceId, base64Data, image:`data:image/png;base64,${base64Data}`}); } }catch(e){}
          }
          if(visualizationsWithImages.length>0){ assistantMessage.visualizations = visualizationsWithImages; }
        }else{
          const resourcesWithImages = [];
          if(assistantMessage.resources && assistantMessage.resources.length>0){
            for(const resource of assistantMessage.resources){
              if(typeof resource==='string' && resource.startsWith('gen_')){
                try{
                  const visualizationResult = await aiAgentService.getVisualization(resource,'base64');
                  if(visualizationResult.success && visualizationResult.data){
                    let base64Data; if(typeof visualizationResult.data==='string'){ base64Data = visualizationResult.data; } else if(visualizationResult.data.data){ base64Data = visualizationResult.data.data; } else if(visualizationResult.data.image){ base64Data = visualizationResult.data.image; } else { for(const key of Object.keys(visualizationResult.data)){ const val = visualizationResult.data[key]; if(typeof val==='string' && val.length>100){ base64Data = val; break; } } }
                    if(base64Data){ const clean = base64Data.replace(/\s/g,''); resourcesWithImages.push({ id:resource, resourceId:resource, base64Data: clean, image:`data:image/png;base64,${clean}`}); }
                  }
                }catch(e){}
              }
            }
          }
          assistantMessage.visualizations = resourcesWithImages;
        }
        setChatMessages(prev=>[...prev, assistantMessage]);
      } else { throw new Error(chatResult.error); }
    }catch(e){ console.error('❌ Error starting initial analysis:', e); Alert.alert('Error','Gagal memulai analisis. Silakan coba lagi.'); } finally { setIsAnalyzing(false); }
  };

  const sendChatMessage = async () => {
    if(!currentMessage.trim() || !sessionId) return;
    const userMessage = { id: Date.now()+'_user', type:'user', content: currentMessage.trim(), timestamp: new Date().toISOString() };
    setChatMessages(prev=>[...prev, userMessage]); setCurrentMessage(''); setIsAnalyzing(true);
    try{
      const chatResult = currentImageId ? await aiAgentService.chatWithAgentAndImage(userMessage.content, currentImageId, sessionId) : await aiAgentService.chatWithAgent(userMessage.content, sessionId);
      if(chatResult.success){
        let processedContent = chatResult.data.assistant_message?.content || chatResult.data.assistantMessage;
        if(typeof processedContent === 'object' && processedContent !== null){ processedContent = processedContent.content || processedContent.message || processedContent.text || processedContent.response || 'Tidak ada respons yang dapat ditampilkan'; }
        if(typeof processedContent !== 'string'){ processedContent = 'Tidak ada respons yang dapat ditampilkan'; }
        const assistantMessage = { id: Date.now()+'_assistant', type:'assistant', content: processedContent, timestamp: new Date().toISOString(), resources: chatResult.data.resources || [], analysis: chatResult.data.analysis };
        if(chatResult.data && chatResult.data.visualizations && chatResult.data.visualizations.length>0){
          const visualizationsWithImages = [];
          for(const viz of chatResult.data.visualizations){
            try{ const imageResponse = await aiAgentService.getVisualization(viz.resourceId); if(imageResponse.data && imageResponse.data.data){ const base64Data = String(imageResponse.data.data).replace(/\s/g,''); visualizationsWithImages.push({ resourceId: viz.resourceId, id: viz.resourceId, base64Data, image:`data:image/png;base64,${base64Data}`}); } }catch(e){}
          }
          if(visualizationsWithImages.length>0){ assistantMessage.visualizations = visualizationsWithImages; }
        } else {
          const resourcesWithImages = [];
          if(assistantMessage.resources && assistantMessage.resources.length>0){
            for(const resource of assistantMessage.resources){
              if(typeof resource==='string' && resource.startsWith('gen_')){
                try{
                  const visualizationResult = await aiAgentService.getVisualization(resource,'base64');
                  if(visualizationResult.success && visualizationResult.data){
                    let base64Data; if(typeof visualizationResult.data==='string'){ base64Data = visualizationResult.data; } else if(visualizationResult.data.data){ base64Data = visualizationResult.data.data; } else if(visualizationResult.data.image){ base64Data = visualizationResult.data.image; } else { for(const key of Object.keys(visualizationResult.data)){ const val = visualizationResult.data[key]; if(typeof val==='string' && val.length>100){ base64Data = val; break; } } }
                    if(base64Data){ const clean = base64Data.replace(/\s/g,''); resourcesWithImages.push({ id:resource, resourceId:resource, base64Data: clean, image:`data:image/png;base64,${clean}`}); }
                  }
                }catch(e){}
              }
            }
          }
          assistantMessage.visualizations = resourcesWithImages;
        }
        setChatMessages(prev=>[...prev, assistantMessage]);
      } else { throw new Error(chatResult.error); }
    }catch(e){ console.error('❌ Error sending chat message:', e); Alert.alert('Error','Gagal mengirim pesan. Silakan coba lagi.'); } finally { setIsAnalyzing(false); }
  };

  const startNewAnalysis = ()=>{ navigation.goBack(); };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:'#F8FAFE' }}>
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios'?'padding':'height'}>
        <LinearGradient colors={['#667eea','#764ba2']} start={{x:0,y:0}} end={{x:1,y:1}} style={{ marginTop:-insets.top, paddingTop:insets.top+12, paddingHorizontal:20, paddingBottom:16, borderBottomLeftRadius:24, borderBottomRightRadius:24, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.12, shadowRadius:8, elevation:4 }}>
          <StatusBar style="light" translucent />
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
            {/* tombol back KOTAK */}
            <TouchableOpacity onPress={()=>navigation.goBack()} style={{ width:44, height:44, borderRadius:8, backgroundColor:'rgba(255,255,255,0.2)', justifyContent:'center', alignItems:'center' }}>
              <MaterialIcons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>

            {/* judul + subtitle + status */}
            <View style={{ flex:1, alignItems:'center' }}>
              <Text style={{ fontSize:20, fontWeight:'700', color:'white' }}>Serene AI</Text>
              <Text style={{ fontSize:12, color:'rgba(255,255,255,0.9)', marginTop:2 }}>Clinical Decision Support System</Text>
              <View style={{ flexDirection:'row', alignItems:'center', alignSelf:'center', marginTop:6, paddingHorizontal:10, paddingVertical:4, borderRadius:12, backgroundColor:'rgba(255,255,255,0.20)' }}>
                <View style={{ width:8, height:8, borderRadius:4, marginRight:6, backgroundColor: agentServerStatus==='online'?'#00C851':agentServerStatus==='offline'?'#FF4444':'#FF9800' }} />
                <Text style={{ fontSize:12, fontWeight:'600', color:'white' }}>{agentServerStatus==='online'?'Siap Membantu':agentServerStatus==='offline'?'Sedang Offline':'Menghubungkan...'}</Text>
              </View>
            </View>

            {/* tombol refresh KOTAK */}
            <TouchableOpacity onPress={restartAnalysis} style={{ width:44, height:44, borderRadius:8, backgroundColor:'rgba(255,255,255,0.2)', justifyContent:'center', alignItems:'center' }}>
              <MaterialIcons name="refresh" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView ref={scrollViewRef} style={{ flex:1, paddingHorizontal:20, backgroundColor:'#F8FAFE' }} contentContainerStyle={{ paddingVertical:20 }} showsVerticalScrollIndicator={false}>
          {imageUri && (
            <View style={{ marginBottom:16, backgroundColor:'#FFFFFF', borderRadius:12, padding:16, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.1, shadowRadius:4, elevation:3 }}>
              <Text style={{ fontSize:14, fontWeight:'600', color:'#666666', marginBottom:12 }}>Gambar yang dianalisis:</Text>
              <TouchableOpacity onPress={()=>openImageModal(imageUri.uri||imageUri)} style={{ position:'relative' }}>
                <Image source={{ uri:imageUri.uri||imageUri }} style={{ width:'100%', height:200, borderRadius:8, backgroundColor:'#F0F0F0' }} resizeMode="cover" />
                <View style={{ position:'absolute', top:8, right:8, backgroundColor:'rgba(0,0,0,0.6)', borderRadius:16, padding:6 }}><MaterialIcons name="zoom-in" size={16} color="white" /></View>
              </TouchableOpacity>
            </View>
          )}

          {chatMessages.map((message)=>(
            <View key={message.id} style={{ marginBottom:16, alignSelf: message.type==='user'?'flex-end':'flex-start', maxWidth:'85%' }}>
              <View style={{ backgroundColor: message.type==='user'?'#0066CC':'#FFFFFF', padding:18, borderRadius:20, borderBottomRightRadius: message.type==='user'?4:20, borderBottomLeftRadius: message.type==='user'?20:4, borderWidth: message.type==='assistant'?1:0, borderColor: message.type==='assistant'?'#E8F4FD':'transparent', shadowColor: message.type==='user'?'#0066CC':'#000', shadowOffset:{width:0,height:3}, shadowOpacity: message.type==='user'?0.3:0.1, shadowRadius:6, elevation:4 }}>
                <Text style={{ color: message.type==='user'?'#FFFFFF':'#333333', fontSize:14, lineHeight:22, textAlign:'left' }}>{message.content}</Text>
                {message.hasImage && <Text style={{ color: message.type==='user'?'#FFFFFF':'#666666', fontSize:12, fontStyle:'italic', marginTop:4 }}>📷 Gambar gigi dilampirkan</Text>}

                {message.visualizations && message.visualizations.length>0 && (
                  <View style={{ marginTop:20, padding:20, backgroundColor:'#FFFFFF', borderRadius:16, borderWidth:2, borderColor:'#E8F4FD', shadowColor:'#0066CC', shadowOffset:{width:0,height:4}, shadowOpacity:0.1, shadowRadius:8, elevation:6 }}>
                    <View style={{ flexDirection:'row', alignItems:'center', marginBottom:16 }}>
                      <View style={{ backgroundColor:'#E8F4FD', borderRadius:20, padding:8, marginRight:12 }}><MaterialIcons name="analytics" size={24} color="#0066CC" /></View>
                      <Text style={{ fontSize:18, fontWeight:'700', color:'#2E3A59' }}>Hasil Analisis Visual</Text>
                    </View>
                    {message.visualizations.map((viz, idx)=>{ const src = viz.base64Data ? `data:image/png;base64,${viz.base64Data}` : viz.image; return src ? (
                      <View key={idx} style={{ marginBottom:16 }}>
                        <View style={{ backgroundColor:'#F8FAFE', borderRadius:12, padding:12, borderWidth:1, borderColor:'#E8F4FD' }}>
                          <TouchableOpacity onPress={()=>openImageModal(src)} activeOpacity={0.8}>
                            <Image source={{ uri:src }} style={{ width:'100%', height:250, borderRadius:8, backgroundColor:'#FFFFFF' }} resizeMode="contain" />
                            <View style={{ position:'absolute', top:8, right:8, backgroundColor:'rgba(0,0,0,0.6)', borderRadius:12, padding:4 }}><MaterialIcons name="zoom-in" size={16} color="#FFFFFF" /></View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View key={idx} style={{ backgroundColor:'#FFF5F5', borderRadius:12, padding:20, borderWidth:1, borderColor:'#FFE0E0', alignItems:'center' }}>
                        <MaterialIcons name="error-outline" size={32} color="#FF6B6B" />
                        <Text style={{ fontSize:14, color:'#FF6B6B', fontWeight:'600', marginTop:8, textAlign:'center' }}>Gambar tidak dapat dimuat</Text>
                        <Text style={{ fontSize:12, color:'#B8B8B8', marginTop:4, textAlign:'center' }}>Data gambar tidak tersedia</Text>
                      </View>
                    ); })}
                  </View>
                )}
              </View>
              <Text style={{ fontSize:10, color:'#999999', marginTop:4, textAlign: message.type==='user'?'right':'left' }}>{new Date(message.timestamp).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</Text>
            </View>
          ))}

          {isAnalyzing && (
            <View style={{ alignSelf:'flex-start', backgroundColor:'#FFFFFF', padding:16, borderRadius:16, borderBottomLeftRadius:4, borderWidth:1, borderColor:'#E5E5E5', shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.1, shadowRadius:4, elevation:3, flexDirection:'row', alignItems:'center' }}>
              <ActivityIndicator size="small" color="#483AA0" style={{ marginRight:8 }} />
              <Text style={{ color:'#666666', fontSize:14 }}>AI sedang menganalisis...</Text>
            </View>
          )}
        </ScrollView>

        <View style={{ flexDirection:'row', alignItems:'center', paddingHorizontal:20, paddingVertical:16, backgroundColor:'#FFFFFF', borderTopWidth:1, borderTopColor:'#E8F4FD', shadowColor:'#000', shadowOffset:{width:0,height:-2}, shadowOpacity:0.1, shadowRadius:4, elevation:8 }}>
          <TextInput style={{ flex:1, borderWidth:2, borderColor:'#E8F4FD', borderRadius:25, paddingHorizontal:20, paddingVertical:14, fontSize:16, backgroundColor:'#F8FAFE', marginRight:12, color:'#2E3A59', fontWeight:'500', maxHeight:100 }} placeholder="Konsultasikan kondisi gigi pasien..." placeholderTextColor="#8FA3B8" value={currentMessage} onChangeText={setCurrentMessage} multiline maxLength={500} />
          <TouchableOpacity onPress={sendChatMessage} disabled={!currentMessage.trim() || isAnalyzing || agentServerStatus!=='online'} style={{ backgroundColor: !currentMessage.trim() || isAnalyzing || agentServerStatus!=='online' ? '#B8D4F0' : '#0066CC', borderRadius:25, width:50, height:50, justifyContent:'center', alignItems:'center', shadowColor:'#0066CC', shadowOffset:{width:0,height:2}, shadowOpacity:0.3, shadowRadius:4, elevation:4 }}>
            {isAnalyzing ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialIcons name="send" size={22} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <AIAgentOfflineModal visible={showOfflineModal} onClose={()=>setShowOfflineModal(false)} onRefresh={checkAgentServerStatus} />

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={closeImageModal}>
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.9)', justifyContent:'center', alignItems:'center' }}>
          <TouchableOpacity style={{ position:'absolute', top:50, right:20, zIndex:1000 }} onPress={closeImageModal}>
            <View style={{ backgroundColor:'rgba(255,255,255,0.2)', borderRadius:20, padding:8 }}><MaterialIcons name="close" size={24} color="#FFFFFF" /></View>
          </TouchableOpacity>
          {selectedImage && (
            <TouchableOpacity style={{ width:'95%', height:'80%' }} activeOpacity={1} onPress={closeImageModal}>
              <Image source={{ uri:selectedImage }} style={{ width:'100%', height:'100%', borderRadius:12 }} resizeMode="contain" />
            </TouchableOpacity>
          )}
          <Text style={{ color:'#FFFFFF', fontSize:14, marginTop:20, textAlign:'center', opacity:0.8 }}>Ketuk gambar atau tombol X untuk menutup</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AgentChatAi;
