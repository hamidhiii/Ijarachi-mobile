import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import PhaseTimeline from '../../../components/protocol/PhaseTimeline';
import PhotoCaptureSheet from '../../../components/protocol/PhotoCaptureSheet';
import PhotoGrid from '../../../components/protocol/PhotoGrid';
import StatusBadge from '../../../components/protocol/StatusBadge';
import { Colors } from '../../../constants/Colors';
import { PROTOCOL } from '../../../constants/protocol';
import { CURRENT_USER_ID } from '../../../mocks/bookings';
import {
    confirmReturnOk,
    getBookingById,
    openDispute,
    submitReturn,
} from '../../../services/rentalService';
import { Booking, ProtocolPhoto } from '../../../types/rental.types';

const { width } = Dimensions.get('window');

export default function ReturnScreen() {
    const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
    const router = useRouter();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [renterRating, setRenterRating] = useState<number>(5);
    const [ownerRating, setOwnerRating] = useState<number>(5);

    const fetchBooking = useCallback(async () => {
        const data = await getBookingById(bookingId);
        setBooking(data);
        setLoading(false);
    }, [bookingId]);

    useEffect(() => { fetchBooking(); }, [fetchBooking]);

    if (loading || !booking) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator color={Colors.primary} size="large" />
            </SafeAreaView>
        );
    }

    const isOwner = booking.ownerId === CURRENT_USER_ID;
    const isRenter = booking.renterId === CURRENT_USER_ID;
    const returnPhotosCount = booking.renterReturnPhotos.length;

    // ── Действия ────────────────────────────────────────────────────────────────

    const handleReturnPhotosComplete = (photos: ProtocolPhoto[]) => {
        setShowCamera(false);
        setBooking((prev) =>
            prev ? { ...prev, renterReturnPhotos: photos } : prev
        );
    };

    const handleSubmitReturn = async () => {
        if (returnPhotosCount < PROTOCOL.MIN_PHOTOS) {
            Alert.alert('Не хватает фото', `Минимум ${PROTOCOL.MIN_PHOTOS} фото обязательны.`);
            return;
        }
        Alert.alert(
            'Вернуть вещь?',
            'Владелец получит уведомление и должен осмотреть вещь в течение 24 часов.',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Вернуть',
                    onPress: async () => {
                        setSubmitting(true);
                        try {
                            // В реальности передаем renterRating в API
                            const updated = await submitReturn(bookingId);
                            setBooking(updated);
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ]
        );
    };

    const handleConfirmOk = async () => {
        // Логика авто-медиации: если разница в оценках большая
        const diff = Math.abs(ownerRating - renterRating);

        if (diff >= 3) {
            Alert.alert(
                'Сильное расхождение оценок',
                `Ваша оценка (${ownerRating}) сильно отличается от оценки арендатора (${renterRating}). Спор будет открыт автоматически для медиации.`,
                [{ text: 'Понятно', onPress: handleOpenDispute }]
            );
            return;
        }

        Alert.alert(
            'Всё в порядке?',
            'Подтверждая, вы соглашаетесь с тем, что вещь возвращена без повреждений. Деньги будут переведены вам.',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Подтвердить',
                    onPress: async () => {
                        setSubmitting(true);
                        try {
                            await confirmReturnOk(bookingId);
                            router.replace({
                                pathname: '/protocol/success/[bookingId]',
                                params: { bookingId },
                            });
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ]
        );
    };

    const handleOpenDispute = async () => {
        Alert.alert(
            'Открыть спор?',
            'Деньги будут заморожены до решения модератора (до 3 рабочих дней). Вы сможете добавить доказательства.',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Открыть спор',
                    style: 'destructive',
                    onPress: async () => {
                        setSubmitting(true);
                        try {
                            await openDispute(bookingId);
                            router.replace({
                                pathname: '/protocol/dispute/[bookingId]',
                                params: { bookingId },
                            });
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={22} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Возврат вещи</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <PhaseTimeline currentPhase={2} />

                {/* Карточка товара */}
                <View style={styles.itemCard}>
                    <Image source={booking.itemImage} style={styles.itemImage} />
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle} numberOfLines={2}>{booking.itemTitle}</Text>
                        <Text style={styles.itemDate}>{booking.startDate} → {booking.endDate}</Text>
                        <Text style={styles.itemPrice}>
                            {booking.totalAmount.toLocaleString()} сум
                        </Text>
                    </View>
                </View>

                {/* ── ШАГ 1: АРЕНДАТОР ФОТОГРАФИРУЕТ И ВОЗВРАЩАЕТ ───────────────── */}
                {booking.status === 'active' && isRenter && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <StatusBadge role="renter" />
                            <Text style={styles.sectionTitle}>Сфотографируйте при возврате</Text>
                        </View>

                        {/* Фото «до» для сравнения (фото владельца при передаче) */}
                        {booking.ownerHandoverPhotos.length > 0 && (
                            <>
                                <Text style={styles.compareLabel}>
                                    Так выглядело при передаче:
                                </Text>
                                <PhotoGrid
                                    photos={booking.ownerHandoverPhotos}
                                    totalSlots={PROTOCOL.MIN_PHOTOS}
                                />
                                <View style={styles.divider} />
                            </>
                        )}

                        <Text style={styles.sectionDesc}>
                            Сделайте {PROTOCOL.MIN_PHOTOS} фото возврата — такие же ракурсы как при
                            получении. Это защита при любом споре.
                        </Text>
                        <PhotoGrid
                            photos={booking.renterReturnPhotos}
                            totalSlots={PROTOCOL.MIN_PHOTOS}
                            onAddPress={() => setShowCamera(true)}
                        />

                        {returnPhotosCount < PROTOCOL.MIN_PHOTOS && (
                            <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowCamera(true)}>
                                <Ionicons name="camera" size={20} color="#fff" />
                                <Text style={styles.primaryBtnText}>Открыть камеру</Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.ratingSection}>
                            <Text style={styles.ratingTitle}>Оцените состояние вещи при возврате</Text>
                            <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <TouchableOpacity key={s} onPress={() => setRenterRating(s)}>
                                        <Ionicons
                                            name={s <= renterRating ? "star" : "star-outline"}
                                            size={32}
                                            color={s <= renterRating ? "#F59E0B" : "#CBD5E1"}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text style={styles.ratingSub}>
                                Ваша оценка: {renterRating} ({renterRating === 5 ? 'Идеально' : renterRating >= 3 ? 'Есть износ' : 'Повреждено'})
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitBtn, returnPhotosCount < PROTOCOL.MIN_PHOTOS && styles.submitBtnDisabled]}
                            onPress={handleSubmitReturn}
                            disabled={submitting || returnPhotosCount < PROTOCOL.MIN_PHOTOS}
                            activeOpacity={0.8}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="return-down-back-outline" size={18} color="#fff" />
                                    <Text style={styles.submitBtnText}>Вернуть вещь</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Ожидание владельца (видит арендатор) */}
                {booking.status === 'pending_owner_confirm' && isRenter && (
                    <View style={styles.waitBox}>
                        <Ionicons name="hourglass-outline" size={40} color={Colors.primary} />
                        <Text style={styles.waitTitle}>Ожидаем владельца</Text>
                        <Text style={styles.waitDesc}>
                            Владелец должен осмотреть вещь и подтвердить возврат в течение{' '}
                            {PROTOCOL.OWNER_CONFIRM_HOURS} часов. Деньги разморозятся автоматически.
                        </Text>
                    </View>
                )}

                {/* ── ШАГ 2: ВЛАДЕЛЕЦ СРАВНИВАЕТ И РЕШАЕТ ─────────────────────── */}
                {booking.status === 'pending_owner_confirm' && isOwner && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <StatusBadge role="owner" />
                            <Text style={styles.sectionTitle}>Осмотрите вещь</Text>
                        </View>
                        <Text style={styles.sectionDesc}>
                            Сравните фото «до» и «после». Если всё в порядке — нажмите «Всё ок»
                            и деньги поступят на ваш счёт. Если есть повреждения — откройте спор.
                        </Text>

                        {/* Сравнение ДО / ПОСЛЕ */}
                        <View style={styles.compareRow}>
                            <View style={styles.compareBlock}>
                                <Text style={styles.compareLabelTitle}>ДО (при передаче)</Text>
                                <PhotoGrid photos={booking.ownerHandoverPhotos} totalSlots={PROTOCOL.MIN_PHOTOS} />
                            </View>
                            <View style={styles.compareBlock}>
                                <Text style={styles.compareLabelTitle}>ПОСЛЕ (при возврате)</Text>
                                <PhotoGrid photos={booking.renterReturnPhotos} totalSlots={PROTOCOL.MIN_PHOTOS} />
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.ratingSection}>
                            <Text style={styles.ratingTitle}>Ваша оценка состояния после аренды</Text>
                            <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <TouchableOpacity key={s} onPress={() => setOwnerRating(s)}>
                                        <Ionicons
                                            name={s <= ownerRating ? "star" : "star-outline"}
                                            size={32}
                                            color={s <= ownerRating ? "#F59E0B" : "#CBD5E1"}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.comparisonBadge}>
                                <Ionicons name="information-circle-outline" size={16} color="#64748B" />
                                <Text style={styles.comparisonText}>
                                    Оценка арендатора: {renterRating}/5.
                                    {Math.abs(ownerRating - renterRating) >= 3 ? ' Внимание: Большое расхождение!' : ' Совпадает с вашим мнением.'}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.okBtn}
                            onPress={handleConfirmOk}
                            disabled={submitting}
                            activeOpacity={0.8}
                        >
                            {submitting ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                    <Text style={styles.okBtnText}>Всё ок — разморозить деньги</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.disputeBtn}
                            onPress={handleOpenDispute}
                            disabled={submitting}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="warning-outline" size={18} color="#DC2626" />
                            <Text style={styles.disputeBtnText}>Открыть спор</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {isRenter && booking.status === 'active' && (
                <PhotoCaptureSheet
                    visible={showCamera}
                    bookingId={bookingId}
                    phase="return_renter"
                    existingPhotos={booking.renterReturnPhotos}
                    onClose={() => setShowCamera(false)}
                    onComplete={handleReturnPhotosComplete}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC',
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
    scroll: { padding: 16 },
    itemCard: {
        flexDirection: 'row', backgroundColor: '#F8FAFC',
        borderRadius: 18, overflow: 'hidden', marginBottom: 20,
        borderWidth: 1, borderColor: '#F1F5F9',
    },
    itemImage: { width: 90, height: 90 },
    itemInfo: { flex: 1, padding: 12, gap: 4 },
    itemTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
    itemDate: { fontSize: 12, color: '#64748B' },
    itemPrice: { fontSize: 15, fontWeight: '800', color: Colors.primary },
    section: { gap: 14 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
    sectionDesc: { fontSize: 13, color: '#64748B', lineHeight: 20 },
    compareLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 8 },
    compareRow: { flexDirection: 'row', gap: 12 },
    compareBlock: { flex: 1, gap: 8 },
    compareLabelTitle: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
    primaryBtn: {
        backgroundColor: Colors.primary, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 14, borderRadius: 16, gap: 8,
    },
    primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    submitBtn: {
        backgroundColor: Colors.primary, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 16, borderRadius: 18, gap: 10,
    },
    submitBtnDisabled: { backgroundColor: '#E2E8F0' },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    waitBox: {
        alignItems: 'center', padding: 32, gap: 14,
        backgroundColor: '#FFF7ED', borderRadius: 20,
    },
    waitTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
    waitDesc: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20 },
    okBtn: {
        backgroundColor: '#059669', flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 16, borderRadius: 18, gap: 10,
    },
    okBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    disputeBtn: {
        backgroundColor: '#FEF2F2', flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 15, borderRadius: 18, gap: 10,
        borderWidth: 1, borderColor: '#FECACA',
    },
    disputeBtnText: { color: '#DC2626', fontSize: 15, fontWeight: '700' },
    ratingSection: {
        backgroundColor: '#F8FAFC', padding: 20, borderRadius: 20,
        gap: 12, alignItems: 'center', marginVertical: 10,
    },
    ratingTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, textAlign: 'center' },
    starsRow: { flexDirection: 'row', gap: 10 },
    ratingSub: { fontSize: 12, color: '#64748B' },
    comparisonBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#fff', padding: 10, borderRadius: 12,
        borderWidth: 1, borderColor: '#E2E8F0', marginTop: 5,
    },
    comparisonText: { fontSize: 12, color: '#64748B' },
});
