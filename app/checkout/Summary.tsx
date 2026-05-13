import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import YandexMapPicker from '../../components/YandexMapPicker';
import { Colors } from '../../constants/Colors';
import * as listingService from '../../services/listingService';
import { Listing } from '../../types/listing.types';

const LOCATION_KEY = 'rentoo_user_location';

export default function OrderSummary() {
  const router = useRouter();
  const { id, days, qty, startDate, endDate } = useLocalSearchParams();

  const [product, setProduct] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    listingService.getListingById(id as string).then(data => {
      setProduct(data);
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    AsyncStorage.getItem(LOCATION_KEY).then(saved => {
      setLocation(saved || 'Ташкент, Чиланзар');
    });
  }, []);

  const handleSelectLocation = async (address: string) => {
    setLocation(address);
    try { await AsyncStorage.setItem(LOCATION_KEY, address); } catch {}
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={{ color: '#64748B', fontSize: 16 }}>Объявление не найдено</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: Colors.primary, fontWeight: '700' }}>Назад</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const daysCount = parseInt(days as string) || 1;
  const quantity = parseInt(qty as string) || 1;
  const pricePerDay =
    product.priceNum ?? (parseInt((product.price ?? '0').replace(/\D/g, ''), 10) || 0);
  const rentTotal = pricePerDay * daysCount * quantity;
  const totalAmount = rentTotal;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Подтверждение заказа</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Карточка товара */}
        <View style={styles.productCard}>
          <Image source={product.image} style={styles.productImg} />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={1}>{product.title}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={14} color="#64748B" />
              <Text style={styles.productSub}>
                {startDate === endDate
                  ? formatDate(startDate as string)
                  : `${formatDate(startDate as string)} — ${formatDate(endDate as string)}`}
                {` (${daysCount} дн.)`}
              </Text>
            </View>
            {quantity > 1 && (
              <View style={styles.infoRow}>
                <Ionicons name="layers-outline" size={14} color="#64748B" />
                <Text style={styles.productSub}>Количество: {quantity} шт.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Адрес доставки */}
        <TouchableOpacity style={styles.locationCard} onPress={() => setMapOpen(true)} activeOpacity={0.8}>
          <View style={styles.locationLeft}>
            <View style={styles.locationIcon}>
              <Ionicons name="location" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationLabel}>Адрес доставки</Text>
              <Text style={styles.locationValue} numberOfLines={2}>
                {location || 'Нажмите, чтобы выбрать'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* Детали расчёта */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Детали расчета</Text>
          <View style={styles.row}>
            <Text style={styles.label}>
              Аренда {quantity > 1 ? `(${quantity} шт. x ${daysCount} дн.)` : `(${daysCount} дн.)`}
            </Text>
            <Text style={styles.value}>{rentTotal.toLocaleString()} сум</Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Итого к оплате</Text>
            <Text style={styles.totalValue}>{totalAmount.toLocaleString()} сум</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Деньги зарезервированы на защищённом счёте Rentoo и переводятся владельцу только после того, как вы вернёте вещь в исправном виде.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.payBtn}
          onPress={() => router.push({
            pathname: '/checkout/Payment',
            params: {
              amount: totalAmount,
              itemId: id,
              startDate: startDate as string,
              endDate: endDate as string,
              days: daysCount,
              location,
            }
          })}
        >
          <Text style={styles.payBtnText}>Перейти к оплате</Text>
        </TouchableOpacity>
      </View>

      <YandexMapPicker
        visible={mapOpen}
        onClose={() => setMapOpen(false)}
        onSelect={(address) => handleSelectLocation(address)}
        initialAddress={location}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  scroll: { padding: 20 },

  productCard: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 20, marginBottom: 16, alignItems: 'center' },
  productImg: { width: 70, height: 70, borderRadius: 12 },
  productInfo: { marginLeft: 15, flex: 1 },
  productTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  productSub: { fontSize: 13, color: '#64748B' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },

  locationCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F8FAFC', borderRadius: 20, padding: 16, marginBottom: 16,
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  locationLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 8 },
  locationIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  locationLabel: { fontSize: 12, color: '#64748B', marginBottom: 2 },
  locationValue: { fontSize: 14, fontWeight: '700', color: Colors.text },

  section: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 25, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  label: { fontSize: 14, color: '#64748B' },
  value: { fontSize: 15, fontWeight: '600', color: Colors.text },
  totalRow: { marginTop: 10, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: Colors.text },
  totalValue: { fontSize: 20, fontWeight: '900', color: Colors.primary },

  infoBox: { flexDirection: 'row', backgroundColor: '#ECFDF5', padding: 15, borderRadius: 15, marginTop: 25, gap: 10 },
  infoText: { flex: 1, fontSize: 12, color: Colors.primary, lineHeight: 18 },

  footer: { padding: 20, paddingBottom: 40 },
  payBtn: { backgroundColor: Colors.primary, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  payBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
