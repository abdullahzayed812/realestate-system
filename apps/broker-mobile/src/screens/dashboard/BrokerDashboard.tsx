import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

interface StatItem {
  label: string;
  value: number;
  icon: string;
  color: string;
  bg: string;
}

export default function BrokerDashboard(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['broker', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/broker/stats');
      return data.data;
    },
    placeholderData: {
      totalProperties: 12,
      activeProperties: 8,
      totalViews: 1420,
      pendingBookings: 3,
      totalBookings: 28,
      profileCompletion: 85,
      rating: 4.8,
      totalDeals: 14,
    },
  });

  const statItems: StatItem[] = [
    { label: 'العقارات النشطة', value: stats?.activeProperties || 0, icon: '🏠', color: '#1d4ed8', bg: '#eff6ff' },
    { label: 'المشاهدات', value: stats?.totalViews || 0, icon: '👁', color: '#059669', bg: '#ecfdf5' },
    { label: 'الحجوزات المعلقة', value: stats?.pendingBookings || 0, icon: '📅', color: '#d97706', bg: '#fffbeb' },
    { label: 'إجمالي الصفقات', value: stats?.totalDeals || 0, icon: '🤝', color: '#7c3aed', bg: '#f5f3ff' },
  ];

  const quickActions = [
    { label: 'إضافة عقار', icon: '➕', screen: 'AddProperty' },
    { label: 'المحادثات', icon: '💬', screen: 'Leads' },
    { label: 'الحجوزات', icon: '📅', screen: 'Bookings' },
    { label: 'عقاراتي', icon: '🏘', screen: 'MyProperties' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.avatar}>
              <Text style={{ fontSize: 28 }}>👤</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.greeting}>مساء الخير،</Text>
            <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Text style={{ fontSize: 22 }}>🔔</Text>
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Rating Banner */}
        <View style={styles.ratingBanner}>
          <Text style={styles.ratingText}>⭐ تقييمك: {stats?.rating || 0}</Text>
          <Text style={styles.ratingSubtext}>{stats?.totalDeals || 0} صفقة مكتملة</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statItems.map((stat) => (
            <View
              key={stat.label}
              style={[styles.statCard, { backgroundColor: stat.bg }]}
            >
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value.toLocaleString('ar-EG')}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionCard}
                onPress={() => navigation.navigate(action.screen)}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Profile completion */}
        <View style={styles.section}>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>اكتمال الملف الشخصي</Text>
              <Text style={styles.progressPercent}>{stats?.profileCompletion || 0}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${stats?.profileCompletion || 0}%` },
                ]}
              />
            </View>
            <Text style={styles.progressHint}>
              أكمل ملفك الشخصي لزيادة ظهورك للعملاء
            </Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0a1628',
    gap: 12,
  },
  headerLeft: {},
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#1d4ed8', alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1 },
  greeting: { fontSize: 13, color: '#94a3b8' },
  userName: { fontSize: 18, fontWeight: '800', color: '#fff', textAlign: 'right' },
  notifBtn: { position: 'relative' },
  notifDot: {
    position: 'absolute', top: 0, right: 0,
    width: 9, height: 9, borderRadius: 4.5,
    backgroundColor: '#ef4444',
  },
  ratingBanner: {
    backgroundColor: '#1d4ed8',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  ratingSubtext: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 16,
    gap: 8,
  },
  statCard: {
    width: (width - 40) / 2,
    marginHorizontal: 4,
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-end',
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2, textAlign: 'right' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 14, textAlign: 'right' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: { fontSize: 34, marginBottom: 8 },
  actionLabel: { fontSize: 14, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  progressCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  progressTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  progressPercent: { fontSize: 18, fontWeight: '800', color: '#1d4ed8' },
  progressTrack: {
    height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden', marginBottom: 8,
  },
  progressFill: { height: '100%', backgroundColor: '#1d4ed8', borderRadius: 4 },
  progressHint: { fontSize: 12, color: '#64748b', textAlign: 'right' },
});
