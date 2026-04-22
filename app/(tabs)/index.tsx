import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../components/ProductCard';
import { Colors } from '../../constants/Colors';
import { CATEGORIES } from '../../constants/data';
import { useAuth } from '../../context/AuthContext';
import * as listingService from '../../services/listingService';
import { Listing } from '../../types/listing.types';

const CATEGORY_EMOJI: Record<string, string> = {
  all: '✦',
  dresses: '👗',
  suits: '🤵',
  furniture: '🪑',
  dishes: '🥂',
  decor: '🌸',
  tools: '🛠',
  kids: '🎈',
  tents: '⛺',
  electronics: '📷',
};

const LOCATION_KEY = 'rentoo_user_location';
const LOCATIONS = [
  'Ташкент, Чиланзар',
  'Ташкент, Юнусабад',
  'Ташкент, Мирабад',
  'Ташкент, Яккасарай',
  'Ташкент, Сергели',
  'Ташкент, Учтепа',
  'Ташкент, Бектемир',
  'Ташкент, Шайхантахур',
  'Самарканд',
  'Бухара',
  'Наманган',
  'Андижан',
  'Фергана',
  'Нукус',
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Ташкент, Чиланзар');
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(LOCATION_KEY).then(saved => {
      if (saved) setLocation(saved);
    });
  }, []);

  const chooseLocation = useCallback(async (loc: string) => {
    setLocation(loc);
    setLocationPickerOpen(false);
    setLocationQuery('');
    try { await AsyncStorage.setItem(LOCATION_KEY, loc); } catch {}
  }, []);

  const filteredLocations = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    if (!q) return LOCATIONS;
    return LOCATIONS.filter(l => l.toLowerCase().includes(q));
  }, [locationQuery]);

  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listingService.getListings();
      setListings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadListings();
  }, [loadListings]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return listings.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        (item.description ?? '').toLowerCase().includes(q) ||
        (item.location ?? '').toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, listings, searchQuery]);

  const trending = useMemo(
    () => listings.filter(i => (i.rating ?? 0) >= 4.7).slice(0, 6),
    [listings],
  );

  const firstName = (user?.name || 'Гость').split(' ')[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* ── HEADER ─────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={styles.locRow}
                onPress={() => setLocationPickerOpen(true)}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="location" size={13} color={Colors.primary} />
                <Text style={styles.locText} numberOfLines={1}>{location}</Text>
                <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
              </TouchableOpacity>
              <Text style={styles.greeting}>Привет, {firstName} 👋</Text>
            </View>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => router.push({ pathname: '/notifications' } as any)}
            >
              <Ionicons name="notifications-outline" size={22} color={Colors.text} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
            <TextInput
              placeholder="Что хотите арендовать?"
              placeholderTextColor={Colors.textMuted}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* ── HERO ───────────────────────────────────── */}
        <View style={styles.hero}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>🔥 Свадебный сезон</Text>
          </View>
          <Text style={styles.heroTitle}>Всё для{'\n'}идеального праздника</Text>
          <Text style={styles.heroSub}>Платья, декор, мебель от 5 000 сум</Text>
          <TouchableOpacity
            style={styles.heroBtn}
            activeOpacity={0.85}
            onPress={() => listings[0] && router.push(`/product/${listings[0].id}` as any)}
          >
            <Text style={styles.heroBtnText}>Смотреть →</Text>
          </TouchableOpacity>
        </View>

        {/* ── CATEGORIES ─────────────────────────────── */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Категории</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          {CATEGORIES.map(cat => {
            const active = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {CATEGORY_EMOJI[cat.id] ?? '•'} {cat.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── TRENDING ───────────────────────────────── */}
        {trending.length > 0 && !searchQuery.trim() && (
          <>
            <View style={[styles.sectionHead, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>Трендово сейчас 🔥</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingRow}
            >
              {trending.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.trendCard}
                  activeOpacity={0.9}
                  onPress={() => router.push(`/product/${item.id}` as any)}
                >
                  <View style={styles.trendImgBox}>
                    <Image source={item.image} style={styles.trendImg} contentFit="cover" />
                    <View style={styles.trendBadge}>
                      <Text style={styles.trendBadgeText}>Хит</Text>
                    </View>
                  </View>
                  <View style={styles.trendInfo}>
                    <Text style={styles.trendTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.trendMeta}>
                      <Ionicons name="star" size={11} color="#F59E0B" />
                      <Text style={styles.trendRating}>
                        {(item.rating ?? 4.8).toFixed(1)}
                        {item.reviewCount ? ` (${item.reviewCount})` : ''}
                      </Text>
                    </View>
                    <Text style={styles.trendPrice}>
                      {item.price} <Text style={styles.trendPer}>/день</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* ── GRID ───────────────────────────────────── */}
        <View style={[styles.sectionHead, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim()
              ? `Результаты${filteredItems.length ? ` (${filteredItems.length})` : ''}`
              : selectedCategory === 'all'
                ? 'Рекомендовано вам'
                : CATEGORIES.find(c => c.id === selectedCategory)?.title}
          </Text>
        </View>

        <View style={styles.grid}>
          {loading ? (
            <View style={{ width: '100%', padding: 40 }}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : filteredItems.length > 0 ? (
            filteredItems.map(item => <ProductCard key={item.id} item={item} />)
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="search" size={50} color="#E2E8F0" />
              <Text style={styles.emptyText}>
                {searchQuery.trim()
                  ? `По запросу «${searchQuery.trim()}» ничего не найдено`
                  : 'В этой категории пока нет вещей для аренды'}
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* LOCATION PICKER */}
      <Modal
        visible={locationPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setLocationPickerOpen(false)}
      >
        <Pressable style={styles.locBackdrop} onPress={() => setLocationPickerOpen(false)}>
          <Pressable style={styles.locSheet} onPress={() => {}}>
            <View style={styles.locHandle} />
            <Text style={styles.locSheetTitle}>Выберите город</Text>

            <View style={styles.locSearch}>
              <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
              <TextInput
                value={locationQuery}
                onChangeText={setLocationQuery}
                placeholder="Поиск города или района"
                placeholderTextColor={Colors.textMuted}
                style={styles.locSearchInput}
                autoCorrect={false}
              />
            </View>

            <ScrollView style={{ maxHeight: 380 }} keyboardShouldPersistTaps="handled">
              {filteredLocations.length === 0 ? (
                <Text style={styles.locEmpty}>Ничего не найдено</Text>
              ) : (
                filteredLocations.map(loc => {
                  const active = loc === location;
                  return (
                    <TouchableOpacity
                      key={loc}
                      style={styles.locItem}
                      onPress={() => chooseLocation(loc)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={active ? 'radio-button-on' : 'radio-button-off'}
                        size={18}
                        color={active ? Colors.primary : '#CBD5E1'}
                      />
                      <Text style={[styles.locItemText, active && styles.locItemTextActive]}>
                        {loc}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'column', backgroundColor: '#F7F7F5' },
  scroll: { paddingBottom: 10 },

  // Header
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  greeting: { fontSize: 22, fontWeight: '900', color: Colors.text, marginTop: 2 },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F7F7F5',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F5',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text, padding: 0 },

  // Hero
  hero: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    overflow: 'hidden',
    padding: 22,
    minHeight: 154,
    position: 'relative',
  },
  heroCircle1: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroCircle2: {
    position: 'absolute',
    right: 40,
    top: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  heroBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 25,
    maxWidth: 240,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    marginBottom: 14,
  },
  heroBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  heroBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  // Section
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },

  // Category pills
  pillsRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 4 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
    backgroundColor: '#FFFFFF',
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: { fontSize: 13, fontWeight: '600', color: Colors.text },
  pillTextActive: { color: '#FFFFFF' },

  // Trending
  trendingRow: { paddingHorizontal: 20, gap: 12, paddingBottom: 4 },
  trendCard: {
    width: 162,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  trendImgBox: {
    height: 118,
    backgroundColor: '#EEF7F2',
    position: 'relative',
  },
  trendImg: { width: '100%', height: '100%' },
  trendBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  trendBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  trendInfo: { padding: 10 },
  trendTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 17,
    marginBottom: 4,
  },
  trendMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  trendRating: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  trendPrice: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  trendPer: { fontSize: 11, fontWeight: '500', color: Colors.textMuted },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
  },
  emptyBox: {
    width: '100%',
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },

  // Location picker
  locBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  locSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  locHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EBEBEB',
    marginBottom: 14,
  },
  locSheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 14,
  },
  locSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F5',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
    marginBottom: 12,
  },
  locSearchInput: { flex: 1, fontSize: 14, color: Colors.text, padding: 0 },
  locItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F7F5',
  },
  locItemText: { fontSize: 15, color: Colors.text, fontWeight: '500' },
  locItemTextActive: { color: Colors.primary, fontWeight: '700' },
  locEmpty: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 13,
    paddingVertical: 30,
  },
});
