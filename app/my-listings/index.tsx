import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import * as listingService from '../../services/listingService';
import { Listing } from '../../types/listing.types';

export default function MyListingsScreen() {
    const router = useRouter();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadListings();
    }, []);

    const loadListings = async () => {
        setLoading(true);
        try {
            const data = await listingService.getMyListings('user_me');
            setListings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await listingService.deleteListing(id);
            setListings(prev => prev.filter(l => l.id !== id));
        } catch (error) {
            alert('Ошибка при удалении');
        }
    };

    const renderItem = ({ item }: { item: Listing }) => (
        <View style={styles.card}>
            <Image source={item.image} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.price}>{item.price}</Text>
                <View style={styles.statusRow}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Активно</Text>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => router.push(`/my-listings/${item.id}/edit`)}>
                    <Ionicons name="pencil-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Мои объявления</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/add')}>
                    <Ionicons name="add" size={28} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={listings}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
                        <Text style={styles.emptyText}>У вас пока нет объявлений</Text>
                        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(tabs)/add')}>
                            <Text style={styles.addBtnText}>Создать первое</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
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
    list: { padding: 20 },
    card: {
        flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 16,
        padding: 12, marginBottom: 15, alignItems: 'center'
    },
    image: { width: 70, height: 70, borderRadius: 12 },
    info: { flex: 1, marginLeft: 15 },
    title: { fontSize: 16, fontWeight: '700', color: Colors.text },
    price: { fontSize: 14, color: Colors.primary, fontWeight: '700', marginTop: 4 },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 },
    statusText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    actions: { flexDirection: 'row', gap: 15 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, color: '#94A3B8', marginTop: 15, marginBottom: 20 },
    addBtn: { backgroundColor: Colors.primary, paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 },
    addBtnText: { color: '#fff', fontWeight: '700' }
});
