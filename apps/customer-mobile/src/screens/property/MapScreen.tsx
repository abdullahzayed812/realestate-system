import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function MapScreen(): React.ReactElement {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>الخريطة</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.placeholder}>
        <Text style={{ fontSize: 56 }}>🗺️</Text>
        <Text style={styles.placeholderTitle}>عرض الخريطة</Text>
        <Text style={styles.placeholderSub}>
          سيتم عرض العقارات على خريطة تفاعلية{'\n'}بعد تكوين Google Maps API
        </Text>
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backLinkText}>العودة للقائمة</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  backBtn: { padding: 4, width: 40 },
  backIcon: { fontSize: 22, color: '#0a1628' },
  title: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  placeholderTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginTop: 16 },
  placeholderSub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  backLink: {
    marginTop: 24, backgroundColor: '#0a1628',
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14,
  },
  backLinkText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
