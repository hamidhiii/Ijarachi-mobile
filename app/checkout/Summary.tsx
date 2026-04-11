import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ITEMS } from '../../constants/data';

export default function OrderSummary() {
  const router = useRouter();

  // Получаем параметры из ProductDetail
  const { id, days, qty, startDate, endDate } = useLocalSearchParams();

  const product = ITEMS.find(p => p.id === id) || ITEMS[0];
  const daysCount = parseInt(days as string) || 1;
  const quantity = parseInt(qty as string) || 1;
  const pricePerDay = parseInt(product.price.replace(/[^0-9]/g, ''));

  // Итоговый расчет: Цена * Дни * Количество
  const rentTotal = pricePerDay * daysCount * quantity;
  const insuranceFee = Math.round(rentTotal * 0.05); // 5% Страховой взнос
  const totalAmount = rentTotal + insuranceFee;

  // Функция для красивого формата дат (например, "12 апр.")
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
        {/* Карточка товара с датами и количеством */}
        <View style={styles.productCard}>
          <Image source={product.image} style={styles.productImg} />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={1}>{product.title}</Text>

            {/* Отображение периода аренды */}
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={14} color="#64748B" />
              <Text style={styles.productSub}>
                {startDate === endDate
                  ? formatDate(startDate as string)
                  : `${formatDate(startDate as string)} — ${formatDate(endDate as string)}`}
                {` (${daysCount} дн.)`}
              </Text>
            </View>

            {/* Отображение количества (только если > 1) */}
            {quantity > 1 && (
              <View style={styles.infoRow}>
                <Ionicons name="layers-outline" size={14} color="#64748B" />
                <Text style={styles.productSub}>Количество: {quantity} шт.</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Детали расчета</Text>
          <View style={styles.row}>
            <Text style={styles.label}>
              Аренда {quantity > 1 ? `(${quantity} шт. x ${daysCount} дн.)` : `(${daysCount} дн.)`}
            </Text>
            <Text style={styles.value}>{rentTotal.toLocaleString()} сум</Text>
          </View>

          <View style={styles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={styles.label}>Страховой взнос (5%)</Text>
              <Ionicons name="information-circle-outline" size={14} color={Colors.primary} />
            </View>
            <Text style={styles.value}>+ {insuranceFee.toLocaleString()} сум</Text>
          </View>

          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Итого к оплате</Text>
            <Text style={styles.totalValue}>{totalAmount.toLocaleString()} сум</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Деньги будут храниться в системе SYNTH и будут переведены владельцу только после того, как вы вернете вещь.
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
            }
          })}
        >
          <Text style={styles.payBtnText}>Перейти к оплате</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  scroll: { padding: 20 },
  productCard: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 20, marginBottom: 25, alignItems: 'center' },
  productImg: { width: 70, height: 70, borderRadius: 12 },
  productInfo: { marginLeft: 15, flex: 1 },
  productTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  productSub: { fontSize: 13, color: '#64748B' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
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
  payBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});