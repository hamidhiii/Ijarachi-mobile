import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface Props {
    allSizes: string[];
    selectedSizes: string[];
    onToggle: (size: string) => void;
}

export default function SizeSelectorMultiple({ allSizes, selectedSizes, onToggle }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {allSizes.map(size => (
                    <TouchableOpacity
                        key={size}
                        style={[
                            styles.chip,
                            selectedSizes.includes(size) && styles.chipSelected
                        ]}
                        onPress={() => onToggle(size)}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.chipText,
                            selectedSizes.includes(size) && styles.chipTextSelected
                        ]}>
                            {size}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginVertical: 8 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 10, borderWidth: 1.5,
        borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
    },
    chipSelected: {
        borderColor: Colors.primary, backgroundColor: Colors.primary,
    },
    chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
    chipTextSelected: { color: Colors.secondary },
});
