import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://speakflow-ai-2.onrender.com/api';

export default function ProgressScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE}/dashboard/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.log('Error fetching progress', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#6C63FF" /></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Learning Progress</Text>
      
      <View style={styles.card}>
         <Text style={styles.label}>Weekly Fluency Score</Text>
         <Text style={styles.value}>{data?.fluencyScore || 0}%</Text>
         <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${data?.fluencyScore || 0}%` }]} />
         </View>
      </View>

      <View style={styles.card}>
         <Text style={styles.label}>Vocabulary Learned</Text>
         <Text style={styles.value}>{data?.wordsLearned || 0} Words</Text>
      </View>

      <View style={styles.card}>
         <Text style={styles.label}>Daily Practice Minutes</Text>
         <Text style={styles.value}>{data?.todayPracticeMinutes || 0} Min</Text>
         <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(100, (data?.todayPracticeMinutes || 0) / 20 * 100)}%`, backgroundColor: '#10B981' }]} />
         </View>
      </View>

      <View style={styles.card}>
         <Text style={styles.label}>AI Improvement Tip</Text>
         <Text style={styles.tip}>{data?.progressInsight || "Keep practicing every day to see improvement!"}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#1E293B', marginTop: 40, marginBottom: 24 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  label: { fontSize: 16, color: '#64748B', fontWeight: '500', marginBottom: 8 },
  value: { fontSize: 32, fontWeight: '700', color: '#1E293B' },
  progressBar: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, marginTop: 12 },
  progressFill: { height: '100%', backgroundColor: '#6C63FF', borderRadius: 4 },
  tip: { fontSize: 16, color: '#475569', lineHeight: 24, marginTop: 8 }
});
