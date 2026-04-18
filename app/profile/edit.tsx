import { Ionicons } from '@expo/vector-icons';
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

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);

  const trimmed = name.trim();
  const changed = trimmed !== (user?.name ?? '').trim();
  const valid = trimmed.length >= 2 && trimmed.length <= 40;

  const handleSave = async () => {
    if (!valid) {
      Alert.alert('Неверное имя', 'Имя должно содержать от 2 до 40 символов.');
      return;
    }
    if (!changed) {
      router.back();
      return;
    }

    try {
      setSaving(true);
      await updateUser({ name: trimmed });
      Alert.alert('Сохранено', 'Профиль обновлён', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Ошибка', 'Не удалось сохранить профиль. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Редактировать</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Войдите, чтобы редактировать профиль.</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Редактировать профиль</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Avatar */}
          <View style={styles.avatarBox}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={42} color="#fff" />
            </View>
          </View>

          {/* Name */}
          <Text style={styles.label}>Имя</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ваше имя"
            placeholderTextColor="#94A3B8"
            maxLength={40}
            autoCapitalize="words"
            returnKeyType="done"
          />

          {/* Phone (read-only) */}
          <Text style={styles.label}>Номер телефона</Text>
          <View style={[styles.input, styles.readonlyInput]}>
            <Text style={styles.readonlyValue}>{user.phone}</Text>
            <Ionicons name="lock-closed-outline" size={16} color="#94A3B8" />
          </View>
          <Text style={styles.hint}>
            Номер телефона изменить нельзя. Если нужно — обратитесь в поддержку Rentoo.
          </Text>

          {/* Verification status */}
          <View style={styles.verifyRow}>
            <Ionicons
              name={user.isPinflVerified ? 'shield-checkmark' : 'shield-outline'}
              size={20}
              color={user.isPinflVerified ? Colors.success : '#94A3B8'}
            />
            <Text style={styles.verifyText}>
              {user.isPinflVerified
                ? 'Личность подтверждена (MyID)'
                : 'Личность не подтверждена'}
            </Text>
            {!user.isPinflVerified && (
              <TouchableOpacity onPress={() => router.push('/auth/myid' as any)}>
                <Text style={styles.verifyLink}>Подтвердить</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              (!valid || !changed || saving) && styles.saveBtnDisabled,
            ]}
            onPress={handleSave}
            disabled={!valid || !changed || saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Сохранить</Text>
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
  scroll: { padding: 20, paddingBottom: 40 },
  avatarBox: { alignItems: 'center', marginVertical: 20 },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  label: {
    fontSize: 13, fontWeight: '600', color: '#64748B',
    marginTop: 18, marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: Colors.text,
  },
  readonlyInput: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  readonlyValue: { fontSize: 15, color: '#64748B' },
  hint: { fontSize: 12, color: '#94A3B8', marginTop: 8, lineHeight: 16 },
  verifyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 24, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  verifyText: { flex: 1, fontSize: 13, color: Colors.text },
  verifyLink: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  footer: {
    padding: 20, paddingBottom: 30,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
    backgroundColor: '#fff',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#CBD5E1' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
});
