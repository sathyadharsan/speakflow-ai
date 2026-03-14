import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = 'https://speakflow-ai-2.onrender.com/api';

export default function DashboardScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.log('Error fetching dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#6C63FF" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Hi {data?.userName || 'Learner'} 👋</Text>
        <Text style={styles.subtitle}>Ready to improve your English today?</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
           <Text style={styles.statLabel}>Streak</Text>
           <Text style={styles.statValue}>{data?.streak || 0} 🔥</Text>
        </View>
        <View style={styles.statCard}>
           <Text style={styles.statLabel}>Sessions</Text>
           <Text style={styles.statValue}>{data?.practiceSessions || 0}</Text>
        </View>
        <View style={styles.statCard}>
           <Text style={styles.statLabel}>Fluency</Text>
           <Text style={styles.statValue}>{data?.fluencyScore || 0}%</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Practice Modes</Text>
      
      <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/chat')}>
        <View style={[styles.iconBox, { backgroundColor: '#EBF4FF' }]}>
           <Ionicons name="chatbubbles" size={24} color="#3B82F6" />
        </View>
        <View style={styles.cardText}>
           <Text style={styles.cardTitle}>Chat Practice</Text>
           <Text style={styles.cardDesc}>Text AI tutor to fix grammar</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/speaking')}>
        <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
           <Ionicons name="mic" size={24} color="#10B981" />
        </View>
        <View style={styles.cardText}>
           <Text style={styles.cardTitle}>Speaking Practice</Text>
           <Text style={styles.cardDesc}>Speak naturally with AI</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/translator')}>
        <View style={[styles.iconBox, { backgroundColor: '#FDF4FF' }]}>
           <Ionicons name="language" size={24} color="#D946EF" />
        </View>
        <View style={styles.cardText}>
           <Text style={styles.cardTitle}>Translator</Text>
           <Text style={styles.cardDesc}>Convert Tanglish to English</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginTop: 40, marginBottom: 24 },
  welcome: { fontSize: 28, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  statCard: { backgroundColor: '#fff', flex: 1, marginHorizontal: 4, padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  statLabel: { fontSize: 13, color: '#64748B', marginBottom: 8, fontWeight: '500' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#1E293B', marginBottom: 16 },
  actionCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  iconBox: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#64748B' }
});
