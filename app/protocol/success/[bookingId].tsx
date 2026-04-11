import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import PhaseTimeline from '../../../components/protocol/PhaseTimeline';
import { Colors } from '../../../constants/Colors';

export default function SuccessScreen() {
    const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.content}>
                <PhaseTimeline currentPhase={3} />

                <View style={styles.iconWrap}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="checkmark-circle" size={72} color="#059669" />
                    </View>
                </View>

                <Text style={styles.title}>Аренда завершена!</Text>
                <Text style={styles.subtitle}>
                    Обе стороны подтвердили возврат.{'\n'}
                    Деньги разморожены и переведены владельцу.
                </Text>

                <View style={styles.summaryCard}>
                    <Row icon="shield-checkmark-outline" color="#059669" label="Протокол зафиксирован" />
                    <Row icon="lock-open-outline" color="#2563EB" label="Эскроу снят" />
                    <Row icon="star-outline" color="#D97706" label="Оставьте отзыв" />
                </View>

                <TouchableOpacity
                    style={styles.homeBtn}
                    onPress={() => router.replace('/(tabs)')}
                    activeOpacity={0.8}
                >
                    <Ionicons name="home-outline" size={20} color="#fff" />
                    <Text style={styles.homeBtnText}>На главную</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.bookingsBtn}
                    onPress={() => router.replace('/(tabs)/bookings')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.bookingsBtnText}>Мои аренды</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

function Row({
    icon, color, label
}: { icon: string; color: string; label: string }) {
    return (
        <View style={rowStyles.row}>
            <View style={[rowStyles.iconBox, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon as any} size={18} color={color} />
            </View>
            <Text style={rowStyles.label}>{label}</Text>
        </View>
    );
}

const rowStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: {
        width: 36, height: 36, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
    },
    label: { fontSize: 14, fontWeight: '600', color: Colors.text },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1, padding: 20, justifyContent: 'center' },
    iconWrap: { alignItems: 'center', marginVertical: 24 },
    iconCircle: {
        width: 120, height: 120, borderRadius: 60,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center', alignItems: 'center',
    },
    title: {
        fontSize: 26, fontWeight: '900', color: Colors.text,
        textAlign: 'center', marginBottom: 12,
    },
    subtitle: {
        fontSize: 15, color: '#64748B', textAlign: 'center',
        lineHeight: 22, marginBottom: 28,
    },
    summaryCard: {
        backgroundColor: '#F8FAFC', borderRadius: 20,
        padding: 20, gap: 16, marginBottom: 32,
        borderWidth: 1, borderColor: '#F1F5F9',
    },
    homeBtn: {
        backgroundColor: Colors.primary, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 16, borderRadius: 18, gap: 10, marginBottom: 12,
    },
    homeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    bookingsBtn: {
        alignItems: 'center', paddingVertical: 12,
    },
    bookingsBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
});
