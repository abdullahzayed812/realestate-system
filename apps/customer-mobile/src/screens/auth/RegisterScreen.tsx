import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function RegisterScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { phone, otpCode } = route.params || {};
  const { setAuth } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('الرجاء إدخال الاسم الأول والأخير');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/register', {
        phone,
        otpCode,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
      });

      await setAuth(data.data.user, data.data.tokens);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>→</Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🏠</Text>
            <Text style={styles.title}>إنشاء حساب جديد</Text>
            <Text style={styles.subtitle}>أدخل بياناتك لإكمال التسجيل</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>الاسم الأول *</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="محمد"
                  textAlign="right"
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>الاسم الأخير *</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="أحمد"
                  textAlign="right"
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>رقم الهاتف</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={phone}
                editable={false}
                textAlign="right"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>البريد الإلكتروني (اختياري)</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign="left"
              />
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>إنشاء الحساب</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            بالتسجيل، توافق على شروط الاستخدام وسياسة الخصوصية
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flexGrow: 1, padding: 24 },
  backBtn: { alignSelf: 'flex-end', padding: 8, marginBottom: 16 },
  backText: { fontSize: 22, color: '#0a1628', transform: [{ scaleX: -1 }] },
  logoContainer: { alignItems: 'center', marginBottom: 36 },
  logo: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: '#0a1628', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#64748b', textAlign: 'center', marginTop: 6 },
  form: { gap: 16 },
  row: { flexDirection: 'row-reverse', gap: 12 },
  halfField: { flex: 1 },
  field: {},
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, textAlign: 'right' },
  input: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: '#0f172a', backgroundColor: '#fff',
  },
  inputDisabled: { backgroundColor: '#f1f5f9', color: '#94a3b8' },
  errorBox: { backgroundColor: '#fef2f2', borderRadius: 12, padding: 14 },
  errorText: { color: '#dc2626', fontSize: 13, textAlign: 'right', fontWeight: '500' },
  submitBtn: {
    backgroundColor: '#0a1628', borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  terms: { textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 24 },
});
