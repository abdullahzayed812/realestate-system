import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const SOCKET_URL = __DEV__ ? 'http://10.0.2.2:3004' : 'https://api.borgalarab-realestate.com';

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  type: 'TEXT' | 'IMAGE' | 'VOICE' | 'PROPERTY_CARD';
  content: string | null;
  mediaUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function ChatScreen(): React.ReactElement {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { chatId, otherUser } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const { data } = await api.get(`/chats/${chatId}/messages`);
      return data.data.data as Message[];
    },
    onSuccess: (data) => {
      setMessages(data.reverse());
    },
  });

  // Connect to Socket.IO
  useEffect(() => {
    let socketInstance: Socket;

    const connectSocket = async (): Promise<void> => {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return;

      socketInstance = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      });

      socketInstance.on('connect', () => {
        setConnected(true);
        socketInstance.emit('join_chat', { chatId });
      });

      socketInstance.on('new_message', (message: Message) => {
        setMessages((prev) => [...prev, message]);
        flatListRef.current?.scrollToEnd({ animated: true });
      });

      socketInstance.on('user_typing', ({ userId }: { userId: string }) => {
        if (userId !== user?.id) setIsTyping(true);
      });

      socketInstance.on('user_stop_typing', () => {
        setIsTyping(false);
      });

      socketInstance.on('messages_read', () => {
        setMessages((prev) =>
          prev.map((m) => ({ ...m, isRead: true })),
        );
      });

      socketInstance.on('disconnect', () => setConnected(false));

      setSocket(socketInstance);
    };

    connectSocket();

    return () => {
      socketInstance?.disconnect();
    };
  }, [chatId, user?.id]);

  const sendMessage = useCallback((): void => {
    if (!inputText.trim() || !socket || !connected) return;

    socket.emit('send_message', {
      chatId,
      type: 'TEXT',
      content: inputText.trim(),
    });

    setInputText('');
  }, [inputText, socket, connected, chatId]);

  const handleTyping = (text: string): void => {
    setInputText(text);

    if (socket && connected) {
      socket.emit('typing', { chatId });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { chatId });
      }, 1500);
    }
  };

  const renderMessage = ({ item }: { item: Message }): React.ReactElement => {
    const isMine = item.senderId === user?.id;

    return (
      <View style={[styles.messageRow, isMine && styles.messageRowMine]}>
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
          {item.type === 'TEXT' && (
            <Text style={[styles.messageText, isMine && styles.messageTextMine]}>
              {item.content}
            </Text>
          )}
          {item.type === 'IMAGE' && item.mediaUrl && (
            <Image source={{ uri: item.mediaUrl }} style={styles.messageImage} />
          )}
          <Text style={[styles.messageTime, isMine && styles.messageTimeMine]}>
            {new Date(item.createdAt).toLocaleTimeString('ar', {
              hour: '2-digit',
              minute: '2-digit',
            })}
            {isMine && (
              <Text> {item.isRead ? '✓✓' : '✓'}</Text>
            )}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 22 }}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>
            {otherUser?.firstName} {otherUser?.lastName}
          </Text>
          <Text style={[styles.headerStatus, connected && styles.headerStatusOnline]}>
            {connected ? '● متصل' : '● غير متصل'}
          </Text>
        </View>
        <View style={styles.headerAvatar}>
          <Text style={{ fontSize: 22 }}>👤</Text>
        </View>
      </View>

      {/* Messages */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1d4ed8" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>يكتب...</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachBtn}>
            <Text style={{ fontSize: 22 }}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="اكتب رسالة..."
            value={inputText}
            onChangeText={handleTyping}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={{ fontSize: 18, color: '#fff' }}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a1628',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700', color: '#fff'' },
  headerStatus: { fontSize: 12, color: '#94a3b8'' },
  headerStatusOnline: { color: '#4ade80' },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1d4ed8', alignItems: 'center', justifyContent: 'center',
  },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messagesList: { paddingHorizontal: 16, paddingVertical: 12 },
  messageRow: { marginBottom: 8, alignItems: 'flex-start' },
  messageRowMine: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '75%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10,
  },
  bubbleOther: {
    backgroundColor: '#fff',
    borderBottomRightRadius: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  bubbleMine: {
    backgroundColor: '#1d4ed8',
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 15, color: '#0f172a', lineHeight: 22' },
  messageTextMine: { color: '#fff' },
  messageImage: { width: 220, height: 165, borderRadius: 10 },
  messageTime: { fontSize: 11, color: '#94a3b8', marginTop: 4' },
  messageTimeMine: { color: 'rgba(255,255,255,0.7)' },
  typingIndicator: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#fff', borderRadius: 16, alignSelf: 'flex-start',
  },
  typingText: { fontSize: 13, color: '#64748b', fontStyle: 'italic' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 8,
  },
  attachBtn: { padding: 6 },
  input: {
    flex: 1, minHeight: 44, maxHeight: 120,
    backgroundColor: '#f8fafc', borderRadius: 22, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 15, color: '#0f172a',
    borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1d4ed8', alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
