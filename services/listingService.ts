import { apiRequest, MOCK_MODE } from '../api/client';
import { ITEMS } from '../constants/data';
import { Listing } from '../types/listing.types';

// ─── Listing Service ──────────────────────────────────────────────────────────
// Пока MOCK_MODE=true — всё в памяти. Когда появится бэкенд, установите
// EXPO_PUBLIC_MOCK_MODE=false, и методы начнут ходить в REST API.
//
// Backend API из Postman collection:
//   GET    /listings/?q=&category=&price_min=&price_max=&ordering=
//   GET    /listings/:id/
//   POST   /listings/
//   PATCH  /listings/:id/
//   DELETE /listings/:id/
//   GET    /items/my/

let _listings: Listing[] = [...(ITEMS as Listing[])];

/** ПОЛУЧИТЬ все объявления (с фильтрами) */
export async function getListings(filters?: {
    category?: string;
    search?: string;
    priceMin?: number;
    priceMax?: number;
    ordering?: string;
}): Promise<Listing[]> {
    if (!MOCK_MODE) {
        const qs = new URLSearchParams();
        if (filters?.category && filters.category !== 'all') qs.set('category', filters.category);
        if (filters?.search) qs.set('q', filters.search);
        if (filters?.priceMin) qs.set('price_min', String(filters.priceMin));
        if (filters?.priceMax) qs.set('price_max', String(filters.priceMax));
        if (filters?.ordering) qs.set('ordering', filters.ordering);
        const path = `/listings/${qs.toString() ? `?${qs.toString()}` : ''}`;
        const response = await apiRequest<any>('GET', path);
        return readList(response).map(mapListing);
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
        const response = await apiRequest<any>('GET', `/listings/${encodeURIComponent(id)}/`);
        return mapListing(response);
    }
    await _delay(200);
    return _listings.find(i => i.id === id) ?? null;
}

/** СОЗДАТЬ объявление */
export async function createListing(
    data: Partial<Listing>,
    seller?: { id: string; name: string; isVerified?: boolean }
): Promise<Listing> {
    if (!MOCK_MODE) {
        const response = await apiRequest<any>('POST', '/listings/', toApiListingPayload(data));
        return mapListing(response);
    }

    await _delay(400);
    const newItem: Listing = {
        id: `item_${Date.now()}`,
        title: data.title || '',
        price: `${data.priceNum?.toLocaleString('ru-RU')} сум`,
        priceNum: data.priceNum || 0,
        deposit: data.depositNum ? `${data.depositNum.toLocaleString('ru-RU')} сум` : undefined,
        depositNum: data.depositNum ?? 0,
        category: data.category || '',
        categoryType: data.categoryType || 'quantity',
        location: data.location || 'Ташкент',
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        image: data.image ?? { uri: '' },
        images: data.images ?? (data.image ? [data.image] : []),
        description: data.description || '',
        tags: data.tags ?? [],
        characteristics: data.characteristics ?? [],
        seller: seller
            ? { id: seller.id, name: seller.name, role: 'Арендодатель', isVerified: seller.isVerified }
            : { id: 'user_me', name: 'Вы', role: 'Арендодатель', isVerified: false },
        availableSizes: data.availableSizes ?? [],
        maxQuantity: data.maxQuantity ?? 1,
        unit: data.unit ?? 'шт',
        minRentalDays: data.minRentalDays ?? 1,
        moderationStatus: data.moderationStatus ?? 'pending',
        rating: 0,
        reviewCount: 0,
    };
    _listings = [newItem, ..._listings];
    return newItem;
}

/** ОБНОВИТЬ объявление */
export async function updateListing(id: string, patch: Partial<Listing>): Promise<Listing> {
    if (!MOCK_MODE) {
        const response = await apiRequest<any>('PATCH', `/listings/${encodeURIComponent(id)}/`, toApiListingPayload(patch));
        return mapListing(response);
    }
    await _delay(300);
    _listings = _listings.map(i => i.id === id ? { ...i, ...patch } : i);
    return _listings.find(i => i.id === id)!;
}

