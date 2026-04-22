import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image, RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { getBookings } from '../../services/rentalService';
import { Booking, BookingStatus, UserRole } from '../../types/rental.types';

const STATUS_META: Record<BookingStatus, { label: string; color: string; bg: string; icon: string }> = {
  pending_payment: { label: 'Ожидает оплаты', color: '#D97706', bg: '#FFFBEB', icon: 'card-outline' },
  confirmed: { label: 'Курьер назначен', color: '#2563EB', bg: '#EFF6FF', icon: 'bicycle-outline' },
  active: { label: 'Аренда идёт', color: '#059669', bg: '#ECFDF5', icon: 'checkmark-circle-outline' },
  completed: { label: 'Завершено', color: '#64748B', bg: '#F8FAFC', icon: 'checkmark-done-outline' },
  in_dispute: { label: 'Спор открыт', color: '#DC2626', bg: '#FEF2F2', icon: 'warning-outline' },
  cancelled: { label: 'Отменено', color: '#94A3B8', bg: '#F8FAFC', icon: 'close-circle-outline' },
};

function ReceiptCard({ booking, currentUserId }: { booking: Booking; currentUserId: string }) {
  const myRole: UserRole = booking.ownerId === currentUserId ? 'owner' : 'renter';
  const meta = STATUS_META[booking.status];

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
});

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

type ReceiptTab = 'renting' | 'lending';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<ReceiptTab>('renting');

  const loadBookings = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getBookings(user.id);
      setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBookings(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoggedIn) loadBookings();
    else {
      setBookings([]);
      setLoadingBookings(false);
    }
  }, [loadBookings, isLoggedIn]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBookings();
  }, [loadBookings]);

  const filtered = bookings.filter((b) =>
    tab === 'renting'
      ? b.renterId === user?.id
      : b.ownerId === user?.id
  );

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPlaceholder}>
          <Ionicons name="person-circle-outline" size={100} color="#CBD5E1" />
          <Text style={styles.authTitle}>Личный кабинет</Text>
          <Text style={styles.authSub}>Войдите, чтобы управлять вашими арендами и объявлениями</Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginBtnText}>Войти / Регистрация</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollBg}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />
        }
      >
        {/* ── Шапка профиля ─────────────────────────────────────────── */}
        <View style={styles.profileHeader}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={34} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userRole}>{user?.phone}</Text>
              {user?.isPinflVerified && (
                <View style={styles.verifiedRow}>
                  <Ionicons name="checkmark-circle" size={13} color="#A7F3D0" />
                  <Text style={styles.verifiedText}>MyID верифицирован</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push({ pathname: '/profile/edit' } as any)}
            >
              <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Мини-статистика */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{bookings.filter(b => b.renterId === user?.id).length}</Text>
              <Text style={styles.statLabel}>Аренд</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{bookings.filter(b => b.ownerId === user?.id).length}</Text>
              <Text style={styles.statLabel}>Сдано</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{(user as any)?.rating?.toFixed(1) ?? '5.0'}</Text>
              <Text style={styles.statLabel}>Рейтинг</Text>
            </View>
          </View>
        </View>

        {/* PINFL Verification Banner */}
        {!user?.isPinflVerified && (
          <TouchableOpacity style={styles.verifyBanner} activeOpacity={0.9}>
            <View style={styles.verifyIconBox}>
              <Ionicons name="shield-checkmark" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.verifyTitle}>Верификация MyID</Text>
              <Text style={styles.verifyText}>Подтвердите личность (PINFL), чтобы сдавать вещи в аренду</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {/* ── Меню ──────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <MenuItem
            icon="person-outline"
            label="Редактировать профиль"
            onPress={() => router.push({ pathname: '/profile/edit' } as any)}
          />
          <MenuItem
            icon="list-outline"
            label="Мои объявления"
            onPress={() => router.push({ pathname: '/my-listings' } as any)}
          />
          <MenuItem
            icon="notifications-outline"
            label="Уведомления"
            onPress={() => router.push({ pathname: '/notifications' } as any)}
          />
          <MenuItem icon="card-outline" label="Способы оплаты" />
          <MenuItem
            icon="settings-outline"
            label="Настройки"
            onPress={() => router.push({ pathname: '/profile/settings' } as any)}
          />
        </View>

        {/* ── Раздел Чеки (Мои аренды) ──────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Мои заказы</Text>

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
                  ? 'У вас пока нет активных заказов'
                  : 'Ваши вещи пока не арендовали'}
              </Text>
            </View>
          ) : (
            filtered.map((b) => <ReceiptCard key={b.id} booking={b} currentUserId={user?.id || ''} />)
          )}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'column', backgroundColor: Colors.primary },
  scrollBg: { flex: 1, backgroundColor: '#F7F7F5' },
  profileHeader: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 0,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 68, height: 68, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  userName: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  userRole: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  verifiedText: { fontSize: 12, color: '#A7F3D0', fontWeight: '600' },
  editBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row', gap: 10,
  },
  statBox: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingVertical: 12,
  },
  statNum: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  verifyBanner: {
    backgroundColor: Colors.primary,
    margin: 16, borderRadius: 20, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
  verifyIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  verifyTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  verifyText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2, fontWeight: '500' },
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
  authPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  authTitle: { fontSize: 24, fontWeight: '900', color: Colors.text, marginTop: 20 },
  authSub: { fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  loginBtn: { backgroundColor: Colors.primary, paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, marginTop: 30 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
