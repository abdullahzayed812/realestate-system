import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

const FEATURES = [
  { icon: '🔍', label: 'ابحث بسهولة', desc: 'آلاف العقارات في متناول يدك' },
  { icon: '🤝', label: 'تواصل مباشر', desc: 'تحدث مع الوسيط فوراً' },
  { icon: '📅', label: 'احجز بسرعة', desc: 'حجز معاينة في خطوات بسيطة' },
];

export default function WelcomeScreen(): React.ReactElement {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🏠</Text>
        </View>
        <Text style={styles.appName}>برج العرب العقارية</Text>
        <Text style={styles.tagline}>اكتشف أفضل العقارات في برج العرب، الإسكندرية</Text>
      </View>

      {/* Feature highlights */}
      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f.label} style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Text style={{ fontSize: 22 }}>{f.icon}</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Otp', { intent: 'login' })}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>تسجيل الدخول</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Otp', { intent: 'register' })}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>إنشاء حساب جديد</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          بالمتابعة توافق على{' '}
          <Text style={styles.termsLink}>شروط الاستخدام</Text>
          {' '}و{' '}
          <Text style={styles.termsLink}>سياسة الخصوصية</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: height * 0.04,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#0a1628',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#0a1628',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  logoEmoji: { fontSize: 52 },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0a1628',
    textAlign: 'center',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },

  features: {
    paddingHorizontal: 28,
    gap: 16,
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureLabel: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  featureDesc: { fontSize: 13, color: '#94a3b8', marginTop: 1 },

  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 24,
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#0a1628',
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#0a1628', fontSize: 16, fontWeight: '700' },
  terms: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
    marginTop: 4,
  },
  termsLink: { color: '#1d4ed8', fontWeight: '600' },
});
