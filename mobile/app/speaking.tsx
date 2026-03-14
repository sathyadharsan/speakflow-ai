import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = 'https://speakflow-ai.vercel.app/api';

export default function SpeakingPracticeScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Note: True speech-to-text requires libraries like @react-native-voice/voice or expo-av
  // For this UI scaffolding, we mock the voice capture process.
  const toggleRecording = async () => {
    if (!isRecording) {
      setIsRecording(true);
      setResult(null);
    } else {
      setIsRecording(false);
      analyzeAudioMock();
    }
  };

  const analyzeAudioMock = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE}/speaking/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sentence: "Yesterday I go office" })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        throw new Error('Analysis failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not analyze speech');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Speaking Practice</Text>
      <Text style={styles.promptLabel}>Practice Prompt:</Text>
      <Text style={styles.prompt}>"Introduce yourself (e.g. 'Yesterday I go office')"</Text>
      
      <View style={styles.micSection}>
         <TouchableOpacity 
           style={[styles.micButton, isRecording && styles.micRecording]} 
           onPress={toggleRecording}
         >
           <Ionicons name={isRecording ? "stop" : "mic"} size={48} color="#fff" />
         </TouchableOpacity>
         <Text style={styles.micText}>
           {isRecording ? 'Listening... Tap to Stop' : 'Tap to Start Speaking'}
         </Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 40 }} />}

      {result && (
         <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>AI Evaluation</Text>
            
            <View style={styles.scoresRow}>
               <View style={styles.scoreBadge}><Text style={styles.scoreText}>Grammar: {result.grammarScore}%</Text></View>
               <View style={styles.scoreBadge}><Text style={styles.scoreText}>Fluency: {result.fluencyScore}%</Text></View>
            </View>

            <Text style={styles.sectionHeader}>You Said:</Text>
            <Text style={styles.originalText}>"{result.originalSentence}"</Text>

            <View style={styles.correctionBox}>
               <Text style={styles.correctedHeader}>Correction:</Text>
               <Text style={styles.correctedText}>"{result.correctedSentence}"</Text>
               <Text style={styles.explanationText}>{result.explanation}</Text>
            </View>

            {result.betterSentence && (
              <View style={styles.alternativeBox}>
                 <Text style={styles.alternativeHeader}>Natural Alternative:</Text>
                 <Text style={styles.alternativeText}>"{result.betterSentence}"</Text>
              </View>
            )}
         </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#1E293B', textAlign: 'center', marginVertical: 20 },
  promptLabel: { fontSize: 14, color: '#64748B', textAlign: 'center', textTransform: 'uppercase', fontWeight: '700', letterSpacing: 1 },
  prompt: { fontSize: 18, fontStyle: 'italic', color: '#334155', textAlign: 'center', marginTop: 8, marginBottom: 40 },
  micSection: { alignItems: 'center', marginVertical: 20 },
  micButton: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center', elevation: 10, shadowColor: '#6C63FF', shadowOpacity: 0.4, shadowRadius: 15 },
  micRecording: { backgroundColor: '#EF4444', shadowColor: '#EF4444' },
  micText: { marginTop: 16, fontSize: 16, color: '#64748B', fontWeight: '500' },
  resultCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginTop: 40, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  resultTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  scoresRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  scoreBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  scoreText: { color: '#334155', fontWeight: '600', fontSize: 14 },
  sectionHeader: { fontSize: 12, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: 8 },
  originalText: { fontSize: 18, color: '#1E293B', marginBottom: 20 },
  correctionBox: { backgroundColor: '#F3F4FF', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#6C63FF', marginBottom: 16 },
  correctedHeader: { fontSize: 12, fontWeight: '700', color: '#6C63FF', textTransform: 'uppercase', marginBottom: 8 },
  correctedText: { fontSize: 18, fontWeight: '600', color: '#3B82F6', marginBottom: 12 },
  explanationText: { fontSize: 15, color: '#334155', lineHeight: 22 },
  alternativeBox: { backgroundColor: '#F0FDF4', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#10B981' },
  alternativeHeader: { fontSize: 12, fontWeight: '700', color: '#10B981', textTransform: 'uppercase', marginBottom: 8 },
  alternativeText: { fontSize: 16, fontWeight: '500', color: '#065F46' }
});
