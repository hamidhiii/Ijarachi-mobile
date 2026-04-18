import { apiRequest, MOCK_MODE } from '../api/client';
import { ITEMS } from '../constants/data';
import { Listing } from '../types/listing.types';

// ─── Listing Service ──────────────────────────────────────────────────────────
// Пока MOCK_MODE=true — всё в памяти. Когда появится бэкенд, установите
// EXPO_PUBLIC_MOCK_MODE=false, и методы начнут ходить в REST API.
//
// Предполагаемые эндпоинты (скорректируйте под реальный бэкенд):
//   GET    /listings                       — список с фильтрами ?category=&search=
//   GET    /listings/:id                   — одна карточка
//   POST   /listings                       — создать (FormData: title, price, images[])
//   PATCH  /listings/:id                   — обновить (частично)
//   DELETE /listings/:id                   — удалить
//   GET    /users/:userId/listings         — мои объявления

let _listings: Listing[] = [...(ITEMS as Listing[])];

/** ПОЛУЧИТЬ все объявления (с фильтрами) */
export async function getListings(filters?: {
    category?: string;
    search?: string;
}): Promise<Listing[]> {
    if (!MOCK_MODE) {
        const qs = new URLSearchParams();
        if (filters?.category && filters.category !== 'all') qs.set('category', filters.category);
        if (filters?.search) qs.set('search', filters.search);
        const path = `/listings${qs.toString() ? `?${qs.toString()}` : ''}`;
        return apiRequest<Listing[]>('GET', path);
    }

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
    if (!MOCK_MODE) {
        return apiRequest<Listing>('GET', `/listings/${encodeURIComponent(id)}`);
    }
    await _delay(200);
    return _listings.find(i => i.id === id) ?? null;
}

/** СОЗДАТЬ объявление */
export async function createListing(
    data: Partial<Listing>,
    seller?: { id: string; name: string }
): Promise<Listing> {
    if (!MOCK_MODE) {
        return apiRequest<Listing>('POST', '/listings', { ...data, sellerId: seller?.id });
    }

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
        seller: seller
            ? { id: seller.id, name: seller.name, role: 'Арендодатель' }
            : { id: 'user_me', name: 'Вы', role: 'Арендодатель' },
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
    if (!MOCK_MODE) {
        return apiRequest<Listing>('PATCH', `/listings/${encodeURIComponent(id)}`, patch);
    }
    await _delay(300);
    _listings = _listings.map(i => i.id === id ? { ...i, ...patch } : i);
    return _listings.find(i => i.id === id)!;
}

/** УДАЛИТЬ объявление */
export async function deleteListing(id: string): Promise<void> {
    if (!MOCK_MODE) {
        await apiRequest<void>('DELETE', `/listings/${encodeURIComponent(id)}`);
        return;
    }
    await _delay(300);
    _listings = _listings.filter(i => i.id !== id);
}

/** МОИ объявления */
export async function getMyListings(userId: string): Promise<Listing[]> {
    if (!MOCK_MODE) {
        return apiRequest<Listing[]>('GET', `/users/${encodeURIComponent(userId)}/listings`);
    }
    await _delay(200);
    return _listings.filter(i => i.seller?.id === userId);
}

function _delay(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}
