import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import YandexMapPicker from '../../components/YandexMapPicker';
import { Colors } from '../../constants/Colors';
import { DeliveryEstimate, estimateYandexDelivery } from '../../services/deliveryService';
import * as listingService from '../../services/listingService';
import { Listing } from '../../types/listing.types';
import { DeliveryMethod } from '../../types/rental.types';

const LOCATION_KEY = 'rentoo_user_location';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface MethodCardProps {
  title: string;
  subtitle: string;
  icon: IoniconName;
  selected: boolean;
  onPress: () => void;
}

function MethodCard({ title, subtitle, icon, selected, onPress }: MethodCardProps) {
  return (
    <TouchableOpacity
      style={[styles.methodCard, selected && styles.methodCardSelected]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.methodIcon, selected && styles.methodIconSelected]}>
        <Ionicons name={icon} size={22} color={selected ? '#FFFFFF' : Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.methodTitle}>{title}</Text>
        <Text style={styles.methodSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={22}
        color={selected ? Colors.primary : '#CBD5E1'}
      />
    </TouchableOpacity>
  );
}

export default function OrderSummary() {
  const router = useRouter();
  const { id, days, qty, startDate, endDate } = useLocalSearchParams();

  const [product, setProduct] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [mapOpen, setMapOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null);
  const [pickupAgreement, setPickupAgreement] = useState(false);
  const [deliveryComment, setDeliveryComment] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState<DeliveryEstimate | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateError, setEstimateError] = useState('');

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

  useEffect(() => {
    let cancelled = false;
    async function loadEstimate() {
      if (deliveryMethod !== 'yandex_delivery' || !product || !location.trim()) return;

      setEstimateLoading(true);
      setEstimateError('');
      setDeliveryEstimate(null);
      try {
        const estimate = await estimateYandexDelivery({
          fromDistrict: product.seller.district || product.location,
          toAddress: location,
          category: product.category,
        });
        if (!cancelled) setDeliveryEstimate(estimate);
      } catch {
        if (!cancelled) {
          setDeliveryEstimate(null);
          setEstimateError('Сервис временно недоступен, попробуйте позже или выберите самовывоз');
        }
      } finally {
        if (!cancelled) setEstimateLoading(false);
      }
    }

    loadEstimate();
    return () => {
      cancelled = true;
    };
  }, [deliveryMethod, location, product]);

  const handleSelectLocation = async (address: string) => {
    setLocation(address);
    try { await AsyncStorage.setItem(LOCATION_KEY, address); } catch {}
  };

  const daysCount = parseInt(days as string, 10) || 1;
  const quantity = parseInt(qty as string, 10) || 1;
  const pricePerDay =
    product?.priceNum ?? (parseInt((product?.price ?? '0').replace(/\D/g, ''), 10) || 0);
  const rentTotal = pricePerDay * daysCount * quantity;
  const deliveryFee = deliveryMethod === 'yandex_delivery' ? deliveryEstimate?.price ?? 0 : 0;
  const totalAmount = rentTotal + deliveryFee;

  const canContinue = useMemo(() => {
    if (!deliveryMethod) return false;
    if (deliveryMethod === 'pickup') return pickupAgreement;
    return !!deliveryEstimate && !estimateLoading && !estimateError;
  }, [deliveryMethod, pickupAgreement, deliveryEstimate, estimateLoading, estimateError]);

  const formatMoney = (value: number) => value.toLocaleString('ru-RU');

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const getButtonText = () => {
    if (!deliveryMethod) return 'Выберите способ получения';
    if (deliveryMethod === 'pickup' && !pickupAgreement) return 'Подтвердите условия самовывоза';
    if (deliveryMethod === 'yandex_delivery' && estimateLoading) return 'Считаем доставку';
    if (deliveryMethod === 'yandex_delivery' && estimateError) return 'Выберите самовывоз или другой адрес';
    return 'Перейти к оплате';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.centered, { padding: 40 }]}>
          <Text style={styles.emptyText}>Объявление не найдено</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={styles.backText}>Назад</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Подтверждение заказа</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.productCard}>
          <Image source={product.image} style={styles.productImg} />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={1}>{product.title}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={14} color="#64748B" />
              <Text style={styles.productSub}>
                {startDate === endDate
                  ? formatDate(startDate as string)
                  : `${formatDate(startDate as string)} - ${formatDate(endDate as string)}`}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Способ получения</Text>
          <MethodCard
            title="Самовывоз"
            subtitle="Заберу сам у арендодателя. Бесплатно"
            icon="walk-outline"
            selected={deliveryMethod === 'pickup'}
            onPress={() => setDeliveryMethod('pickup')}
          />
          <MethodCard
            title="Доставка Rentoo"
            subtitle={
              deliveryEstimate
                ? `Yandex Доставка: ${formatMoney(deliveryEstimate.price)} сум`
                : 'Привезут до двери. Рассчитаем по адресу'
            }
            icon="cube-outline"
            selected={deliveryMethod === 'yandex_delivery'}
            onPress={() => setDeliveryMethod('yandex_delivery')}
          />
        </View>

        {deliveryMethod === 'pickup' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Самовывоз</Text>
            <View style={styles.noteBox}>
              <Ionicons name="location-outline" size={19} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.noteTitle}>Адрес откроется после оплаты</Text>
                <Text style={styles.noteText}>
                  Сейчас виден только район: {product.seller.district || product.location}.
                  Точный адрес, телефон и часы работы появятся в карточке сделки.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setPickupAgreement(prev => !prev)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={pickupAgreement ? 'checkbox' : 'square-outline'}
                size={22}
                color={pickupAgreement ? Colors.primary : '#94A3B8'}
              />
              <Text style={styles.checkboxText}>
                Понимаю, что при самовывозе платформа не несёт ответственности за состояние товара при передаче.
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {deliveryMethod === 'yandex_delivery' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Доставка</Text>

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
              <Text style={styles.changeText}>Изменить</Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Комментарий курьеру</Text>
            <TextInput
              style={styles.commentInput}
              value={deliveryComment}
              onChangeText={setDeliveryComment}
              placeholder="Этаж, домофон, ориентир"
              placeholderTextColor="#94A3B8"
              multiline
            />

            {estimateLoading && (
              <View style={styles.estimateBox}>
                <ActivityIndicator color={Colors.primary} />
                <Text style={styles.estimateText}>Рассчитываем стоимость Yandex Доставки...</Text>
              </View>
            )}

            {!!estimateError && (
              <View style={styles.errorBox}>
                <Ionicons name="warning-outline" size={18} color="#DC2626" />
                <Text style={styles.errorText}>{estimateError}</Text>
              </View>
            )}

            {deliveryEstimate && !estimateLoading && !estimateError && (
              <View style={styles.deliveryProtection}>
                <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
                <Text style={styles.infoText}>
                  Доставку выполняет Yandex Доставка. Rentoo обеспечивает компенсацию при повреждении товара в пути.
                  ETA: около {deliveryEstimate.etaMinutes} мин.
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Детали расчёта</Text>
          <View style={styles.row}>
            <Text style={styles.label}>
              Аренда {quantity > 1 ? `(${quantity} шт. x ${daysCount} дн.)` : `(${daysCount} дн.)`}
            </Text>
            <Text style={styles.value}>{formatMoney(rentTotal)} сум</Text>
          </View>
          {deliveryMethod === 'yandex_delivery' && (
            <View style={styles.row}>
              <Text style={styles.label}>Доставка Yandex</Text>
              <Text style={styles.value}>{deliveryEstimate ? `${formatMoney(deliveryFee)} сум` : '...'}</Text>
            </View>
          )}
          {deliveryMethod === 'pickup' && (
            <View style={styles.row}>
              <Text style={styles.label}>Доставка</Text>
              <Text style={styles.value}>0 сум</Text>
            </View>
          )}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Итого к оплате</Text>
            <Text style={styles.totalValue}>{formatMoney(totalAmount)} сум</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Деньги резервируются на защищённом счёте Rentoo. Комиссия платформы удерживается с арендодателя.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payBtn, !canContinue && styles.payBtnDisabled]}
          disabled={!canContinue}
          onPress={() => router.push({
            pathname: '/checkout/Payment',
            params: {
              amount: String(totalAmount),
              rentAmount: String(rentTotal),
              deliveryFee: String(deliveryFee),
              itemId: id as string,
              startDate: startDate as string,
              endDate: endDate as string,
              days: String(daysCount),
              deliveryMethod: deliveryMethod as DeliveryMethod,
              deliveryAddress: deliveryMethod === 'yandex_delivery' ? location : '',
              deliveryComment,
              pickupDistrict: product.seller.district || product.location,
              pickupAddress: product.seller.address || '',
              ownerPhone: product.seller.phone || '',
              ownerWorkingHours: product.seller.workingHours || '',
              yandexEtaMinutes: String(deliveryEstimate?.etaMinutes ?? ''),
            }
          })}
        >
          <Text style={styles.payBtnText}>{getButtonText()}</Text>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  scroll: { padding: 20, paddingBottom: 28 },
  emptyText: { color: '#64748B', fontSize: 16 },
  backText: { color: Colors.primary, fontWeight: '700' },

  productCard: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 20, marginBottom: 16, alignItems: 'center' },
  productImg: { width: 70, height: 70, borderRadius: 12 },
  productInfo: { marginLeft: 15, flex: 1 },
  productTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  productSub: { fontSize: 13, color: '#64748B' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },

  section: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 14 },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  methodCardSelected: { borderColor: Colors.primary, backgroundColor: '#FFFFFF' },
  methodIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodIconSelected: { backgroundColor: Colors.primary },
  methodTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  methodSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 17 },

  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#ECFDF5',
    borderRadius: 15,
    padding: 14,
  },
  noteTitle: { fontSize: 14, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  noteText: { fontSize: 12, color: '#047857', lineHeight: 18 },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 14 },
  checkboxText: { flex: 1, fontSize: 12, color: '#475569', lineHeight: 18 },

  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  locationLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 8 },
  locationIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  locationLabel: { fontSize: 12, color: '#64748B', marginBottom: 2 },
  locationValue: { fontSize: 14, fontWeight: '700', color: Colors.text },
  changeText: { fontSize: 13, color: Colors.primary, fontWeight: '800' },
  inputLabel: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  commentInput: {
    minHeight: 74,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  estimateBox: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  estimateText: { fontSize: 12, color: '#64748B' },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FEF2F2', borderRadius: 14, padding: 12 },
  errorText: { flex: 1, fontSize: 12, color: '#DC2626', lineHeight: 18 },
  deliveryProtection: { flexDirection: 'row', backgroundColor: '#ECFDF5', padding: 14, borderRadius: 15, gap: 10 },

  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 14, marginBottom: 14 },
  label: { flex: 1, fontSize: 14, color: '#64748B' },
  value: { fontSize: 15, fontWeight: '700', color: Colors.text },
  totalRow: { marginTop: 6, marginBottom: 0, paddingTop: 18, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: Colors.text },
  totalValue: { fontSize: 20, fontWeight: '900', color: Colors.primary },

  infoBox: { flexDirection: 'row', backgroundColor: '#ECFDF5', padding: 15, borderRadius: 15, gap: 10 },
  infoText: { flex: 1, fontSize: 12, color: Colors.primary, lineHeight: 18 },

  footer: { padding: 20, paddingBottom: 40 },
  payBtn: { backgroundColor: Colors.primary, minHeight: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 },
  payBtnDisabled: { backgroundColor: '#CBD5E1' },
  payBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
