import { ITEMS } from '../constants/data';
import { Listing } from '../types/listing.types';
import { User } from '../types/user.types';

// Мок пользователей для публичных профилей
const MOCK_SELLERS: Record<string, User> = {
    'user_alice': {
        id: 'user_alice',
        name: 'Алина',
        phone: '+998 90 999 88 77',
        isPinflVerified: true,
        rating: 4.9,
        reviewCount: 45,
        createdAt: '2025-10-15T10:00:00.000Z',
    },
    'user_bob': {
        id: 'user_bob',
        name: 'Бобур',
        phone: '+998 90 555 44 33',
        isPinflVerified: true,
        rating: 4.5,
        reviewCount: 12,
        createdAt: '2025-11-20T10:00:00.000Z',
    }
};

/** Получить публичный профиль пользователя */
export async function getUserProfile(userId: string): Promise<User | null> {
    await _delay(300);
    return MOCK_SELLERS[userId] || null;
}

/** Получить объявления конкретного пользователя */
export async function getUserListings(userId: string): Promise<Listing[]> {
    await _delay(400);
    return ITEMS.filter(item => item.seller.id === userId) as Listing[];
}

function _delay(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}
