import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { PropertyCard } from '../../components/property/PropertyCard';

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

export default function FavoritesScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery<Property[]>({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data } = await api.get('/properties/user/favorites');
      return data.data?.data || [];
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      await api.post(`/properties/${propertyId}/favorite`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>المفضلة</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1d4ed8" />
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <PropertyCard
                property={item}
                horizontal
                onPress={() =>
                  navigation.navigate('HomeMain', {
                    screen: 'PropertyDetail',
                    params: { id: item.id },
                  })
                }
              />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeMutation.mutate(item.id)}
              >
                <Text style={styles.removeBtnText}>❤️ إزالة</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 56 }}>❤️</Text>
              <Text style={styles.emptyTitle}>لا توجد عقارات مفضلة</Text>
              <Text style={styles.emptySubtitle}>اضغط على ❤️ في أي عقار لإضافته هنا</Text>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => navigation.navigate('Home', { screen: 'HomeMain' })}
              >
                <Text style={styles.browseBtnText}>تصفح العقارات</Text>
              </TouchableOpacity>
            </View>
          }
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: { padding: 4, width: 40 },
  backIcon: { fontSize: 22, color: '#0a1628' },
  title: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, gap: 12 },
  cardWrapper: { position: 'relative' },
  removeBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  removeBtnText: { fontSize: 12, fontWeight: '600', color: '#dc2626' },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#374151', marginTop: 16 },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  browseBtn: {
    marginTop: 24,
    backgroundColor: '#0a1628',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
  },
  browseBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
