import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useWishlist } from '../../context/WishlistContext';
import { ITEMS } from '../../constants/data';
import ProductCard from '../../components/ProductCard';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function WishlistScreen() {
  const { wishlist } = useWishlist();
  const favoriteItems = ITEMS.filter(item => wishlist.includes(item.id));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Избранное</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {favoriteItems.length > 0 ? (
          <View style={styles.grid}>
            {favoriteItems.map(item => <ProductCard key={item.id} item={item} />)}
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