import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { ArrowLeft, Bell, Calendar, Clock } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import { useAppStore } from '@/store/AppStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const { notifications } = useAppStore();

  const alert = notifications.find(n => n.id === id);

  if (!alert) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>Alert not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.tint }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const date = new Date(alert.timestamp);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />
      
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Alert Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.iconContainer}
        >
          <View style={[styles.iconCircle, { backgroundColor: theme.tint + '15' }]}>
            <Bell size={48} color={theme.tint} />
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 100 }}
          style={styles.infoSection}
        >
          <Text style={[styles.title, { color: theme.text }]}>{alert.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Calendar size={16} color={theme.tabIconDefault} />
              <Text style={[styles.metaText, { color: theme.tabIconDefault }]}>
                {date.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={16} color={theme.tabIconDefault} />
              <Text style={[styles.metaText, { color: theme.tabIconDefault }]}>
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          
          <Text style={[styles.body, { color: theme.text }]}>
            {alert.body}
          </Text>
        </MotiView>
      </ScrollView>

      <TouchableOpacity 
        onPress={() => router.back()}
        style={[styles.closeButton, { backgroundColor: theme.tint }]}
      >
        <Text style={styles.closeButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: Platform.OS === 'ios' ? 100 : 80,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
    lineHeight: 34,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  metaText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 24,
  },
  body: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
    opacity: 0.9,
  },
  closeButton: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
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
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
