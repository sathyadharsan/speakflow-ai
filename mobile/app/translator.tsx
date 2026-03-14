import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = 'https://speakflow-ai-2.onrender.com/api';

export default function TranslatorScreen() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: input })
      });
      if (res.ok) {
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error(text);
        }
        setResult(data?.english || "Translation unavailable");
      } else {
        throw new Error('Failed to translate');
      }
    } catch (err) {
      Alert.alert('Error', 'Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tamil / Tanglish to English Translator</Text>
      <Text style={styles.subtitle}>Type in Tamil or Tanglish to get an instant natural English translation.</Text>
      
      <View style={styles.card}>
         <View style={styles.micSection}>
            <TouchableOpacity style={styles.micButton}>
               <Ionicons name="mic" size={24} color="#6C63FF" />
            </TouchableOpacity>
            <Text style={styles.micHint}>Tap to speak</Text>
         </View>

         <TextInput
            style={styles.inputArea}
            placeholder="Type here... (e.g. 'naethu na school ku pona pa')"
            placeholderTextColor="#94A3B8"
            value={input}
            onChangeText={setInput}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
         />

         <TouchableOpacity style={styles.translateButton} onPress={handleTranslate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.translateButtonText}>Translate</Text>}
         </TouchableOpacity>
      </View>

      {result ? (
        <View style={styles.resultBox}>
           <Text style={styles.resultTitle}>English Translation:</Text>
           <Text style={styles.resultText}>"{result}"</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#64748B', marginBottom: 32 },
  card: { backgroundColor: '#fff', padding: 24, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, marginBottom: 24 },
  micSection: { alignItems: 'center', marginBottom: 16 },
  micButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4FF', alignItems: 'center', justifyContent: 'center' },
  micHint: { marginTop: 8, fontSize: 12, color: '#94A3B8' },
  inputArea: { height: 120, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, fontSize: 16, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  translateButton: { backgroundColor: '#6C63FF', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  translateButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resultBox: { backgroundColor: '#F3F4FF', padding: 24, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#6C63FF' },
  resultTitle: { fontSize: 14, fontWeight: '700', color: '#6C63FF', textTransform: 'uppercase', marginBottom: 16 },
  resultText: { fontSize: 20, fontWeight: '600', color: '#1E293B' }
});
