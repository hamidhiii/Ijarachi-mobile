import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function PaymentScreen() {
  const router = useRouter();
  const { amount } = useLocalSearchParams();
  const [method, setMethod] = useState<'click' | 'payme' | null>(null);

  const handleFinish = () => {
    // Здесь будет вызов SDK. Пока имитируем успех.
    alert(`Редирект в приложение ${method === 'click' ? 'Click' : 'Payme'}...`);
    setTimeout(() => {
      router.replace('/'); // Возвращаем на главную после "оплаты"
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Оплата</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.amountLabel}>Сумма к оплате:</Text>
        <Text style={styles.amountValue}>{amount?.toLocaleString()} сум</Text>

        <Text style={styles.sectionTitle}>Выберите способ оплаты</Text>

        {/* CLICK */}
        <TouchableOpacity 
          style={[styles.payOption, method === 'click' && styles.selectedOption]} 
          onPress={() => setMethod('click')}
        >
          <Image source={{ uri: 'https://click.uz/static/img/logo.png' }} style={styles.logo} resizeMode="contain" />
          <Text style={styles.payText}>Оплата через Click</Text>
          <Ionicons 
            name={method === 'click' ? "radio-button-on" : "radio-button-off"} 
            size={24} color={method === 'click' ? Colors.primary : '#CBD5E1'} 
          />
        </TouchableOpacity>

        {/* PAYME */}
        <TouchableOpacity 
          style={[styles.payOption, method === 'payme' && styles.selectedOption]} 
          onPress={() => setMethod('payme')}
        >
          <Image source={{ uri: 'https://cdn.payme.uz/logo/payme_color.png' }} style={styles.logo} resizeMode="contain" />
          <Text style={styles.payText}>Оплата через Payme</Text>
          <Ionicons 
            name={method === 'payme' ? "radio-button-on" : "radio-button-off"} 
            size={24} color={method === 'payme' ? Colors.primary : '#CBD5E1'} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.mainBtn, !method && { backgroundColor: '#CBD5E1' }]} 
          disabled={!method}
          onPress={handleFinish}
        >
          <Text style={styles.mainBtnText}>Оплатить {(amount as string)} сум</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  content: { padding: 25, flex: 1 },
  amountLabel: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  amountValue: { fontSize: 32, fontWeight: '900', color: Colors.text, textAlign: 'center', marginTop: 5, marginBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 20 },
  payOption: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', 
    padding: 20, borderRadius: 20, marginBottom: 15, borderWidth: 2, borderColor: 'transparent'
  },
  selectedOption: { borderColor: Colors.primary, backgroundColor: '#FFFFFF' },
  logo: { width: 40, height: 40, marginRight: 15 },
  payText: { flex: 1, fontSize: 16, fontWeight: '600', color: Colors.text },
  footer: { padding: 25, paddingBottom: 40 },
  mainBtn: { backgroundColor: Colors.primary, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  mainBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});