import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Dimensions, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SellerCard } from '../../components/SellerCard';
import QuantitySelector from '../../components/listing/QuantitySelector';
import SizeSelector from '../../components/listing/SizeSelector';
import { Colors } from '../../constants/Colors';
import { ITEMS } from '../../constants/data';
import { useAuth } from '../../context/AuthContext';
import { Listing } from '../../types/listing.types';

let DateTimePicker: any;
if (Platform.OS !== 'web') {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
}

const { width } = Dimensions.get('window');

export default function ProductDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { isLoggedIn } = useAuth();

    const product = (ITEMS.find(p => p.id === id) || ITEMS[0]) as Listing;
    const priceNum = product.priceNum;

    const today = new Date().toISOString().split('T')[0];

    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [range, setRange] = useState({ start: '', end: '', markedDates: {} });

    const [startTime, setStartTime] = useState(new Date(new Date().setHours(14, 46, 0, 0)));
    const [endTime, setEndTime] = useState(new Date(new Date().setHours(20, 0, 0, 0)));
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const isSizeCategory = product.categoryType === 'size';

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    };

    const handleBooking = () => {
        if (!isLoggedIn) {
            router.push('/auth/login');
            return;
        }

        if (!range.start) {
            Alert.alert("Дата не выбрана", "Выберите хотя бы один день на календаре.");
            return;
        }

        if (isSizeCategory && !selectedSize) {
            Alert.alert('Размер не выбран', 'Пожалуйста, выберите размер.');
            return;
        }

        router.push({
            pathname: '/checkout/Summary',
            params: {
                id: id,
                days: daysCount,
                qty: isSizeCategory ? 1 : quantity,
                size: isSizeCategory ? selectedSize : null,
                startDate: range.start,
                endDate: range.end,
                startTime: range.start === range.end ? formatTime(startTime) : null,
                endTime: range.start === range.end ? formatTime(endTime) : null,
            }
        });
    };

    const blockedDatesObj = useMemo(() => {
        const obj: any = {};
        (product.blockedDates || []).forEach(date => {
            obj[date] = {
                disabled: true,
                disableTouchEvent: true,
                textColor: '#CBD5E1',
            };
        });
        return obj;
    }, [product.blockedDates]);

    useEffect(() => {
        if (product.blockedDates) {
            setRange(prev => ({
                ...prev,
                markedDates: { ...prev.markedDates, ...blockedDatesObj }
            }));
        }
    }, [blockedDatesObj]);

    const handleDayPress = (day: any) => {
        const dateStr = day.dateString;

        // Если дата заблокирована - ничего не делаем
        if (product.blockedDates?.includes(dateStr)) return;

        if (!range.start || (range.start !== range.end)) {
            setRange({
                start: dateStr,
                end: dateStr,
                markedDates: {
                    ...blockedDatesObj,
                    [dateStr]: {
                        startingDay: true,
                        endingDay: true,
                        color: Colors.primary,
                        textColor: 'white'
                    }
                }
            });
        }
        else {
            let start = new Date(range.start);
            let end = new Date(dateStr);

            if (end < start) [start, end] = [end, start];

            // Проверка: есть ли заблокированные даты внутри выбранного диапазона
            let checkDate = new Date(start);
            let hasBlocked = false;
            while (checkDate <= end) {
                if (product.blockedDates?.includes(checkDate.toISOString().split('T')[0])) {
                    hasBlocked = true;
                    break;
                }
                checkDate.setDate(checkDate.getDate() + 1);
            }

            if (hasBlocked) {
                // Если есть заблокированные даты, сбрасываем выбор на текущую дату
                setRange({
                    start: dateStr,
                    end: dateStr,
                    markedDates: {
                        ...blockedDatesObj,
                        [dateStr]: {
                            startingDay: true,
                            endingDay: true,
                            color: Colors.primary,
                            textColor: 'white'
                        }
                    }
                });
                return;
            }

            let newMarkedDates: any = { ...blockedDatesObj };
            let currentDate = new Date(start);

            while (currentDate <= end) {
                const fmt = currentDate.toISOString().split('T')[0];
                const isStart = fmt === start.toISOString().split('T')[0];
                const isEnd = fmt === end.toISOString().split('T')[0];

                newMarkedDates[fmt] = {
                    color: Colors.primary,
                    textColor: 'white',
                    startingDay: isStart,
                    endingDay: isEnd
                };
                currentDate.setDate(currentDate.getDate() + 1);
            }

            setRange({
                start: start.toISOString().split('T')[0],
                end: end.toISOString().split('T')[0],
                markedDates: newMarkedDates
            });
        }
    };

    const daysCount = useMemo(() => Object.keys(range.markedDates).length || 1, [range.markedDates]);
    const totalAmount = daysCount * priceNum * (isSizeCategory ? 1 : quantity);

    const rating = product.rating ?? 4.8;
    const reviewCount = product.reviewCount ?? 0;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <StatusBar barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                <View style={styles.imageWrap}>
                    <Image source={product.image} style={styles.mainImage} />
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={22} color={Colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.heartBtn}>
                        <Ionicons name="heart-outline" size={20} color={Colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={{ padding: 20 }}>
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>{product.title}</Text>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={14} color="#F59E0B" />
                                <Text style={styles.ratingNum}>{rating.toFixed(1)}</Text>
                                {reviewCount > 0 && (
                                    <Text style={styles.ratingReviews}>· {reviewCount} отзывов</Text>
                                )}
                            </View>
                        </View>
                        <View style={styles.priceBox}>
                            <Text style={styles.price}>{product.priceNum.toLocaleString()}</Text>
                            <Text style={styles.perDay}>сум / день</Text>
                        </View>
                    </View>

                    <View style={styles.badgesRow}>
                        <View style={styles.locBadge}>
                            <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                            <Text style={styles.locBadgeText}>{product.location}</Text>
                        </View>
                        <View style={styles.availBadge}>
                            <View style={styles.availDot} />
                            <Text style={styles.availText}>Свободно сейчас</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* SELECTORS Section */}
                    {isSizeCategory ? (
                        <SizeSelector
                            availableSizes={product.availableSizes || []}
                            selectedSize={selectedSize}
                            onSelect={setSelectedSize}
                        />
                    ) : (
                        <QuantitySelector
                            value={quantity}
                            max={product.maxQuantity || 1}
                            onChange={setQuantity}
                            unit={product.unit || 'шт'}
                        />
                    )}

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Описание</Text>
                    <Text style={styles.description}>{product.description}</Text>

                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Владелец</Text>
                    <SellerCard
                        sellerName={product.seller.name}
                        sellerRole={product.seller.role}
                        onPress={() => router.push(`/seller/${product.seller.id}` as any)}
                    />

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Период аренды</Text>
                    <View style={styles.dateTimeRow}>
                        <View style={styles.dateTimeCard}>
                            <Text style={styles.dateTimeLabelSmall}>Начало</Text>
                            <Text style={styles.dateTimeValue}>{range.start || '---'}</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={18} color="#CBD5E1" />
                        <View style={styles.dateTimeCard}>
                            <Text style={styles.dateTimeLabelSmall}>Конец</Text>
                            <Text style={styles.dateTimeValue}>{range.end || '---'}</Text>
                        </View>
                    </View>

                    {range.start && range.start === range.end && (
                        <View style={styles.timeSection}>
                            <Text style={styles.sectionTitleSmall}>Укажите часы аренды</Text>
                            <View style={styles.dateTimeRow}>
                                <TouchableOpacity
                                    style={[styles.dateTimeCard, styles.timePickerCardActive]}
                                    onPress={() => Platform.OS !== 'web' && setShowStartPicker(true)}
                                >
                                    <Text style={styles.timeLabelBlue}>С</Text>
                                    <Text style={styles.timeValue}>{formatTime(startTime)}</Text>
                                </TouchableOpacity>

                                <Ionicons name="time-outline" size={20} color={Colors.primary} />

                                <TouchableOpacity
                                    style={[styles.dateTimeCard, styles.timePickerCardActive]}
                                    onPress={() => Platform.OS !== 'web' && setShowEndPicker(true)}
                                >
                                    <Text style={styles.timeLabelBlue}>До</Text>
                                    <Text style={styles.timeValue}>{formatTime(endTime)}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {Platform.OS !== 'web' && (showStartPicker || showEndPicker) && (
                        <DateTimePicker
                            value={showStartPicker ? startTime : endTime}
                            mode="time"
                            is24Hour={true}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            textColor="#000000"
                            onChange={(event: any, date: any) => {
                                setShowStartPicker(false);
                                setShowEndPicker(false);
                                if (date) {
                                    if (showStartPicker) setStartTime(date);
                                    else setEndTime(date);
                                }
                            }}
                        />
                    )}

                    <Text style={styles.sectionTitle}>Выберите даты</Text>
                    <View style={styles.calendarWrapper}>
                        <Calendar
                            markingType={'period'}
                            onDayPress={handleDayPress}
                            markedDates={range.markedDates}
                            minDate={today}
                            theme={{ selectedDayBackgroundColor: Colors.primary, todayTextColor: Colors.primary, ...({ 'stylesheet.calendar.header': { week: { marginTop: 5, flexDirection: 'row', justifyContent: 'space-between' } } } as any) }}
                        />
                    </View>

                    {range.start && range.end && range.start !== range.end && (
                        <View style={styles.rangeInfoBox}>
                            <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
                            <Text style={styles.rangeText}>Аренда с {range.start} до {range.end}</Text>
                        </View>
                    )}

                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.totalLabel}>Итого за {daysCount} дн. {!isSizeCategory && quantity > 1 ? `(${quantity} шт.)` : ''}</Text>
                    <Text style={styles.totalPrice}>{totalAmount.toLocaleString()} сум</Text>
                </View>
                <TouchableOpacity style={[styles.bookBtn, (!range.start) && { opacity: 0.5 }]}
                    onPress={handleBooking}
                ><Text style={styles.bookBtnText}>Забронировать</Text></TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    imageWrap: { position: 'relative' },
    backBtn: {
        position: 'absolute', top: 50, left: 16, zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.92)', width: 40, height: 40,
        borderRadius: 13, justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
    },
    heartBtn: {
        position: 'absolute', top: 50, right: 16, zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.92)', width: 40, height: 40,
        borderRadius: 13, justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
    },
    mainImage: { width: width, height: 360, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
    title: { fontSize: 22, fontWeight: '900', color: Colors.text, lineHeight: 28 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    ratingNum: { fontSize: 13, fontWeight: '700', color: Colors.text },
    ratingReviews: { fontSize: 13, color: Colors.textMuted },
    priceBox: { alignItems: 'flex-end' },
    price: { fontSize: 22, fontWeight: '900', color: Colors.primary },
    perDay: { fontSize: 12, fontWeight: '500', color: Colors.textMuted },
    badgesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    locBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#F7F7F5', borderRadius: 9,
        paddingHorizontal: 10, paddingVertical: 5,
    },
    locBadgeText: { fontSize: 12, color: Colors.textMuted },
    availBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#ECFDF5', borderRadius: 9,
        paddingHorizontal: 10, paddingVertical: 5,
    },
    availDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' },
    availText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000000', marginBottom: 15 },
    description: { fontSize: 15, color: '#64748B', lineHeight: 22 },
    calendarWrapper: { backgroundColor: '#FFFFFF', borderRadius: 25, padding: 10, borderWidth: 1, borderColor: '#F1F5F9' },
    bottomBar: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFFFFF', padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingBottom: 35 },
    totalLabel: { fontSize: 13, color: '#64748B' },
    totalPrice: { fontSize: 20, fontWeight: '900', color: '#000000' },
    bookBtn: { backgroundColor: Colors.primary, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 18 },
    bookBtnText: { color: '#FFFFFF', fontWeight: '700' },

    // Стили для карточек даты/времени
    dateTimeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 15 },
    dateTimeCard: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 65
    },
    dateTimeLabelSmall: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 4
    },
    dateTimeValue: {
        fontSize: 16,
        fontWeight: '900',
        color: '#000000', // Темный цвет для четкости
    },

    // Специфические стили для активных карточек времени (синих)
    timeSection: { marginTop: 10, marginBottom: 20 },
    sectionTitleSmall: { fontSize: 14, fontWeight: '700', color: '#000000', marginBottom: 10 },
    timePickerCardActive: {
        backgroundColor: '#F0F9FF',
        borderColor: '#BAE6FD',
    },
    timeValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0369A1'
    },
    timeLabelBlue: {
        color: '#0369A1',
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 4
    },

    // Стили для Stepper
    quantitySection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    stockText: { fontSize: 12, color: '#94A3B8', marginTop: -5 },
    quantityInput: {
        fontSize: 18,
        fontWeight: '800',
        color: '#000000',
        width: 60,
        textAlign: 'center',
        padding: 0
    },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 15,
        padding: 5,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    stepBtn: { width: 38, height: 38, backgroundColor: '#FFFFFF', borderRadius: 10, justifyContent: 'center', alignItems: 'center', elevation: 2 },

    rangeInfoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9FF', padding: 15, borderRadius: 15, marginTop: 15, gap: 10 },
    rangeText: { fontSize: 13, color: '#0369A1', fontWeight: '500' },
});