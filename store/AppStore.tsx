import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';

// Production API URL
export const API_URL = 'https://hsad.pythonanywhere.com';
const BACKGROUND_FETCH_TASK = 'background-announcement-fetch';
const READ_NOTIFICATIONS_KEY = '@read_notifications_v1';
const MUTE_SETTINGS_KEY = '@mute_settings_v1';
const THEME_SETTINGS_KEY = '@theme_settings_v1';
const CLEARED_NOTIFICATIONS_KEY = '@cleared_notifications_v1';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Define background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const response = await fetch(`${API_URL}/announcements`);
    const data = await response.json();
    console.log('[Background Fetch] Announcements fetched:', data.length);
    
    // We can't update state directly here, but the OS-level fetch 
    // helps keep the app "warm" and ready for when the user returns.
    return data ? BackgroundFetch.BackgroundFetchResult.NewData : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice && Platform.OS !== 'web') {
    console.log('Must use physical device for Push Notifications');
    // alert('Push Notifications require a physical device. Emulators will not work.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    if (Platform.OS === 'web') {
      // On web, if expo-notifications fails, we can try native browser API
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const nativeStatus = await window.Notification.requestPermission();
        if (nativeStatus === 'granted') {
          console.log('[Native] Notification permission granted via browser API');
          // We still might not get an Expo Token without VAPID, but we can show local alerts
          return null; 
        }
      }
    } else {
      alert('Permission for notifications was denied. Please enable it in settings.');
    }
    return null;
  }
  
  // Try to get the project ID dynamically
  const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  
  if (!projectId) {
    console.log('No Project ID found in config. This is required for push notifications in SDK 51+');
    // We will still try with the fallback but it might fail
  }
  
  const fallbackProjectId = '597793d5-032c-473d-82d2-850f4a8e2f8c'; // My fallback
  
  try {
    console.log('[Token Debug] Attempting to get token with projectId:', projectId || fallbackProjectId);
    const targetProjectId = projectId || fallbackProjectId;
    token = (await Notifications.getExpoPushTokenAsync({ 
      projectId: targetProjectId,
      applicationId: 'com.hsad.alertsportal'
    })).data;
    console.log('[Token Debug] Token acquired with projectId:', token);
  } catch (e: any) {
    console.log('[Token Debug] Error with projectId:', e.message);
    try {
      console.log('[Token Debug] Attempting fallback without projectId...');
      token = (await Notifications.getExpoPushTokenAsync({
        applicationId: 'com.hsad.alertsportal'
      })).data;
      console.log('[Token Debug] Token acquired via fallback:', token);
    } catch (innerError: any) {
      console.log('[Token Debug] Final failure:', innerError.message);
      
      // Silently handle web CORS/Fetch errors
      if (Platform.OS === 'web') {
        console.log('[Push] Web Push is unavailable due to CORS restrictions or missing FCM config.');
        return null;
      }

      // Check if it's a specific Expo Go error
      if (innerError.message.includes('Project ID')) {
        alert('Push Error: Your project needs to be linked to an Expo account. Please run "npx expo login" in your terminal.');
      } else if (Platform.OS === 'web' && innerError.message.includes('vapidPublicKey')) {
        console.log('[Push] Web Push disabled: Missing VAPID key in app.json');
      } else {
        alert(`Token Error: ${innerError.message}`);
      }
    }
  }

  return token;
}

export type Role = 'admin' | 'user';

export interface AlertNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

interface AppState {
  role: Role;
  setRole: (role: Role) => void;
  notifications: AlertNotification[];
  addNotification: (title: string, body: string) => Promise<void>;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  expoPushToken: string | null;
  refreshNotifications: () => Promise<void>;
  isMuted: boolean;
  toggleMute: () => void;
  userTheme: 'light' | 'dark' | 'system';
  setAppTheme: (theme: 'light' | 'dark' | 'system') => void;
  notificationPermission: Notifications.PermissionStatus;
  requestPermission: () => Promise<void>;
}

