import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, StatusBar, RefreshControl, Image, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { PropertyCard } from '../../components/property/PropertyCard';

const CATEGORY_FILTERS = [
  { key: '', label: 'الكل' },
  { key: 'APARTMENT', label: 'شقق' },
  { key: 'VILLA', label: 'فيلل' },
  { key: 'LAND', label: 'أراضي' },
  { key: 'OFFICE', label: 'مكاتب' },
  { key: 'WAREHOUSE', label: 'مخازن' },
];

const LISTING_TYPES = [
  { key: 'SALE', label: 'للبيع' },
  { key: 'RENT', label: 'للإيجار' },
  { key: 'DAILY_RENT', label: 'إيجار يومي' },
];

export default function HomeScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [selectedListing, setSelectedListing] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: featured, refetch: refetchFeatured } = useQuery({
    queryKey: ['properties', 'featured'],
    queryFn: async () => {
      const { data } = await api.get('/properties/featured');
      return data.data as Property[];
    },
  });

  const { data: properties, refetch: refetchProperties } = useQuery({
    queryKey: ['properties', 'list', selectedCategory, selectedListing],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('type', selectedCategory);
      if (selectedListing) params.append('listingType', selectedListing);
      params.append('limit', '10');
      const { data } = await api.get(`/properties?${params}`);
      return (data.data?.data || []) as Property[];
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchFeatured(), refetchProperties()]);
    setRefreshing(false);
  }, [refetchFeatured, refetchProperties]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>مرحباً {user?.firstName} 👋</Text>
            <Text style={styles.location}>برج العرب، الإسكندرية</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Text style={{ fontSize: 22 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search', { screen: 'SearchMain' })}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 18, marginLeft: 8 }}>🔍</Text>
          <Text style={styles.searchPlaceholder}>ابحث عن عقار...</Text>
        </TouchableOpacity>

        {/* Listing type filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {LISTING_TYPES.map((lt) => (
            <TouchableOpacity
              key={lt.key}
              style={[
                styles.filterChip,
                selectedListing === lt.key && styles.filterChipActive,
              ]}
              onPress={() => setSelectedListing(selectedListing === lt.key ? '' : lt.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedListing === lt.key && styles.filterChipTextActive,
                ]}
              >
                {lt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Properties */}
        {featured && featured.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>العقارات المميزة</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Search', { screen: 'SearchMain', params: { featured: true } })}>
                <Text style={styles.seeAll}>عرض الكل</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={featured}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PropertyCard
                  property={item}
                  style={{ width: 260, marginLeft: 12 }}
                  onPress={() => navigation.navigate('HomeMain', { screen: 'PropertyDetail', params: { id: item.id } })}
                />
              )}
            />
          </View>
        )}

        {/* Category filter */}
        <View style={styles.section}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {CATEGORY_FILTERS.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.key && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.key && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Properties List */}
        <View style={[styles.section, { paddingHorizontal: 20 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>أحدث العقارات</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search', { screen: 'SearchMain' })}>
              <Text style={styles.seeAll}>عرض الكل</Text>
            </TouchableOpacity>
          </View>

          {(properties || []).map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onPress={() => navigation.navigate('Home', {
                screen: 'PropertyDetail',
                params: { id: property.id },
              })}
              horizontal
            />
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface Property {
  id: string;
  title: string;
  price: number;
  currency: string;
  type: string;
  area: number;
  bedrooms: number | null;
  bathrooms: number | null;
  primaryImage?: string;
  location?: { city: string; district: string | null };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'right',
  },
  location: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'right',
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'right',
    marginRight: 8,
  },
  filterRow: {
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginLeft: 8,
    backgroundColor: '#fff',
  },
  filterChipActive: {
    borderColor: '#1d4ed8',
    backgroundColor: '#eff6ff',
  },
  filterChipText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  seeAll: {
    fontSize: 14,
    color: '#1d4ed8',
    fontWeight: '600',
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginLeft: 8,
  },
  categoryChipActive: {
    backgroundColor: '#0a1628',
  },
  categoryText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
});
