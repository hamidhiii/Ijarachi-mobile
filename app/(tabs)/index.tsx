import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState, useMemo } from 'react';
import { 
  RefreshControl, 
  SafeAreaView, 
  ScrollView, 
  StatusBar, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { useRouter } from 'expo-router';
import ProductCard from '../../components/ProductCard';
import { Colors } from '../../constants/Colors';
import { CATEGORIES, ITEMS } from '../../constants/data';

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  // СОСТОЯНИЕ ДЛЯ ВЫБРАННОЙ КАТЕГОРИИ
  const [selectedCategory, setSelectedCategory] = useState('all'); 

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setSelectedCategory('all'); // Сбрасываем фильтр при обновлении
    }, 1000);
  }, []);

  // ЛОГИКА ФИЛЬТРАЦИИ
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return ITEMS;
    return ITEMS.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* ХЕДЕР С ПОИСКОМ */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.white} />
          <TextInput 
            placeholder="Что ищете?" 
            placeholderTextColor={Colors.secondary} 
            style={styles.searchInput} 
          />
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={26} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scroll}
        removeClippedSubviews={true} 
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={Colors.primary} 
            colors={[Colors.primary]} 
          />
        }
      >
        {/* СЕКЦИЯ КАТЕГОРИЙ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Категории Ijarachi</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoriesScroll}
          >
            {CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat.id} 
                style={styles.categoryCard} 
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.iconCircle, 
                  selectedCategory === cat.id && styles.activeIconCircle
                ]}>
                  <Ionicons 
                    name={cat.icon as any} 
                    size={28} 
                    color={selectedCategory === cat.id ? Colors.primary : Colors.background} 
                  />
                </View>
                <Text style={[
                  styles.categoryText, 
                  selectedCategory === cat.id && { color: Colors.primary }
                ]}>
                  {cat.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* СЕКЦИЯ ТОВАРОВ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' 
              ? 'Рекомендовано вам' 
              : CATEGORIES.find(c => c.id === selectedCategory)?.title}
          </Text>
          
          <View style={styles.grid}>
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <ProductCard key={item.id} item={item} />
              ))
            ) : (
              <View style={styles.emptyBox}>
                <Ionicons name="search" size={50} color="#E2E8F0" />
                <Text style={styles.emptyText}>В этой категории пока нет вещей для аренды</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* ОТСТУП СНИЗУ: чтобы парящий NavBar не закрывал нижние товары */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  searchBar: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.primary, 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    height: 50 
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: Colors.white },
  notifBtn: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingTop: 10 },
  section: { marginBottom: 25 },
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: Colors.text, 
    marginLeft: 16, 
    marginBottom: 16 
  },
  categoriesScroll: { 
    paddingHorizontal: 16, 
    gap: 15,
    paddingBottom: 5
  },
  categoryCard: { 
    alignItems: 'center', 
    width: 75 
  },
  iconCircle: { 
    width: 65, 
    height: 65, 
    borderRadius: 22, 
    backgroundColor: Colors.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  activeIconCircle: { 
    backgroundColor: Colors.secondary, 
    borderWidth: 2, 
    borderColor: Colors.primary,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5
  },
  categoryText: { 
    fontSize: 12, 
    color: Colors.text, 
    textAlign: 'center', 
    fontWeight: '700' 
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 8 
  },
  emptyBox: { 
    width: '100%', 
    padding: 60, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  emptyText: { 
    color: '#94A3B8', 
    textAlign: 'center', 
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500'
  },
});