import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import * as authService from '../../services/authService';
import { guardPendingIntegration } from '../../services/integrationAvailability';

export default function MyIdScreen() {
    const router = useRouter();
    const { updateUser } = useAuth();

    const [pinfl, setPinfl] = useState('');
    const [passportSeries, setPassportSeries] = useState('');
    const [loading, setLoading] = useState(false);

    const pinflClean = pinfl.replace(/\D/g, '');
    const seriesClean = passportSeries.trim().toUpperCase();
    const isValid = true;

    const handleVerify = async () => {
        if (guardPendingIntegration('myid')) return;
        setLoading(true);
        try {
            const session = await authService.startMyIdVerification();
            if (session.url) {
                await WebBrowser.openAuthSessionAsync(session.url, 'rentoo://auth/myid');
                const verified = await authService.getVerificationStatus();
                if (!verified) throw new Error('verification_not_completed');
            } else {
                await new Promise(r => setTimeout(r, 1200));
            }
            await updateUser({ isPinflVerified: true });
            Alert.alert(
                'Готово!',
                'Теперь у вас статус Верифицированный пользователь. Проверка больше не понадобится.',
                [{ text: 'Продолжить', onPress: () => router.back() }]
            );
        } catch {
            Alert.alert(
                'Ошибка верификации',
                'Не удалось подтвердить личность через MyID. Попробуйте ещё раз.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Верификация MyID</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    <View style={styles.bannerBox}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="shield-checkmark" size={48} color={Colors.primary} />
                        </View>
                        <Text style={styles.bannerTitle}>Подтвердите личность через MyID</Text>
                        <Text style={styles.bannerText}>
                            Для безопасности всех пользователей Rentoo требует одноразовую государственную верификацию.
                            Это займёт около 2 минут и больше никогда не понадобится.
                        </Text>
                    </View>

                    <View style={styles.chipsRow}>
                        <View style={styles.chip}>
                            <Ionicons name="lock-closed-outline" size={14} color={Colors.primary} />
                            <Text style={styles.chipText}>Данные защищены</Text>
                        </View>
                        <View style={styles.chip}>
                            <Ionicons name="time-outline" size={14} color={Colors.primary} />
                            <Text style={styles.chipText}>~2 мин</Text>
                        </View>
                        <View style={styles.chip}>
                            <Ionicons name="checkmark-circle-outline" size={14} color={Colors.primary} />
                            <Text style={styles.chipText}>Одноразово</Text>
                        </View>
                        <View style={styles.chip}>
                            <Ionicons name="gift-outline" size={14} color={Colors.primary} />
                            <Text style={styles.chipText}>Бесплатно</Text>
                        </View>
                    </View>

                    <Text style={styles.label}>ПИНФЛ (для dev-проверки)</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="card-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={pinfl}
                            onChangeText={v => setPinfl(v.replace(/\D/g, '').slice(0, 14))}
                            placeholder="12345678901234"
                            placeholderTextColor="#94A3B8"
                            keyboardType="number-pad"
                            maxLength={14}
                            returnKeyType="next"
                        />
                        {pinflClean.length === 14 && (
                            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        )}
                    </View>
                    <Text style={styles.hint}>В боевом режиме данные вводятся на стороне MyID</Text>

                    <Text style={[styles.label, { marginTop: 20 }]}>Серия и номер паспорта</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="document-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={passportSeries}
                            onChangeText={setPassportSeries}
                            placeholder="AA1234567"
                            placeholderTextColor="#94A3B8"
                            autoCapitalize="characters"
                            maxLength={9}
                            returnKeyType="done"
                        />
                        {seriesClean.length >= 7 && (
                            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        )}
                    </View>
                    <Text style={styles.hint}>Серия и номер без пробелов (например: AA1234567)</Text>

                    <View style={styles.privacyBox}>
                        <Ionicons name="information-circle-outline" size={16} color="#64748B" />
                        <Text style={styles.privacyText}>
                            Rentoo покрывает стоимость MyID. Паспортные данные не хранятся в приложении:
                            проверка выполняется через защищённый API MyID.
                        </Text>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitBtn, (!isValid || loading) && styles.submitBtnDisabled]}
                        onPress={handleVerify}
                        disabled={!isValid || loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
                                <Text style={styles.submitBtnText}>Пройти верификацию</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
    scroll: { padding: 24, paddingBottom: 40 },
    bannerBox: { alignItems: 'center', marginBottom: 28 },
    iconCircle: {
        width: 96, height: 96, borderRadius: 28,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 18,
    },
    bannerTitle: { fontSize: 22, fontWeight: '900', color: Colors.text, marginBottom: 10 },
    bannerText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, maxWidth: 300 },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32, justifyContent: 'center' },
    chip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: '#ECFDF5', borderRadius: 20,
        paddingHorizontal: 12, paddingVertical: 6,
    },
    chipText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
    label: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 8 },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
        borderRadius: 14, paddingHorizontal: 14, height: 54,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 16, color: Colors.text, letterSpacing: 1 },
    hint: { fontSize: 12, color: '#94A3B8', marginTop: 6, marginBottom: 4 },
    privacyBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 10,
        backgroundColor: '#F8FAFC', borderRadius: 14,
        padding: 14, marginTop: 28,
    },
    privacyText: { flex: 1, fontSize: 12, color: '#64748B', lineHeight: 18 },
    footer: { padding: 20, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    submitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        backgroundColor: Colors.primary, height: 56, borderRadius: 16,
    },
    submitBtnDisabled: { backgroundColor: '#CBD5E1' },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
