import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function MyIdVerification() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://myid.uz/static/img/myid-logo.png' }} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Идентификация личности</Text>
      <Text style={styles.sub}>Чтобы сдавать вещи в аренду, нам нужно подтвердить вашу личность через систему MyID.</Text>
      
      <TouchableOpacity style={styles.btn} onPress={() => router.replace('/')}>
        <Text style={styles.btnText}>Пройти идентификацию</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.replace('/')}>
        <Text style={styles.skip}>Пропустить (только просмотр)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 40, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 150, height: 60, marginBottom: 30 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  sub: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 15, lineHeight: 22 },
  btn: { backgroundColor: '#0055BB', width: '100%', padding: 18, borderRadius: 15, marginTop: 40 },
  btnText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
  skip: { marginTop: 20, color: '#64748B' }
});