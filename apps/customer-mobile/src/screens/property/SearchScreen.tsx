import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  // Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../../services/api';
import { PropertyCard } from '../../components/property/PropertyCard';

// const { width } = Dimensions.get('window');

const TYPES = [
  { key: '', label: 'الكل' },
  { key: 'APARTMENT', label: 'شقق' },
  { key: 'VILLA', label: 'فيلات' },
  { key: 'LAND', label: 'أراضي' },
  { key: 'OFFICE', label: 'مكاتب' },
  { key: 'WAREHOUSE', label: 'مخازن' },
  { key: 'STUDIO', label: 'استوديو' },
];

const LISTING_TYPES = [
  { key: '', label: 'الكل' },
  { key: 'SALE', label: 'للبيع' },
  { key: 'RENT', label: 'للإيجار' },
  { key: 'DAILY_RENT', label: 'يومي' },
];

const SORT_OPTIONS = [
  { key: 'created_at_desc', label: 'الأحدث' },
  { key: 'price_asc', label: 'السعر: الأقل' },
  { key: 'price_desc', label: 'السعر: الأعلى' },
  { key: 'area_desc', label: 'الأكبر مساحة' },
];

interface Property {
  id: string;
  titleAr: string;
  price: number;
  currency: string;
  type: string;
  area: number;
  bedrooms: number | null;
  bathrooms: number | null;
  primaryImage?: string;
  location?: { city: string; district: string | null };
}

export default function SearchScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [listingFilter, setListingFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minArea, setMinArea] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'properties',
      'search',
      { query, typeFilter, listingFilter, sortBy, minPrice, maxPrice, minArea, page },
    ],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (query) params.append('search', query);
      if (typeFilter) params.append('type', typeFilter);
      if (listingFilter) params.append('listingType', listingFilter);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minArea) params.append('minArea', minArea);
      const { data } = await api.get(`/properties?${params}`);
      return data.data;
    },
  });

  const properties: Property[] = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const handleSearch = useCallback(() => {
    setPage(1);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Text style={{ fontSize: 16, color: '#94a3b8' }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            placeholder="ابحث بالمنطقة، النوع..."
            placeholderTextColor="#94a3b8"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                setPage(1);
              }}
            >
              <Text style={{ color: '#94a3b8', fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={{ fontSize: 18 }}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Type filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeFilter}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {TYPES.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.chip, typeFilter === t.key && styles.chipActive]}
            onPress={() => {
              setTypeFilter(t.key);
              setPage(1);
            }}
          >
            <Text style={[styles.chipText, typeFilter === t.key && styles.chipTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterGroupLabel}>نوع العرض</Text>
          <View style={styles.filterRow}>
            {LISTING_TYPES.map((lt) => (
              <TouchableOpacity
                key={lt.key}
                style={[styles.filterOption, listingFilter === lt.key && styles.filterOptionActive]}
                onPress={() => {
                  setListingFilter(lt.key);
                  setPage(1);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    listingFilter === lt.key && styles.filterOptionTextActive,
                  ]}
                >
                  {lt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterGroupLabel}>نطاق السعر (جنيه)</Text>
          <View style={styles.priceRow}>
            <TextInput
              style={styles.priceInput}
              value={minPrice}
              onChangeText={setMinPrice}
              placeholder="الحد الأدنى"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
            />
            <Text style={{ color: '#94a3b8' }}>—</Text>
            <TextInput
              style={styles.priceInput}
              value={maxPrice}
              onChangeText={setMaxPrice}
              placeholder="الحد الأقصى"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <Text style={styles.filterGroupLabel}>ترتيب حسب</Text>
          <View style={styles.filterRow}>
            {SORT_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s.key}
                style={[styles.filterOption, sortBy === s.key && styles.filterOptionActive]}
                onPress={() => {
                  setSortBy(s.key);
                  setPage(1);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    sortBy === s.key && styles.filterOptionTextActive,
                  ]}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{meta.total} نتيجة</Text>
        {isFetching && !isLoading && <ActivityIndicator size="small" color="#1d4ed8" />}
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1d4ed8" />
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              horizontal
              onPress={() => navigation.navigate('PropertyDetail', { id: item.id })}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48 }}>🔍</Text>
              <Text style={styles.emptyTitle}>لا توجد نتائج</Text>
              <Text style={styles.emptySubtitle}>جرب تغيير معايير البحث</Text>
            </View>
          }
          onEndReached={() => {
            if (page < meta.totalPages) setPage(page + 1);
          }}
          onEndReachedThreshold={0.3}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 22, color: '#0a1628' },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#0f172a' },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: '#eff6ff', borderWidth: 1.5, borderColor: '#1d4ed8' },
  typeFilter: { flexShrink: 0, maxHeight: 51, paddingVertical: 8, backgroundColor: '#fff' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  chipActive: { backgroundColor: '#0a1628' },
  chipText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  filtersPanel: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterGroupLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterOption: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  filterOptionActive: { borderColor: '#1d4ed8', backgroundColor: '#eff6ff' },
  filterOptionText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  filterOptionTextActive: { color: '#1d4ed8' },
  priceRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  priceInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resultsCount: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', marginTop: 6 },
});
