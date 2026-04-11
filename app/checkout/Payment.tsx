import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ITEMS } from '../../constants/data';
import { useAuth } from '../../context/AuthContext';
import { CURRENT_USER_ID } from '../../mocks/bookings';
import { chatService } from '../../services/chatService';
import { createBooking } from '../../services/rentalService';

export default function PaymentScreen() {
  const router = useRouter();
  const { amount, itemId, startDate, endDate, days } = useLocalSearchParams();
  const [method, setMethod] = useState<'click' | 'payme' | null>(null);
  const [loading, setLoading] = useState(false);

  // Используем реальное состояние авторизации
  const { isLoggedIn } = useAuth();
  const isGuest = !isLoggedIn;

  const handleFinish = async () => {
    if (isGuest) {
      Alert.alert(
        'Нужна авторизация',
        'Пожалуйста, войдите в аккаунт или зарегистрируйтесь, чтобы продолжить бронирование.',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Войти', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }

    setLoading(true);

    // Имитация оплаты (в разработке — просто переходим дальше)
    await new Promise((r) => setTimeout(r, 800));

    const product = ITEMS.find((p) => p.id === itemId) || ITEMS[0];
    const daysNum = parseInt(days as string) || 1;
    const totalAmt = parseInt((amount as string)?.replace(/[^0-9]/g, '')) || 0;

    const booking = await createBooking({
      itemId: itemId as string,
      itemTitle: product.title,
      itemImage: product.image,
      itemPricePerDay: parseInt(product.price.replace(/[^0-9]/g, '')),
      ownerId: (product as any).seller?.id ?? 'user_alice',
      ownerName: (product as any).seller?.name ?? 'Алина',
      renterId: CURRENT_USER_ID,
      renterName: 'Вы',
      startDate: (startDate as string) || new Date().toISOString().split('T')[0],
      endDate: (endDate as string) || new Date().toISOString().split('T')[0],
      totalDays: daysNum,
      totalAmount: totalAmt,
      status: 'pending_handover',
      ownerHandoverPhotos: [],
      renterHandoverPhotos: [],
      renterReturnPhotos: [],
      disputeEvidence: [],
    });

    // АВТОМАТИЗАЦИЯ: Отправляем сообщение владельцу
    await chatService.sendMessage({
      recipientId: booking.ownerId,
      type: 'rental_request',
      bookingId: booking.id,
      text: `Запрос на аренду: ${booking.itemTitle}`
    });

    setLoading(false);
    Alert.alert(
      'Заказ оформлен',
      'Владельцу отправлен запрос в чат. Перейдите к идентификации личности.',
      [{ text: 'ОК', onPress: () => router.replace({ pathname: '/auth/myid', params: { bookingId: booking.id } }) }]
    );
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

      <View style={styles.content}>
        <Text style={styles.amountLabel}>Сумма к оплате:</Text>
        <Text style={styles.amountValue}>{amount?.toLocaleString()} сум</Text>

        <Text style={styles.sectionTitle}>Выберите способ оплаты</Text>

        {/* CLICK */}
        <TouchableOpacity
          style={[styles.payOption, method === 'click' && styles.selectedOption]}
          onPress={() => setMethod('click')}
        >
          <Image source={{ uri: 'https://click.uz/static/img/logo.png' }} style={styles.logo} resizeMode="contain" />
          <Text style={styles.payText}>Оплата через Click</Text>
          <Ionicons
            name={method === 'click' ? 'radio-button-on' : 'radio-button-off'}
            size={24} color={method === 'click' ? Colors.primary : '#CBD5E1'}
          />
        </TouchableOpacity>

        {/* PAYME */}
        <TouchableOpacity
          style={[styles.payOption, method === 'payme' && styles.selectedOption]}
          onPress={() => setMethod('payme')}
        >
          <Image source={{ uri: 'https://cdn.payme.uz/logo/payme_color.png' }} style={styles.logo} resizeMode="contain" />
          <Text style={styles.payText}>Оплата через Payme</Text>
          <Ionicons
            name={method === 'payme' ? 'radio-button-on' : 'radio-button-off'}
            size={24} color={method === 'payme' ? Colors.primary : '#CBD5E1'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.mainBtn, (!method || loading) && { backgroundColor: '#CBD5E1' }]}
          disabled={!method || loading}
          onPress={handleFinish}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.mainBtnText}>Оплатить {amount} сум (ДЕМО-ОБХОД)</Text>
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
  content: { padding: 25, flex: 1 },
  amountLabel: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  amountValue: { fontSize: 32, fontWeight: '900', color: Colors.text, textAlign: 'center', marginTop: 5, marginBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 20 },
  payOption: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
    padding: 20, borderRadius: 20, marginBottom: 15, borderWidth: 2, borderColor: 'transparent'
  },
  selectedOption: { borderColor: Colors.primary, backgroundColor: '#FFFFFF' },
  logo: { width: 40, height: 40, marginRight: 15 },
  payText: { flex: 1, fontSize: 16, fontWeight: '600', color: Colors.text },
  footer: { padding: 25, paddingBottom: 40 },
  mainBtn: { backgroundColor: Colors.primary, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  mainBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});