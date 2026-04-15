import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import RentalRequestCard from '../../components/chat/RentalRequestCard';
import { Colors } from '../../constants/Colors';
import { CURRENT_USER_ID } from '../../mocks/bookings';
import { chatService } from '../../services/chatService';
import { getBookingById, updateBookingStatus } from '../../services/rentalService';
import { Booking, ChatMessage, Conversation } from '../../types/rental.types';

export default function ChatDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [bookings, setBookings] = useState<Record<string, Booking>>({});
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);

    const loadChat = useCallback(async () => {
        const [convs, msgs] = await Promise.all([
            chatService.getConversations(),
            chatService.getMessages(id)
        ]);
        const conv = convs.find(c => c.id === id);
        setConversation(conv || null);
        setMessages(msgs);

        // Загружаем данные бронирований для карточек
        const rentalMessages = msgs.filter(m => m.type === 'rental_request' && m.bookingId);
        const bookingData: Record<string, Booking> = {};
        for (const msg of rentalMessages) {
            if (msg.bookingId) {
                const b = await getBookingById(msg.bookingId);
                if (b) bookingData[msg.bookingId] = b;
            }
        }
        setBookings(bookingData);
        setLoading(false);
    }, [id]);

    useEffect(() => {
        loadChat();
    }, [loadChat]);

    const handleSend = async () => {
        if (!inputText.trim() || !conversation) return;
        const recipient = conversation.participants.find(p => p.id !== CURRENT_USER_ID);
        if (!recipient) return;

        await chatService.sendMessage({
            conversationId: id,
            recipientId: recipient.id,
            type: 'text',
            text: inputText.trim()
        });
        setInputText('');
        loadChat();
    };

    const handleAcceptRequest = async (bookingId: string) => {
        await updateBookingStatus(bookingId, 'pending_handover');
        loadChat();
    };

    const handleDeclineRequest = async (bookingId: string) => {
        await updateBookingStatus(bookingId, 'cancelled');
        loadChat();
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isMe = item.senderId === CURRENT_USER_ID;

        if (item.type === 'rental_request' && item.bookingId && bookings[item.bookingId]) {
            const booking = bookings[item.bookingId];
            return (
                <RentalRequestCard
                    booking={booking}
                    isOwner={booking.ownerId === CURRENT_USER_ID}
                />
            );
        }

        return (
            <View style={[styles.msgBubble, isMe ? styles.myMsg : styles.theirMsg]}>
                <Text style={[styles.msgText, isMe ? styles.myMsgText : styles.theirMsgText]}>
                    {item.text}
                </Text>
                <Text style={[styles.msgTime, isMe ? styles.myTime : styles.theirTime]}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    if (loading) return <View style={styles.centered}><ActivityIndicator color={Colors.primary} /></View>;

    const participant = conversation?.participants.find(p => p.id !== CURRENT_USER_ID);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{participant?.name || 'Чат'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.list}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={100}>
                <View style={styles.inputArea}>
                    <TextInput
                        style={styles.input}
                        placeholder="Напишите сообщение..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                        <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' }, // Чуть серее фон для контраста пузырьков
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
    list: { padding: 15, gap: 10 },
    msgBubble: {
        maxWidth: '80%', padding: 12, borderRadius: 18, marginBottom: 5,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1
    },
    myMsg: { alignSelf: 'flex-end', backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
    theirMsg: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 4 },
    msgText: { fontSize: 15, lineHeight: 20 },
    myMsgText: { color: '#fff' },
    theirMsgText: { color: Colors.text },
    msgTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    myTime: { color: 'rgba(255,255,255,0.7)' },
    theirTime: { color: '#94A3B8' },
    inputArea: {
        flexDirection: 'row', alignItems: 'center', padding: 12,
        backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 10
    },
    input: {
        flex: 1, backgroundColor: '#F1F5F9', borderRadius: 20,
        paddingHorizontal: 15, paddingVertical: 10, fontSize: 15,
        maxHeight: 100
    },
    sendBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center'
    },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
