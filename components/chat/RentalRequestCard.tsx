import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Booking } from '../../types/rental.types';

interface RentalRequestCardProps {
    booking: Booking;
    isOwner: boolean;
}

export default function RentalRequestCard({ booking, isOwner }: RentalRequestCardProps) {
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
                    <Text style={styles.renterName}>От: {booking.renterName}</Text>
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
            </View>

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
    renterName: { fontSize: 12, color: '#64748B' },
    detailsBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 12,
        gap: 8,
        marginBottom: 16,
    },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    detailText: { fontSize: 13, color: '#1E293B', fontWeight: '500' },
    actions: { flexDirection: 'row', gap: 10 },
    btn: { flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    acceptBtn: { backgroundColor: Colors.primary },
    acceptText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    declineBtn: { backgroundColor: '#F1F5F9' },
    declineText: { color: '#64748B', fontWeight: '700', fontSize: 13 },
    statusBox: { paddingVertical: 8, alignItems: 'center' },
    statusText: { fontSize: 11, color: '#94A3B8', textAlign: 'center', fontStyle: 'italic' },
});
