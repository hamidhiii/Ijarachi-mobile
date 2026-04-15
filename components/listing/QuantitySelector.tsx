import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface Props {
    value: number;
    max: number;
    onChange: (n: number) => void;
    unit?: string;
}

export default function QuantitySelector({ value, max, onChange, unit = 'шт' }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Количество</Text>
            <View style={styles.row}>
                <TouchableOpacity
                    style={[styles.btn, value <= 1 && styles.btnDisabled]}
                    onPress={() => onChange(Math.max(1, value - 1))}
                    disabled={value <= 1}
                >
                    <Ionicons name="remove" size={24} color={value <= 1 ? '#CBD5E1' : Colors.text} />
                </TouchableOpacity>

                <View style={styles.valueBox}>
                    <Text style={styles.value}>{value}</Text>
                    <Text style={styles.unit}>{unit}</Text>
                </View>

                <TouchableOpacity
                    style={[styles.btn, value >= max && styles.btnDisabled]}
                    onPress={() => onChange(Math.min(max, value + 1))}
                    disabled={value >= max}
                >
                    <Ionicons name="add" size={24} color={value >= max ? '#CBD5E1' : Colors.text} />
                </TouchableOpacity>
            </View>
            <Text style={styles.maxText}>Доступно: {max} {unit}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginVertical: 16 },
    label: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    btn: {
        width: 48, height: 48, borderRadius: 14,
        backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
        justifyContent: 'center', alignItems: 'center',
    },
    btnDisabled: { opacity: 0.5 },
    valueBox: { alignItems: 'center', minWidth: 60 },
    value: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
    unit: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    maxText: { fontSize: 12, color: '#94A3B8', marginTop: 8 },
});
