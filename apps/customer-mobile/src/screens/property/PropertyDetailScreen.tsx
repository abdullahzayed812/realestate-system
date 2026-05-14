import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Share,
  StatusBar,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'شقة',
  VILLA: 'فيلا',
  LAND: 'أرض',
  OFFICE: 'مكتب',
  STUDIO: 'استوديو',
  WAREHOUSE: 'مخزن',
  FACTORY: 'مصنع',
};

const LISTING_LABELS: Record<string, string> = {
  SALE: 'للبيع',
  RENT: 'للإيجار',
  DAILY_RENT: 'إيجار يومي',
};

interface PropertyDetail {
  id: string;
  titleAr: string;
  descriptionAr: string;
  type: string;
  listingType: string;
  price: number;
  currency: string;
  pricePerLabel?: string;
  area: number;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  furnished: string | null;
  condition: string | null;
  yearBuilt: number | null;
  parkingSpaces: number;
  isFavorited: boolean;
  viewsCount: number;
  images: { url: string; thumbnailUrl: string }[];
  location: {
    addressAr: string;
    city: string;
    district: string | null;
    latitude: number;
    longitude: number;
  } | null;
  features: { featureAr: string; category: string }[];
  broker: {
    id: string;
    userId: string;
    user: { firstName: string; lastName: string; phone: string };
    rating: number | string | null;
    totalDeals: number | null;
  };
}

export default function PropertyDetailScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params;
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: property, isLoading } = useQuery<PropertyDetail>({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data } = await api.get(`/properties/${id}`);
      return data.data;
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/properties/${id}/favorite`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const startChatMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/chats', {
        brokerId: property!.broker.userId,
        propertyId: property!.id,
      });
      return data.data as { id: string };
    },
    onSuccess: (chat) => {
      navigation.navigate('Chat', {
        screen: 'ChatRoom',
        params: { chatId: chat.id, otherUser: property!.broker.user },
      });
    },
  });

  const handleShare = async () => {
    await Share.share({
      message: `${property?.titleAr}\n${formatPrice(property?.price || 0, property?.currency || 'EGP')} - ${TYPE_LABELS[property?.type || '']}`,
    });
  };

  if (isLoading || !property) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  const featuresByCategory = property.features.reduce(
    (acc, f) => {
      if (!acc[f.category]) acc[f.category] = [];
      acc[f.category].push(f.featureAr);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Image Gallery */}
      <View style={styles.imageContainer}>
        {property.images.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const rawIndex = Math.round(e.nativeEvent.contentOffset.x / width);
              const index = I18nManager.isRTL ? property.images.length - 1 - rawIndex : rawIndex;
              setCurrentImageIndex(Math.max(0, index));
            }}
          >
            {property.images.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img.url }}
                style={styles.propertyImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={{ fontSize: 60 }}>🏠</Text>
          </View>
        )}

        {/* Image counter */}
        {property.images.length > 1 && (
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1}/{property.images.length}
            </Text>
          </View>
        )}

        {/* Top actions */}
        <SafeAreaView style={styles.topActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Text style={{ fontSize: 18 }}>↑</Text>
            </TouchableOpacity>
            {isAuthenticated && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => favoriteMutation.mutate()}>
                <Text style={{ fontSize: 18 }}>{property.isFavorited ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.details} showsVerticalScrollIndicator={false}>
        {/* Price & Title */}
        <View style={styles.section}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{TYPE_LABELS[property.type] || property.type}</Text>
            </View>
            <View style={[styles.badge, styles.badgeGreen]}>
              <Text style={[styles.badgeText, { color: '#065f46' }]}>
                {LISTING_LABELS[property.listingType] || property.listingType}
              </Text>
            </View>
          </View>
          <Text style={styles.propertyTitle}>{property.titleAr}</Text>
          <Text style={styles.price}>{formatPrice(property.price, property.currency)}</Text>
          {property.location && (
            <Text style={styles.locationText}>📍 {property.location.addressAr}</Text>
          )}
        </View>

        {/* Key Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'المساحة', value: `${property.area} م²` },
            ...(property.bedrooms !== null
              ? [{ label: 'غرف النوم', value: `${property.bedrooms} غرف` }]
              : []),
            ...(property.bathrooms !== null
              ? [{ label: 'الحمامات', value: `${property.bathrooms}` }]
              : []),
            ...(property.floor !== null ? [{ label: 'الطابق', value: `${property.floor}` }] : []),
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>وصف العقار</Text>
          <Text style={styles.descriptionText}>{property.descriptionAr}</Text>
        </View>

        {/* Features */}
        {Object.keys(featuresByCategory).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المميزات</Text>
            {Object.entries(featuresByCategory).map(([cat, features]) => (
              <View key={cat} style={{ marginBottom: 12 }}>
                <View style={styles.featuresGrid}>
                  {features.map((feature) => (
                    <View key={feature} style={styles.featureChip}>
                      <Text style={styles.featureText}>✓ {feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Broker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الوسيط العقاري</Text>
          <View style={styles.brokerCard}>
            <View style={styles.brokerAvatar}>
              <Text style={{ fontSize: 24 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.brokerName}>
                {property.broker.user.firstName} {property.broker.user.lastName}
              </Text>
              <Text style={styles.brokerMeta}>
                ⭐{' '}
                {property.broker.rating != null ? Number(property.broker.rating).toFixed(1) : '—'} ·{' '}
                {property.broker.totalDeals ?? 0} صفقة
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.chatBtn, startChatMutation.isPending && { opacity: 0.6 }]}
              onPress={() => startChatMutation.mutate()}
              disabled={startChatMutation.isPending}
            >
              {startChatMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.chatBtnText}>💬 تواصل</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Book CTA */}
      <View style={styles.bottomCta}>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() =>
            navigation.navigate('Booking', {
              propertyId: property.id,
              brokerId: property.broker.id,
            })
          }
        >
          <Text style={styles.bookBtnText}>
            {property.listingType === 'SALE' ? 'طلب معاينة' : 'احجز الآن'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageContainer: { height: 300, position: 'relative' },
  propertyImage: { width, height: 300 },
  imagePlaceholder: {
    width,
    height: 300,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  imageCounterText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  topActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: { flex: 1, backgroundColor: '#fff' },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  badge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeGreen: { backgroundColor: '#ecfdf5' },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#1d4ed8' },
  propertyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  price: { fontSize: 22, fontWeight: '800', color: '#1d4ed8', marginBottom: 6 },
  locationText: { fontSize: 13, color: '#64748b' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  descriptionText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featureChip: {
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  featureText: { fontSize: 12, color: '#166534', fontWeight: '500' },
  brokerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
  },
  brokerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brokerName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  brokerMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  chatBtn: {
    backgroundColor: '#0a1628',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chatBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  bookBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
