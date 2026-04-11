import { Link } from 'expo-router';
import React, { memo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useWishlist } from '@/context/WishlistContext';
import { Ionicons } from '@expo/vector-icons'; // Не забудь импорт иконок

const ProductCard = memo(({ item }: any) => {
    const { wishlist, toggleWishlist } = useWishlist();
    const isFavorite = wishlist.includes(item.id);

    return (
        <View style={styles.cardContainer}>
            {/* Кнопка сердечка вынесена отдельно, чтобы не срабатывал Link */}
            <TouchableOpacity 
                style={styles.heartBtn} 
                onPress={() => toggleWishlist(item.id)}
                activeOpacity={0.7}
            >
                <Ionicons 
                    name={isFavorite ? "heart" : "heart-outline"} 
                    size={20} 
                    color={isFavorite ? "#FF4B4B" : Colors.text} 
                />
            </TouchableOpacity>

            <Link href={`/product/${item.id}`} asChild>
                <TouchableOpacity style={styles.card} activeOpacity={0.9}>
                    <Image source={item.image} style={styles.image} resizeMode="cover" />
                    <View style={styles.info}>
                        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                        <Text style={styles.price}>{item.price}</Text>
                        <Text style={styles.location}>{item.location}</Text>
                    </View>
                </TouchableOpacity>
            </Link>
        </View>
    );
});

const styles = StyleSheet.create({
    cardContainer: {
        width: '50%',
        padding: 8,
        position: 'relative', // Для позиционирования сердечка
    },
    card: { 
        width: '100%', 
    },
    heartBtn: { 
        position: 'absolute', 
        top: 18, 
        right: 18, 
        zIndex: 10, 
        backgroundColor: 'rgba(255,255,255,0.9)', 
        padding: 6, 
        borderRadius: 12,
        // Легкая тень для кнопки
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: { 
        width: '100%', 
        height: 180, 
        borderRadius: 20, 
        backgroundColor: '#F1F5F9' 
    },
    info: { 
        paddingVertical: 8,
    },
    title: { 
        fontSize: 14, 
        fontWeight: '700', 
        color: Colors.text,
        lineHeight: 18,
        height: 36 
    },
    price: { 
        fontSize: 16, 
        fontWeight: '800', 
        color: Colors.primary, 
        marginTop: 4 
    },
    location: { 
        fontSize: 12, 
        color: '#94A3B8', 
        marginTop: 2 
    },
});

export default memo(ProductCard);