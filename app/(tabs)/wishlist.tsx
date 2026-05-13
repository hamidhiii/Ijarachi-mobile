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
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const loadListings = useCallback(async () => {
    try {
      const allListings = await listingService.getListings();
      setListings(allListings);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const favoriteItems = listings.filter(item => wishlist.includes(item.id));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Избранное</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : favoriteItems.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.grid}>
            {favoriteItems.map(item => <ProductCard key={item.id} item={item} />)}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="heart-dislike-outline" size={80} color="#E2E8F0" />
          <Text style={styles.emptyText}>Вы еще ничего не добавили в избранное</Text>
        </View>
      )}
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
