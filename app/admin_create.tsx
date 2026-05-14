import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Send, X, AlertCircle } from 'lucide-react-native';

import { useAppStore } from '@/store/AppStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function CreateAnnouncementScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const { addNotification } = useAppStore();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Error', 'Please fill in both title and body');
      return;
    }

    setLoading(true);
    try {
      await addNotification(title, body);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>New Announcement</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={theme.tabIconDefault} />
        </TouchableOpacity>
      </View>

      <MotiView 
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        style={styles.content}
      >
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.tabIconDefault }]}>TITLE</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder="Announcement Title"
            placeholderTextColor={theme.tabIconDefault + '80'}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.tabIconDefault }]}>MESSAGE</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder="Write your announcement message here..."
            placeholderTextColor={theme.tabIconDefault + '80'}
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={[styles.infoBox, { backgroundColor: theme.tint + '10', borderColor: theme.tint + '30' }]}>
          <AlertCircle size={20} color={theme.tint} />
          <Text style={[styles.infoText, { color: theme.text }]}>
            This announcement will be sent to all portal users immediately.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: theme.tint }]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Send size={20} color="#fff" style={styles.submitIcon} />
              <Text style={styles.submitText}>Send Announcement</Text>
            </>
          )}
        </TouchableOpacity>
      </MotiView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 150,
    paddingTop: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
    opacity: 0.8,
  },
  submitButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitIcon: {
    marginRight: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
