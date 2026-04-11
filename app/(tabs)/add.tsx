import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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
    View
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { CATEGORIES as DATA_CATEGORIES } from '../../constants/data';

const CATEGORIES = DATA_CATEGORIES.filter(c => c.id !== 'all');

export default function AddProductScreen() {
    const router = useRouter();
    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const uris = result.assets.map(asset => asset.uri);
            setImages(prev => [...prev, ...uris]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handlePublish = () => {
        if (images.length === 0) {
            Alert.alert('Нет фото', 'Добавьте хотя бы одну фотографию вещи.');
            return;
        }
        if (!title.trim() || !price.trim() || !selectedCategory) {
            Alert.alert('Пустые поля', 'Укажите название, категорию и цену за день.');
            return;
        }

        Alert.alert(
            'Готово!',
            'Ваше объявление отправлено на модерацию. Обычно это занимает не более часа.',
            [{ text: 'Отлично', onPress: () => router.replace('/(tabs)') }]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Сдать в аренду</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    {/* СЕКЦИЯ ФОТО */}
                    <Text style={styles.sectionTitle}>Фотографии</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoList}>
                        <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImage}>
                            <Ionicons name="camera" size={32} color={Colors.primary} />
                            <Text style={styles.addPhotoText}>{images.length}/10</Text>
                        </TouchableOpacity>

                        {images.map((uri, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image source={{ uri }} style={styles.photo} />
                                <TouchableOpacity
                                    style={styles.removePhoto}
                                    onPress={() => removeImage(index)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.divider} />

                    {/* НАЗВАНИЕ */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Название объявления</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Например: Дрель Bosch GSR 120-LI"
                            placeholderTextColor="#94A3B8"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    {/* КАТЕГОРИИ */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Категория</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catList}>
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.catChip,
                                        selectedCategory === cat.id && styles.catChipActive
                                    ]}
                                    onPress={() => setSelectedCategory(cat.id)}
                                >
                                    <Ionicons
                                        name={cat.icon as any}
                                        size={16}
                                        color={selectedCategory === cat.id ? '#fff' : Colors.text}
                                    />
                                    <Text style={[
                                        styles.catText,
                                        selectedCategory === cat.id && styles.catTextActive
                                    ]}>{cat.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* ЦЕНА */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Цена аренды за день (сум)</Text>
                        <View style={styles.priceInputWrapper}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="50 000"
                                placeholderTextColor="#94A3B8"
                                keyboardType="number-pad"
                                value={price}
                                onChangeText={setPrice}
                            />
                            <Text style={styles.currency}>сум / день</Text>
                        </View>
                    </View>

                    {/* ОПИСАНИЕ */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Описание</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Расскажите о состоянии вещи, комплектации и правилах использования..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={styles.publishBtn}
                        onPress={handlePublish}
                    >
                        <Text style={styles.publishBtnText}>Опубликовать</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
    scroll: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 15 },

    photoList: { flexDirection: 'row', marginBottom: 5 },
    addPhotoBtn: {
        width: 100, height: 100, borderRadius: 20,
        backgroundColor: '#F8FAFC', borderStyle: 'dashed', borderWidth: 2, borderColor: Colors.primary,
        justifyContent: 'center', alignItems: 'center', marginRight: 12
    },
    addPhotoText: { fontSize: 12, color: Colors.primary, fontWeight: '700', marginTop: 4 },
    imageWrapper: { marginRight: 12, position: 'relative' },
    photo: { width: 100, height: 100, borderRadius: 20 },
    removePhoto: { position: 'absolute', top: -8, right: -8, backgroundColor: '#fff', borderRadius: 12 },

    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 25 },

    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 8 },
    input: {
        backgroundColor: '#F8FAFC', borderRadius: 16, padding: 15,
        fontSize: 16, color: Colors.text, borderWidth: 1, borderColor: '#F1F5F9'
    },
    textArea: { height: 120, paddingTop: 15 },

    priceInputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    currency: { fontSize: 16, fontWeight: '600', color: '#64748B' },

    catList: { flexDirection: 'row', gap: 8 },
    catChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25,
        backgroundColor: '#F1F5F9', marginRight: 8
    },
    catChipActive: { backgroundColor: Colors.primary },
    catText: { fontSize: 14, fontWeight: '600', color: Colors.text },
    catTextActive: { color: '#fff' },

    bottomBar: {
        padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9',
        backgroundColor: '#fff', paddingBottom: Platform.OS === 'ios' ? 30 : 20
    },
    publishBtn: {
        backgroundColor: Colors.primary, height: 56, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 8, elevation: 5
    },
    publishBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' }
});