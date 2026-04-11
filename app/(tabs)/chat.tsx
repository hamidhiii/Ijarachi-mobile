import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { chatService } from '../../services/chatService';
import { Conversation } from '../../types/rental.types';

export default function ChatScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    const data = await chatService.getConversations();
    setConversations(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const participant = item.participants.find(p => p.id !== 'user_me') || item.participants[0];
    const lastMsg = item.lastMessage;

    return (
      <TouchableOpacity
        style={styles.convItem}
        onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}
      >
        <Image
          source={{ uri: participant.avatar || `https://ui-avatars.com/api/?name=${participant.name}&background=random` }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.name}>{participant.name}</Text>
            {lastMsg && (
              <Text style={styles.time}>
                {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
          <View style={styles.row}>
            <Text style={styles.lastMsg} numberOfLines={1}>
              {lastMsg?.type === 'rental_request' ? '🛍️ Запрос на аренду' : (lastMsg?.text || 'Начните общение')}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{item.unreadCount}</Text></View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Сообщения</Text>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>У вас пока нет активных диалогов</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  list: { padding: 10 },
  convItem: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 18,
    backgroundColor: '#fff',
    marginBottom: 8,
    alignItems: 'center',
    gap: 15,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F1F5F9' },
  info: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: Colors.text },
  time: { fontSize: 12, color: '#94A3B8' },
  lastMsg: { fontSize: 14, color: '#64748B', flex: 1, marginRight: 10 },
  badge: { backgroundColor: Colors.primary, minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100, gap: 15 },
  emptyText: { color: '#94A3B8', fontSize: 15 }
});