import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image, RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { CURRENT_USER_ID } from '../../mocks/bookings';
import { getBookings } from '../../services/rentalService';
import { Booking, BookingStatus, UserRole } from '../../types/rental.types';

// ─── Метаданные статусов ──────────────────────────────────────────────────────
const STATUS_META: Record<BookingStatus, { label: string; color: string; bg: string; icon: string }> = {
  pending_payment: { label: 'Ожидает оплаты', color: '#D97706', bg: '#FFFBEB', icon: 'card-outline' },
  pending_handover: { label: 'Передача вещи', color: '#2563EB', bg: '#EFF6FF', icon: 'hand-right-outline' },
  pending_renter_confirm: { label: 'Ждём вас', color: '#7C3AED', bg: '#F5F3FF', icon: 'eye-outline' },
  active: { label: 'Аренда идёт', color: '#059669', bg: '#ECFDF5', icon: 'checkmark-circle-outline' },
  pending_return: { label: 'Возврат', color: '#D97706', bg: '#FFFBEB', icon: 'return-down-back-outline' },
  pending_owner_confirm: { label: 'Ждём владельца', color: '#7C3AED', bg: '#F5F3FF', icon: 'hourglass-outline' },
  completed: { label: 'Завершено', color: '#64748B', bg: '#F8FAFC', icon: 'checkmark-done-outline' },
  in_dispute: { label: 'Спор открыт', color: '#DC2626', bg: '#FEF2F2', icon: 'warning-outline' },
  moderating: { label: 'На модерации', color: '#64748B', bg: '#F8FAFC', icon: 'shield-outline' },
  cancelled: { label: 'Отменено', color: '#94A3B8', bg: '#F8FAFC', icon: 'close-circle-outline' },
};

// ─── Кнопка действия по статусу ──────────────────────────────────────────────
function useActionButton(booking: Booking, myRole: UserRole) {
  const router = useRouter();
  switch (booking.status) {
    case 'pending_handover':
      return myRole === 'owner'
        ? { label: 'Передать вещь', icon: 'camera-outline', onPress: () => router.push({ pathname: '/protocol/handover/[bookingId]', params: { bookingId: booking.id } }) }
        : null;
    case 'pending_renter_confirm':
      return myRole === 'renter'
        ? { label: 'Подтвердить получение', icon: 'checkmark-circle-outline', onPress: () => router.push({ pathname: '/protocol/handover/[bookingId]', params: { bookingId: booking.id } }) }
        : null;
    case 'active':
      return myRole === 'renter'
        ? { label: 'Вернуть вещь', icon: 'return-down-back-outline', onPress: () => router.push({ pathname: '/protocol/return/[bookingId]', params: { bookingId: booking.id } }) }
        : null;
    case 'pending_owner_confirm':
      return myRole === 'owner'
        ? { label: 'Подтвердить возврат', icon: 'eye-outline', onPress: () => router.push({ pathname: '/protocol/return/[bookingId]', params: { bookingId: booking.id } }) }
        : null;
    case 'in_dispute':
      return { label: 'Добавить доказательства', icon: 'document-text-outline', onPress: () => router.push({ pathname: '/protocol/dispute/[bookingId]', params: { bookingId: booking.id } }) };
    default:
      return null;
  }
}

