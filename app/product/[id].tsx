import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { SellerCard } from '../../components/SellerCard';
import QuantitySelector from '../../components/listing/QuantitySelector';
import SizeSelector from '../../components/listing/SizeSelector';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import * as listingService from '../../services/listingService';
import { Listing } from '../../types/listing.types';

let DateTimePicker: any;
if (Platform.OS !== 'web') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    DateTimePicker = require('@react-native-community/datetimepicker').default;
}

const { width } = Dimensions.get('window');

export default function ProductDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { isLoggedIn } = useAuth();
    const { wishlist, toggleWishlist } = useWishlist();
    const insets = useSafeAreaInsets();

    const [product, setProduct] = useState<Listing | null>(null);
    const [similarListings, setSimilarListings] = useState<Listing[]>([]);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [zoomVisible, setZoomVisible] = useState(false);
    const [zoomIndex, setZoomIndex] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function loadProduct() {
            setLoadingProduct(true);
            setActiveImageIndex(0);
            try {
                const data = await listingService.getListingById(id as string);
                if (cancelled) return;
                setProduct(data);

                if (data) {
                    const related = await listingService.getListings({ category: data.category });
                    if (!cancelled) {
                        setSimilarListings(related.filter(item => item.id !== data.id).slice(0, 6));
                    }
                } else {
                    setSimilarListings([]);
                }
            } catch {
                if (!cancelled) {
                    setProduct(null);
                    setSimilarListings([]);
                }
            } finally {
                if (!cancelled) setLoadingProduct(false);
            }
        }

        loadProduct();
        return () => {
            cancelled = true;
        };
    }, [id]);

    const today = new Date().toISOString().split('T')[0];

    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [range, setRange] = useState({ start: '', end: '', markedDates: {} });

    const [startTime, setStartTime] = useState(new Date(new Date().setHours(14, 46, 0, 0)));
    const [endTime, setEndTime] = useState(new Date(new Date().setHours(20, 0, 0, 0)));
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const priceNum = product?.priceNum ?? 0;
    const isSizeCategory = product?.categoryType === 'size';

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
        const obj: Record<string, object> = {};
        (product?.blockedDates || []).forEach(date => {
            obj[date] = {
                disabled: true,
                disableTouchEvent: true,
                textColor: '#CBD5E1',
            };
        });
        return obj;
    }, [product?.blockedDates]);

    useEffect(() => {
        setRange(prev => ({
            ...prev,
            markedDates: { ...prev.markedDates, ...blockedDatesObj }
        }));
    }, [blockedDatesObj]);

    const handleDayPress = (day: any) => {
        const dateStr = day.dateString;

        if (product?.blockedDates?.includes(dateStr)) return;

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
                if (product?.blockedDates?.includes(checkDate.toISOString().split('T')[0])) {
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

    const daysCount = useMemo(() => {
        if (!range.start || !range.end) return 1;
        const diff = Math.round(
            (new Date(range.end).getTime() - new Date(range.start).getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
        return Math.max(1, diff);
    }, [range.start, range.end]);
    const totalAmount = daysCount * priceNum * (isSizeCategory ? 1 : quantity);

    const rating = product?.rating ?? 4.8;
    const reviewCount = product?.reviewCount ?? 0;
    const isWishlisted = product ? wishlist.includes(product.id) : false;
    const galleryImages = useMemo(() => {
        if (!product) return [];
        return product.images?.length ? product.images : [product.image];
    }, [product]);

    const handleGalleryScroll = (event: any) => {
        const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        if (nextIndex !== activeImageIndex) setActiveImageIndex(nextIndex);
    };

    const openZoom = (index: number) => {
        setZoomIndex(index);
        setZoomVisible(true);
    };

    if (loadingProduct) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </SafeAreaView>
        );
    }

    if (!product) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                <Ionicons name="alert-circle-outline" size={60} color="#CBD5E1" />
                <Text style={{ fontSize: 16, color: '#64748B', textAlign: 'center', marginTop: 16 }}>
                    Объявление не найдено или было удалено
                </Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: Colors.primary, fontWeight: '700' }}>Назад</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                <View style={styles.imageWrap}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={handleGalleryScroll}
                    >
                        {galleryImages.map((image, index) => (
                            <TouchableOpacity
                                key={`gallery-${index}`}
                                activeOpacity={0.95}
                                onPress={() => openZoom(index)}
                            >
                                <Image source={image} style={styles.mainImage} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity style={[styles.backBtn, { top: insets.top + 10 }]} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={22} color={Colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.heartBtn, { top: insets.top + 10 }]} onPress={() => toggleWishlist(product.id)}>
                        <Ionicons
                            name={isWishlisted ? 'heart' : 'heart-outline'}
                            size={20}
                            color={isWishlisted ? '#EF4444' : Colors.text}
                        />
                    </TouchableOpacity>
                    {galleryImages.length > 1 && (
                        <>
                            <View style={styles.photoDots}>
                                {galleryImages.map((_, index) => (
                                    <View
                                        key={`dot-${index}`}
                                        style={[styles.photoDot, activeImageIndex === index && styles.photoDotActive]}
                                    />
                                ))}
                            </View>
                            <View style={styles.photoCounter}>
                                <Ionicons name="images-outline" size={13} color="#FFFFFF" />
                                <Text style={styles.photoCounterText}>{activeImageIndex + 1}/{galleryImages.length}</Text>
                            </View>
                        </>
                    )}
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

                    {!!product.tags?.length && (
                        <View style={styles.tagsRow}>
                            {product.tags.map(tag => (
                                <View key={tag} style={styles.tagChip}>
                                    <Text style={styles.tagText}>#{tag}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={styles.moneyGrid}>
                        <View style={styles.moneyTile}>
                            <Text style={styles.moneyLabel}>Аренда</Text>
                            <Text style={styles.moneyValue}>{product.priceNum.toLocaleString('ru-RU')} сум/день</Text>
                        </View>
                        {!!product.minRentalDays && (
                            <View style={styles.moneyTile}>
                                <Text style={styles.moneyLabel}>Минимум</Text>
                                <Text style={styles.moneyValue}>{product.minRentalDays} дн.</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.divider} />

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

                    {!!product.characteristics?.length && (
                        <View style={styles.characteristicsGrid}>
                            {product.characteristics.map(item => (
                                <View key={`${item.label}-${item.value}`} style={styles.characteristicItem}>
                                    <Text style={styles.characteristicLabel}>{item.label}</Text>
                                    <Text style={styles.characteristicValue}>{item.value}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Владелец</Text>
                    <SellerCard
                        sellerName={product.seller.name}
                        sellerRole={product.seller.role}
                        isVerified={product.seller.isVerified}
                        onPress={() => router.push(`/seller/${product.seller.id}` as any)}
                    />

                    {!!similarListings.length && (
                        <>
                            <View style={styles.divider} />
                            <Text style={styles.sectionTitle}>Похожие объявления</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.similarList}
                            >
                                {similarListings.map(item => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.similarCard}
                                        activeOpacity={0.85}
                                        onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
                                    >
                                        <Image source={item.image} style={styles.similarImage} />
                                        <View style={styles.similarBody}>
                                            <Text style={styles.similarTitle} numberOfLines={2}>{item.title}</Text>
                                            <Text style={styles.similarPrice}>{item.priceNum.toLocaleString('ru-RU')} сум</Text>
                                            <View style={styles.similarMeta}>
                                                <Ionicons name="location-outline" size={12} color="#94A3B8" />
                                                <Text style={styles.similarLocation} numberOfLines={1}>{item.location}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </>
                    )}

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

            <Modal visible={zoomVisible} transparent animationType="fade" onRequestClose={() => setZoomVisible(false)}>
                <View style={styles.zoomBackdrop}>
                    <TouchableOpacity
                        style={[styles.zoomClose, { top: insets.top + 16 }]}
                        onPress={() => setZoomVisible(false)}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        contentOffset={{ x: zoomIndex * width, y: 0 }}
                    >
                        {galleryImages.map((image, index) => (
                            <ScrollView
                                key={`zoom-${index}`}
                                style={styles.zoomPage}
                                contentContainerStyle={styles.zoomPageContent}
                                maximumZoomScale={3}
                                minimumZoomScale={1}
                                centerContent
                            >
                                <Image source={image} style={styles.zoomImage} resizeMode="contain" />
                            </ScrollView>
                        ))}
                    </ScrollView>
                </View>
            </Modal>

            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.totalLabel}>Итого за {daysCount} дн. {!isSizeCategory && quantity > 1 ? `(${quantity} шт.)` : ''}</Text>
                    <Text style={styles.totalPrice}>{totalAmount.toLocaleString()} сум</Text>
                </View>
                <TouchableOpacity style={[styles.bookBtn, (!range.start) && { opacity: 0.5 }]}
                    onPress={handleBooking}
                ><Text style={styles.bookBtnText}>Забронировать</Text></TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    imageWrap: { position: 'relative' },
    backBtn: {
        position: 'absolute', left: 16, zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.92)', width: 40, height: 40,
        borderRadius: 13, justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
    },
    heartBtn: {
        position: 'absolute', right: 16, zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.92)', width: 40, height: 40,
        borderRadius: 13, justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
    },
    mainImage: { width: width, height: 360, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    photoDots: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    photoDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.6)' },
    photoDotActive: { width: 18, backgroundColor: '#FFFFFF' },
    photoCounter: {
        position: 'absolute',
        right: 16,
        bottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(15,23,42,0.62)',
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    photoCounterText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
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
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    tagChip: {
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    tagText: { fontSize: 12, color: '#475569', fontWeight: '700' },
    moneyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
    moneyTile: {
        flexGrow: 1,
        minWidth: '30%',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        padding: 12,
    },
    moneyLabel: { fontSize: 11, color: '#64748B', fontWeight: '700', marginBottom: 5, textTransform: 'uppercase' },
    moneyValue: { fontSize: 14, color: Colors.text, fontWeight: '900' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000000', marginBottom: 15 },
    description: { fontSize: 15, color: '#64748B', lineHeight: 22 },
    characteristicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
    characteristicItem: {
        width: '48%',
        minHeight: 72,
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: '#EEF2F7',
    },
    characteristicLabel: { fontSize: 11, color: '#64748B', fontWeight: '700', marginBottom: 6 },
    characteristicValue: { fontSize: 14, color: Colors.text, fontWeight: '800', lineHeight: 18 },
    similarList: { gap: 12, paddingRight: 4 },
    similarCard: {
        width: 158,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EEF2F7',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    similarImage: { width: '100%', height: 112, backgroundColor: '#F1F5F9' },
    similarBody: { padding: 10 },
    similarTitle: { fontSize: 13, color: Colors.text, fontWeight: '800', minHeight: 36, lineHeight: 18 },
    similarPrice: { fontSize: 13, color: Colors.primary, fontWeight: '900', marginTop: 6 },
    similarMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    similarLocation: { flex: 1, fontSize: 11, color: '#94A3B8' },
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
    zoomBackdrop: { flex: 1, backgroundColor: '#000000' },
    zoomClose: {
        position: 'absolute',
        right: 18,
        zIndex: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.16)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    zoomPage: { width },
    zoomPageContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
    zoomImage: { width, height: '82%' },
});
