import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import ProductCard from '../../components/ProductCard';
import { Colors } from '../../constants/Colors';
import { useWishlist } from '../../context/WishlistContext';
import * as listingService from '../../services/listingService';
import { Listing } from '../../types/listing.types';

export default function WishlistScreen() {
  const { wishlist } = useWishlist();
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    try {
      const all = await listingService.getListings();
      setItems(all.filter(item => wishlist.includes(item.id)));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [wishlist]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Избранное</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {loading ? (
          <View style={styles.empty}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : items.length > 0 ? (
          <View style={styles.grid}>
            {items.map(item => <ProductCard key={item.id} item={item} />)}
          </View>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="heart-dislike-outline" size={80} color="#E2E8F0" />
            <Text style={styles.emptyText}>Вы еще ничего не добавили в избранное</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  scroll: { paddingHorizontal: 8, paddingTop: 10, paddingBottom: 100 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 150 },
  emptyText: { color: '#94A3B8', fontSize: 16, textAlign: 'center', marginTop: 15 },
});