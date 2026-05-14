import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  value?: string;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
  danger?: boolean;
}

interface BrokerStats {
  activeProperties: number;
  totalViews: number;
  totalBookings: number;
  totalDeals: number;
  rating: number;
  profileCompletion: number;
}

export default function BrokerProfileScreen(): React.ReactElement {
  const { user, logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { data: stats } = useQuery<BrokerStats>({
    queryKey: ['broker', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/broker/stats');
      return data.data;
    },
    placeholderData: {
      activeProperties: 0,
      totalViews: 0,
      totalBookings: 0,
      totalDeals: 0,
      rating: 0,
      profileCompletion: 0,
    },
  });

  const handleLogout = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد من تسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'تسجيل الخروج', style: 'destructive', onPress: logout },
    ]);
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'حسابي',
      items: [
        { icon: '✏️', label: 'تعديل الملف الشخصي', onPress: () => Alert.alert('قريباً') },
        { icon: '📋', label: 'الوثائق والترخيص', onPress: () => Alert.alert('قريباً') },
        { icon: '⭐', label: 'التقييمات والمراجعات', onPress: () => Alert.alert('قريباً') },
        { icon: '💳', label: 'الاشتراك والباقات', onPress: () => Alert.alert('قريباً') },
      ],
    },
    {
      title: 'الإعدادات',
      items: [
        {
          icon: '🔔',
          label: 'الإشعارات',
          onPress: () => {},
          isSwitch: true,
          switchValue: notificationsEnabled,
          onSwitchChange: setNotificationsEnabled,
        },
        {
          icon: '🌐',
          label: 'اللغة',
          onPress: () => Alert.alert('قريباً'),
          value: 'العربية',
        },
      ],
    },
    {
      title: 'المساعدة',
      items: [
        { icon: '📞', label: 'الدعم الفني', onPress: () => Alert.alert('الدعم', 'هاتف: +201000000001') },
        { icon: '📄', label: 'شروط الاستخدام', onPress: () => Alert.alert('قريباً') },
        { icon: '🔒', label: 'سياسة الخصوصية', onPress: () => Alert.alert('قريباً') },
      ],
    },
  ];

  const completion = stats?.profileCompletion ?? 0;

  const statItems = [
    { label: 'عقارات نشطة', value: stats?.activeProperties ?? 0, color: '#1d4ed8' },
    { label: 'مشاهدات', value: (stats?.totalViews ?? 0).toLocaleString('ar-EG'), color: '#059669' },
    { label: 'حجوزات', value: stats?.totalBookings ?? 0, color: '#d97706' },
    { label: 'صفقات', value: stats?.totalDeals ?? 0, color: '#7c3aed' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Text style={{ fontSize: 14 }}>📷</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>

          <View style={styles.headerBadges}>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>وسيط عقاري</Text>
            </View>
            <View style={styles.ratingChip}>
              <Text style={styles.ratingChipText}>⭐ {Number(stats?.rating ?? 0).toFixed(1)}</Text>
            </View>
          </View>
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          {statItems.map((stat, idx) => (
            <React.Fragment key={stat.label}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
              {idx < statItems.length - 1 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Profile completion */}
        <View style={styles.completionCard}>
          <View style={styles.completionHeader}>
            <Text style={styles.completionTitle}>اكتمال الملف الشخصي</Text>
            <Text style={styles.completionPercent}>{completion}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${completion}%` }]} />
          </View>
          <Text style={styles.completionHint}>أكمل ملفك لزيادة ظهورك للعملاء</Text>
        </View>

        {/* Menu sections */}
        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, iIdx) => (
                <TouchableOpacity
                  key={iIdx}
                  style={[
                    styles.menuItem,
                    iIdx < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={item.isSwitch ? 1 : 0.7}
                >
                  <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  <View style={styles.menuItemRight}>
                    {item.isSwitch ? (
                      <Switch
                        value={item.switchValue}
                        onValueChange={item.onSwitchChange}
                        trackColor={{ false: '#e2e8f0', true: '#1d4ed8' }}
                        thumbColor="#fff"
                      />
                    ) : (
                      <>
                        {item.value && <Text style={styles.menuItemValue}>{item.value}</Text>}
                        <Text style={styles.chevron}>‹</Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>تسجيل الخروج</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>وسيط برج العرب v1.0.0</Text>
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  header: {
    backgroundColor: '#0a1628',
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarWrapper: { position: 'relative', marginBottom: 14 },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarText: { fontSize: 34, fontWeight: '800', color: '#fff' },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0a1628',
  },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' },
  userPhone: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  headerBadges: { flexDirection: 'row', gap: 8, marginTop: 12 },
  roleChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleChipText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  ratingChip: {
    backgroundColor: 'rgba(251,191,36,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.4)',
  },
  ratingChipText: { fontSize: 12, fontWeight: '700', color: '#fbbf24' },

  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 3, fontWeight: '500' },
  statDivider: { width: 1, backgroundColor: '#f1f5f9', marginVertical: 4 },

  completionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  completionTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  completionPercent: { fontSize: 18, fontWeight: '800', color: '#1d4ed8' },
  progressTrack: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#1d4ed8', borderRadius: 4 },
  completionHint: { fontSize: 12, color: '#94a3b8', marginTop: 8 },

  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 12,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  menuItemIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  menuItemLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#0f172a' },
  menuItemRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuItemValue: { fontSize: 13, color: '#94a3b8' },
  chevron: { fontSize: 20, color: '#cbd5e1', transform: [{ scaleX: -1 }] },

  logoutBtn: {
    backgroundColor: '#fef2f2',
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutIcon: { fontSize: 18 },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#dc2626' },

  version: { textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 20 },
});
