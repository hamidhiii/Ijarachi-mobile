import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
    getBookingById,
    submitOwnerHandover,
    submitRenterHandoverConfirm,
} from '../../../services/rentalService';
import { Booking, ProtocolPhoto } from '../../../types/rental.types';

// ─── Экран передачи вещи ─────────────────────────────────────────────────────
// Шаг 1: Владелец делает 5 фото и нажимает «Передать»
// Шаг 2: Арендатор проверяет фото владельца, делает свои 5 фото, подтверждает

export default function HandoverScreen() {
    const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
    const router = useRouter();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [checklist, setChecklist] = useState({
        condition: false,
        completeness: false,
        functionality: false,
    });
    const [signed, setSigned] = useState(false);

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

    const ownerPhotosCount = booking.ownerHandoverPhotos.length;
    const renterPhotosCount = booking.renterHandoverPhotos.length;

    // ── Действия ────────────────────────────────────────────────────────────────

    const handleOwnerPhotosComplete = (photos: ProtocolPhoto[]) => {
        setShowCamera(false);
        setBooking((prev) =>
            prev ? { ...prev, ownerHandoverPhotos: photos } : prev
        );
    };

    const handleRenterPhotosComplete = (photos: ProtocolPhoto[]) => {
        setShowCamera(false);
        setBooking((prev) =>
            prev ? { ...prev, renterHandoverPhotos: photos } : prev
        );
    };

    const handleOwnerSubmit = async () => {
        if (ownerPhotosCount < PROTOCOL.MIN_PHOTOS) {
            Alert.alert(
                'Не хватает фото',
                `Минимум ${PROTOCOL.MIN_PHOTOS} фото обязательны для протокола.`
            );
            return;
        }
        Alert.alert(
            'Подтвердить передачу?',
            'После этого арендатор получит уведомление и должен будет осмотреть вещь.',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Передать',
                    onPress: async () => {
                        setSubmitting(true);
                        try {
                            const updated = await submitOwnerHandover(bookingId);
                            setBooking(updated);
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ]
        );
    };

    const handleRenterConfirm = async () => {
        if (renterPhotosCount < PROTOCOL.MIN_PHOTOS) {
            Alert.alert(
                'Не хватает фото',
                `Сделайте ${PROTOCOL.MIN_PHOTOS} фото для подтверждения получения.`
            );
            return;
        }

        if (!checklist.condition || !checklist.completeness || !checklist.functionality) {
            Alert.alert('Чек-лист не заполнен', 'Пожалуйста, отметьте все пункты проверки состояния вещи.');
            return;
        }

        if (!signed) {
            Alert.alert('Нет подписи', 'Пожалуйста, подтвердите получение своей цифровой подписью.');
            return;
        }

        Alert.alert(
            'Подтвердить получение?',
            'Вы подтверждаете, что вещь получена и соответствует описанию. Деньги будут заморожены до возврата.',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Подтвердить',
                    onPress: async () => {
                        setSubmitting(true);
                        try {
                            const updated = await submitRenterHandoverConfirm(bookingId);
                            setBooking(updated);
                            // Небольшая задержка перед переходом
                            setTimeout(() => {
                                router.replace('/(tabs)/profile');
                            }, 1500);
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ]
        );
    };

    // ── Определяем текущую фазу для таймлайна ───────────────────────────────────
    const timelinePhase =
        booking.status === 'pending_handover' ? 0 :
            booking.status === 'pending_renter_confirm' ? 1 : 2;

    // ── Рендер ──────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Хедер */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={22} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Передача вещи</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Временная шкала */}
                <PhaseTimeline currentPhase={timelinePhase as 0 | 1 | 2 | 3} />

                {/* Карточка товара */}
                <View style={styles.itemCard}>
                    <Image source={booking.itemImage} style={styles.itemImage} />
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle} numberOfLines={2}>{booking.itemTitle}</Text>
                        <Text style={styles.itemDate}>
                            {booking.startDate} → {booking.endDate}
                        </Text>
                        <Text style={styles.itemPrice}>
                            {booking.totalAmount.toLocaleString()} сум
                        </Text>
                    </View>
                </View>

                {/* ── ШАГ 1: ВЛАДЕЛЕЦ ФОТОГРАФИРУЕТ ────────────────────────────── */}
                {booking.status === 'pending_handover' && isOwner && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <StatusBadge role="owner" />
                            <Text style={styles.sectionTitle}>Сфотографируйте вещь</Text>
                        </View>
                        <Text style={styles.sectionDesc}>
                            Сделайте {PROTOCOL.MIN_PHOTOS} обязательных фото через камеру приложения.
                            Это фиксирует состояние вещи до передачи — юридически значимый документ.
                        </Text>

                        <View style={styles.gridBox}>
                            <PhotoGrid
                                photos={booking.ownerHandoverPhotos}
                                totalSlots={PROTOCOL.MIN_PHOTOS}
                                onAddPress={() => setShowCamera(true)}
                            />
                        </View>

                        {ownerPhotosCount < PROTOCOL.MIN_PHOTOS && (
                            <TouchableOpacity
                                style={styles.primaryBtn}
                                onPress={() => setShowCamera(true)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="camera" size={20} color="#fff" />
                                <Text style={styles.primaryBtnText}>Открыть камеру</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.submitBtn,
                                ownerPhotosCount < PROTOCOL.MIN_PHOTOS && styles.submitBtnDisabled,
                            ]}
                            onPress={handleOwnerSubmit}
                            disabled={submitting || ownerPhotosCount < PROTOCOL.MIN_PHOTOS}
                            activeOpacity={0.8}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="send-outline" size={18} color="#fff" />
                                    <Text style={styles.submitBtnText}>Передать вещь</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* ── Ожидание арендатора (видит владелец) ─────────────────────── */}
                {booking.status === 'pending_renter_confirm' && isOwner && (
                    <View style={styles.waitBox}>
                        <Ionicons name="hourglass-outline" size={40} color={Colors.primary} />
                        <Text style={styles.waitTitle}>Ожидаем арендатора</Text>
                        <Text style={styles.waitDesc}>
                            Арендатор должен осмотреть вещь и подтвердить получение.
                            Если нет ответа в течение {PROTOCOL.OWNER_CONFIRM_HOURS} часов —
                            аренда начнётся автоматически.
                        </Text>
                    </View>
                )}

                {/* ── ШАГ 2: АРЕНДАТОР ПРОВЕРЯЕТ И ФОТОГРАФИРУЕТ ───────────────── */}
                {booking.status === 'pending_renter_confirm' && isRenter && (
                    <View style={styles.section}>
                        {/* Геолокация/Близость */}
                        <View style={styles.proximityBox}>
                            <Ionicons name="location" size={16} color="#059669" />
                            <Text style={styles.proximityText}>Вы рядом с владельцем (150м) — Встреча подтверждена</Text>
                        </View>

                        {/* Фото владельца для сравнения */}
                        <View style={styles.sectionHeader}>
                            <StatusBadge role="owner" />
                            <Text style={styles.sectionTitle}>Фото владельца</Text>
                        </View>
                        <Text style={styles.sectionDesc}>
                            Осмотрите вещь и сравните с фото ниже. Если что-то не так — не
                            подтверждайте и свяжитесь с владельцем.
                        </Text>
                        <View style={styles.gridBox}>
                            <PhotoGrid photos={booking.ownerHandoverPhotos} totalSlots={PROTOCOL.MIN_PHOTOS} />
                        </View>

                        <View style={styles.divider} />

                        {/* Фото арендатора */}
                        <View style={styles.sectionHeader}>
                            <StatusBadge role="renter" />
                            <Text style={styles.sectionTitle}>Ваши фото при получении</Text>
                        </View>
                        <Text style={styles.sectionDesc}>
                            Сделайте {PROTOCOL.MIN_PHOTOS} фото со своей стороны. Это ваша защита
                            при любом споре.
                        </Text>
                        <View style={styles.gridBox}>
                            <PhotoGrid
                                photos={booking.renterHandoverPhotos}
                                totalSlots={PROTOCOL.MIN_PHOTOS}
                                onAddPress={() => setShowCamera(true)}
                            />
                        </View>

                        {renterPhotosCount < PROTOCOL.MIN_PHOTOS && (
                            <TouchableOpacity
                                style={styles.primaryBtn}
                                onPress={() => setShowCamera(true)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="camera" size={20} color="#fff" />
                                <Text style={styles.primaryBtnText}>Открыть камеру</Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.divider} />

                        {/* Чек-лист проверки */}
                        <View style={styles.checklistCard}>
                            <Text style={styles.checklistTitle}>Чек-лист осмотра</Text>

                            <TouchableOpacity
                                style={styles.checkRow}
                                onPress={() => setChecklist(p => ({ ...p, condition: !p.condition }))}
                            >
                                <Ionicons
                                    name={checklist.condition ? "checkbox" : "square-outline"}
                                    size={24} color={checklist.condition ? Colors.primary : "#CBD5E1"}
                                />
                                <Text style={styles.checkLabel}>Нет новых царапин и повреждений</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.checkRow}
                                onPress={() => setChecklist(p => ({ ...p, completeness: !p.completeness }))}
                            >
                                <Ionicons
                                    name={checklist.completeness ? "checkbox" : "square-outline"}
                                    size={24} color={checklist.completeness ? Colors.primary : "#CBD5E1"}
                                />
                                <Text style={styles.checkLabel}>Комплектность соответствует (зарядка, чехлы и т.д.)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.checkRow}
                                onPress={() => setChecklist(p => ({ ...p, functionality: !p.functionality }))}
                            >
                                <Ionicons
                                    name={checklist.functionality ? "checkbox" : "square-outline"}
                                    size={24} color={checklist.functionality ? Colors.primary : "#CBD5E1"}
                                />
                                <Text style={styles.checkLabel}>Вещь полностью работоспособна</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Цифровая подпись */}
                        <View style={[styles.signatureBox, signed && styles.signatureBoxActive]}>
                            <Text style={styles.signatureTitle}>Цифровая подпись арендатора</Text>
                            <TouchableOpacity
                                style={styles.signPad}
                                onPress={() => setSigned(true)}
                                disabled={signed}
                            >
                                {signed ? (
                                    <View style={styles.signComplete}>
                                        <Ionicons name="finger-print" size={40} color={Colors.primary} />
                                        <Text style={styles.signText}>Подписано через FaceID/Bio</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.signPlaceholder}>Нажмите для подписи</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.submitBtn,
                                (renterPhotosCount < PROTOCOL.MIN_PHOTOS || !signed || !checklist.condition || !checklist.completeness || !checklist.functionality) && styles.submitBtnDisabled,
                            ]}
                            onPress={handleRenterConfirm}
                            disabled={submitting || renterPhotosCount < PROTOCOL.MIN_PHOTOS || !signed}
                            activeOpacity={0.8}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                                    <Text style={styles.submitBtnText}>Подтвердить и начать аренду</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.legalNote}>
                            Подтверждая получение, вы берете на себя полную материальную ответственность за сохранность вещи.
                        </Text>
                    </View>
                )}

                {/* Аренда активна */}
                {booking.status === 'active' && (
                    <View style={styles.waitBox}>
                        <Ionicons name="checkmark-circle" size={50} color="#059669" />
                        <Text style={[styles.waitTitle, { color: '#059669' }]}>Аренда активна!</Text>
                        <Text style={styles.waitDesc}>
                            Обе стороны подтвердили передачу. Деньги заморожены до возврата.
                        </Text>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Камера для владельца */}
            {isOwner && booking.status === 'pending_handover' && (
                <PhotoCaptureSheet
                    visible={showCamera}
                    bookingId={bookingId}
                    phase="handover_owner"
                    existingPhotos={booking.ownerHandoverPhotos}
                    onClose={() => setShowCamera(false)}
                    onComplete={handleOwnerPhotosComplete}
                />
            )}

            {/* Камера для арендатора */}
            {isRenter && booking.status === 'pending_renter_confirm' && (
                <PhotoCaptureSheet
                    visible={showCamera}
                    bookingId={bookingId}
                    phase="handover_renter"
                    existingPhotos={booking.renterHandoverPhotos}
                    onClose={() => setShowCamera(false)}
                    onComplete={handleRenterPhotosComplete}
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
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#F8FAFC',
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
    gridBox: { marginTop: 4 },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },
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
        marginTop: 4,
    },
    submitBtnDisabled: { backgroundColor: '#E2E8F0' },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    waitBox: {
        alignItems: 'center', padding: 32, gap: 14,
        backgroundColor: '#F0FDF4', borderRadius: 20,
    },
    waitTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
    waitDesc: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20 },
    proximityBox: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#F0FDF4', padding: 12, borderRadius: 12,
        marginBottom: 10, borderWidth: 1, borderColor: '#DCFCE7',
    },
    proximityText: { fontSize: 12, color: '#166534', fontWeight: '600' },
    checklistCard: {
        backgroundColor: '#F8FAFC', padding: 20, borderRadius: 20,
        borderWidth: 1, borderColor: '#F1F5F9', gap: 15,
    },
    checklistTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 5 },
    checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    checkLabel: { fontSize: 14, color: Colors.text, flex: 1 },
    signatureBox: {
        marginTop: 10, padding: 20, borderRadius: 20,
        backgroundColor: '#F8FAFC', borderWidth: 1, borderStyle: 'dashed', borderColor: '#CBD5E1',
    },
    signatureBoxActive: { borderColor: Colors.primary, backgroundColor: '#F0F9FF' },
    signatureTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 15 },
    signPad: {
        height: 120, backgroundColor: '#fff', borderRadius: 15,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#F1F5F9',
    },
    signPlaceholder: { fontSize: 14, color: '#94A3B8' },
    signComplete: { alignItems: 'center', gap: 8 },
    signText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
    legalNote: {
        fontSize: 11, color: '#94A3B8', textAlign: 'center',
        marginTop: 10, lineHeight: 16, paddingHorizontal: 20,
    },
});
