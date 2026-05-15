import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: '#fffbeb', text: '#92400e' },
  CONFIRMED: { bg: '#ecfdf5', text: '#065f46' },
  COMPLETED: { bg: '#eff6ff', text: '#1e40af' },
  CANCELLED: { bg: '#fef2f2', text: '#991b1b' },
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'معلّق',
  CONFIRMED: 'مؤكد',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
};

const TYPE_LABELS: Record<string, string> = {
  VIEWING: 'معاينة',
  RENTAL: 'إيجار',
  PURCHASE: 'شراء',
};

interface Booking {
  id: string;
  property: { titleAr: string };
  customer: { firstName: string; lastName: string; phone: string };
  type: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  message: string | null;
}

export default function BookingRequestsScreen(): React.ReactElement {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cancelModal, setCancelModal] = useState<{ visible: boolean; bookingId: string | null }>({
    visible: false,
    bookingId: null,
  });
  const [cancelReason, setCancelReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['broker', 'bookings', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '20' });
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      const { data } = await api.get(`/bookings/broker?${params}`);
      return data.data;
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/bookings/${id}/confirm`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['broker', 'bookings'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await api.patch(`/bookings/${id}/cancel`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker', 'bookings'] });
      setCancelModal({ visible: false, bookingId: null });
      setCancelReason('');
    },
    onError: () => {
      Alert.alert('خطأ', 'حدث خطأ أثناء إلغاء الحجز، حاول مرة أخرى');
    },
  });

  const handleConfirm = (id: string) => {
    Alert.alert('تأكيد الحجز', 'هل تريد تأكيد هذا الموعد؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'تأكيد', onPress: () => confirmMutation.mutate(id) },
    ]);
  };

  const handleCancel = (id: string) => {
    setCancelReason('');
    setCancelModal({ visible: true, bookingId: id });
  };

  const submitCancel = () => {
    if (cancelReason.trim().length < 5) {
      Alert.alert('تنبيه', 'يرجى كتابة سبب الإلغاء (5 أحرف على الأقل)');
      return;
    }
    cancelMutation.mutate({ id: cancelModal.bookingId!, reason: cancelReason.trim() });
  };

  const bookings: Booking[] = data || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>الحجوزات</Text>
      </View>

      <View style={styles.filterRow}>
        {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED'].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.filterBtn, statusFilter === s && styles.filterBtnActive]}
            onPress={() => setStatusFilter(s)}
          >
            <Text style={[styles.filterBtnText, statusFilter === s && styles.filterBtnTextActive]}>
              {s === 'ALL' ? 'الكل' : STATUS_LABELS[s]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1d4ed8" />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const statusColor = STATUS_COLORS[item.status] || { bg: '#f1f5f9', text: '#475569' };
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>
                      {STATUS_LABELS[item.status]}
                    </Text>
                  </View>
                  <Text style={styles.typeText}>{TYPE_LABELS[item.type]}</Text>
                </View>

                <Text style={styles.propertyName} numberOfLines={1}>
                  {item.property.titleAr}
                </Text>

                <View style={styles.customerRow}>
                  <Text style={styles.customerName}>
                    👤 {item.customer.firstName} {item.customer.lastName}
                  </Text>
                  <Text style={styles.customerPhone}>{item.customer.phone}</Text>
                </View>

                <View style={styles.scheduleRow}>
                  <Text style={styles.scheduleText}>📅 {item.scheduledDate}</Text>
                  <Text style={styles.scheduleText}>🕐 {item.scheduledTime?.slice(0, 5)}</Text>
                </View>

                {item.message && <Text style={styles.messageText}>💬 {item.message}</Text>}

                {item.status === 'PENDING' && (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.confirmBtn}
                      onPress={() => handleConfirm(item.id)}
                    >
                      <Text style={styles.confirmBtnText}>✓ تأكيد</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => handleCancel(item.id)}
                    >
                      <Text style={styles.cancelBtnText}>✕ إلغاء</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48 }}>📅</Text>
              <Text style={styles.emptyTitle}>لا توجد حجوزات</Text>
            </View>
          }
        />
      )}
      <Modal
        visible={cancelModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModal({ visible: false, bookingId: null })}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCancelModal({ visible: false, bookingId: null })}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>سبب الإلغاء</Text>
              <Text style={styles.modalSubtitle}>يرجى توضيح سبب إلغاء الحجز للعميل</Text>

              <TextInput
                style={styles.modalInput}
                value={cancelReason}
                onChangeText={setCancelReason}
                placeholder="مثال: تعارض في المواعيد، العقار غير متاح..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={500}
                autoFocus
              />
              <Text style={styles.charCount}>{cancelReason.length}/500</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setCancelModal({ visible: false, bookingId: null })}
                >
                  <Text style={styles.modalCancelText}>تراجع</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalConfirmBtn,
                    cancelMutation.isPending && styles.modalConfirmDisabled,
                  ]}
                  onPress={submitCancel}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.modalConfirmText}>تأكيد الإلغاء</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#0a1628' },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  filterBtnActive: { backgroundColor: '#0a1628', borderColor: '#0a1628' },
  filterBtnText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  filterBtnTextActive: { color: '#fff' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingBottom: 120, padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  typeText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  propertyName: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 10 },
  customerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  customerName: { fontSize: 13, fontWeight: '600', color: '#374151' },
  customerPhone: { fontSize: 13, color: '#64748b' },
  scheduleRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  scheduleText: { fontSize: 13, color: '#475569' },
  messageText: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#065f46', fontWeight: '700', fontSize: 13 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#dc2626', fontWeight: '700', fontSize: 13 },
  emptyContainer: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  modalSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: '#0f172a',
    minHeight: 90,
  },
  charCount: { fontSize: 11, color: '#94a3b8', textAlign: 'right', marginTop: 4, marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalConfirmDisabled: { opacity: 0.6 },
  modalConfirmText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
