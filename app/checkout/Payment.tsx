import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { guardPendingIntegration } from '../../services/integrationAvailability';
import * as listingService from '../../services/listingService';
import { createBooking, startDealPayment } from '../../services/rentalService';
import { Listing } from '../../types/listing.types';
import { DeliveryMethod } from '../../types/rental.types';

export default function PaymentScreen() {
  const router = useRouter();
  const {
    amount,
    rentAmount,
    deliveryFee,
    itemId,
    startDate,
    endDate,
    days,
    deliveryMethod,
    deliveryAddress,
    deliveryComment,
    pickupDistrict,
    pickupAddress,
    ownerPhone,
    ownerWorkingHours,
    yandexEtaMinutes,
  } = useLocalSearchParams();

  const [method, setMethod] = useState<'click' | 'payme' | null>(null);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Listing | null>(null);

  const { isLoggedIn, user } = useAuth();
  const isGuest = !isLoggedIn;
  const needsVerification = !!user && !user.isPinflVerified;

  const deliveryMethodValue = (deliveryMethod as DeliveryMethod) || 'pickup';
  const amountNum = parseInt(amount as string, 10) || 0;
  const rentAmountNum = parseInt(rentAmount as string, 10) || amountNum;
  const deliveryFeeNum = parseInt(deliveryFee as string, 10) || 0;
  const daysNum = parseInt(days as string, 10) || 1;
  const etaNum = parseInt(yandexEtaMinutes as string, 10) || undefined;

  useEffect(() => {
    listingService.getListingById(itemId as string).then(setProduct);
  }, [itemId]);

  const methodCopy = useMemo(() => {
    if (deliveryMethodValue === 'pickup') {
      return {
        title: 'Самовывоз',
        icon: 'walk-outline' as const,
        detail: pickupDistrict ? `Район: ${pickupDistrict}` : 'Адрес откроется после оплаты',
      };
    }
    return {
      title: 'Доставка Rentoo',
      icon: 'cube-outline' as const,
      detail: deliveryAddress ? `${deliveryAddress}` : 'Доставка до двери',
    };
  }, [deliveryMethodValue, pickupDistrict, deliveryAddress]);

  const formatMoney = (value: number) => value.toLocaleString('ru-RU');

  const handleFinish = async () => {
    if (isGuest) {
      Alert.alert(
        'Нужна авторизация',
        'Войдите в аккаунт, чтобы продолжить бронирование.',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Войти', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }

    if (needsVerification) {
      Alert.alert(
        'Подтвердите личность через MyID',
        'Для безопасности всех пользователей Rentoo требует одноразовую государственную верификацию перед первой сделкой.',
        [
          { text: 'Позже', style: 'cancel' },
          {
            text: 'Пройти MyID',
            onPress: () => {
              if (!guardPendingIntegration('myid')) router.push('/auth/myid' as any);
            },
          },
        ]
      );
      return;
    }

    if (!product) {
      Alert.alert('Ошибка', 'Объявление не найдено.');
      return;
    }
    if (method && guardPendingIntegration(method)) return;

    setLoading(true);

    try {
      const isDelivery = deliveryMethodValue === 'yandex_delivery';
      const booking = await createBooking({
        itemId: itemId as string,
        itemTitle: product.title,
        itemImage: product.image,
        itemPricePerDay: product.priceNum,
        ownerId: product.seller.id,
        ownerName: product.seller.name,
        ownerVerified: product.seller.isVerified ?? true,
        ownerPhone: ownerPhone as string || product.seller.phone,
        ownerWorkingHours: ownerWorkingHours as string || product.seller.workingHours,
        renterId: user?.id ?? 'user_me',
        renterName: user?.name ?? 'Вы',
        renterVerified: true,
        startDate: (startDate as string) || new Date().toISOString().split('T')[0],
        endDate: (endDate as string) || new Date().toISOString().split('T')[0],
        totalDays: daysNum,
        rentAmount: rentAmountNum,
        totalAmount: amountNum,
        status: 'confirmed',
        deliveryMethod: deliveryMethodValue,
        deliveryLocation: isDelivery ? deliveryAddress as string : pickupAddress as string,
        deliveryAddress: isDelivery ? deliveryAddress as string : undefined,
        deliveryComment: isDelivery ? deliveryComment as string : undefined,
        deliveryPrice: isDelivery ? deliveryFeeNum : 0,
        pickupDistrict: pickupDistrict as string || product.seller.district,
        pickupAddress: pickupAddress as string || product.seller.address,
        yandexOrderId: isDelivery ? `YDX-${Date.now().toString().slice(-6)}` : undefined,
        yandexStatus: isDelivery ? 'created' : undefined,
        yandexEtaMinutes: isDelivery ? etaNum : undefined,
      });

      await chatService.sendMessage({
        recipientId: booking.ownerId,
        type: 'rental_request',
        bookingId: booking.id,
        text: isDelivery
          ? `Новый заказ: ${booking.itemTitle}. Арендатор выбрал доставку.`
          : `Новый заказ: ${booking.itemTitle}. Арендатор выбрал самовывоз.`,
      });

      const paymentSession = await startDealPayment(booking.id, method!);
      const paymentUrl = paymentSession.deeplink || paymentSession.paymentUrl;
      if (paymentUrl) {
        Linking.openURL(paymentUrl).catch(() => {});
      }

      setLoading(false);
      Alert.alert(
        'Заказ оформлен',
        isDelivery
          ? 'Оплата прошла успешно. Rentoo оформит доставку и покажет статус в карточке сделки.'
          : 'Оплата прошла успешно. Точный адрес и телефон арендодателя открыты в карточке сделки.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/profile') }]
      );
    } catch {
      setLoading(false);
      Alert.alert('Ошибка', 'Не удалось создать заказ. Попробуйте ещё раз.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Оплата</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.amountLabel}>Сумма к оплате</Text>
        <Text style={styles.amountValue}>{formatMoney(amountNum)} сум</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <Ionicons name={methodCopy.icon} size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryTitle}>{methodCopy.title}</Text>
              <Text style={styles.summarySub} numberOfLines={2}>{methodCopy.detail}</Text>
            </View>
          </View>
          <View style={styles.amountLine}>
            <Text style={styles.amountLineLabel}>Аренда</Text>
            <Text style={styles.amountLineValue}>{formatMoney(rentAmountNum)} сум</Text>
          </View>
          {deliveryMethodValue === 'yandex_delivery' && (
            <View style={styles.amountLine}>
              <Text style={styles.amountLineLabel}>Доставка</Text>
              <Text style={styles.amountLineValue}>{formatMoney(deliveryFeeNum)} сум</Text>
            </View>
          )}
        </View>

        {needsVerification && (
          <View style={styles.kycCard}>
            <View style={styles.kycIcon}>
              <Ionicons name="shield-checkmark" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.kycTitle}>Подтвердите личность через MyID</Text>
              <Text style={styles.kycText}>
                Это одноразовая проверка перед первой сделкой. Бесплатно, Rentoo покрывает расходы.
              </Text>
              <TouchableOpacity
                style={styles.kycButton}
                onPress={() => {
                  if (!guardPendingIntegration('myid')) router.push('/auth/myid' as any);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.kycButtonText}>Пройти верификацию</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Выберите способ оплаты</Text>

        <TouchableOpacity
          style={[styles.payOption, method === 'click' && styles.selectedOption, needsVerification && styles.disabledOption]}
          onPress={() => {
            if (!guardPendingIntegration('click')) setMethod('click');
          }}
          disabled={needsVerification}
        >
          <Image source={{ uri: 'https://click.uz/static/img/logo.png' }} style={styles.logo} resizeMode="contain" />
          <Text style={styles.payText}>Оплата через Click</Text>
          <Ionicons
            name={method === 'click' ? 'radio-button-on' : 'radio-button-off'}
            size={24} color={method === 'click' ? Colors.primary : '#CBD5E1'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.payOption, method === 'payme' && styles.selectedOption, needsVerification && styles.disabledOption]}
          onPress={() => {
            if (!guardPendingIntegration('payme')) setMethod('payme');
          }}
          disabled={needsVerification}
        >
          <Image source={{ uri: 'https://cdn.payme.uz/logo/payme_color.png' }} style={styles.logo} resizeMode="contain" />
          <Text style={styles.payText}>Оплата через Payme</Text>
          <Ionicons
            name={method === 'payme' ? 'radio-button-on' : 'radio-button-off'}
            size={24} color={method === 'payme' ? Colors.primary : '#CBD5E1'}
          />
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.mainBtn, (!method || loading || needsVerification) && styles.mainBtnDisabled]}
          disabled={!method || loading || needsVerification}
          onPress={handleFinish}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.mainBtnText}>
                {needsVerification ? 'Сначала пройдите MyID' : `Оплатить ${formatMoney(amountNum)} сум`}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  content: { padding: 25, paddingBottom: 36 },
  amountLabel: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  amountValue: { fontSize: 32, fontWeight: '900', color: Colors.text, textAlign: 'center', marginTop: 5, marginBottom: 24 },
  summaryCard: { borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 18, padding: 16, marginBottom: 18, backgroundColor: '#FFFFFF' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  summaryIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  summaryTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  summarySub: { fontSize: 12, color: '#64748B', lineHeight: 17, marginTop: 2 },
  amountLine: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 },
  amountLineLabel: { fontSize: 13, color: '#64748B' },
  amountLineValue: { fontSize: 13, color: Colors.text, fontWeight: '700' },
  kycCard: { flexDirection: 'row', gap: 12, backgroundColor: Colors.primary, borderRadius: 18, padding: 16, marginBottom: 22 },
  kycIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  kycTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  kycText: { color: 'rgba(255,255,255,0.88)', fontSize: 12, lineHeight: 18, marginTop: 4 },
  kycButton: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginTop: 12 },
  kycButtonText: { color: Colors.primary, fontSize: 13, fontWeight: '800' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: { borderColor: Colors.primary, backgroundColor: '#FFFFFF' },
  disabledOption: { opacity: 0.5 },
  logo: { width: 40, height: 40, marginRight: 15 },
  payText: { flex: 1, fontSize: 16, fontWeight: '600', color: Colors.text },
  footer: { padding: 25, paddingBottom: 40 },
  mainBtn: { backgroundColor: Colors.primary, minHeight: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  mainBtnDisabled: { backgroundColor: '#CBD5E1' },
  mainBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
