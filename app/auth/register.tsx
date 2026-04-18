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
  View
} from 'react-native';
import { Colors } from '../../constants/Colors';
import * as authService from '../../services/authService';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите ваше имя');
      return;
    }
    if (phone.length < 9) {
      Alert.alert('Ошибка', 'Введите корректный номер телефона');
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        name,
        phone: `+998${phone}`,
        isPinflVerified: false,
      });
      await authService.sendOTP(`+998${phone}`);
      router.push({
        pathname: '/auth/verify',
        params: { phone: `+998${phone}` }
      });
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось зарегистрироваться');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.logoText}>Rentoo</Text>
          <Text style={styles.subTitle}>Создайте аккаунт</Text>

          <View style={styles.inputLabelGroup}>
            <Text style={styles.label}>Как вас зовут?</Text>
            <TextInput
              placeholder="Имя Фамилия"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputLabelGroup}>
            <Text style={styles.label}>Номер телефона</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.uzbPrefix}>
                <Text style={styles.flag}>🇺🇿</Text>
                <Text style={styles.prefixText}>+998</Text>
              </View>
              <TextInput
                placeholder="00 000 00 00"
                placeholderTextColor="#94A3B8"
                style={styles.phoneInput}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={9}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.mainBtn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.mainBtnText}>Зарегистрироваться</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Нажимая кнопку, вы подтверждаете согласие с{' '}
            <Text style={styles.linkText}>Условиями использования</Text>
          </Text>

          <View style={styles.footerLinkWrapper}>
            <Text style={styles.footerText}>Уже есть аккаунт? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.linkText}>Войти</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 25, flexGrow: 1, justifyContent: 'center' },
  logoText: { fontSize: 36, fontWeight: '900', color: Colors.primary, textAlign: 'center', marginBottom: 5 },
  subTitle: { fontSize: 18, color: '#1E293B', textAlign: 'center', marginBottom: 40, fontWeight: '600' },
  inputLabelGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 8, marginLeft: 5 },
  input: {
    backgroundColor: '#F8FAFC', borderRadius: 16, paddingHorizontal: 20,
    height: 60, fontSize: 16, color: '#1E293B', borderWidth: 1, borderColor: '#F1F5F9',
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
    borderRadius: 16, paddingHorizontal: 15, height: 60,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  uzbPrefix: { flexDirection: 'row', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#CBD5E1', paddingRight: 10, marginRight: 10, gap: 5 },
  flag: { fontSize: 18 },
  prefixText: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  phoneInput: { flex: 1, fontSize: 16, color: '#1E293B' },
  mainBtn: { backgroundColor: Colors.primary, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  mainBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  termsText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 20, lineHeight: 18 },
  footerLinkWrapper: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { fontSize: 14, color: '#64748B' },
  linkText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});