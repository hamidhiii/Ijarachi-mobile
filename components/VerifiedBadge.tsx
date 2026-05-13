import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface VerifiedBadgeProps {
    label?: string;
    compact?: boolean;
    inverted?: boolean;
}

export default function VerifiedBadge({
    label = 'Верифицирован',
    compact = false,
    inverted = false,
}: VerifiedBadgeProps) {
    return (
        <View style={[
            styles.badge,
            compact && styles.compact,
            inverted && styles.inverted,
        ]}>
            <Ionicons
                name="checkmark-circle"
                size={compact ? 12 : 15}
                color={inverted ? '#A7F3D0' : Colors.primary}
            />
            {!compact && (
                <Text style={[styles.text, inverted && styles.invertedText]}>{label}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        maxWidth: '100%',
        gap: 4,
        backgroundColor: '#ECFDF5',
        borderRadius: 12,
        paddingHorizontal: 9,
        paddingVertical: 4,
    },
    compact: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        backgroundColor: 'transparent',
    },
    inverted: {
        backgroundColor: 'rgba(255,255,255,0.14)',
    },
    text: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.primary,
        flexShrink: 1,
    },
    invertedText: {
        color: '#A7F3D0',
    },
});
