import { StyleSheet, FlatList, View, Text, Pressable, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { Bell, Info, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useAppStore } from '@/store/AppStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function AlertsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const { notifications, markAsRead, role } = useAppStore();

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500, delay: index * 100 }}
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
    >
      <Pressable 
        onPress={() => {
          markAsRead(item.id);
          router.push(`/alert/${item.id}`);
        }} 
        style={styles.cardContent}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: item.read ? theme.surface : theme.tint + '20' }]}>
            <Bell size={20} color={item.read ? theme.tabIconDefault : theme.tint} />
          </View>
          <Text style={[styles.timestamp, { color: theme.tabIconDefault }]}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text style={[styles.title, { color: theme.text, opacity: item.read ? 0.7 : 1 }]}>
          {item.title}
        </Text>
        <Text 
          style={[styles.body, { color: theme.text, opacity: item.read ? 0.5 : 0.8 }]}
          numberOfLines={1}
        >
          {item.body}
        </Text>
        {!item.read && <View style={[styles.unreadDot, { backgroundColor: theme.tint }]} />}
      </Pressable>
    </MotiView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {notifications.length === 0 ? (
        <MotiView 
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.emptyState}
        >
          <Bell size={64} color={theme.border} />
          <Text style={[styles.emptyText, { color: theme.tabIconDefault }]}>No alerts yet</Text>
        </MotiView>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {role === 'admin' && (
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: theme.tint }]}
          onPress={() => router.push('/admin_create')}
          activeOpacity={0.8}
        >
          <Plus size={30} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
