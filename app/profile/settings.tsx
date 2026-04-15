import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

export default function SettingsScreen() {
    const router = useRouter();
    const { logout } = useAuth();
    const [notifications, setNotifications] = React.useState(true);

    const handleLogout = () => {
        Alert.alert(
            'Выход',
            'Вы уверены, что хотите выйти из аккаунта?',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Выйти',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/auth/login');
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon, title, value, type = 'arrow', onPress, color = Colors.text }: any) => (
        <TouchableOpacity
            style={styles.item}
            onPress={onPress}
            disabled={type === 'switch'}
        >
            <View style={[styles.iconBox, { backgroundColor: color + '10' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={[styles.itemTitle, { color }]}>{title}</Text>
            {type === 'arrow' && <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />}
            {type === 'switch' && (
                <Switch
                    value={value}
                    onValueChange={onPress}
                    trackColor={{ false: '#E2E8F0', true: Colors.primary + '80' }}
                    thumbColor={value ? Colors.primary : '#fff'}
                />
            )}
            {type === 'value' && <Text style={styles.itemValue}>{value}</Text>}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Настройки</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>Основные</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="notifications-outline"
                        title="Уведомления"
                        type="switch"
                        value={notifications}
                        onPress={setNotifications}
                    />
                    <SettingItem
                        icon="language-outline"
                        title="Язык приложения"
                        type="value"
                        value="Русский"
                    />
                </View>

                <Text style={styles.sectionTitle}>Аккаунт</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="person-outline"
                        title="Редактировать профиль"
                    />
                    <SettingItem
                        icon="shield-checkmark-outline"
                        title="Безопасность"
                    />
                </View>

                <Text style={styles.sectionTitle}>Поддержка</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="help-circle-outline"
                        title="Помощь и FAQ"
                    />
                    <SettingItem
                        icon="document-text-outline"
                        title="Условия использования"
                    />
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                    <Text style={styles.logoutText}>Выйти из аккаунта</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Версия 1.0.0 (42)</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 20, backgroundColor: '#fff'
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
    content: { flex: 1 },
    sectionTitle: {
        fontSize: 13, fontWeight: '700', color: '#94A3B8',
        textTransform: 'uppercase', marginLeft: 20, marginTop: 25, marginBottom: 10
    },
    section: { backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9' },
    item: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
        borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
    },
    iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    itemTitle: { flex: 1, fontSize: 16, fontWeight: '600' },
    itemValue: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#fff', marginTop: 30, padding: 18,
        borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9'
    },
    logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '700', marginLeft: 10 },
    versionText: { textAlign: 'center', color: '#CBD5E1', fontSize: 12, marginTop: 20, marginBottom: 40 }
});
