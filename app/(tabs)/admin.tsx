import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { MotiView } from 'moti';
import { Send, ShieldAlert, Type, AlignLeft } from 'lucide-react-native';

import { useAppStore, API_URL } from '@/store/AppStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function AdminScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const { addNotification, expoPushToken } = useAppStore();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!title || !body) {
      Alert.alert('Error', 'Please fill in both title and message');
      return;
    }

    setIsSending(true);
    try {
      // In the future, this will call the Flask API
      // For now, it adds to local store and triggers a local notification
      await addNotification(title, body);
      
      setTitle('');
      setBody('');
      Alert.alert('Success', 'Notification sent to all users!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.header}
        >
          <View style={[styles.iconCircle, { backgroundColor: theme.tint + '20' }]}>
            <ShieldAlert size={32} color={theme.tint} />
          </View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Admin Panel</Text>
          <Text style={[styles.headerSubtitle, { color: theme.tabIconDefault }]}>
            Broadcast notifications to all active users
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 200 }}
          style={[styles.form, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Type size={16} color={theme.tabIconDefault} style={styles.labelIcon} />
              <Text style={[styles.label, { color: theme.tabIconDefault }]}>Notification Title</Text>
            </View>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
              placeholder="e.g. Urgent Update"
              placeholderTextColor={theme.tabIconDefault + '80'}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <AlignLeft size={16} color={theme.tabIconDefault} style={styles.labelIcon} />
              <Text style={[styles.label, { color: theme.tabIconDefault }]}>Message Content</Text>
            </View>
            <TextInput
              style={[styles.textArea, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
              placeholder="Type your message here..."
              placeholderTextColor={theme.tabIconDefault + '80'}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={body}
              onChangeText={setBody}
            />
          </View>

          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: theme.tint }]}
            onPress={handleSend}
            disabled={isSending}
            activeOpacity={0.8}
          >
            <Send size={20} color="#fff" style={styles.sendIcon} />
            <Text style={styles.sendButtonText}>
              {isSending ? 'Sending...' : 'Send Notification'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, { borderColor: theme.tint }]}
            onPress={async () => {
              if (!expoPushToken) {
                Alert.alert('Error', 'No push token available. Please check permissions.');
                return;
              }
              try {
                console.log('Sending test push to:', `${API_URL}/announcements`);
                const response = await fetch(`${API_URL}/announcements`, {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                  body: JSON.stringify({ 
                    title: '🔔 Test Notification', 
                    body: 'This is a test notification from the HSAD Portal.' 
                  }),
                });
                
                if (response.ok) {
                  Alert.alert('Success', 'Test notification sent! Check your notification tray.');
                } else {
                  const errorText = await response.text();
                  Alert.alert('Server Error', `Status ${response.status}: ${errorText.substring(0, 50)}`);
                }
              } catch (e: any) {
                console.error('Test push error:', e);
                Alert.alert('Network Error', `Could not reach server: ${e.message}`);
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.testButtonText, { color: theme.tint }]}>Test Push Notification</Text>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 16,
  },
  sendButton: {
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sendIcon: {
    marginRight: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  testButton: {
    height: 50,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
