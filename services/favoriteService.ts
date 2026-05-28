import { apiRequest, MOCK_MODE } from '../api/client';

export async function getFavorites(): Promise<string[]> {
    if (MOCK_MODE) return [];

    const response = await apiRequest<any>('GET', '/favorites/');
    return readList(response)
        .map(item => item.listing_id ?? item.listing?.id ?? item.id)
        .filter(Boolean)
        .map(String);
}

export async function addFavorite(listingId: string): Promise<void> {
    if (MOCK_MODE) return;
    await apiRequest<void>('POST', '/favorites/', { listing_id: listingId });
}

export async function removeFavorite(listingId: string): Promise<void> {
    if (MOCK_MODE) return;
    await apiRequest<void>('DELETE', `/favorites/${encodeURIComponent(listingId)}/`);
}

function readList(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.results)) return response.results;
    if (Array.isArray(response?.items)) return response.items;
    return [];
}
