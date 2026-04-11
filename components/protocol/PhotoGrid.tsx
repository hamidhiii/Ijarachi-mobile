import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { PHOTO_SHOT_GUIDES } from '../../constants/protocol';
import { ProtocolPhoto } from '../../types/rental.types';

const CELL_SIZE = (Dimensions.get('window').width - 48 - 8) / 3;

interface Props {
    photos: ProtocolPhoto[];
    totalSlots?: number;           // По умолчанию 5
    onAddPress?: (slotIndex: number) => void; // Если undefined — режим просмотра
}

export default function PhotoGrid({
    photos,
    totalSlots = 5,
    onAddPress,
}: Props) {
    return (
        <View style={styles.grid}>
            {Array.from({ length: totalSlots }).map((_, idx) => {
                const photo = photos[idx];
                const guide = PHOTO_SHOT_GUIDES[idx];
                const isReadonly = !onAddPress;

                if (photo) {
                    return (
                        <View key={idx} style={styles.cell}>
                            <Image source={{ uri: photo.uri }} style={styles.image} />
                            {/* Метка типа снимка */}
                            <View style={styles.labelBadge}>
                                <Ionicons name={guide.icon as any} size={10} color="#fff" />
                            </View>
                            {/* Номер */}
                            <View style={styles.numBadge}>
                                <Text style={styles.numText}>{idx + 1}</Text>
                            </View>
                        </View>
                    );
                }

                // Пустой слот
                return (
                    <TouchableOpacity
                        key={idx}
                        style={[styles.cell, styles.emptyCell]}
                        onPress={() => onAddPress?.(idx)}
                        disabled={isReadonly}
                        activeOpacity={0.7}
                    >
                        {isReadonly ? (
                            <View style={styles.emptyInner}>
                                <Ionicons name="image-outline" size={22} color="#CBD5E1" />
                            </View>
                        ) : (
                            <View style={styles.emptyInner}>
                                <Ionicons name={guide.icon as any} size={20} color={Colors.primary} />
                                <Text style={styles.emptyNum}>{idx + 1}</Text>
                                <Text style={styles.emptyHint} numberOfLines={2}>
                                    {guide.title}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderRadius: 14,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    emptyCell: {
        backgroundColor: '#F1F5F9',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
    },
    emptyInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 6,
        gap: 3,
    },
    emptyNum: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.primary,
    },
    emptyHint: {
        fontSize: 9,
        color: '#94A3B8',
        textAlign: 'center',
    },
    labelBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: 'rgba(6,95,70,0.8)',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    numBadge: {
        position: 'absolute',
        top: 5,
        left: 5,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    numText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '700',
    },
});
