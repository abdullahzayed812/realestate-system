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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

const PROPERTY_TYPES = [
  { key: 'APARTMENT', label: 'شقة' },
  { key: 'VILLA', label: 'فيلا' },
  { key: 'LAND', label: 'أرض' },
  { key: 'OFFICE', label: 'مكتب' },
  { key: 'STUDIO', label: 'استوديو' },
  { key: 'WAREHOUSE', label: 'مخزن' },
  { key: 'FACTORY', label: 'مصنع' },
  { key: 'SHOP', label: 'محل تجاري' },
];

const LISTING_TYPES = [
  { key: 'SALE', label: 'للبيع' },
  { key: 'RENT', label: 'للإيجار' },
  { key: 'DAILY_RENT', label: 'إيجار يومي' },
];

const FURNISHED_OPTS = [
  { key: 'FURNISHED', label: 'مفروش' },
  { key: 'SEMI_FURNISHED', label: 'نصف مفروش' },
  { key: 'UNFURNISHED', label: 'غير مفروش' },
];

const CONDITION_OPTS = [
  { key: 'NEW', label: 'جديد' },
  { key: 'EXCELLENT', label: 'ممتاز' },
  { key: 'GOOD', label: 'جيد' },
  { key: 'NEEDS_RENOVATION', label: 'يحتاج تجديد' },
];

interface FormState {
  titleAr: string;
  descriptionAr: string;
  type: string;
  listingType: string;
  price: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  floor: string;
  totalFloors: string;
  parkingSpaces: string;
  furnished: string;
  condition: string;
  address: string;
  district: string;
}

