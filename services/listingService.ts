import { ITEMS } from '../constants/data';
import { Listing } from '../types/listing.types';

let _listings: Listing[] = [...(ITEMS as Listing[])];

/** ПОЛУЧИТЬ все объявления (с фильтрами) */
export async function getListings(filters?: {
    category?: string;
    search?: string;
}): Promise<Listing[]> {
    await _delay(300);
    let result = [..._listings];
    if (filters?.category && filters.category !== 'all') {
        result = result.filter(i => i.category === filters.category);
    }
    if (filters?.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(i => i.title.toLowerCase().includes(q));
    }
    return result;
}

/** ПОЛУЧИТЬ одно объявление */
export async function getListingById(id: string): Promise<Listing | null> {
    await _delay(200);
    return _listings.find(i => i.id === id) ?? null;
}

/** СОЗДАТЬ объявление */
export async function createListing(data: Partial<Listing>): Promise<Listing> {
    await _delay(400);
    const newItem: Listing = {
        id: `item_${Date.now()}`,
        title: data.title || '',
        price: `${data.priceNum?.toLocaleString('ru-RU')} сум`,
        priceNum: data.priceNum || 0,
        category: data.category || '',
        categoryType: data.categoryType || 'quantity',
        location: data.location || 'Ташкент',
        image: data.image,
        description: data.description || '',
        seller: { id: 'user_me', name: 'Вы', role: 'Арендодатель' },
        availableSizes: data.availableSizes ?? [],
        maxQuantity: data.maxQuantity ?? 1,
        unit: data.unit ?? 'шт',
        rating: 0,
        reviewCount: 0,
    };
    _listings = [newItem, ..._listings];
    return newItem;
}

/** ОБНОВИТЬ объявление */
export async function updateListing(id: string, patch: Partial<Listing>): Promise<Listing> {
    await _delay(300);
    _listings = _listings.map(i => i.id === id ? { ...i, ...patch } : i);
    return _listings.find(i => i.id === id)!;
}

/** УДАЛИТЬ объявление */
export async function deleteListing(id: string): Promise<void> {
    await _delay(300);
    _listings = _listings.filter(i => i.id !== id);
}

/** МОИ объявления */
export async function getMyListings(userId: string): Promise<Listing[]> {
    await _delay(200);
    return _listings.filter(i => i.seller?.id === userId);
}

function _delay(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}
