import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';

const BOOKING_TYPES = [
  { key: 'VIEWING', label: 'معاينة', icon: '👁', description: 'زيارة وتفقد العقار' },
  { key: 'RENTAL', label: 'إيجار', icon: '🔑', description: 'إيجار العقار' },
  { key: 'PURCHASE', label: 'شراء', icon: '🤝', description: 'شراء العقار' },
];

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

export default function BookingScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { propertyId, brokerId } = route.params;

  const [bookingType, setBookingType] = useState('VIEWING');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');
  const [rentalStart, setRentalStart] = useState('');
  const [rentalEnd, setRentalEnd] = useState('');

  const bookingMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        propertyId,
        type: bookingType,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime + ':00',
        message: message || undefined,
      };

      if (bookingType === 'RENTAL') {
        payload.rentalStartDate = rentalStart;
        payload.rentalEndDate = rentalEnd;
      }

      const { data } = await api.post('/bookings', payload);
      return data.data;
    },
    onSuccess: () => {
      Alert.alert(
        'تم الحجز بنجاح',
        'سيتواصل معك الوسيط لتأكيد الموعد',
        [{ text: 'حسناً', onPress: () => navigation.goBack() }],
      );
    },
    onError: (err: any) => {
      Alert.alert('خطأ', err?.response?.data?.message || 'حدث خطأ، حاول مرة أخرى');
    },
  });

  const isValid = selectedDate && selectedTime && (bookingType !== 'RENTAL' || (rentalStart && rentalEnd));

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>طلب حجز</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Booking type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نوع الطلب</Text>
          <View style={styles.typeGrid}>
            {BOOKING_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[styles.typeCard, bookingType === type.key && styles.typeCardActive]}
                onPress={() => setBookingType(type.key)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[styles.typeLabel, bookingType === type.key && styles.typeLabelActive]}>
                  {type.label}
                </Text>
                <Text style={[styles.typeDesc, bookingType === type.key && { color: '#fff' }]}>
                  {type.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تاريخ الموعد</Text>
          <TextInput
            style={styles.dateInput}
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholder={getMinDate()}
            placeholderTextColor="#94a3b8"
            textAlign="right"
          />
          <Text style={styles.hint}>صيغة التاريخ: YYYY-MM-DD (مثال: 2026-05-25)</Text>
        </View>

        {/* Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>وقت الموعد</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((time) => (
              <TouchableOpacity
                key={time}
                style={[styles.timeSlot, selectedTime === time && styles.timeSlotActive]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[styles.timeText, selectedTime === time && styles.timeTextActive]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rental dates */}
        {bookingType === 'RENTAL' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>فترة الإيجار</Text>
            <View style={styles.rentalDates}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rentalLabel}>تاريخ البداية</Text>
                <TextInput
                  style={styles.dateInput}
                  value={rentalStart}
                  onChangeText={setRentalStart}
                  placeholder="2026-06-01"
                  placeholderTextColor="#94a3b8"
                  textAlign="right"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rentalLabel}>تاريخ الانتهاء</Text>
                <TextInput
                  style={styles.dateInput}
                  value={rentalEnd}
                  onChangeText={setRentalEnd}
                  placeholder="2026-12-01"
                  placeholderTextColor="#94a3b8"
                  textAlign="right"
                />
              </View>
            </View>
          </View>
        )}

        {/* Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>رسالة للوسيط (اختياري)</Text>
          <TextInput
            style={styles.messageInput}
            value={message}
            onChangeText={setMessage}
            placeholder="أي ملاحظات أو أسئلة للوسيط..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            textAlign="right"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, (!isValid || bookingMutation.isPending) && styles.submitBtnDisabled]}
          onPress={() => bookingMutation.mutate()}
          disabled={!isValid || bookingMutation.isPending}
        >
          {bookingMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>تأكيد الحجز</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  backBtn: { padding: 4, width: 40 },
  backIcon: { fontSize: 22, color: '#0a1628' },
  title: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  scroll: { flex: 1 },
  section: { backgroundColor: '#fff', padding: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', textAlign: 'right', marginBottom: 14 },
  typeGrid: { flexDirection: 'row-reverse', gap: 10 },
  typeCard: {
    flex: 1, borderRadius: 16, padding: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e2e8f0', backgroundColor: '#fff',
  },
  typeCardActive: { backgroundColor: '#0a1628', borderColor: '#0a1628' },
  typeIcon: { fontSize: 28, marginBottom: 6 },
  typeLabel: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  typeLabelActive: { color: '#fff' },
  typeDesc: { fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 3 },
  dateInput: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 14,
    color: '#0f172a', backgroundColor: '#fff',
  },
  hint: { fontSize: 11, color: '#94a3b8', textAlign: 'right', marginTop: 4 },
  timeGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  timeSlot: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e2e8f0', backgroundColor: '#fff',
  },
  timeSlotActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  timeText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  timeTextActive: { color: '#fff' },
  rentalDates: { flexDirection: 'row-reverse', gap: 12 },
  rentalLabel: { fontSize: 13, fontWeight: '600', color: '#374151', textAlign: 'right', marginBottom: 6 },
  messageInput: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 14,
    color: '#0f172a', backgroundColor: '#fff', minHeight: 100,
  },
  footer: {
    backgroundColor: '#fff', paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  submitBtn: {
    backgroundColor: '#1d4ed8', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
