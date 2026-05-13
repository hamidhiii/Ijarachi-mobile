import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Booking } from '../../types/rental.types';
import VerifiedBadge from '../VerifiedBadge';

interface RentalRequestCardProps {
    booking: Booking;
    isOwner: boolean;
}

export default function RentalRequestCard({ booking, isOwner }: RentalRequestCardProps) {
    const isDelivery = booking.deliveryMethod === 'yandex_delivery';

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
                <Text style={styles.headerText}>Запрос на аренду</Text>
            </View>

            <View style={styles.productRow}>
                <Image source={booking.itemImage} style={styles.image} />
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={2}>{booking.itemTitle}</Text>
                    <View style={styles.personRow}>
                        <Text style={styles.renterName}>От: {booking.renterName}</Text>
                        {booking.renterVerified && <VerifiedBadge compact />}
                    </View>
                </View>
            </View>

            <View style={styles.detailsBox}>
                <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={14} color="#64748B" />
                    <Text style={styles.detailText}>{booking.startDate} — {booking.endDate}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={14} color="#64748B" />
                    <Text style={styles.detailText}>{booking.totalDays} дн.</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={14} color="#64748B" />
                    <Text style={styles.detailText}>{booking.totalAmount.toLocaleString()} сум</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name={isDelivery ? 'cube-outline' : 'walk-outline'} size={14} color="#64748B" />
                    <Text style={styles.detailText}>
                        {isDelivery
                            ? `Yandex Доставка${booking.yandexEtaMinutes ? `, ETA ~${booking.yandexEtaMinutes} мин` : ''}`
                            : `Самовывоз${booking.pickupDistrict ? `, ${booking.pickupDistrict}` : ''}`}
                    </Text>
                </View>
            </View>

            {booking.ownerVerified && booking.renterVerified && (
                <View style={styles.trustRow}>
                    <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
                    <Text style={styles.trustText}>Обе стороны верифицированы через MyID</Text>
                </View>
            )}

            <View style={styles.statusBox}>
                <Text style={styles.statusText}>
                    {isOwner
                        ? 'Вы получили новый запрос на аренду. Вещь забронирована.'
                        : 'Запрос отправлен. Вещь забронирована за вами.'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        width: '85%',
        alignSelf: 'flex-start',
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    headerText: { fontSize: 13, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
    productRow: { flexDirection: 'row', gap: 12, marginBottom: 15 },
    image: { width: 60, height: 60, borderRadius: 12 },
    info: { flex: 1, justifyContent: 'center', gap: 4 },
    title: { fontSize: 14, fontWeight: '700', color: Colors.text },
    personRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    renterName: { fontSize: 12, color: '#64748B' },
    detailsBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 12,
        gap: 8,
        marginBottom: 12,
    },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    detailText: { fontSize: 13, color: '#1E293B', fontWeight: '500' },
    trustRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ECFDF5',
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
    },
    trustText: { flex: 1, fontSize: 11, color: Colors.primary, fontWeight: '700' },
    actions: { flexDirection: 'row', gap: 10 },
    btn: { flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    acceptBtn: { backgroundColor: Colors.primary },
    acceptText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    declineBtn: { backgroundColor: '#F1F5F9' },
    declineText: { color: '#64748B', fontWeight: '700', fontSize: 13 },
    statusBox: { paddingVertical: 8, alignItems: 'center' },
    statusText: { fontSize: 11, color: '#94A3B8', textAlign: 'center', fontStyle: 'italic' },
});
