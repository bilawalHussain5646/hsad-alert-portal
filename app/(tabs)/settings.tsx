import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { User, Shield, Trash2, ChevronRight, BellOff } from 'lucide-react-native';

import { useAppStore } from '@/store/AppStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const theme = Colors[colorScheme ?? 'dark'];
  const { role, setRole, clearNotifications, isMuted, toggleMute, userTheme, setAppTheme } = useAppStore();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.profileSection}
        >
          <View style={[styles.avatar, { backgroundColor: theme.tint + '20' }]}>
            <Shield size={40} color={theme.tint} />
          </View>
          <Text style={[styles.name, { color: theme.text }]}>
            {role === 'admin' ? 'Admin Portal' : 'HSAD User'}
          </Text>
          <Text style={[styles.email, { color: theme.tabIconDefault }]}>
            {role === 'admin' ? 'admin@hsad.portal' : 'App Version 1.0.0'}
          </Text>
        </MotiView>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.tabIconDefault }]}>Appearance</Text>
          
          <TouchableOpacity 
            onPress={() => setAppTheme(userTheme === 'dark' ? 'light' : 'dark')}
            style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.iconBox, { backgroundColor: theme.tint + '15' }]}>
                <BellOff size={20} color={theme.tint} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
                <Text style={[styles.settingDesc, { color: theme.tabIconDefault }]}>Toggle theme style</Text>
              </View>
            </View>
            <Switch
              value={userTheme === 'dark'}
              onValueChange={(val) => setAppTheme(val ? 'dark' : 'light')}
              trackColor={{ false: theme.border, true: theme.tint + '50' }}
              thumbColor={userTheme === 'dark' ? theme.tint : '#f4f3f4'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.tabIconDefault }]}>Data Management</Text>
          
          <TouchableOpacity 
            onPress={clearNotifications}
            style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.iconBox, { backgroundColor: theme.error + '15' }]}>
                <Trash2 size={20} color={theme.error} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Clear History</Text>
                <Text style={[styles.settingDesc, { color: theme.tabIconDefault }]}>Remove all received alerts</Text>
              </View>
            </View>
            <ChevronRight size={20} color={theme.tabIconDefault} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 12 }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.iconBox, { backgroundColor: theme.warning + '15' }]}>
                <BellOff size={20} color={theme.warning} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Mute Notifications</Text>
                <Text style={[styles.settingDesc, { color: theme.tabIconDefault }]}>Temporarily stop alerts</Text>
              </View>
            </View>
            <Switch
              value={isMuted}
              onValueChange={toggleMute}
              trackColor={{ false: theme.border, true: theme.warning + '50' }}
              thumbColor={isMuted ? theme.warning : '#f4f3f4'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.tabIconDefault }]}>System Permissions</Text>
          
          <TouchableOpacity 
            onPress={useAppStore().requestPermission}
            disabled={useAppStore().notificationPermission === 'granted'}
            style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border, opacity: useAppStore().notificationPermission === 'granted' ? 0.6 : 1 }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.iconBox, { backgroundColor: theme.tint + '15' }]}>
                <BellOff size={20} color={theme.tint} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  {useAppStore().notificationPermission === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
                </Text>
                <Text style={[styles.settingDesc, { color: theme.tabIconDefault }]}>
                  {useAppStore().notificationPermission === 'granted' 
                    ? 'App has permission to show alerts' 
                    : useAppStore().notificationPermission === 'denied'
                      ? 'Permission denied. Reset in browser settings.'
                      : 'Required for real-time alerts'}
                </Text>
              </View>
            </View>
            <View style={[styles.statusDot, { backgroundColor: useAppStore().notificationPermission === 'granted' ? theme.tint : theme.error }]} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.tabIconDefault }]}>Account</Text>
          {role === 'admin' ? (
            <TouchableOpacity 
              onPress={() => setRole('user')}
              style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border }]}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.iconBox, { backgroundColor: theme.error + '15' }]}>
                  <User size={20} color={theme.error} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Logout</Text>
                  <Text style={[styles.settingDesc, { color: theme.tabIconDefault }]}>Switch back to regular user mode</Text>
                </View>
              </View>
              <ChevronRight size={20} color={theme.tabIconDefault} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={() => router.push('/login')}
              style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border }]}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.iconBox, { backgroundColor: theme.tint + '15' }]}>
                  <Shield size={20} color={theme.tint} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Admin Login</Text>
                  <Text style={[styles.settingDesc, { color: theme.tabIconDefault }]}>Access administrative controls</Text>
                </View>
              </View>
              <ChevronRight size={20} color={theme.tabIconDefault} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.tabIconDefault }]}>Testing</Text>
          <TouchableOpacity 
            onPress={() => {
              if (Platform.OS === 'web') {
                if (typeof window !== 'undefined' && 'Notification' in window) {
                  if (Notification.permission === 'granted') {
                    new Notification('Test Alert', { body: 'This is a test notification from HSAD Portal' });
                  } else {
                    alert('Please enable notifications in System Permissions first!');
                  }
                }
              } else {
                import('expo-notifications').then(Notifications => {
                  Notifications.scheduleNotificationAsync({
                    content: { title: 'Test Alert', body: 'This is a test notification from HSAD Portal' },
                    trigger: null,
                  });
                });
              }
            }}
            style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.iconBox, { backgroundColor: theme.tint + '15' }]}>
                <Shield size={20} color={theme.tint} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Send Test Notification</Text>
                <Text style={[styles.settingDesc, { color: theme.tabIconDefault }]}>Verify system alerts are working</Text>
              </View>
            </View>
            <ChevronRight size={20} color={theme.tabIconDefault} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { color: theme.tabIconDefault }]}>
          HSAD Alerts Portal v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 13,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
    opacity: 0.5,
  },
});
