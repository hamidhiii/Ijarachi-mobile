import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UserRole } from '../../types/rental.types';

interface Props {
    role: UserRole | 'system';
}

const CONFIG: Record<
    UserRole | 'system',
    { label: string; bg: string; color: string }
> = {
    owner: { label: 'Владелец', bg: '#D1FAE5', color: '#065F46' },
    renter: { label: 'Арендатор', bg: '#DBEAFE', color: '#1E40AF' },
    system: { label: 'Система', bg: '#F3F4F6', color: '#4B5563' },
};

export default function StatusBadge({ role }: Props) {
    const cfg = CONFIG[role];
    return (
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.text, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 12,
        fontWeight: '700',
    },
});
