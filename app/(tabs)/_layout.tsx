import React from 'react';
import { Tabs } from 'expo-router';
import { Bell, ShieldAlert, Settings } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAppStore } from '@/store/AppStore';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { role } = useAppStore();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'dark'].background,
          borderTopColor: Colors[colorScheme ?? 'dark'].border,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'dark'].background,
        },
        headerTitleStyle: {
          color: Colors[colorScheme ?? 'dark'].text,
          fontWeight: '700',
        },
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <Bell size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color }) => <ShieldAlert size={24} color={color} />,
          href: role === 'admin' ? '/admin' : null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

