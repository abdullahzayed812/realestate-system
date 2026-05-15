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
  NO_SHOW: { bg: '#f1f5f9', text: '#475569' },
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'معلّق',
  CONFIRMED: 'مؤكد',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
  NO_SHOW: 'لم يحضر',
};

const TYPE_LABELS: Record<string, string> = {
  VIEWING: 'معاينة',
  RENTAL: 'إيجار',
  PURCHASE: 'شراء',
  VISIT: 'معاينة',
  RENT: 'إيجار',
};

interface Booking {
  id: string;
  type: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  message: string | null;
  property: { titleAr: string };
  broker: { firstName: string; lastName: string; phone: string };
}

export default function BookingsScreen(): React.ReactElement {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cancelModal, setCancelModal] = useState<{ visible: boolean; bookingId: string | null }>({
    visible: false,
    bookingId: null,
  });
  const [cancelReason, setCancelReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customer', 'bookings', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '20' });
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      const { data } = await api.get(`/bookings?${params}`);
      return data.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await api.patch(`/bookings/${id}/cancel`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'bookings'] });
      setCancelModal({ visible: false, bookingId: null });
      setCancelReason('');
    },
    onError: () => {
      Alert.alert('خطأ', 'حدث خطأ أثناء إلغاء الحجز، حاول مرة أخرى');
    },
  });

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
        <Text style={styles.title}>حجوزاتي</Text>
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
            const statusColor = STATUS_COLORS[item.status] ?? { bg: '#f1f5f9', text: '#475569' };
            const canCancel = item.status === 'PENDING' || item.status === 'CONFIRMED';

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>
                      {STATUS_LABELS[item.status]}
                    </Text>
                  </View>
                  <Text style={styles.typeText}>{TYPE_LABELS[item.type] ?? item.type}</Text>
                </View>

                <Text style={styles.propertyName} numberOfLines={1}>
                  {item.property?.titleAr}
                </Text>

                <View style={styles.brokerRow}>
                  <Text style={styles.brokerName}>
                    🏢 {item.broker?.firstName} {item.broker?.lastName}
                  </Text>
                  <Text style={styles.brokerPhone}>{item.broker?.phone}</Text>
                </View>

                <View style={styles.scheduleRow}>
                  <Text style={styles.scheduleText}>📅 {item.scheduledDate}</Text>
                  <Text style={styles.scheduleText}>🕐 {item.scheduledTime?.slice(0, 5)}</Text>
                </View>

                {item.message ? (
                  <Text style={styles.messageText}>💬 {item.message}</Text>
                ) : null}

                {canCancel && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item.id)}>
                    <Text style={styles.cancelBtnText}>إلغاء الحجز</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>لا توجد حجوزات</Text>
              <Text style={styles.emptySubtitle}>يمكنك حجز معاينة عقار من صفحة العقار</Text>
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
              <Text style={styles.modalSubtitle}>يرجى توضيح سبب إلغاء الحجز</Text>

              <TextInput
                style={styles.modalInput}
                value={cancelReason}
                onChangeText={setCancelReason}
                placeholder="مثال: تغيير في الخطط، وجدت عقاراً آخر..."
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
                  style={styles.modalDismissBtn}
                  onPress={() => setCancelModal({ visible: false, bookingId: null })}
                >
                  <Text style={styles.modalDismissText}>تراجع</Text>
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
  listContent: { padding: 16, gap: 12, paddingBottom: 120 },
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
  brokerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  brokerName: { fontSize: 13, fontWeight: '600', color: '#374151' },
  brokerPhone: { fontSize: 13, color: '#64748b' },
  scheduleRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  scheduleText: { fontSize: 13, color: '#475569' },
  messageText: { fontSize: 13, color: '#64748b', fontStyle: 'italic', marginBottom: 8 },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: '#dc2626' },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16 },
  emptySubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 6, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
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
  modalDismissBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalDismissText: { fontSize: 14, fontWeight: '700', color: '#374151' },
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
