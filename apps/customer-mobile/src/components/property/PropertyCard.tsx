import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, ViewStyle,
} from 'react-native';

interface Property {
  id: string;
  title: string;
  titleAr?: string;
  price: number;
  currency: string;
  pricePer?: string;
  type: string;
  area: number;
  bedrooms: number | null;
  bathrooms: number | null;
  primaryImage?: string;
  isFeatured?: boolean;
  location?: { city?: string; district?: string | null; address?: string };
}

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
  style?: ViewStyle;
  horizontal?: boolean;
}

const CURRENCY_LABEL: Record<string, string> = {
  EGP: 'ج.م',
  USD: 'دولار',
  EUR: 'يورو',
};

const PRICE_PER_LABEL: Record<string, string> = {
  TOTAL: '',
  METER: '/م²',
  NIGHT: '/ليلة',
  MONTH: '/شهر',
  YEAR: '/سنة',
};

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'شقة', VILLA: 'فيلا', LAND: 'أرض', OFFICE: 'مكتب',
  SHOP: 'محل', WAREHOUSE: 'مخزن', FACTORY: 'مصنع', STUDIO: 'استوديو',
};

function formatPrice(price: number, currency: string, pricePer?: string): string {
  const formatted = new Intl.NumberFormat('ar-EG').format(price);
  const cur = CURRENCY_LABEL[currency] || currency;
  const per = PRICE_PER_LABEL[pricePer || 'TOTAL'] || '';
  return `${formatted} ${cur}${per}`;
}

export function PropertyCard({
  property,
  onPress,
  style,
  horizontal,
}: PropertyCardProps): React.ReactElement {
  if (horizontal) {
    return (
      <TouchableOpacity
        style={[styles.horizontalCard, style]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Image
          source={
            property.primaryImage
              ? { uri: property.primaryImage }
              : require('../../assets/placeholder.png')
          }
          style={styles.horizontalImage}
          resizeMode="cover"
        />
        <View style={styles.horizontalContent}>
          <View style={styles.horizontalHeader}>
            <Text style={styles.propertyType}>
              {TYPE_LABELS[property.type] || property.type}
            </Text>
            {property.isFeatured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>مميز</Text>
              </View>
            )}
          </View>
          <Text style={styles.horizontalTitle} numberOfLines={2}>
            {property.titleAr || property.title}
          </Text>
          <Text style={styles.price}>
            {formatPrice(property.price, property.currency, property.pricePer)}
          </Text>
          <View style={styles.specs}>
            <Text style={styles.specText}>📐 {property.area} م²</Text>
            {property.bedrooms != null && (
              <Text style={styles.specText}>🛏 {property.bedrooms}</Text>
            )}
            {property.bathrooms != null && (
              <Text style={styles.specText}>🚿 {property.bathrooms}</Text>
            )}
          </View>
          {property.location && (
            <Text style={styles.location} numberOfLines={1}>
              📍 {property.location.district || property.location.city || ''}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.imageContainer}>
        <Image
          source={
            property.primaryImage
              ? { uri: property.primaryImage }
              : require('../../assets/placeholder.png')
          }
          style={styles.image}
          resizeMode="cover"
        />
        {property.isFeatured && (
          <View style={styles.featuredBadgeAbsolute}>
            <Text style={styles.featuredText}>⭐ مميز</Text>
          </View>
        )}
        <View style={styles.typeBadgeAbsolute}>
          <Text style={styles.typeBadgeText}>{TYPE_LABELS[property.type] || property.type}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {property.titleAr || property.title}
        </Text>
        <Text style={styles.cardPrice}>
          {formatPrice(property.price, property.currency, property.pricePer)}
        </Text>
        <View style={styles.cardSpecs}>
          <Text style={styles.specText}>📐 {property.area} م²</Text>
          {property.bedrooms != null && (
            <Text style={styles.specText}>🛏 {property.bedrooms}</Text>
          )}
          {property.bathrooms != null && (
            <Text style={styles.specText}>🚿 {property.bathrooms}</Text>
          )}
        </View>
        {property.location && (
          <Text style={styles.cardLocation} numberOfLines={1}>
            📍 {property.location.district || property.location.city}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Vertical card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#f1f5f9',
  },
  featuredBadgeAbsolute: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  typeBadgeAbsolute: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'right',
    lineHeight: 22,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1d4ed8',
    marginTop: 6,
    textAlign: 'right',
  },
  cardSpecs: {
    flexDirection: 'row-reverse',
    gap: 12,
    marginTop: 8,
  },
  cardLocation: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'right',
  },

  // Horizontal card
  horizontalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row-reverse',
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  horizontalImage: {
    width: 120,
    height: 120,
    backgroundColor: '#f1f5f9',
  },
  horizontalContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  horizontalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  propertyType: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  featuredBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  featuredText: {
    fontSize: 10,
    color: '#92400e',
    fontWeight: '700',
  },
  horizontalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'right',
    flex: 1,
    lineHeight: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1d4ed8',
    textAlign: 'right',
  },
  specs: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  specText: {
    fontSize: 12,
    color: '#475569',
  },
  location: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'right',
  },
});
