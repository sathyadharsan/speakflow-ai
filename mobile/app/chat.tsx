import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = 'https://speakflow-ai-2.onrender.com/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  corrected?: string;
  explanation?: string;
  suggestion?: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'intro',
    sender: 'ai',
    text: "Hello! Let's practice English. Tell me about your day."
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    const newMessages: ChatMessage[] = [...messages, { id: Date.now().toString(), sender: 'user', text: userMsg }];
    setMessages(newMessages);

    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE}/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: userMsg })
      });

      if (res.ok) {
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error(text);
        }
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: '', // Main bubble text is actually the corrected sentence here
          corrected: data.correctedSentence,
          explanation: data.explanation,
          suggestion: data.suggestion,
        }]);
      }
    } catch (err) {
      console.log('Chat Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderBubble = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {isUser ? (
          <Text style={styles.userText}>{item.text}</Text>
        ) : (
          <View>
            <Text style={styles.correctedText}>{item.corrected || item.text}</Text>
            {item.explanation && (
              <View style={styles.feedbackBox}>
                 <Text style={styles.feedbackTitle}>Feedback</Text>
                 <Text style={styles.feedbackText}>{item.explanation}</Text>
                 {item.suggestion && (
                   <View style={styles.suggestionBox}>
                     <Text style={styles.suggestionTitle}>💡 Suggestion</Text>
                     <Text style={styles.suggestionText}>{item.suggestion}</Text>
                   </View>
                 )}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderBubble}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      {loading && <View style={styles.typingIndicator}><ActivityIndicator color="#6C63FF" size="small" /><Text style={{ marginLeft: 8, color: '#64748B' }}>AI is typing...</Text></View>}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  bubble: { maxWidth: '85%', padding: 16, borderRadius: 20, marginBottom: 16, elevation: 1 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#6C63FF', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  userText: { color: '#fff', fontSize: 16, lineHeight: 22 },
  correctedText: { color: '#1E293B', fontSize: 16, fontWeight: '600', lineHeight: 22 },
  feedbackBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  feedbackTitle: { fontSize: 12, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: 4 },
  feedbackText: { color: '#334155', fontSize: 14, lineHeight: 20 },
  suggestionBox: { marginTop: 12, padding: 12, backgroundColor: '#F0FDF4', borderRadius: 8 },
  suggestionTitle: { fontSize: 12, fontWeight: '700', color: '#10B981', textTransform: 'uppercase', marginBottom: 4 },
  suggestionText: { color: '#065F46', fontSize: 14, lineHeight: 20 },
  inputArea: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 16 },
  sendButton: { width: 44, height: 44, backgroundColor: '#6C63FF', borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  typingIndicator: { flexDirection: 'row', padding: 10, paddingHorizontal: 24, alignItems: 'center' }
});
