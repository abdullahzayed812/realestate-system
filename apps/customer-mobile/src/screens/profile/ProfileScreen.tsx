import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';

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

export default function ProfileScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'حسابي',
      items: [
        {
          icon: '👤',
          label: 'تعديل الملف الشخصي',
          onPress: () => Alert.alert('قريباً', 'هذه الميزة قيد التطوير'),
        },
        {
          icon: '❤️',
          label: 'العقارات المفضلة',
          onPress: () => navigation.navigate('Favorites'),
        },
        {
          icon: '📅',
          label: 'حجوزاتي',
          onPress: () => Alert.alert('قريباً', 'عرض الحجوزات قيد التطوير'),
        },
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
          onPress: () => Alert.alert('قريباً', 'تغيير اللغة قيد التطوير'),
          value: 'العربية',
        },
      ],
    },
    {
      title: 'المساعدة',
      items: [
        {
          icon: '📞',
          label: 'تواصل مع الدعم',
          onPress: () => Alert.alert('الدعم الفني', 'هاتف: +201000000001'),
        },
        {
          icon: '📋',
          label: 'شروط الاستخدام',
          onPress: () => Alert.alert('شروط الاستخدام', 'سيتم عرض الشروط هنا'),
        },
        {
          icon: '🔒',
          label: 'سياسة الخصوصية',
          onPress: () => Alert.alert('سياسة الخصوصية', 'سيتم عرض السياسة هنا'),
        },
      ],
    },
    {
      title: '',
      items: [
        {
          icon: '🚪',
          label: 'تسجيل الخروج',
          onPress: handleLogout,
          danger: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.avatarUrl ? null : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Text style={{ fontSize: 16 }}>📷</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>

          <View style={styles.roleChip}>
            <Text style={styles.roleText}>
              {user?.role === 'CUSTOMER' ? 'عميل' : user?.role === 'BROKER' ? 'وسيط' : 'مدير'}
            </Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIdx) => (
          <View key={sectionIdx} style={styles.section}>
            {section.title ? (
              <Text style={styles.sectionTitle}>{section.title}</Text>
            ) : null}
            <View style={styles.menuCard}>
              {section.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={itemIdx}
                  style={[
                    styles.menuItem,
                    itemIdx < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={item.isSwitch ? 1 : 0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  </View>
                  <Text style={[styles.menuItemLabel, item.danger && styles.menuItemLabelDanger]}>
                    {item.label}
                  </Text>
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
                        {item.value && (
                          <Text style={styles.menuItemValue}>{item.value}</Text>
                        )}
                        {!item.danger && <Text style={styles.chevron}>‹</Text>}
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.versionText}>برج العرب العقارية v1.0.0</Text>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  profileHeader: {
    backgroundColor: '#0a1628', paddingTop: 24, paddingBottom: 32,
    alignItems: 'center', paddingHorizontal: 20,
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#1d4ed8', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#0a1628',
  },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' },
  userPhone: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  roleChip: {
    marginTop: 10, backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
  },
  roleText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94a3b8', textAlign: 'right', marginBottom: 8, paddingHorizontal: 4 },
  menuCard: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  menuItem: {
    flexDirection: 'row-reverse', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  menuItemLeft: {},
  menuItemIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  menuItemLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#0f172a', textAlign: 'right' },
  menuItemLabelDanger: { color: '#dc2626' },
  menuItemRight: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  menuItemValue: { fontSize: 13, color: '#94a3b8' },
  chevron: { fontSize: 20, color: '#cbd5e1', transform: [{ scaleX: -1 }] },
  versionText: { textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 24 },
});
