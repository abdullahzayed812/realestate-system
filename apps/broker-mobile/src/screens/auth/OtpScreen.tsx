import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

type Step = 'PHONE' | 'OTP';

export default function OtpScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { setAuth } = useAuthStore();

  const [step, setStep] = useState<Step>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!phone.trim() || phone.length < 10) {
      Alert.alert('خطأ', 'أدخل رقم هاتف صحيح');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/otp/send', { phone, purpose: 'LOGIN' });
      setIsNewUser(data.data?.isNewUser ?? false);
      setStep('OTP');
      setCountdown(60);
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'فشل الإرسال');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) return;

    setLoading(true);
    try {
      if (isNewUser) {
        navigation.navigate('Register', { phone, otpCode });
      } else {
        const { data } = await api.post('/auth/login', { phone, otpCode });
        if (data.data.user.role !== 'BROKER' && data.data.user.role !== 'ADMIN') {
          Alert.alert('غير مصرح', 'هذا التطبيق للوسطاء العقاريين فقط');
          return;
        }
        await setAuth(data.data.user, data.data.tokens);
      }
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message || 'رمز غير صحيح');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🏢</Text>
            <Text style={styles.title}>وسيط برج العرب</Text>
            <Text style={styles.subtitle}>
              {step === 'PHONE' ? 'أدخل رقم هاتفك للمتابعة' : `أدخل الرمز المرسل إلى\n${phone}`}
            </Text>
          </View>

          {step === 'PHONE' ? (
            <View style={styles.form}>
              <View style={styles.phoneField}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>🇪🇬 +20</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="1XX XXXX XXXX"
                  keyboardType="phone-pad"
                  maxLength={13}
                  placeholderTextColor="#94a3b8"
                  textAlign="left"
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>إرسال الرمز</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.otpContainer}>
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={(ref) => { inputRefs.current[i] = ref; }}
                    style={[styles.otpInput, digit && styles.otpInputFilled]}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text.slice(-1), i)}
                    onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, i)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, (otp.join('').length < 6 || loading) && styles.primaryBtnDisabled]}
                onPress={handleVerify}
                disabled={otp.join('').length < 6 || loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>تحقق</Text>}
              </TouchableOpacity>

              <View style={styles.resendRow}>
                {countdown > 0 ? (
                  <Text style={styles.countdownText}>إعادة الإرسال بعد {countdown}ث</Text>
                ) : (
                  <TouchableOpacity onPress={handleSendOtp}>
                    <Text style={styles.resendText}>إعادة إرسال الرمز</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => { setStep('PHONE'); setOtp(['', '', '', '', '', '']); }}>
                  <Text style={styles.changePhoneText}>تغيير الرقم</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },
  content: { flex: 1, padding: 28, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center' },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  form: { gap: 16 },
  phoneField: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: 16, paddingVertical: 16, justifyContent: 'center',
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.15)',
  },
  countryCodeText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  phoneInput: { flex: 1, paddingHorizontal: 16, fontSize: 16, color: '#fff' },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  otpInput: {
    width: 48, height: 56, borderRadius: 14, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.08)',
    fontSize: 22, fontWeight: '800', color: '#fff',
  },
  otpInputFilled: { borderColor: '#1d4ed8', backgroundColor: 'rgba(29,78,216,0.2)' },
  primaryBtn: {
    backgroundColor: '#1d4ed8', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resendRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  countdownText: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  resendText: { fontSize: 13, color: '#60a5fa', fontWeight: '600' },
  changePhoneText: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
});