export const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('user');
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [userTheme, setUserTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [notificationPermission, setNotificationPermission] = useState<Notifications.PermissionStatus>(Notifications.PermissionStatus.UNDETERMINED);

  const requestPermission = async () => {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      setExpoPushToken(token);
      setNotificationPermission(Notifications.PermissionStatus.GRANTED);
    } else {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationPermission(status);
    }
  };

  // Configure foreground notification handling dynamically based on mute status
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: !isMuted,
        shouldPlaySound: !isMuted,
        shouldSetBadge: !isMuted,
      }),
    });
  }, [isMuted]);

  const refreshNotifications = async (silent = false) => {
    try {
      const response = await fetch(`${API_URL}/announcements`);
      if (response.ok) {
        const data = await response.json();
        
        // Get locally stored read and cleared status
        const readIdsJson = await AsyncStorage.getItem(READ_NOTIFICATIONS_KEY);
        const readIds = readIdsJson ? JSON.parse(readIdsJson) : [];
        
        const clearedIdsJson = await AsyncStorage.getItem(CLEARED_NOTIFICATIONS_KEY);
        const clearedIds = clearedIdsJson ? JSON.parse(clearedIdsJson) : [];
        
        const newNotifs = data
          .map((n: any) => {
            const idStr = n.id.toString();
            return { 
              ...n, 
              id: idStr, 
              read: readIds.includes(idStr) 
            };
          })
          .filter((n: any) => !clearedIds.includes(n.id));
        
        // Check for new notifications to trigger local alerts
        if (!silent && !isMuted && notifications.length > 0 && newNotifs.length > notifications.length) {
          const latest = newNotifs[0];
          // Check if the latest one is truly new (not just reloaded) and not read
          if (!notifications.find(n => n.id === latest.id) && !readIds.includes(latest.id)) {
            if (Platform.OS === 'web') {
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(`New Alert: ${latest.title}`, {
                  body: latest.body,
                });
              }
            } else {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: `New Alert: ${latest.title}`,
                  body: latest.body,
                },
                trigger: null,
              });
            }
          }
        }
        
        setNotifications(newNotifs);
      }
    } catch (e) {
      console.error('Failed to fetch announcements', e);
      if (!silent) {
        // console.log('Network Error: Could not connect to server');
      }
    }
  };

  useEffect(() => {
    // Register for push notifications
    const initNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationPermission(status);
      
      // On mobile, try to register automatically if granted or undetermined
      // On web, only if already granted (to avoid blocking popups)
      if (Platform.OS !== 'web' || status === Notifications.PermissionStatus.GRANTED) {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          setExpoPushToken(token);
          // Register token with backend
          fetch(`${API_URL}/register-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          }).catch(err => console.log('Error registering token:', err));
        }
      }
    };

    initNotifications();

    // Initial load
    refreshNotifications(true);

    // Load mute settings
    AsyncStorage.getItem(MUTE_SETTINGS_KEY).then(val => {
      if (val !== null) setIsMuted(JSON.parse(val));
    });

    // Load theme settings
    AsyncStorage.getItem(THEME_SETTINGS_KEY).then(val => {
      if (val !== null) setUserTheme(val as any);
    });

    // Set up polling for runtime notifications
    const interval = setInterval(() => {
      refreshNotifications(true);
    }, 3000);

    // Register background fetch task
    const registerBackgroundFetch = async () => {
      try {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
          minimumInterval: 60 * 15, // 15 minutes (minimum allowed by iOS/Android)
          stopOnTerminate: false,
          startOnBoot: true,
        });
      } catch (err) {
        console.log("Background Fetch registration failed:", err);
      }
    };

    registerBackgroundFetch();

    // Listen for AppState changes to refresh when app returns to foreground
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        refreshNotifications(true);
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Listen for notifications
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
      refreshNotifications(true);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification clicked:', response);
      const data = response.notification.request.content.data;
      if (data && data.id) {
        markAsRead(data.id.toString());
      }
      refreshNotifications(true);
    });

    return () => {
      clearInterval(interval);
      appStateSubscription.remove();
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []); // Re-run once

  // SEPARATE EFFECT FOR TOKEN SYNC
  useEffect(() => {
    // Synchronize token registration with mute status
    if (expoPushToken) {
      const endpoint = isMuted ? 'unregister-token' : 'register-token';
      fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: expoPushToken }),
      })
      .then(res => res.json())
      .then(data => console.log(`[Push Sync] ${endpoint} successful:`, data))
      .catch(err => console.log(`[Push Sync] Error with ${endpoint}:`, err));
    }
  }, [expoPushToken, isMuted]); // Re-run when token or mute status changes

  const addNotification = async (title: string, body: string) => {
    // Create optimistic notification
    const optimisticId = Date.now().toString();
    const optimisticNotif: AlertNotification = {
      id: optimisticId,
      title,
      body,
      timestamp: Date.now(),
      read: false
    };

    // Add to local state immediately
    setNotifications(prev => [optimisticNotif, ...prev]);

    try {
      console.log('Attempting to send announcement to:', `${API_URL}/announcements`);
      const response = await fetch(`${API_URL}/announcements`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ title, body }),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Announcement sent successfully:', result);
        
        // Refresh from server to get official ID and timestamp
        await refreshNotifications(true);
        
        // Also trigger a local notification for immediate feedback
        if (!isMuted) {
          if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification(title, { body });
            }
          } else {
            await Notifications.scheduleNotificationAsync({
              content: {
                title,
                body,
              },
              trigger: null,
            });
          }
        }
      } else {
        const errorText = await response.text();
        console.error('Server returned error:', errorText);
        // Remove optimistic notification if server failed
        setNotifications(prev => prev.filter(n => n.id !== optimisticId));
        alert(`Server Error (${response.status}): Failed to send announcement`);
      }
    } catch (e: any) {
      console.error('Fetch error detail:', e);
      // Remove optimistic notification if network failed
      setNotifications(prev => prev.filter(n => n.id !== optimisticId));
      alert(`Network Error: ${e.message || 'Could not connect to server'}. Please check your internet and if the backend is running.`);
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));

    // Persist read status locally
    try {
      const readIdsJson = await AsyncStorage.getItem(READ_NOTIFICATIONS_KEY);
      const readIds = readIdsJson ? JSON.parse(readIdsJson) : [];
      if (!readIds.includes(id)) {
        readIds.push(id);
        await AsyncStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(readIds));
      }
    } catch (e) {
      console.error('Error saving read status', e);
    }
  };

  const clearNotifications = async () => {
    // Local clear only
    try {
      const clearedIdsJson = await AsyncStorage.getItem(CLEARED_NOTIFICATIONS_KEY);
      const clearedIds = clearedIdsJson ? JSON.parse(clearedIdsJson) : [];
      
      const currentIds = notifications.map(n => n.id);
      const updatedClearedIds = Array.from(new Set([...clearedIds, ...currentIds]));
      
      await AsyncStorage.setItem(CLEARED_NOTIFICATIONS_KEY, JSON.stringify(updatedClearedIds));
      setNotifications([]);
    } catch (e) {
      console.error('Failed to clear notifications locally', e);
    }
  };

  const toggleMute = async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    try {
      await AsyncStorage.setItem(MUTE_SETTINGS_KEY, JSON.stringify(newMuted));
    } catch (e) {
      console.error('Error saving mute settings', e);
    }
  };

  const setAppTheme = async (theme: 'light' | 'dark' | 'system') => {
    setUserTheme(theme);
    try {
      await AsyncStorage.setItem(THEME_SETTINGS_KEY, theme);
    } catch (e) {
      console.error('Error saving theme settings', e);
    }
  };

  return (
    <AppContext.Provider value={{ 
      role, 
      setRole,
      notifications, 
      addNotification, 
      markAsRead, 
      clearNotifications,
      expoPushToken,
      refreshNotifications,
      isMuted,
      toggleMute,
      userTheme,
      setAppTheme,
      notificationPermission,
      requestPermission
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};