export default function AddPropertyScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  const isEdit = !!route.params?.propertyId;

  const [form, setForm] = useState<FormState>({
    titleAr: '',
    descriptionAr: '',
    type: 'APARTMENT',
    listingType: 'SALE',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    floor: '',
    totalFloors: '',
    parkingSpaces: '',
    furnished: '',
    condition: '',
    address: '',
    district: '',
  });

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.titleAr,
        titleAr: form.titleAr,
        description: form.descriptionAr,
        descriptionAr: form.descriptionAr,
        type: form.type,
        listingType: form.listingType,
        price: parseFloat(form.price),
        area: parseFloat(form.area),
        bedrooms: form.bedrooms ? parseInt(form.bedrooms, 10) : undefined,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms, 10) : undefined,
        floor: form.floor ? parseInt(form.floor, 10) : undefined,
        totalFloors: form.totalFloors ? parseInt(form.totalFloors, 10) : undefined,
        parkingSpaces: form.parkingSpaces ? parseInt(form.parkingSpaces, 10) : 0,
        furnished: form.furnished || undefined,
        condition: form.condition || undefined,
        location: {
          address: form.address || form.district || 'برج العرب',
          addressAr: form.address || form.district || 'برج العرب',
          city: 'Borg El Arab',
          district: form.district || undefined,
          latitude: 30.876,
          longitude: 29.654,
        },
      };
      const { data } = await api.post('/properties', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker', 'listings'] });
      Alert.alert('تم بنجاح', 'تم إرسال العقار للمراجعة', [
        { text: 'حسناً', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (err: any) => {
      Alert.alert('خطأ', err?.response?.data?.message || 'حدث خطأ، حاول مرة أخرى');
    },
  });

  const isValid =
    form.titleAr.trim().length >= 10 &&
    form.descriptionAr.trim().length >= 50 &&
    form.price &&
    form.area &&
    form.address.trim();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isEdit ? 'تعديل العقار' : 'إضافة عقار'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>

            <Text style={styles.label}>عنوان العقار *</Text>
            <TextInput
              style={styles.input}
              value={form.titleAr}
              onChangeText={(v) => update('titleAr', v)}
              placeholder="مثال: شقة فاخرة بثلاث غرف نوم..."
              multiline
              placeholderTextColor="#94a3b8"
            />

            <Text style={styles.label}>
              {'وصف العقار * '}
              <Text style={styles.labelHint}>
                ({form.descriptionAr.trim().length}/50 حرف كحد أدنى)
              </Text>
            </Text>
            <TextInput
              style={[styles.input, { minHeight: 100 }]}
              value={form.descriptionAr}
              onChangeText={(v) => update('descriptionAr', v)}
              placeholder="وصف تفصيلي للعقار ومميزاته..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>نوع العقار</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -20 }}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
            >
              {PROPERTY_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.chip, form.type === t.key && styles.chipActive]}
                  onPress={() => update('type', t.key)}
                >
                  <Text style={[styles.chipText, form.type === t.key && styles.chipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { marginTop: 16 }]}>نوع العرض</Text>
            <View style={styles.row}>
              {LISTING_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.optionBtn, form.listingType === t.key && styles.optionBtnActive]}
                  onPress={() => update('listingType', t.key)}
                >
                  <Text
                    style={[
                      styles.optionBtnText,
                      form.listingType === t.key && styles.optionBtnTextActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pricing & Area */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>السعر والمساحة</Text>
            <View style={styles.gridRow}>
              <View style={styles.gridCell}>
                <Text style={styles.label}>السعر (جنيه) *</Text>
                <TextInput
                  style={styles.input}
                  value={form.price}
                  onChangeText={(v) => update('price', v)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.label}>المساحة (م²) *</Text>
                <TextInput
                  style={styles.input}
                  value={form.area}
                  onChangeText={(v) => update('area', v)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>
          </View>

          {/* Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تفاصيل إضافية</Text>
            <View style={styles.gridRow}>
              <View style={styles.gridCell}>
                <Text style={styles.label}>غرف النوم</Text>
                <TextInput
                  style={styles.input}
                  value={form.bedrooms}
                  onChangeText={(v) => update('bedrooms', v)}
                  placeholder="0"
                  keyboardType="number-pad"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.label}>الحمامات</Text>
                <TextInput
                  style={styles.input}
                  value={form.bathrooms}
                  onChangeText={(v) => update('bathrooms', v)}
                  placeholder="0"
                  keyboardType="number-pad"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>
            <View style={styles.gridRow}>
              <View style={styles.gridCell}>
                <Text style={styles.label}>الطابق</Text>
                <TextInput
                  style={styles.input}
                  value={form.floor}
                  onChangeText={(v) => update('floor', v)}
                  placeholder="0"
                  keyboardType="number-pad"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.label}>عدد الطوابق</Text>
                <TextInput
                  style={styles.input}
                  value={form.totalFloors}
                  onChangeText={(v) => update('totalFloors', v)}
                  placeholder="0"
                  keyboardType="number-pad"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCell}>
                <Text style={styles.label}>مواقف السيارات</Text>
                <TextInput
                  style={styles.input}
                  value={form.parkingSpaces}
                  onChangeText={(v) => update('parkingSpaces', v)}
                  placeholder="0"
                  keyboardType="number-pad"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.gridCell} />
            </View>

            <Text style={styles.label}>التأثيث</Text>
            <View style={styles.row}>
              {FURNISHED_OPTS.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.optionBtn, form.furnished === f.key && styles.optionBtnActive]}
                  onPress={() => update('furnished', form.furnished === f.key ? '' : f.key)}
                >
                  <Text
                    style={[
                      styles.optionBtnText,
                      form.furnished === f.key && styles.optionBtnTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>حالة العقار</Text>
            <View style={styles.row}>
              {CONDITION_OPTS.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.optionBtn, form.condition === c.key && styles.optionBtnActive]}
                  onPress={() => update('condition', form.condition === c.key ? '' : c.key)}
                >
                  <Text
                    style={[
                      styles.optionBtnText,
                      form.condition === c.key && styles.optionBtnTextActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الموقع</Text>
            <Text style={styles.label}>العنوان التفصيلي *</Text>
            <TextInput
              style={styles.input}
              value={form.address}
              onChangeText={(v) => update('address', v)}
              placeholder="مثال: المجموعة الخامسة، برج العرب الجديدة"
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.label}>الحي / المنطقة</Text>
            <TextInput
              style={styles.input}
              value={form.district}
              onChangeText={(v) => update('district', v)}
              placeholder="برج العرب"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* <View style={{ height: 100 }} /> */}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!isValid || createMutation.isPending) && styles.submitBtnDisabled,
          ]}
          onPress={() => createMutation.mutate()}
          disabled={!isValid || createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>{isEdit ? 'حفظ التعديلات' : 'نشر العقار'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0a1628',
  },
  backBtn: { padding: 4, width: 40 },
  backIcon: { fontSize: 22, color: '#fff' },
  title: { fontSize: 18, fontWeight: '700', color: '#fff' },
  scroll: { flex: 1 },
  section: { backgroundColor: '#fff', padding: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  labelHint: { fontSize: 11, fontWeight: '400', color: '#94a3b8' },
  input: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#fff',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: '#0a1628', borderColor: '#0a1628' },
  chipText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  optionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  optionBtnActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  optionBtnText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  optionBtnTextActive: { color: '#fff' },
  gridRow: { flexDirection: 'row', gap: 12 },
  gridCell: { flex: 1 },
  footer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  submitBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 80,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
