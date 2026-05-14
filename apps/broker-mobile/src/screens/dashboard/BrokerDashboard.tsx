import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2; // 20px padding each side + 12px gap

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'صباح الخير';
  if (h < 17) return 'مساء الخير';
  return 'مساء النور';
}

interface BrokerStats {
  totalProperties: number;
  activeProperties: number;
  totalViews: number;
  pendingBookings: number;
  totalBookings: number;
  profileCompletion: number;
  rating: number;
  totalDeals: number;
}

export default function BrokerDashboard(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats } = useQuery<BrokerStats>({
    queryKey: ['broker', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/broker/stats');
      return data.data;
    },
    placeholderData: {
      totalProperties: 0,
      activeProperties: 0,
      totalViews: 0,
      pendingBookings: 0,
      totalBookings: 0,
      profileCompletion: 0,
      rating: 0,
      totalDeals: 0,
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['broker', 'stats'] });
    setRefreshing(false);
  }, [queryClient]);

  const statItems = [
    {
      label: 'العقارات النشطة',
      value: stats?.activeProperties ?? 0,
      icon: '🏠',
      color: '#1d4ed8',
      bg: '#eff6ff',
    },
    {
      label: 'المشاهدات',
      value: stats?.totalViews ?? 0,
      icon: '👁',
      color: '#059669',
      bg: '#ecfdf5',
    },
    {
      label: 'حجوزات معلقة',
      value: stats?.pendingBookings ?? 0,
      icon: '📅',
      color: '#d97706',
      bg: '#fffbeb',
    },
    {
      label: 'إجمالي الصفقات',
      value: stats?.totalDeals ?? 0,
      icon: '🤝',
      color: '#7c3aed',
      bg: '#f5f3ff',
    },
  ];

  const quickActions = [
    {
      label: 'إضافة عقار',
      icon: '➕',
      onPress: () => navigation.navigate('listings', { screen: 'AddProperty' }),
    },
    { label: 'المحادثات', icon: '💬', onPress: () => navigation.navigate('chat') },
    { label: 'الحجوزات', icon: '📅', onPress: () => navigation.navigate('bookings') },
    { label: 'عقاراتي', icon: '🏘', onPress: () => navigation.navigate('listings') },
  ];

  const completion = stats?.profileCompletion ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 26 }}>👤</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{getGreeting()}،</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Text style={{ fontSize: 22 }}>🔔</Text>
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Rating + deals banner */}
        <View style={styles.banner}>
          <View style={styles.bannerItem}>
            <Text style={styles.bannerValue}>⭐ {Number(stats?.rating ?? 0).toFixed(1)}</Text>
            <Text style={styles.bannerLabel}>التقييم</Text>
          </View>
          <View style={styles.bannerDivider} />
          <View style={styles.bannerItem}>
            <Text style={styles.bannerValue}>{stats?.totalDeals ?? 0}</Text>
            <Text style={styles.bannerLabel}>صفقة مكتملة</Text>
          </View>
          <View style={styles.bannerDivider} />
          <View style={styles.bannerItem}>
            <Text style={styles.bannerValue}>{stats?.totalProperties ?? 0}</Text>
            <Text style={styles.bannerLabel}>إجمالي العقارات</Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {statItems.map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: stat.bg }]}>
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
                onPress={action.onPress}
                activeOpacity={0.75}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Profile completion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اكتمال الملف الشخصي</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressHint}>أكمل ملفك لزيادة ظهورك للعملاء</Text>
              <Text style={styles.progressPercent}>{completion}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${completion}%` }]} />
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { flexGrow: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a1628',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  greeting: { fontSize: 13, color: '#94a3b8' },
  userName: { textAlign: 'left', fontSize: 18, fontWeight: '800', color: '#fff', marginTop: 1 },
  notifBtn: { position: 'relative', padding: 4 },
  notifDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#0a1628',
  },

  banner: {
    flexDirection: 'row-reverse',
    backgroundColor: '#1d4ed8',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerItem: { flex: 1, alignItems: 'center' },
  bannerValue: { fontSize: 20, fontWeight: '800', color: '#fff' },
  bannerLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 3, fontWeight: '500' },
  bannerDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.25)' },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    width: CARD_WIDTH,
    borderRadius: 20,
    padding: 18,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: { fontSize: 30, marginBottom: 10 },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 3 },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 14 },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: { fontSize: 36, marginBottom: 10 },
  actionLabel: { fontSize: 14, fontWeight: '700', color: '#0f172a', textAlign: 'center' },

  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressHint: { fontSize: 13, color: '#64748b', flex: 1 },
  progressPercent: { fontSize: 20, fontWeight: '800', color: '#1d4ed8', marginRight: 4 },
  progressTrack: {
    height: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#1d4ed8', borderRadius: 5 },
});
