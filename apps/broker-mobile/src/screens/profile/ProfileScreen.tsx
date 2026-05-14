import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function BrokerProfileScreen(): React.ReactElement {
  const { user, logout } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['broker', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/broker/stats');
      return data.data;
    },
    placeholderData: {
      totalProperties: 12, activeProperties: 8,
      totalViews: 1420, totalBookings: 28,
      rating: 4.8, totalDeals: 14, profileCompletion: 85,
    },
  });

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تسجيل الخروج', style: 'destructive', onPress: logout },
      ],
    );
  };

  const menuItems = [
    { icon: '✏️', label: 'تعديل الملف الشخصي', onPress: () => Alert.alert('قريباً') },
    { icon: '📋', label: 'الوثائق والترخيص', onPress: () => Alert.alert('قريباً') },
    { icon: '⭐', label: 'التقييمات والمراجعات', onPress: () => Alert.alert('قريباً') },
    { icon: '💳', label: 'الاشتراك والباقات', onPress: () => Alert.alert('قريباً') },
    { icon: '📞', label: 'الدعم الفني', onPress: () => Alert.alert('الدعم', 'هاتف: +201000000001') },
    { icon: '🔒', label: 'الخصوصية والأمان', onPress: () => Alert.alert('قريباً') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Text>📷</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>⭐ {stats?.rating || 0}</Text>
            <Text style={styles.dealsText}>{stats?.totalDeals || 0} صفقة مكتملة</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'عقارات نشطة', value: stats?.activeProperties || 0, color: '#1d4ed8' },
            { label: 'مشاهدات', value: (stats?.totalViews || 0).toLocaleString('ar-EG'), color: '#059669' },
            { label: 'حجوزات', value: stats?.totalBookings || 0, color: '#d97706' },
            { label: 'صفقات', value: stats?.totalDeals || 0, color: '#7c3aed' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Profile Completion */}
        <View style={styles.section}>
          <View style={styles.completionHeader}>
            <Text style={styles.completionTitle}>اكتمال الملف الشخصي</Text>
            <Text style={styles.completionPercent}>{stats?.profileCompletion || 0}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${stats?.profileCompletion || 0}%` }]} />
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.menuItem, idx < menuItems.length - 1 && styles.menuItemBorder]}
              onPress={item.onPress}
            >
              <Text style={styles.menuItemIcon}>{item.icon}</Text>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
              <Text style={styles.chevron}>‹</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 تسجيل الخروج</Text>
        </TouchableOpacity>

        <Text style={styles.version}>وسيط برج العرب v1.0.0</Text>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0a1628', paddingTop: 24, paddingBottom: 28,
    paddingHorizontal: 20, alignItems: 'center',
  },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#1d4ed8', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  userPhone: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  ratingRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  ratingText: { fontSize: 15, fontWeight: '700', color: '#fbbf24' },
  dealsText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, paddingTop: 16, gap: 8,
  },
  statCard: {
    width: '47%', marginHorizontal: '1.5%',
    backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  section: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  completionHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 10 },
  completionTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  completionPercent: { fontSize: 16, fontWeight: '800', color: '#1d4ed8' },
  progressTrack: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#1d4ed8', borderRadius: 4 },
  menuCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 16,
    overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  menuItem: {
    flexDirection: 'row-reverse', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  menuItemIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  menuItemLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#0f172a', textAlign: 'right' },
  chevron: { fontSize: 20, color: '#cbd5e1', transform: [{ scaleX: -1 }] },
  logoutBtn: {
    marginHorizontal: 16, marginTop: 12, backgroundColor: '#fef2f2',
    borderRadius: 16, paddingVertical: 14, alignItems: 'center',
  },
  logoutText: { color: '#dc2626', fontSize: 15, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 16 },
});
