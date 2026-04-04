import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Добавил useLocalSearchParams
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function Verify() {
    const router = useRouter();
    const { phone, code: correctCode } = useLocalSearchParams(); // Получаем данные из Register
    const [code, setCode] = useState('');
    const [timer, setTimer] = useState(59);
    const inputRef = useRef<TextInput>(null);

    // Таймер обратного отсчета
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleVerify = () => {
        // Проверяем введенный код с тем, что пришел в параметрах
        if (code === String(correctCode)) {
            // Успех! Идем на MyID или Главную
            router.push('/auth/myid'); 
        } else {
            Alert.alert(
                'Ошибка подтверждения', 
                'Введенный код неверный. Пожалуйста, проверьте консоль в VS Code или попробуйте снова.',
                [{ text: 'ОК' }]
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>

                <View style={styles.textBlock}>
                    <Text style={styles.title}>Подтверждение</Text>
                    <Text style={styles.subTitle}>
                        Мы отправили 4-значный код на ваш номер телефона {phone ? `+998 ${phone}` : ''}. Введите его ниже.
                    </Text>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        ref={inputRef}
                        value={code}
                        onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ''))}
                        style={[styles.codeInput, { letterSpacing: 25 }]}
                        placeholder="0000"
                        placeholderTextColor="#CBD5E1"
                        keyboardType="number-pad"
                        maxLength={4}
                        autoFocus={true}
                        selectionColor={Colors.primary}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.btn, code.length < 4 && styles.btnDisabled]}
                    onPress={handleVerify}
                    disabled={code.length < 4}
                >
                    <Text style={styles.btnText}>Подтвердить</Text>
                </TouchableOpacity>

                <View style={styles.resendBlock}>
                    {timer > 0 ? (
                        <Text style={styles.timerText}>Отправить повторно через {timer} сек.</Text>
                    ) : (
                        <TouchableOpacity onPress={() => {
                            setTimer(59);
                            // Здесь можно добавить логику повторной отправки и нового лога в консоль
                            console.log("🔄 Код отправлен повторно!");
                        }}>
                            <Text style={styles.resendLink}>Отправить код еще раз</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { flex: 1, padding: 30 },
    backBtn: { width: 40, height: 40, justifyContent: 'center', marginBottom: 20 },
    textBlock: { marginBottom: 40 },
    title: { fontSize: 32, fontWeight: '800', color: Colors.text, marginBottom: 10 },
    subTitle: { fontSize: 16, color: '#64748B', lineHeight: 22 },
    inputContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        paddingVertical: 25,
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    codeInput: {
        fontSize: 36,
        fontWeight: '900',
        color: Colors.primary,
        textAlign: 'center',
        width: '100%',
    },
    btn: { 
        backgroundColor: Colors.primary, 
        height: 60, 
        borderRadius: 18, 
        width: '100%', 
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5
    },
    btnDisabled: { backgroundColor: '#CBD5E1', elevation: 0, shadowOpacity: 0 },
    btnText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700', fontSize: 18 },
    resendBlock: { marginTop: 30, alignItems: 'center' },
    timerText: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
    resendLink: { color: Colors.primary, fontWeight: '700', fontSize: 14 }
});