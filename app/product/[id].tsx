import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Dimensions, Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'; // ПРАВИЛЬНЫЙ ИМПОРТ ТУТ
import { Calendar } from 'react-native-calendars';
import { SellerCard } from '../../components/SellerCard';
import { Colors } from '../../constants/Colors';
import { ITEMS } from '../../constants/data';

const { width } = Dimensions.get('window');

export default function ProductDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const product = ITEMS.find(p => p.id === id) || ITEMS[0];
    const priceNum = parseInt(product.price.replace(/[^0-9]/g, ''));

    const isAuthenticated = false; // Временная переменная (потом возьмем из глобального стейта)

    // Для запрета прошедших дней
    const today = new Date().toISOString().split('T')[0];

    // Состояние для количества (по умолчанию 1)
    const [quantity, setQuantity] = useState(1);
    const [range, setRange] = useState({ start: '', end: '', markedDates: {} });

    // const handleBooking = () => {
    //   if (!isAuthenticated) {
    //     // Если не залогинен — летим на страницу входа
    //     router.push('/auth/login');
    //   } else {
    //     // Если залогинен — открываем экран успеха или оплаты
    //     alert(`Забронировано на ${daysCount} дн.!`);
    //   }
    // };

    const handleBooking = () => {
        if (!range.start) {
            Alert.alert("Дата не выбрана", "Выберите хотя бы один день на календаре.");
            return;
        }

        router.push({
            pathname: '/checkout/Summary',
            params: {
                id: id,
                days: daysCount, // Если даты одинаковые, daysCount будет 1
                qty: quantity,   // Передаем выбранное количество
                startDate: range.start,
                endDate: range.end
            }
        });
    };

    const handleDayPress = (day: any) => {
        const dateStr = day.dateString;

        // Если ничего не выбрано ИЛИ уже был выбран законченный диапазон — начинаем новый выбор
        // (Добавили проверку: если start и end равны, значит это был только первый клик)
        if (!range.start || (range.start !== range.end)) {
            setRange({
                start: dateStr,
                end: dateStr, // Ставим временно ту же дату
                markedDates: {
                    [dateStr]: {
                        startingDay: true,
                        endingDay: true,
                        color: Colors.primary,
                        textColor: 'white'
                    }
                }
            });
        }
        // Если уже есть точка старта, и мы кликаем второй раз — рисуем диапазон
        else {
            let start = new Date(range.start);
            let end = new Date(dateStr);

            // Если кликнули на дату раньше начала — меняем их местами
            if (end < start) [start, end] = [end, start];

            let newMarkedDates: any = {};
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

    // const handleDayPress = (day: any) => {
    //   const dateStr = day.dateString;
    //   if (!range.start || (range.start && range.end)) {
    //     setRange({ start: dateStr, end: '', markedDates: { [dateStr]: { startingDay: true, color: Colors.primary, textColor: 'white', endingDay: true } } });
    //   } else {
    //     let start = new Date(range.start); let end = new Date(dateStr);
    //     if (end < start) [start, end] = [end, start];
    //     let newMarkedDates: any = {}; let currentDate = new Date(start);
    //     while (currentDate <= end) {
    //       const fmt = currentDate.toISOString().split('T')[0];
    //       newMarkedDates[fmt] = { color: Colors.primary, textColor: 'white', startingDay: fmt === start.toISOString().split('T')[0], endingDay: fmt === end.toISOString().split('T')[0] };
    //       currentDate.setDate(currentDate.getDate() + 1);
    //     }
    //     setRange({ start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0], markedDates: newMarkedDates });
    //   }
    // };

    const daysCount = useMemo(() => Object.keys(range.markedDates).length || 1, [range.markedDates]);

    // Итоговая цена с учетом количества и дней
    const totalAmount = daysCount * priceNum * quantity;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <StatusBar barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color={Colors.text} /></TouchableOpacity>
                <Image source={product.image} style={styles.mainImage} />

                <View style={{ padding: 20 }}>
                    <Text style={styles.title}>{product.title}</Text>
                    <Text style={styles.price}>{product.price} <Text style={styles.perDay}>/ день</Text></Text>

                    <View style={styles.divider} />

                    {/* Блок выбора количества (показываем только если мебели/посуды много) */}
                    {(product as any).maxQuantity > 1 && (
                        <View style={styles.quantitySection}>
                            <View>
                                <Text style={styles.sectionTitle}>Количество</Text>
                                <Text style={styles.stockText}>В наличии: {(product as any).maxQuantity} шт.</Text>
                            </View>
                            <View style={styles.stepper}>
                                {/* Кнопка Минус */}
                                <TouchableOpacity
                                    style={styles.stepBtn}
                                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    <Ionicons name="remove" size={24} color={Colors.text} />
                                </TouchableOpacity>

                                {/* ВВОД ВРУЧНУЮ */}
                                <TextInput
                                    style={styles.quantityInput}
                                    keyboardType="number-pad"
                                    value={String(quantity)}
                                    onChangeText={(text) => {
                                        const val = parseInt(text.replace(/[^0-9]/g, '')) || 0;
                                        // Если ввел больше чем есть, ставим максимум
                                        if (val > (product as any).maxQuantity) {
                                            setQuantity((product as any).maxQuantity);
                                        } else {
                                            setQuantity(val);
                                        }
                                    }}
                                    onBlur={() => {
                                        // Если оставил поле пустым, возвращаем 1
                                        if (quantity < 1) setQuantity(1);
                                    }}
                                    selectTextOnFocus={true} 
                                />
                                {/* Кнопка Плюс */}
                                <TouchableOpacity
                                    style={styles.stepBtn}
                                    onPress={() => setQuantity(Math.min((product as any).maxQuantity, quantity + 1))}
                                >
                                    <Ionicons name="add" size={24} color={Colors.text} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {(product as any).maxQuantity > 1 && <View style={styles.divider} />}

                    <Text style={styles.sectionTitle}>Описание</Text>
                    <Text style={styles.description}>{product.description}</Text>

                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Владелец</Text>
                    <SellerCard sellerName={(product as any).seller.name} sellerRole={(product as any).seller.role} />

                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Выберите даты</Text>
                    <View style={styles.calendarWrapper}>
                        <Calendar
                            markingType={'period'} 
                            onDayPress={handleDayPress} 
                            markedDates={range.markedDates}
                            minDate={today} // ЗАПРЕТ ПРОШЕДШИХ ДНЕЙ ТУТ
                            theme={{ selectedDayBackgroundColor: Colors.primary, todayTextColor: Colors.primary, ...({ 'stylesheet.calendar.header': { week: { marginTop: 5, flexDirection: 'row', justifyContent: 'space-between' } } } as any) }}
                        />
                    </View>
                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.totalLabel}>Итого за {daysCount} дн. {quantity > 1 ? `(${quantity} шт.)` : ''}</Text>
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
    backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10, backgroundColor: '#FFFFFF', width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 5 },
    mainImage: { width: width, height: 420, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
    title: { fontSize: 26, fontWeight: '800', color: Colors.text },
    price: { fontSize: 22, fontWeight: '800', color: Colors.primary, marginTop: 5 },
    perDay: { fontSize: 16, fontWeight: '400', color: '#64748B' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 15 },
    description: { fontSize: 15, color: '#64748B', lineHeight: 22 },
    calendarWrapper: { backgroundColor: '#FFFFFF', borderRadius: 25, padding: 10, borderWidth: 1, borderColor: '#F1F5F9' },
    bottomBar: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFFFFF', padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingBottom: 35 },
    totalLabel: { fontSize: 13, color: '#64748B' },
    totalPrice: { fontSize: 20, fontWeight: '900', color: Colors.text },
    bookBtn: { backgroundColor: Colors.primary, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 18 },
    bookBtnText: { color: '#FFFFFF', fontWeight: '700' },

    // Стили для Stepper
    quantitySection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    stockText: { fontSize: 12, color: '#94A3B8', marginTop: -5 },
    quantityInput: { 
        fontSize: 18, 
        fontWeight: '800', 
        color: Colors.text,
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
    quantityText: { fontSize: 18, fontWeight: '800', paddingHorizontal: 15, color: Colors.text },
});