/** УДАЛИТЬ объявление */
export async function deleteListing(id: string): Promise<void> {
    if (!MOCK_MODE) {
        await apiRequest<void>('DELETE', `/listings/${encodeURIComponent(id)}/`);
        return;
    }
    await _delay(300);
    _listings = _listings.filter(i => i.id !== id);
}

/** МОИ объявления */
export async function getMyListings(userId: string): Promise<Listing[]> {
    if (!MOCK_MODE) {
        const response = await apiRequest<any>('GET', '/items/my/');
        return readList(response).map(mapListing);
    }
    await _delay(200);
    return _listings.filter(i => i.seller?.id === userId);
}

function _delay(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}

function readList(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.results)) return response.results;
    if (Array.isArray(response?.items)) return response.items;
    return [];
}

function mapListing(raw: any): Listing {
    const photos = Array.isArray(raw.photos) ? raw.photos : [];
    const firstPhoto = photos[0]?.url || photos[0]?.image || raw.image || raw.photo;
    const owner = raw.owner || raw.seller || {};
    const priceNum = Number(raw.price_per_day ?? raw.priceNum ?? raw.price ?? 0);
    const depositNum = Number(raw.deposit ?? raw.depositNum ?? 0);
    const categoryType = raw.category_type === 'size' || raw.categoryType === 'size' || raw.available_sizes?.length
        ? 'size'
        : 'quantity';

    return {
        id: String(raw.id),
        title: raw.title ?? '',
        price: `${priceNum.toLocaleString('ru-RU')} сум`,
        priceNum,
        deposit: depositNum ? `${depositNum.toLocaleString('ru-RU')} сум` : undefined,
        depositNum,
        category: String(raw.category?.slug ?? raw.category?.id ?? raw.category ?? ''),
        categoryType,
        location: raw.city || raw.location || raw.address || 'Ташкент',
        address: raw.address,
        latitude: Number(raw.latitude ?? raw.lat) || undefined,
        longitude: Number(raw.longitude ?? raw.lng) || undefined,
        image: firstPhoto ? { uri: firstPhoto } : ITEMS[0].image,
        images: photos.length
            ? photos.map((p: any) => ({ uri: p.url || p.image || p }))
            : firstPhoto ? [{ uri: firstPhoto }] : [ITEMS[0].image],
        description: raw.description ?? '',
        tags: raw.tags ?? [],
        characteristics: raw.characteristics ?? [],
        seller: {
            id: String(owner.id ?? raw.owner_id ?? ''),
            name: owner.full_name ?? owner.name ?? 'Арендодатель',
            role: owner.role ?? 'Арендодатель',
            isVerified: Boolean(owner.is_verified_myid ?? owner.is_verified ?? owner.isPinflVerified),
            phone: owner.phone,
            district: owner.district,
            address: owner.address,
            latitude: Number(owner.latitude ?? owner.lat) || undefined,
            longitude: Number(owner.longitude ?? owner.lng) || undefined,
            workingHours: owner.working_hours,
        },
        availableSizes: raw.available_sizes ?? raw.availableSizes ?? [],
        maxQuantity: raw.max_quantity ?? raw.maxQuantity ?? 1,
        unit: raw.unit ?? 'шт',
        minRentalDays: raw.min_rental_days ?? raw.minRentalDays ?? 1,
        moderationStatus: raw.status ?? raw.moderationStatus ?? 'approved',
        rating: Number(raw.rating ?? 0),
        reviewCount: Number(raw.review_count ?? raw.reviewCount ?? 0),
        blockedDates: raw.blocked_dates ?? raw.blockedDates ?? [],
    };
}

function toApiListingPayload(data: Partial<Listing>) {
    return {
        title: data.title,
        description: data.description,
        category: data.category,
        price_per_day: data.priceNum,
        deposit: data.depositNum,
        address: data.address || data.location,
        city: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        available_sizes: data.availableSizes,
        max_quantity: data.maxQuantity,
        unit: data.unit,
        min_rental_days: data.minRentalDays,
        status: data.moderationStatus,
        tags: data.tags,
        characteristics: data.characteristics,
    };
}
