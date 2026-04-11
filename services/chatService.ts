import { CURRENT_USER_ID } from '../mocks/bookings';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '../mocks/chat';
import { ChatMessage, Conversation } from '../types/rental.types';

class ChatService {
    private conversations: Conversation[] = [...MOCK_CONVERSATIONS];
    private messages: Record<string, ChatMessage[]> = { ...MOCK_MESSAGES };

    async getConversations(): Promise<Conversation[]> {
        return this.conversations;
    }

    async getMessages(conversationId: string): Promise<ChatMessage[]> {
        return this.messages[conversationId] || [];
    }

    async sendMessage(params: {
        conversationId?: string;
        recipientId: string;
        type: 'text' | 'rental_request';
        text?: string;
        bookingId?: string;
    }): Promise<ChatMessage> {
        let convId = params.conversationId;

        if (!convId) {
            // Ищем или создаем беседу
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
                        { id: params.recipientId, name: 'Пользователь' } // В идеале тянуть имя
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

        // Обновляем беседу
        const convIndex = this.conversations.findIndex(c => c.id === convId);
        if (convIndex > -1) {
            this.conversations[convIndex].lastMessage = newMessage;
            this.conversations[convIndex].updatedAt = newMessage.createdAt;
        }

        return newMessage;
    }
}

export const chatService = new ChatService();
