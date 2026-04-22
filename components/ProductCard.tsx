import { useWishlist } from '@/context/WishlistContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { Listing } from '../types/listing.types';

type ProductCardProps = { item: Listing };

function ProductCard({ item }: ProductCardProps) {
    const { wishlist, toggleWishlist } = useWishlist();
    const isFavorite = wishlist.includes(item.id);

    const rating = item.rating ?? 4.8;
    const reviewCount = item.reviewCount ?? 0;

    return (
        <View style={styles.cardContainer}>
            <Link href={`/product/${item.id}`} asChild>
                <TouchableOpacity style={styles.card} activeOpacity={0.9}>
                    <View style={styles.imageBox}>
                        <Image
                            source={item.image}
                            style={styles.image}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            transition={150}
                            recyclingKey={item.id}
                        />
                        <TouchableOpacity
                            style={styles.heartBtn}
                            onPress={() => toggleWishlist(item.id)}
                            activeOpacity={0.7}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons
                                name={isFavorite ? 'heart' : 'heart-outline'}
                                size={16}
                                color={isFavorite ? '#EF4444' : Colors.text}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.info}>
                        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={11} color="#F59E0B" />
                            <Text style={styles.ratingText}>
                                {rating.toFixed(1)}
                                {reviewCount > 0 && (
                                    <Text style={styles.reviewText}> ({reviewCount})</Text>
                                )}
                            </Text>
                        </View>

                        <Text style={styles.price}>
                            {item.price}
                            <Text style={styles.perDay}> /день</Text>
                        </Text>

                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
                            <Text style={styles.location} numberOfLines={1}>{item.location}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        width: '50%',
        padding: 6,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#EBEBEB',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    imageBox: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 140,
        backgroundColor: '#F1F5F9',
    },
    heartBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.92)',
        width: 30,
        height: 30,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        padding: 10,
    },
    title: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.text,
        lineHeight: 16,
        minHeight: 32,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 4,
    },
    ratingText: {
        fontSize: 11,
        color: Colors.textMuted,
        fontWeight: '600',
    },
    reviewText: {
        fontSize: 10,
        color: Colors.textMuted,
        fontWeight: '500',
    },
    price: {
        fontSize: 13,
        fontWeight: '800',
        color: Colors.primary,
        marginTop: 3,
    },
    perDay: {
        fontSize: 10,
        fontWeight: '500',
        color: Colors.textMuted,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 3,
    },
    location: {
        fontSize: 10,
        color: Colors.textMuted,
        fontWeight: '500',
        flex: 1,
    },
});

export default memo(ProductCard);
