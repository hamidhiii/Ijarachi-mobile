import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { AppNotification, getNotifications, markNotificationRead } from '../../services/notificationService';

export default function NotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = useCallback(async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        notifications.filter(n => !n.isRead).forEach(n => {
            markNotificationRead(n.id).catch(() => {});
        });
    };

    const handlePress = (item: AppNotification) => {
        if (!item.isRead) {
            setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
            markNotificationRead(item.id).catch(() => {});
        }
    };

    const renderItem = ({ item }: { item: AppNotification }) => (
        <TouchableOpacity style={[styles.card, !item.isRead && styles.unreadCard]} onPress={() => handlePress(item)}>
            <View style={[styles.iconBox, { backgroundColor: item.type === 'booking' ? '#ECFDF5' : '#F1F5F9' }]}>
                <Ionicons
                    name={item.type === 'booking' ? 'calendar' : item.type === 'chat' ? 'chatbubble' : 'notifications'}
                    size={20}
                    color={item.type === 'booking' ? Colors.primary : '#64748B'}
                />
            </View>
            <View style={styles.content}>
                <View style={styles.row}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                </View>
                <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
            </View>
            {!item.isRead && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Уведомления</Text>
                <TouchableOpacity onPress={markAllRead}>
                    <Text style={styles.readAll}>Прочитать все</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                loadNotifications();
                            }}
                            tintColor={Colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="notifications-off-outline" size={64} color="#CBD5E1" />
                            <Text style={styles.emptyText}>Уведомлений пока нет</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
    readAll: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
    list: { padding: 10 },
    card: {
        flexDirection: 'row', padding: 15, borderRadius: 16, marginBottom: 10,
        alignItems: 'center', backgroundColor: '#fff'
    },
    unreadCard: { backgroundColor: '#F8FAFC' },
    iconBox: {
        width: 45, height: 45, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', marginRight: 15
    },
    content: { flex: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    title: { fontSize: 15, fontWeight: '700', color: Colors.text },
    time: { fontSize: 11, color: '#94A3B8' },
    message: { fontSize: 14, color: '#64748B', lineHeight: 20 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginLeft: 10 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, color: '#94A3B8', marginTop: 15 }
});
