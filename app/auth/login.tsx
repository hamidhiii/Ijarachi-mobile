import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logoText}>Ijarachi</Text>
        <Text style={styles.subTitle}>С возвращением!</Text>

        {/* Поле Телефон */}
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
          />
        </View>

        {/* Поле Пароль */}
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} style={styles.icon} />
          <TextInput 
            placeholder="Пароль" 
            placeholderTextColor="#94A3B8" 
            style={styles.input} 
            secureTextEntry 
          />
        </View>

        <TouchableOpacity style={styles.mainBtn} onPress={() => router.replace('/')}>
          <Text style={styles.mainBtnText}>Войти</Text>
        </TouchableOpacity>

        {/* Ссылка на Регистрацию */}
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
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#1E293B' },
  mainBtn: { backgroundColor: Colors.primary, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  mainBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  footerLinkWrapper: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { fontSize: 14, color: '#64748B' },
  linkText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});