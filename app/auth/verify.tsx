import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import * as authService from '../../services/authService';
import { guardPendingIntegration } from '../../services/integrationAvailability';

export default function VerifyScreen() {
    const router = useRouter();
    const { phone, name } = useLocalSearchParams();
    const { login, updateUser } = useAuth();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (code.length < 6) {
            Alert.alert('Ошибка', 'Введите код из СМС');
            return;
        }
        if (guardPendingIntegration('eskiz')) return;

        setLoading(true);
        try {
            await login(phone as string, code);
            if (name) {
                const displayName = Array.isArray(name) ? name[0] : name;
                await authService.updateProfile({ name: displayName }).catch(() => null);
                await updateUser({ name: displayName });
            }
            router.replace('/(tabs)');
        } catch {
            Alert.alert('Ошибка', 'Неверный код или ошибка сервера');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Подтверждение</Text>
                <Text style={styles.subTitle}>Мы отправили код на номер {phone}</Text>

                <TextInput
                    placeholder="000000"
                    placeholderTextColor="#94A3B8"
                    style={styles.otpInput}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={code}
                    onChangeText={setCode}
                    autoFocus
                />

                <TouchableOpacity
                    style={[styles.mainBtn, loading && { opacity: 0.7 }]}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.mainBtnText}>Подтвердить</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.resendBtn}
                    onPress={async () => {
                        if (guardPendingIntegration('eskiz')) return;
                        try {
                            await authService.sendOTP(phone as string);
                            Alert.alert('Готово', 'Код отправлен повторно');
                        } catch {
                            Alert.alert('Ошибка', 'Не удалось отправить код');
                        }
                    }}
                >
                    <Text style={styles.resendText}>Отправить код еще раз</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { padding: 25, justifyContent: 'center', flex: 1 },
    title: { fontSize: 28, fontWeight: '900', color: Colors.primary, textAlign: 'center', marginBottom: 10 },
    subTitle: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 40 },
    otpInput: {
        backgroundColor: '#F8FAFC', borderRadius: 16, height: 70, textAlign: 'center',
        fontSize: 32, fontWeight: '800', color: Colors.primary, letterSpacing: 10,
        borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 25
    },
    mainBtn: { backgroundColor: Colors.primary, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    mainBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    resendBtn: { marginTop: 25, alignItems: 'center' },
    resendText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
});
