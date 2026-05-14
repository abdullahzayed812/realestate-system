import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';

interface Chat {
  id: string;
  propertyId: string | null;
  propertyTitleAr: string | null;
  otherUser: { firstName: string; lastName: string; avatarUrl: string | null };
  lastMessage: { content: string | null; createdAt: string } | null;
  brokerUnread: number;
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'أمس';
  return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
}

export default function BrokerChatListScreen(): React.ReactElement {
  const navigation = useNavigation<any>();

  const { data: chats, isLoading } = useQuery<Chat[]>({
    queryKey: ['broker', 'chats'],
    queryFn: async () => {
      const { data } = await api.get('/chats');
      return data.data;
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>المحادثات</Text>
        {chats && chats.reduce((sum, c) => sum + c.brokerUnread, 0) > 0 && (
          <View style={styles.totalUnread}>
            <Text style={styles.totalUnreadText}>
              {chats.reduce((sum, c) => sum + c.brokerUnread, 0)}
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1d4ed8" />
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() =>
                navigation.navigate('Chat', {
                  chatId: item.id,
                  otherUser: item.otherUser,
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.otherUser.firstName[0]}
                    {item.otherUser.lastName[0]}
                  </Text>
                </View>
                {item.brokerUnread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.brokerUnread}</Text>
                  </View>
                )}
              </View>
              <View style={styles.chatInfo}>
                <View style={styles.topRow}>
                  <Text style={styles.userName}>
                    {item.otherUser.firstName} {item.otherUser.lastName}
                  </Text>
                  <Text style={styles.timeText}>{formatTime(item.lastMessage?.createdAt ?? null)}</Text>
                </View>
                {item.propertyTitleAr && (
                  <Text style={styles.propertyName} numberOfLines={1}>
                    🏠 {item.propertyTitleAr}
                  </Text>
                )}
                <Text
                  style={[styles.lastMsg, item.brokerUnread > 0 && styles.lastMsgUnread]}
                  numberOfLines={1}
                >
                  {item.lastMessage?.content || '—'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48 }}>💬</Text>
              <Text style={styles.emptyTitle}>لا توجد محادثات</Text>
              <Text style={styles.emptySubtitle}>ستظهر محادثات العملاء هنا</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0a1628',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  totalUnread: {
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalUnreadText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    left: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  chatInfo: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between' },
  userName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  timeText: { fontSize: 12, color: '#94a3b8' },
  propertyName: { fontSize: 12, color: '#64748b', marginTop: 2 },
  lastMsg: { fontSize: 13, color: '#94a3b8', marginTop: 3 },
  lastMsgUnread: { color: '#374151', fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#f8fafc', marginHorizontal: 20 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', marginTop: 6 },
});
