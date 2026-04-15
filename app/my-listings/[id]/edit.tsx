import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import SizeSelectorMultiple from '../../../components/listing/SizeSelectorMultiple';
import { Colors } from '../../../constants/Colors';
import { CATEGORIES as DATA_CATEGORIES } from '../../../constants/data';
import { ALL_CLOTHING_SIZES, CLOTHING_CATEGORIES } from '../../../constants/sizes';
import * as listingService from '../../../services/listingService';

const CATEGORIES = DATA_CATEGORIES.filter(c => c.id !== 'all');

export default function EditListingScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [quantity, setQuantity] = useState('1');
    const [unit, setUnit] = useState('шт');
    const [image, setImage] = useState<any>(null);
    const [blockedDates, setBlockedDates] = useState<string[]>([]);

    const isSizeCategory = useMemo(() =>
        CLOTHING_CATEGORIES.includes(selectedCategory),
        [selectedCategory]);

    useEffect(() => {
        loadListing();
    }, [id]);

    const loadListing = async () => {
        try {
            const data = await listingService.getListingById(id as string);
            if (data) {
                setTitle(data.title);
                setDescription(data.description);
                setPrice(data.priceNum.toString());
                setSelectedCategory(data.category);
                setSelectedSizes(data.availableSizes || []);
                setQuantity((data.maxQuantity || 1).toString());
                setUnit(data.unit || 'шт');
                setImage(data.image);
                setBlockedDates(data.blockedDates || []);
            }
        } catch (e) {
            Alert.alert('Ошибка', 'Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !price.trim() || !selectedCategory) {
            Alert.alert('Ошибка', 'Заполните основные поля');
            return;
        }

        setSaving(true);
        try {
            await listingService.updateListing(id as string, {
                title,
                description,
                priceNum: parseInt(price),
                category: selectedCategory,
                availableSizes: isSizeCategory ? selectedSizes : [],
                maxQuantity: isSizeCategory ? 1 : parseInt(quantity),
                unit,
                blockedDates,
            });
            Alert.alert('Успех', 'Изменения сохранены', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (e) {
            Alert.alert('Ошибка', 'Не удалось сохранить');
        } finally {
            setSaving(false);
        }
    };

    const toggleBlockedDate = (date: string) => {
        setBlockedDates(prev =>
            prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
        );
    };

    const markedDates = useMemo(() => {
        const obj: any = {};
        blockedDates.forEach(d => {
            obj[d] = { selected: true, selectedColor: '#EF4444', textColor: 'white' };
        });
        return obj;
    }, [blockedDates]);

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="close" size={28} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Редактировать</Text>
                    <TouchableOpacity onPress={handleSave} disabled={saving}>
                        {saving ? <ActivityIndicator size="small" color={Colors.primary} /> : <Text style={styles.saveBtnText}>Готово</Text>}
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    <View style={styles.imageBox}>
                        <Image source={image} style={styles.image} />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Название</Text>
                        <TextInput style={styles.input} value={title} onChangeText={setTitle} />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Категория</Text>
                        <Text style={styles.disabledInput}>{CATEGORIES.find(c => c.id === selectedCategory)?.title}</Text>
                    </View>

                    {isSizeCategory ? (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Размеры</Text>
                            <SizeSelectorMultiple
                                allSizes={ALL_CLOTHING_SIZES}
                                selectedSizes={selectedSizes}
                                onToggle={(size) => setSelectedSizes(prev =>
                                    prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                                )}
                            />
                        </View>
                    ) : (
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text style={styles.label}>Кол-во</Text>
                                <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Ед. изм</Text>
                                <TextInput style={styles.input} value={unit} onChangeText={setUnit} />
                            </View>
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Цена в день (сум)</Text>
                        <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Описание</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.divider} />
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Управление занятостью</Text>
                        <Text style={styles.helperText}>Отметьте даты, когда вещь уже забронирована оффлайн (они будут выделены красным)</Text>
                        <View style={styles.calendarContainer}>
                            <Calendar
                                onDayPress={(day) => toggleBlockedDate(day.dateString)}
                                markedDates={markedDates}
                                theme={{
                                    todayTextColor: Colors.primary,
                                    arrowColor: Colors.primary,
                                    selectedDayBackgroundColor: '#EF4444',
                                }}
                            />
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
    saveBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 16 },
    scroll: { padding: 20 },
    imageBox: { height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 25 },
    image: { width: '100%', height: '100%' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 8 },
    input: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 15, fontSize: 16, borderWidth: 1, borderColor: '#F1F5F9' },
    disabledInput: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 15, fontSize: 16, color: '#94A3B8' },
    textArea: { height: 120, textAlignVertical: 'top' },
    row: { flexDirection: 'row', marginBottom: 20 },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
    helperText: { fontSize: 13, color: '#64748B', marginBottom: 15, lineHeight: 18 },
    calendarContainer: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' },
});
