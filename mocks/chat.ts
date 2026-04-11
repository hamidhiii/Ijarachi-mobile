import { ChatMessage, Conversation } from '../types/rental.types';

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv_001',
        participants: [
            { id: 'user_me', name: 'Вы' },
            { id: 'user_alice', name: 'Алина', avatar: 'https://i.pravatar.cc/150?u=alice' }
        ],
        lastMessage: {
            id: 'msg_001',
            conversationId: 'conv_001',
            senderId: 'user_alice',
            type: 'text',
            text: 'Привет! Всё в силе?',
            createdAt: new Date().toISOString()
        },
        unreadCount: 0,
        updatedAt: new Date().toISOString()
    }
];

export const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
    'conv_001': [
        {
            id: 'msg_001',
            conversationId: 'conv_001',
            senderId: 'user_alice',
            type: 'text',
            text: 'Привет! Всё в силе?',
            createdAt: new Date().toISOString()
        }
    ]
};
