import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProductCard from '../../components/ProductCard';
import { Colors } from '../../constants/Colors';
import { getUserListings, getUserProfile } from '../../services/userService';
import { Listing } from '../../types/listing.types';
import { User } from '../../types/user.types';

export default function SellerProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [seller, setSeller] = useState<User | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (!id) return;
            const [profile, items] = await Promise.all([
                getUserProfile(id),
                getUserListings(id)
            ]);
            setSeller(profile);
            setListings(items);
            setLoading(false);
        }
        loadData();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!seller) {
        return (
            <View style={styles.centered}>
                <Text>Пользователь не найден</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
                    <Text style={{ color: Colors.primary }}>Назад</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Профиль арендодателя</Text>
                </View>

                <View style={styles.profileHeader}>
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/147/147144.png' }}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>{seller.name}</Text>

                    {seller.isPinflVerified && (
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                            <Text style={styles.verifiedText}>Личность подтверждена</Text>
                        </View>
                    )}

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{seller.rating}</Text>
                            <View style={styles.statLabelRow}>
                                <Ionicons name="star" size={12} color="#F59E0B" />
                                <Text style={styles.statLabel}>Рейтинг</Text>
                            </View>
                        </View>
                        < View style={styles.divider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{seller.reviewCount}</Text>
                            <Text style={styles.statLabel}>Отзывов</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>1 год</Text>
                            <Text style={styles.statLabel}>С нами</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Объявления ({listings.length})</Text>
                </View>

                {/* Grid */}
                <View style={styles.grid}>
                    {listings.map(item => (
                        <ProductCard key={item.id} item={item} />
                    ))}
                </View>

                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        zIndex: 10,
        height: 60,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 8,
        zIndex: 20,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        textAlign: 'center',
    },
    profileHeader: { alignItems: 'center', paddingTop: 20, paddingBottom: 10, paddingHorizontal: 20 },
    avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F1F5F9', marginBottom: 12 },
    name: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 6 },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 20
    },
    verifiedText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        paddingVertical: 15,
        width: '100%',
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    statItem: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 2 },
    statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    statLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
    divider: { width: 1, height: 25, backgroundColor: '#E2E8F0' },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, alignSelf: 'flex-start', marginLeft: 15, marginBottom: 15 },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 8
    },
    listContent: { paddingBottom: 40 },
    backLink: { marginTop: 15 }
});
