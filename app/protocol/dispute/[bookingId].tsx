import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import PhaseTimeline from '../../../components/protocol/PhaseTimeline';
import StatusBadge from '../../../components/protocol/StatusBadge';
import { Colors } from '../../../constants/Colors';
import { PROTOCOL } from '../../../constants/protocol';
import { CURRENT_USER_ID } from '../../../mocks/bookings';
import { addDisputeEvidence, getBookingById } from '../../../services/rentalService';
import { Booking } from '../../../types/rental.types';

export default function DisputeScreen() {
    const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
    const router = useRouter();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

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

    const myRole = booking.ownerId === CURRENT_USER_ID ? 'owner' : 'renter';

    const handleAddPhoto = async () => {
        if (evidencePhotos.length >= 5) {
            Alert.alert('Максимум 5 фото', 'Достигнут лимит дополнительных фото.');
            return;
        }
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Нет доступа к камере');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            quality: 0.85,
        });
        if (!result.canceled && result.assets.length > 0) {
            setEvidencePhotos((prev) => [...prev, result.assets[0].uri]);
        }
    };

    const handleSubmit = async () => {
        if (!comment.trim() && evidencePhotos.length === 0) {
            Alert.alert('Добавьте доказательства', 'Загрузите фото или напишите комментарий.');
            return;
        }
        Alert.alert(
            'Отправить доказательства?',
            `Статус изменится на «На модерации». Модератор рассмотрит спор в течение ${PROTOCOL.MODERATION_DAYS} рабочих дней.`,
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Отправить',
                    onPress: async () => {
                        setSubmitting(true);
                        try {
                            await addDisputeEvidence(bookingId, {
                                authorRole: myRole,
                                photoUris: evidencePhotos,
                                comment: comment.trim(),
                            });
                            Alert.alert(
                                '✓ Доказательства отправлены',
                                'Модератор свяжется с вами в течение 3 рабочих дней.',
                                [{ text: 'OK', onPress: () => router.replace('/(tabs)/bookings') }]
                            );
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
                <Text style={styles.headerTitle}>Спор</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <PhaseTimeline currentPhase={3} />

                {/* Статус бокс */}
                <View style={styles.alertBox}>
                    <Ionicons name="warning" size={24} color="#D97706" />
                    <View style={styles.alertText}>
                        <Text style={styles.alertTitle}>Спор открыт</Text>
                        <Text style={styles.alertDesc}>
                            Деньги заморожены. У каждой стороны есть{' '}
                            {PROTOCOL.DISPUTE_EVIDENCE_HOURS} часов на загрузку доказательств.
                        </Text>
                    </View>
                </View>

                {/* Карточка товара */}
                <View style={styles.itemCard}>
                    <Image source={booking.itemImage} style={styles.itemImage} />
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle} numberOfLines={2}>{booking.itemTitle}</Text>
                        <Text style={styles.itemDate}>{booking.startDate} → {booking.endDate}</Text>
                        <Text style={styles.itemPrice}>{booking.totalAmount.toLocaleString()} сум</Text>
                    </View>
                </View>

                {/* Уже загруженные доказательства */}
                {booking.disputeEvidence.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Доказательства сторон</Text>
                        {booking.disputeEvidence.map((ev) => (
                            <View key={ev.id} style={styles.evidenceCard}>
                                <View style={styles.evidenceHeader}>
                                    <StatusBadge role={ev.authorRole} />
                                    <Text style={styles.evidenceDate}>
                                        {new Date(ev.uploadedAt).toLocaleDateString('ru-RU')}
                                    </Text>
                                </View>
                                {ev.comment ? (
                                    <Text style={styles.evidenceComment}>{ev.comment}</Text>
                                ) : null}
                                {ev.photoUris.length > 0 && (
                                    <View style={styles.evidencePhotoRow}>
                                        {ev.photoUris.map((uri, i) => (
                                            <Image key={i} source={{ uri }} style={styles.evidencePhoto} />
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Добавить свои доказательства */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <StatusBadge role={myRole} />
                        <Text style={styles.sectionTitle}>Ваши доказательства</Text>
                    </View>

                    {/* Фото */}
                    <Text style={styles.fieldLabel}>Фото ({evidencePhotos.length}/5)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosRow}>
                        {evidencePhotos.map((uri, i) => (
                            <Image key={i} source={{ uri }} style={styles.thumbPhoto} />
                        ))}
                        {evidencePhotos.length < 5 && (
                            <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddPhoto}>
                                <Ionicons name="camera-outline" size={26} color={Colors.primary} />
                            </TouchableOpacity>
                        )}
                    </ScrollView>

                    {/* Комментарий */}
                    <Text style={styles.fieldLabel}>Комментарий</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Опишите ситуацию подробно..."
                        placeholderTextColor="#94A3B8"
                        multiline
                        numberOfLines={5}
                        value={comment}
                        onChangeText={setComment}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        style={styles.submitBtn}
                        onPress={handleSubmit}
                        disabled={submitting}
                        activeOpacity={0.8}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="send" size={18} color="#fff" />
                                <Text style={styles.submitBtnText}>Отправить доказательства</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Правила */}
                <View style={styles.rulesBox}>
                    <Ionicons name="information-circle-outline" size={16} color="#64748B" />
                    <Text style={styles.rulesText}>
                        Решение модератора принимается в течение {PROTOCOL.MODERATION_DAYS} рабочих
                        дней. Возможные исходы: полный возврат арендатору / полная выплата владельцу /
                        частичный возврат. Решение финальное.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
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
    alertBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 12,
        backgroundColor: '#FFFBEB', borderRadius: 16,
        padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A',
    },
    alertText: { flex: 1, gap: 4 },
    alertTitle: { fontSize: 15, fontWeight: '700', color: '#92400E' },
    alertDesc: { fontSize: 12, color: '#78350F', lineHeight: 18 },
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
    section: { gap: 12, marginBottom: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
    evidenceCard: {
        backgroundColor: '#F8FAFC', borderRadius: 16,
        padding: 14, gap: 10, borderWidth: 1, borderColor: '#F1F5F9',
    },
    evidenceHeader: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
    },
    evidenceDate: { fontSize: 11, color: '#94A3B8' },
    evidenceComment: { fontSize: 13, color: '#475569', lineHeight: 20 },
    evidencePhotoRow: { flexDirection: 'row', gap: 8 },
    evidencePhoto: { width: 70, height: 70, borderRadius: 10 },
    fieldLabel: { fontSize: 13, fontWeight: '600', color: '#475569' },
    photosRow: { marginVertical: 4 },
    thumbPhoto: {
        width: 80, height: 80, borderRadius: 12, marginRight: 8,
    },
    addPhotoBtn: {
        width: 80, height: 80, borderRadius: 12,
        backgroundColor: '#F0FDF4', borderWidth: 1.5,
        borderColor: Colors.primary, borderStyle: 'dashed',
        justifyContent: 'center', alignItems: 'center',
    },
    textInput: {
        backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
        borderRadius: 16, padding: 14, fontSize: 14, color: Colors.text,
        minHeight: 120,
    },
    submitBtn: {
        backgroundColor: Colors.primary, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 16, borderRadius: 18, gap: 10,
    },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    rulesBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 8,
        backgroundColor: '#F8FAFC', borderRadius: 14, padding: 12,
        borderWidth: 1, borderColor: '#E2E8F0',
    },
    rulesText: { flex: 1, fontSize: 11, color: '#64748B', lineHeight: 17 },
});
