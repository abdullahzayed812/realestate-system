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
  { icon: '🏠', label: 'أضف عقاراتك', desc: 'انشر إعلاناتك وتواصل مع العملاء' },
  { icon: '📅', label: 'إدارة الحجوزات', desc: 'تابع طلبات المعاينة في مكان واحد' },
  { icon: '📊', label: 'إحصائيات دقيقة', desc: 'راقب أداء إعلاناتك لحظة بلحظة' },
];

export default function BrokerWelcomeScreen(): React.ReactElement {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🏢</Text>
        </View>
        <Text style={styles.appName}>وسيط برج العرب</Text>
        <Text style={styles.tagline}>منصتك الاحترافية لإدارة العقارات وتنمية أعمالك</Text>
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
          <Text style={styles.secondaryBtnText}>إنشاء حساب وسيط</Text>
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
  container: { flex: 1, backgroundColor: '#0a1628' },

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
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoEmoji: { fontSize: 52 },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureLabel: { fontSize: 15, fontWeight: '700', color: '#fff' },
  featureDesc: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 1 },

  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 24,
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  secondaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  terms: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 18,
    marginTop: 4,
  },
  termsLink: { color: 'rgba(255,255,255,0.65)', fontWeight: '600' },
});
