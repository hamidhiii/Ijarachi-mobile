import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

export const SellerCard = ({ sellerName, sellerRole, onPress }: any) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Аватарка */}
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/147/147144.png' }}
        style={styles.avatar}
      />

      <View style={styles.info}>
        <Text style={styles.badge}>ВЛАДЕЛЕЦ ВЕЩИ</Text>
        <Text style={styles.name}>{sellerName}</Text>
        <Text style={styles.role}>{sellerRole}</Text>
      </View>

      <View style={styles.viewProfile}>
        <Text style={styles.linkText}>Профиль</Text>
        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginVertical: 10,
    // Легкая тень как на референсе
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
  },
  info: {
    flex: 1,
    marginLeft: 15,
  },
  badge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280', // Оранжевый акцент для роли
    letterSpacing: 1,
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  role: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  viewProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  }
});