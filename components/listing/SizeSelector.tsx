import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { CLOTHING_SIZES_LETTER, CLOTHING_SIZES_NUMERIC } from '../../constants/sizes';

interface Props {
    availableSizes: string[];
    selectedSize: string | null;
    onSelect: (size: string) => void;
}

export default function SizeSelector({ availableSizes, selectedSize, onSelect }: Props) {
    const letterSizes = CLOTHING_SIZES_LETTER.filter(s => availableSizes.includes(s));
    const numericSizes = CLOTHING_SIZES_NUMERIC.filter(s => availableSizes.includes(s));

    const renderChip = (size: string) => (
        <TouchableOpacity
            key={size}
            style={[styles.chip, selectedSize === size && styles.chipSelected]}
            onPress={() => onSelect(size)}
            activeOpacity={0.7}
        >
            <Text style={[styles.chipText, selectedSize === size && styles.chipTextSelected]}>
                {size}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Доступные размеры</Text>
            {letterSizes.length > 0 && (
                <View style={styles.row}>
                    {letterSizes.map(renderChip)}
                </View>
            )}
            {numericSizes.length > 0 && (
                <View style={styles.row}>
                    {numericSizes.map(renderChip)}
                </View>
            )}
            {!selectedSize && (
                <Text style={styles.hint}>Выберите размер для продолжения</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginVertical: 16 },
    label: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
    chip: {
        paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 12, borderWidth: 1.5,
        borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
    },
    chipSelected: {
        borderColor: Colors.primary, backgroundColor: Colors.primary,
    },
    chipText: { fontSize: 14, fontWeight: '600', color: '#475569' },
    chipTextSelected: { color: Colors.secondary },
    hint: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
});
