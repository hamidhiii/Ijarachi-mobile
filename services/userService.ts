import { MOCK_MODE } from '../api/client';
import { ITEMS } from '../constants/data';
import { getListings } from './listingService';
import { Listing } from '../types/listing.types';
import { User } from '../types/user.types';

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

export async function getUserProfile(userId: string): Promise<User | null> {
    if (!MOCK_MODE) {
        const listings = await getListings();
        const seller = listings.find(item => item.seller.id === userId)?.seller;
        if (!seller) return null;
        return {
            id: seller.id,
            name: seller.name,
            phone: seller.phone ?? '',
            isPinflVerified: Boolean(seller.isVerified),
            rating: 0,
            reviewCount: 0,
            createdAt: new Date().toISOString(),
        };
    }
    await _delay(300);
    return MOCK_SELLERS[userId] || null;
}

export async function getUserListings(userId: string): Promise<Listing[]> {
    if (!MOCK_MODE) {
        const listings = await getListings();
        return listings.filter(item => item.seller.id === userId);
    }
    await _delay(400);
    return ITEMS.filter(item => item.seller.id === userId) as Listing[];
}

function _delay(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}
