import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
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

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال الاسم الأول والأخير');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        phone,
        otpCode,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        role: 'BROKER',
      });

      await setAuth(data.data.user, data.data.tokens);
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'حدث خطأ، حاول مرة أخرى');
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
          <View style={styles.header}>
            <Text style={styles.title}>إنشاء حساب وسيط</Text>
            <Text style={styles.subtitle}>أكمل بياناتك للبدء في نشر العقارات</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>الاسم الأول *</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="محمد"
                />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>الاسم الأخير *</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="أحمد"
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>رقم الهاتف</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={phone}
                editable={false}
              />
            </View>

            <View>
              <Text style={styles.label}>البريد الإلكتروني (اختياري)</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="broker@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign="left"
              />
            </View>

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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },
  scroll: { flexGrow: 1, padding: 24 },
  header: { alignItems: 'center', marginBottom: 36, marginTop: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 6 },
  form: { gap: 16 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  label: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  inputDisabled: { backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' },
  submitBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
