import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import * as authService from '../../services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phone.length < 9) {
      Alert.alert('Ошибка', 'Введите корректный номер телефона');
      return;
    }

    setLoading(true);
    try {
      await authService.sendOTP(`+998${phone}`);
      router.push({
        pathname: '/auth/verify',
        params: { phone: `+998${phone}` }
      });
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отправить код');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logoText}>Ijarachi</Text>
        <Text style={styles.subTitle}>С возвращением!</Text>

        <View style={styles.inputWrapper}>
          <View style={styles.uzbPrefix}>
            <Text style={styles.flag}>🇺🇿</Text>
            <Text style={styles.prefixText}>+998</Text>
          </View>
          <TextInput
            placeholder="Номер телефона"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={9}
          />
        </View>

        <TouchableOpacity
          style={[styles.mainBtn, loading && { opacity: 0.7 }]}
          onPress={handleSendOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.mainBtnText}>Получить код</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerLinkWrapper}>
          <Text style={styles.footerText}>Нет аккаунта? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.linkText}>Создать</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 25, justifyContent: 'center', flex: 1 },
  logoText: { fontSize: 36, fontWeight: '900', color: Colors.primary, textAlign: 'center', marginBottom: 5 },
  subTitle: { fontSize: 18, color: '#1E293B', textAlign: 'center', marginBottom: 40, fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
    borderRadius: 16, paddingHorizontal: 15, height: 60, marginBottom: 15,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  uzbPrefix: { flexDirection: 'row', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#CBD5E1', paddingRight: 10, marginRight: 10, gap: 5 },
  flag: { fontSize: 18 },
  prefixText: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  input: { flex: 1, fontSize: 16, color: '#1E293B' },
  mainBtn: { backgroundColor: Colors.primary, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  mainBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  footerLinkWrapper: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { fontSize: 14, color: '#64748B' },
  linkText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});
