import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { PHOTO_SHOT_GUIDES, PROTOCOL } from '../../constants/protocol';
import { uploadProtocolPhoto } from '../../services/rentalService';
import { ProtocolPhase, ProtocolPhoto } from '../../types/rental.types';
import PhotoGrid from './PhotoGrid';

interface Props {
    visible: boolean;
    bookingId: string;
    phase: ProtocolPhase;
    existingPhotos: ProtocolPhoto[];
    onClose: () => void;
    onComplete: (photos: ProtocolPhoto[]) => void;
}

export default function PhotoCaptureSheet({
    visible,
    bookingId,
    phase,
    existingPhotos,
    onClose,
    onComplete,
}: Props) {
    const [photos, setPhotos] = useState<ProtocolPhoto[]>(existingPhotos);
    const [uploading, setUploading] = useState(false);

    // Индекс следующего пустого слота
    const nextSlotIndex = photos.length;
    const currentGuide = PHOTO_SHOT_GUIDES[nextSlotIndex] ?? null;
    const isDone = photos.length >= PROTOCOL.MIN_PHOTOS;

    const handleTakePhoto = useCallback(async () => {
        if (isDone) return;

        // Запрос разрешения на камеру
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Нет доступа к камере',
                'Разрешите приложению использовать камеру в настройках устройства.'
            );
            return;
        }

        // ТОЛЬКО камера — из галереи нельзя (юридически значимый протокол)
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            allowsEditing: false,
            quality: 0.85,
            exif: true, // Сохраняем метаданные
        });

        if (result.canceled || !result.assets.length) return;

        const uri = result.assets[0].uri;
        const shotType = PHOTO_SHOT_GUIDES[nextSlotIndex].shotType;

        setUploading(true);
        try {
            const photo = await uploadProtocolPhoto(bookingId, phase, uri, shotType);
            setPhotos((prev) => [...prev, photo]);
        } catch {
            Alert.alert('Ошибка', 'Не удалось сохранить фото. Попробуйте снова.');
        } finally {
            setUploading(false);
        }
    }, [isDone, nextSlotIndex, bookingId, phase]);

    const handleComplete = () => {
        if (!isDone) {
            Alert.alert(
                'Недостаточно фото',
                `Сделайте минимум ${PROTOCOL.MIN_PHOTOS} фото перед тем как продолжить.`
            );
            return;
        }
        onComplete(photos);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={styles.container}>
                {/* Хедер */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={22} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Фотопротокол</Text>
                    <Text style={styles.counter}>
                        {photos.length} / {PROTOCOL.MIN_PHOTOS}
                    </Text>
                </View>

                {/* Подсказка для текущего снимка */}
                {!isDone && currentGuide ? (
                    <View style={styles.guideBox}>
                        <Ionicons name={currentGuide.icon as any} size={28} color={Colors.primary} />
                        <View style={styles.guideText}>
                            <Text style={styles.guideTitle}>
                                Снимок {nextSlotIndex + 1}: {currentGuide.title}
                            </Text>
                            <Text style={styles.guideSubtitle}>{currentGuide.subtitle}</Text>
                        </View>
                    </View>
                ) : isDone ? (
                    <View style={[styles.guideBox, styles.guideBoxDone]}>
                        <Ionicons name="checkmark-circle" size={28} color="#059669" />
                        <View style={styles.guideText}>
                            <Text style={[styles.guideTitle, { color: '#059669' }]}>
                                Все {PROTOCOL.MIN_PHOTOS} фото сделаны!
                            </Text>
                            <Text style={styles.guideSubtitle}>Нажмите «Готово» для продолжения</Text>
                        </View>
                    </View>
                ) : null}

                {/* Важная заметка (только один раз в начале) */}
                {photos.length === 0 && (
                    <View style={styles.warningBox}>
                        <Ionicons name="lock-closed-outline" size={16} color="#B45309" />
                        <Text style={styles.warningText}>
                            Загрузить из галереи нельзя — снимки делаются только через камеру
                            приложения. Это обеспечивает юридическую значимость протокола.
                        </Text>
                    </View>
                )}

                {/* Сетка фото */}
                <View style={styles.gridWrapper}>
                    <PhotoGrid
                        photos={photos}
                        totalSlots={PROTOCOL.MIN_PHOTOS}
                        onAddPress={!isDone ? () => handleTakePhoto() : undefined}
                    />
                </View>

                {/* Кнопки */}
                <View style={styles.footer}>
                    {!isDone && (
                        <TouchableOpacity
                            style={styles.cameraBtn}
                            onPress={handleTakePhoto}
                            disabled={uploading}
                            activeOpacity={0.8}
                        >
                            {uploading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="camera" size={22} color="#fff" />
                                    <Text style={styles.cameraBtnText}>Сделать снимок</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.doneBtn, !isDone && styles.doneBtnDisabled]}
                        onPress={handleComplete}
                        disabled={!isDone}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="checkmark-circle-outline" size={20} color={isDone ? '#fff' : '#94A3B8'} />
                        <Text style={[styles.doneBtnText, !isDone && { color: '#94A3B8' }]}>
                            Готово
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.text,
    },
    counter: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primary,
        minWidth: 36,
        textAlign: 'right',
    },
    guideBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        margin: 16,
        padding: 14,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    guideBoxDone: {
        backgroundColor: '#ECFDF5',
        borderColor: '#6EE7B7',
    },
    guideText: {
        flex: 1,
        gap: 2,
    },
    guideTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
    },
    guideSubtitle: {
        fontSize: 12,
        color: '#64748B',
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFBEB',
        marginHorizontal: 16,
        marginBottom: 8,
        padding: 12,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    warningText: {
        flex: 1,
        fontSize: 11,
        color: '#92400E',
        lineHeight: 16,
    },
    gridWrapper: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 4,
    },
    footer: {
        padding: 20,
        gap: 12,
    },
    cameraBtn: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 18,
        gap: 10,
    },
    cameraBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    doneBtn: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 18,
        gap: 8,
    },
    doneBtnDisabled: {
        backgroundColor: '#F1F5F9',
    },
    doneBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
});
