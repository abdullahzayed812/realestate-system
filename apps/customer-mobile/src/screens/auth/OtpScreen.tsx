import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function OtpScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { setAuth } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [purpose, setPurpose] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOtp = async (): Promise<void> => {
    const formattedPhone = phone.startsWith('+') ? phone : `+2${phone}`;

    if (formattedPhone.length < 12) {
      Alert.alert('خطأ', 'يرجى إدخال رقم هاتف صحيح');
      return;
    }

    setLoading(true);
    try {
      let detectedPurpose: 'LOGIN' | 'REGISTER' = 'LOGIN';
      try {
        await api.post('/auth/otp/send', { phone: formattedPhone, purpose: 'LOGIN' });
      } catch (err: any) {
        if (err.response?.status === 404) {
          detectedPurpose = 'REGISTER';
          await api.post('/auth/otp/send', { phone: formattedPhone, purpose: 'REGISTER' });
        } else {
          throw err;
        }
      }

      setPurpose(detectedPurpose);
      setStep('otp');
      setCountdown(60);
      setTimeout(() => otpInputRef.current?.focus(), 200);
    } catch (err: any) {
      Alert.alert('خطأ', err.response?.data?.message || 'فشل إرسال رمز التحقق');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (): Promise<void> => {
    if (otp.length !== 6) {
      Alert.alert('خطأ', 'يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+2${phone}`;

      if (purpose === 'REGISTER') {
        navigation.navigate('Register', { phone: formattedPhone, otpCode: otp });
        return;
      }

      const { data } = await api.post('/auth/login', {
        phone: formattedPhone,
        otpCode: otp,
      });

      await setAuth(data.data.user, data.data.tokens);
    } catch (err: any) {
      Alert.alert('خطأ', err.response?.data?.message || 'رمز التحقق غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Logo/Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🏢</Text>
          <Text style={styles.appName}>برج العرب العقارية</Text>
          <Text style={styles.tagline}>منصتك الأولى للعقارات في برج العرب</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {step === 'phone' ? (
            <>
              <Text style={styles.label}>رقم الهاتف</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+20 🇪🇬</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={11}
                  autoFocus
                />
              </View>
              <Text style={styles.hint}>
                سيتم إرسال رمز تحقق برسالة SMS
              </Text>
              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={sendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>إرسال رمز التحقق</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>رمز التحقق</Text>
              <Text style={styles.otpSentTo}>
                تم إرسال رمز التحقق إلى {phone}
              </Text>
              <TextInput
                ref={otpInputRef}
                style={styles.otpInput}
                placeholder="_ _ _ _ _ _"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
              />

              <TouchableOpacity
                style={[styles.btn, (loading || otp.length !== 6) && styles.btnDisabled]}
                onPress={verifyOtp}
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>تأكيد</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={sendOtp}
                disabled={countdown > 0}
              >
                <Text style={[styles.resendText, countdown > 0 && styles.resendDisabled]}>
                  {countdown > 0 ? `إعادة الإرسال بعد ${countdown}ث` : 'إعادة إرسال الرمز'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('phone')}>
                <Text style={styles.changePhone}>تغيير رقم الهاتف</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0a1628',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  phoneInputRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    overflow: 'hidden',
  },
  countryCode: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderLeftWidth: 1.5,
    borderLeftColor: '#e2e8f0',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#0f172a',
  },
  hint: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 8,
    marginBottom: 24,
  },
  otpSentTo: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  otpInput: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 20,
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 12,
    marginBottom: 24,
  },
  btn: {
    backgroundColor: '#0a1628',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  resendText: {
    fontSize: 14,
    color: '#1d4ed8',
    fontWeight: '600',
  },
  resendDisabled: {
    color: '#94a3b8',
  },
  changePhone: {
    textAlign: 'center',
    fontSize: 14,
    color: '#64748b',
    paddingTop: 8,
  },
});