// ─── Карточка чека ────────────────────────────────────────────────────────────
function ReceiptCard({ booking }: { booking: Booking }) {
  const myRole: UserRole = booking.ownerId === CURRENT_USER_ID ? 'owner' : 'renter';
  const meta = STATUS_META[booking.status];
  const action = useActionButton(booking, myRole);

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.row}>
        <Image source={booking.itemImage} style={cardStyles.image} />
        <View style={cardStyles.info}>
          <Text style={cardStyles.title} numberOfLines={1}>{booking.itemTitle}</Text>
          <Text style={cardStyles.dates}>{booking.startDate} → {booking.endDate} · {booking.totalDays} дн.</Text>
          <Text style={cardStyles.price}>{booking.totalAmount.toLocaleString()} сум</Text>
        </View>
        <View style={[cardStyles.badge, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon as any} size={11} color={meta.color} />
          <Text style={[cardStyles.badgeText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      <Text style={cardStyles.roleText}>
        {myRole === 'owner' ? `→ ${booking.renterName}` : `у ${booking.ownerName}`}
      </Text>

      {action && (
        <TouchableOpacity style={cardStyles.actionBtn} onPress={action.onPress} activeOpacity={0.8}>
          <Ionicons name={action.icon as any} size={15} color="#fff" />
          <Text style={cardStyles.actionText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  row: { flexDirection: 'row', gap: 10 },
  image: { width: 60, height: 60, borderRadius: 12 },
  info: { flex: 1, gap: 2 },
  title: { fontSize: 13, fontWeight: '700', color: Colors.text },
  dates: { fontSize: 11, color: '#94A3B8' },
  price: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 9, fontWeight: '700' },
  roleText: { fontSize: 11, color: '#64748B' },
  actionBtn: {
    backgroundColor: Colors.primary, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 12, gap: 6,
  },
  actionText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});

// ─── Пункт меню ──────────────────────────────────────────────────────────────
function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={menuItemStyles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={menuItemStyles.iconBox}>
        <Ionicons name={icon as any} size={20} color={Colors.primary} />
      </View>
      <Text style={menuItemStyles.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

const menuItemStyles = StyleSheet.create({
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, gap: 14,
    borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  iconBox: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center', alignItems: 'center',
  },
  label: { flex: 1, fontSize: 15, color: Colors.text, fontWeight: '500' },
});

// ─── Главный экран профиля ────────────────────────────────────────────────────
type ReceiptTab = 'renting' | 'lending';

export default function ProfileScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<ReceiptTab>('renting');

  const loadBookings = useCallback(async () => {
    const data = await getBookings(CURRENT_USER_ID);
    setBookings(data);
    setLoadingBookings(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBookings();
  }, [loadBookings]);

  const filtered = bookings.filter((b) =>
    tab === 'renting'
      ? b.renterId === CURRENT_USER_ID
      : b.ownerId === CURRENT_USER_ID
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />
        }
      >
        {/* ── Шапка профиля ─────────────────────────────────────────── */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color="#fff" />
          </View>
          <Text style={styles.userName}>Хамидулло</Text>
          <Text style={styles.userRole}>Арендатор · Ташкент</Text>

          {/* Мини-статистика */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{bookings.filter(b => b.renterId === CURRENT_USER_ID).length}</Text>
              <Text style={styles.statLabel}>Аренд</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{bookings.filter(b => b.ownerId === CURRENT_USER_ID).length}</Text>
              <Text style={styles.statLabel}>Сдано</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>4.9</Text>
              <Text style={styles.statLabel}>Рейтинг</Text>
            </View>
          </View>
        </View>

        {/* ── Меню ──────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <MenuItem icon="settings-outline" label="Настройки профиля" />
          <MenuItem icon="card-outline" label="Мои карты" />
          <MenuItem icon="shield-checkmark-outline" label="Верификация MyID" />
          <MenuItem icon="help-circle-outline" label="Поддержка" />
        </View>

        {/* ── Раздел Чеки (Мои аренды) ──────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Мои аренды</Text>

          {/* Табы */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'renting' && styles.tabBtnActive]}
              onPress={() => setTab('renting')}
            >
              <Text style={[styles.tabText, tab === 'renting' && styles.tabTextActive]}>
                Я арендую
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'lending' && styles.tabBtnActive]}
              onPress={() => setTab('lending')}
            >
              <Text style={[styles.tabText, tab === 'lending' && styles.tabTextActive]}>
                Я сдаю
              </Text>
            </TouchableOpacity>
          </View>

          {loadingBookings ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 30 }} />
          ) : filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="receipt-outline" size={40} color="#E2E8F0" />
              <Text style={styles.emptyText}>
                {tab === 'renting'
                  ? 'Вы ничего не арендовали'
                  : 'Вы ничего не сдавали'}
              </Text>
            </View>
          ) : (
            filtered.map((b) => <ReceiptCard key={b.id} booking={b} />)
          )}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  userName: { fontSize: 22, fontWeight: '900', color: Colors.text },
  userRole: { fontSize: 13, color: '#94A3B8', marginTop: 4, marginBottom: 20 },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#F8FAFC',
    borderRadius: 18, paddingVertical: 16, paddingHorizontal: 24,
    borderWidth: 1, borderColor: '#F1F5F9', gap: 0,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '900', color: Colors.text },
  statLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#F1F5F9', marginHorizontal: 8 },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 0,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 18, fontWeight: '800', color: Colors.text,
    marginBottom: 14,
  },
  tabs: {
    flexDirection: 'row', gap: 8, marginBottom: 14,
  },
  tabBtn: {
    flex: 1, paddingVertical: 9,
    borderRadius: 12, alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  tabBtnActive: { backgroundColor: '#ECFDF5', borderColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
  tabTextActive: { color: Colors.primary },
  emptyBox: {
    alignItems: 'center', paddingVertical: 32, gap: 10,
  },
  emptyText: { fontSize: 13, color: '#CBD5E1' },
});