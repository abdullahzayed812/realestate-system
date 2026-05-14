import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';

type Status = 'ALL' | 'ACTIVE' | 'PENDING' | 'DRAFT';

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'نشط',
  PENDING: 'قيد المراجعة',
  DRAFT: 'مسودة',
  SOLD: 'مبيع',
  RENTED: 'مؤجر',
  SUSPENDED: 'موقوف',
  REJECTED: 'مرفوض',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: '#ecfdf5', text: '#065f46' },
  PENDING: { bg: '#fffbeb', text: '#92400e' },
  DRAFT: { bg: '#f1f5f9', text: '#475569' },
  REJECTED: { bg: '#fef2f2', text: '#991b1b' },
  SOLD: { bg: '#eff6ff', text: '#1e40af' },
};

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'شقة',
  VILLA: 'فيلا',
  LAND: 'أرض',
  OFFICE: 'مكتب',
  STUDIO: 'استوديو',
  WAREHOUSE: 'مخزن',
  FACTORY: 'مصنع',
};

interface Property {
  id: string;
  titleAr: string;
  type: string;
  listingType: string;
  status: string;
  price: number;
  currency: string;
  area: number;
  viewsCount: number;
  favoritesCount: number;
  createdAt: string;
}

export default function MyListingsScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<Status>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['broker', 'listings', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '20' });
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      const { data } = await api.get(`/properties/broker/my?${params}`);
      return data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/properties/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['broker', 'listings'] }),
  });

  const handleDelete = (id: string, title: string) => {
    Alert.alert('حذف العقار', `هل تريد حذف "${title}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  const properties: Property[] = data?.data || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>عقاراتي</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddProperty')}>
          <Text style={styles.addBtnText}>+ إضافة</Text>
        </TouchableOpacity>
      </View>

      {/* Status filters */}
      <View style={styles.filterRow}>
        {(['ALL', 'ACTIVE', 'PENDING', 'DRAFT'] as Status[]).map((s) => (
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
          data={properties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const statusColor = STATUS_COLORS[item.status] || { bg: '#f1f5f9', text: '#475569' };
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>
                      {STATUS_LABELS[item.status] || item.status}
                    </Text>
                  </View>
                  <Text style={styles.propertyType}>{TYPE_LABELS[item.type] || item.type}</Text>
                </View>

                <Text style={styles.propertyTitle} numberOfLines={2}>
                  {item.titleAr}
                </Text>
                <Text style={styles.propertyPrice}>
                  {new Intl.NumberFormat('ar-EG', {
                    style: 'currency',
                    currency: item.currency,
                    maximumFractionDigits: 0,
                  }).format(item.price)}
                </Text>
                <Text style={styles.propertyArea}>{item.area} م²</Text>

                <View style={styles.stats}>
                  <Text style={styles.statItem}>👁 {item.viewsCount.toLocaleString('ar-EG')}</Text>
                  <Text style={styles.statItem}>❤️ {item.favoritesCount}</Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => navigation.navigate('AddProperty', { propertyId: item.id })}
                  >
                    <Text style={styles.editBtnText}>تعديل</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id, item.titleAr)}
                  >
                    <Text style={styles.deleteBtnText}>حذف</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48 }}>🏠</Text>
              <Text style={styles.emptyTitle}>لا توجد عقارات</Text>
              <TouchableOpacity
                style={styles.addEmptyBtn}
                onPress={() => navigation.navigate('AddProperty')}
              >
                <Text style={styles.addEmptyBtnText}>+ أضف عقارك الأول</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0a1628',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  addBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
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
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  filterBtnActive: { backgroundColor: '#0a1628', borderColor: '#0a1628' },
  filterBtnText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  filterBtnTextActive: { color: '#fff' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, gap: 12 },
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  propertyType: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  propertyTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  propertyPrice: { fontSize: 18, fontWeight: '800', color: '#1d4ed8', marginBottom: 2 },
  propertyArea: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  stats: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  statItem: { fontSize: 13, color: '#475569' },
  actions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editBtnText: { color: '#1d4ed8', fontWeight: '700', fontSize: 13 },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  deleteBtnText: { color: '#dc2626', fontWeight: '700', fontSize: 13 },
  emptyContainer: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 20,
  },
  addEmptyBtn: {
    backgroundColor: '#0a1628',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  addEmptyBtnText: { color: '#fff', fontWeight: '700' },
});
