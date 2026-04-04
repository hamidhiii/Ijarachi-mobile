import { Link } from 'expo-router';
import React, { memo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

const ProductCard = memo(({ item }: any) => {
  return (
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
  );
});

const styles = StyleSheet.create({
  card: { 
    width: '50%', 
    padding: 8,
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
    height: 36 // Чтобы текст в две строки не двигал верстку
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