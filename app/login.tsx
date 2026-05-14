import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Shield, Lock, ArrowLeft } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import { useAppStore } from '@/store/AppStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const { setRole } = useAppStore();

  const [passcode, setPasscode] = useState('');

  const handleLogin = () => {
    // Hardcoded passcode for now
    if (passcode === '1234') {
      setRole('admin');
      Alert.alert('Success', 'Logged in as administrator');
      router.back();
    } else {
      Alert.alert('Error', 'Invalid passcode. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar style="light" />
      
      <MotiView 
        from={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.content}
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: theme.tint + '15' }]}>
            <Shield size={40} color={theme.tint} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Admin Login</Text>
          <Text style={[styles.subtitle, { color: theme.tabIconDefault }]}>
            Enter the administrative passcode to continue
          </Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Lock size={20} color={theme.tabIconDefault} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Passcode"
              placeholderTextColor={theme.tabIconDefault}
              value={passcode}
              onChangeText={setPasscode}
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
            />
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: theme.tint }]}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Authorize</Text>
          </TouchableOpacity>
        </View>
      </MotiView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  loginButton: {
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
