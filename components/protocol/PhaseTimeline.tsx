import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface Phase {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const PHASES: Phase[] = [
    { label: 'Подготовка', icon: 'camera-outline' },
    { label: 'Передача', icon: 'hand-right-outline' },
    { label: 'Возврат', icon: 'return-down-back-outline' },
    { label: 'Закрыто', icon: 'checkmark-circle-outline' },
];

interface Props {
    currentPhase: 0 | 1 | 2 | 3; // 0-indexed
}

export default function PhaseTimeline({ currentPhase }: Props) {
    return (
        <View style={styles.container}>
            {PHASES.map((phase, idx) => {
                const isDone = idx < currentPhase;
                const isActive = idx === currentPhase;
                const isPending = idx > currentPhase;

                const dotColor = isDone || isActive ? Colors.primary : '#E2E8F0';
                const textColor = isPending ? '#94A3B8' : Colors.text;

                return (
                    <React.Fragment key={phase.label}>
                        <View style={styles.step}>
                            <View style={[styles.dot, { backgroundColor: dotColor }]}>
                                <Ionicons
                                    name={isDone ? 'checkmark' : phase.icon}
                                    size={14}
                                    color={isDone || isActive ? '#fff' : '#94A3B8'}
                                />
                            </View>
                            <Text
                                style={[
                                    styles.label,
                                    { color: textColor, fontWeight: isActive ? '700' : '500' },
                                ]}
                                numberOfLines={1}
                            >
                                {phase.label}
                            </Text>
                        </View>

                        {/* Соединительная линия между шагами */}
                        {idx < PHASES.length - 1 && (
                            <View
                                style={[
                                    styles.line,
                                    { backgroundColor: idx < currentPhase ? Colors.primary : '#E2E8F0' },
                                ]}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        marginBottom: 20,
    },
    step: {
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    dot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 10,
        textAlign: 'center',
    },
    line: {
        height: 2,
        width: 20,
        marginBottom: 18,
        borderRadius: 1,
    },
});
