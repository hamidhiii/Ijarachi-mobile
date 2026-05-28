import { apiRequest, MOCK_MODE } from '../api/client';
import { CURRENT_USER_ID } from '../mocks/bookings';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '../mocks/chat';
import { ChatMessage, Conversation, MessageType } from '../types/rental.types';

class ChatService {
    private conversations: Conversation[] = [...MOCK_CONVERSATIONS];
    private messages: Record<string, ChatMessage[]> = { ...MOCK_MESSAGES };

    async getConversations(): Promise<Conversation[]> {
        if (!MOCK_MODE) {
            const response = await apiRequest<any>('GET', '/chat/conversations/');
            return readList(response).map(mapConversation);
        }
        return this.conversations;
    }

    async getMessages(conversationId: string): Promise<ChatMessage[]> {
        if (!MOCK_MODE) {
            const response = await apiRequest<any>('GET', `/chat/conversations/${encodeURIComponent(conversationId)}/messages/`);
            return readList(response).map((message) => mapMessage(message, conversationId));
        }
        return this.messages[conversationId] || [];
    }

    async sendMessage(params: {
        conversationId?: string;
        recipientId: string;
        type: 'text' | 'rental_request';
        text?: string;
        bookingId?: string;
        listingId?: string;
    }): Promise<ChatMessage> {
        if (!MOCK_MODE) {
            let conversationId = params.conversationId;
            if (!conversationId) {
                const payload = params.bookingId
                    ? { deal_id: params.bookingId }
                    : params.listingId ? { listing_id: params.listingId } : {};
                const conversation = await apiRequest<any>('POST', '/chat/conversations/', payload);
                conversationId = String(conversation.id);
            }
            const response = await apiRequest<any>(
                'POST',
                `/chat/conversations/${encodeURIComponent(conversationId)}/messages/`,
                { text: params.text || '' }
            );
            return mapMessage(response, conversationId);
        }

        let convId = params.conversationId;

        if (!convId) {
            const existing = this.conversations.find(c =>
                c.participants.some(p => p.id === params.recipientId)
            );
            if (existing) {
                convId = existing.id;
            } else {
                convId = `conv_${Date.now()}`;
                const newConv: Conversation = {
                    id: convId,
                    participants: [
                        { id: CURRENT_USER_ID, name: 'Вы' },
                        { id: params.recipientId, name: 'Пользователь', isVerified: false }
                    ],
                    unreadCount: 0,
                    updatedAt: new Date().toISOString()
                };
                this.conversations.push(newConv);
                this.messages[convId] = [];
            }
        }

        const newMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            conversationId: convId!,
            senderId: CURRENT_USER_ID,
            type: params.type,
            text: params.text,
            bookingId: params.bookingId,
            createdAt: new Date().toISOString()
        };

        if (!this.messages[convId!]) this.messages[convId!] = [];
        this.messages[convId!].push(newMessage);

        const convIndex = this.conversations.findIndex(c => c.id === convId);
        if (convIndex > -1) {
            this.conversations[convIndex].lastMessage = newMessage;
            this.conversations[convIndex].updatedAt = newMessage.createdAt;
        }

        return newMessage;
    }
}

export const chatService = new ChatService();

function readList(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.results)) return response.results;
    if (Array.isArray(response?.items)) return response.items;
    return [];
}

function mapConversation(raw: any): Conversation {
    return {
        id: String(raw.id),
        participants: readParticipants(raw),
        lastMessage: raw.last_message ? mapMessage(raw.last_message, String(raw.id)) : undefined,
        unreadCount: Number(raw.unread_count ?? raw.unreadCount ?? 0),
        updatedAt: raw.updated_at ?? raw.updatedAt ?? raw.last_message?.created_at ?? new Date().toISOString(),
    };
}

function readParticipants(raw: any): Conversation['participants'] {
    const participants = raw.participants || raw.users || [];
    if (Array.isArray(participants) && participants.length) {
        return participants.map((user: any) => ({
            id: String(user.id),
            name: user.full_name ?? user.name ?? user.phone ?? 'Пользователь',
            avatar: user.avatar,
            isVerified: Boolean(user.is_verified_myid ?? user.is_verified ?? user.isPinflVerified),
        }));
    }

    const peer = raw.peer || raw.other_user || raw.owner || raw.renter;
    if (peer) {
        return [
            { id: CURRENT_USER_ID, name: 'Вы' },
            {
                id: String(peer.id),
                name: peer.full_name ?? peer.name ?? peer.phone ?? 'Пользователь',
                avatar: peer.avatar,
                isVerified: Boolean(peer.is_verified_myid ?? peer.is_verified ?? peer.isPinflVerified),
            },
        ];
    }

    return [{ id: CURRENT_USER_ID, name: 'Вы' }];
}

function mapMessage(raw: any, fallbackConversationId: string): ChatMessage {
    const bookingId = raw.deal_id ?? raw.booking_id ?? raw.deal?.id ?? raw.booking?.id;
    const type: MessageType = bookingId || raw.type === 'rental_request' ? 'rental_request' : 'text';
    return {
        id: String(raw.id),
        conversationId: String(raw.conversation_id ?? raw.conversation ?? fallbackConversationId),
        senderId: String(raw.sender?.id ?? raw.sender_id ?? raw.user_id ?? ''),
        type,
        text: raw.text ?? raw.message ?? '',
        bookingId: bookingId ? String(bookingId) : undefined,
        createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    };
}
