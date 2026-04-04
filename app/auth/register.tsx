import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Используем useRouter внутри компонента
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView, Platform,
    SafeAreaView,
    StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../constants/Colors';

export default function Register() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // --- ЛОГИКА ГЕНЕРАЦИИ И ОТПРАВКИ КОДА ---
  const handleSendSMS = () => {
    if (phone.length < 9) {
      Alert.alert("Ошибка", "Введите полный номер телефона");
      return;
    }

    setLoading(true);

    // Имитируем сетевой запрос (задержка 1.5 сек)
    setTimeout(() => {
      const generatedCode = Math.floor(1000 + Math.random() * 9000); // 4-значный код
      
      // ВЫВОД В КОНСОЛЬ (Смотри в терминал твоего ПК!)
      console.log("--------------------------------");
      console.log("📱 IJARACHI AUTH SYSTEM");
      console.log(`📞 Номер: +998 ${phone}`);
      console.log(`🔐 ВАШ КОД: ${generatedCode}`);
      console.log("--------------------------------");

      setLoading(false);

      // Переход на экран верификации с передачей данных
      router.push({
        pathname: '/auth/verify', // Убедись, что файл лежит в app/auth/verify.tsx
        params: { phone: phone, code: generatedCode }
      });
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <View style={styles.content}>
          <Text style={styles.headerTitle}>Регистрация</Text>

          {/* Поле Имя */}
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={Colors.primary} style={styles.icon} />
            <TextInput 
              placeholder="Имя" 
              placeholderTextColor="#94A3B8" 
              style={styles.input} 
            />
          </View>

          {/* Поле Фамилия */}
          <View style={styles.inputWrapper}>
            <Ionicons name="people-outline" size={20} color={Colors.primary} style={styles.icon} />
            <TextInput 
              placeholder="Фамилия" 
              placeholderTextColor="#94A3B8" 
              style={styles.input} 
            />
          </View>

          {/* Поле Телефон с флагом Узб */}
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={20} color={Colors.primary} style={styles.icon} />
            <View style={styles.uzbPrefix}>
              <Text style={styles.flag}>🇺🇿</Text>
              <Text style={styles.prefixText}>+998</Text>
            </View>
            <TextInput 
              placeholder="-- --- -- --" 
              placeholderTextColor="#94A3B8" 
              style={[styles.input, { paddingLeft: 5 }]} 
              keyboardType="phone-pad"
              maxLength={9}
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Поле Пароль */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} style={styles.icon} />
            <TextInput 
              placeholder="Придумайте пароль" 
              placeholderTextColor="#94A3B8" 
              style={styles.input} 
              secureTextEntry 
            />
          </View>

          {/* Поле Повтор пароля */}
          <View style={styles.inputWrapper}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} style={styles.icon} />
            <TextInput 
              placeholder="Повторите пароль" 
              placeholderTextColor="#94A3B8" 
              style={styles.input} 
              secureTextEntry 
            />
          </View>

          <TouchableOpacity 
            style={[styles.mainBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSendSMS}
            disabled={loading}
          >
            <Text style={styles.mainBtnText}>
              {loading ? "Отправка..." : "Получить код по SMS"}
            </Text>
          </TouchableOpacity>

          <View style={styles.footerLinkWrapper}>
            <Text style={styles.footerText}>Уже есть аккаунт? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.linkText}>Войти</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  content: { padding: 25, justifyContent: 'center', flex: 1 },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: Colors.primary, 
    marginBottom: 40,
    textAlign: 'left'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 60,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  icon: { marginRight: 10 },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: '#1E293B',
    height: '100%' 
  },
  uzbPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
    paddingRight: 10,
    marginRight: 5,
    gap: 5
  },
  flag: { fontSize: 18 },
  prefixText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1E293B' 
  },
  mainBtn: {
    backgroundColor: Colors.primary,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  },
  mainBtnText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '700' 
  },
  footerLinkWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    gap: 5,
  },
  footerText: {
    fontSize: 15,
    color: '#64748B',
  },
  linkText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
});