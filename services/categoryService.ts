import { apiRequest, MOCK_MODE } from '../api/client';
import { CATEGORIES as FALLBACK_CATEGORIES } from '../constants/data';

export type AppCategory = {
    id: string;
    title: string;
    icon: string;
    type: 'all' | 'size' | 'quantity';
};

const ICON_BY_SLUG: Record<string, string> = {
    dresses: 'woman-outline',
    suits: 'man-outline',
    furniture: 'bed-outline',
    dishes: 'restaurant-outline',
    decor: 'flower-outline',
    tools: 'construct-outline',
    kids: 'balloon-outline',
    tents: 'home-outline',
    electronics: 'camera-outline',
};

export async function getCategories(): Promise<AppCategory[]> {
    if (MOCK_MODE) {
        return FALLBACK_CATEGORIES as AppCategory[];
    }

    const response = await apiRequest<any>('GET', '/categories/');
    const categories = readList(response).map(mapCategory);
    return [
        { id: 'all', title: 'Все', icon: 'grid-outline', type: 'all' },
        ...categories,
    ];
}

function readList(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.results)) return response.results;
    if (Array.isArray(response?.items)) return response.items;
    return [];
}

function mapCategory(raw: any): AppCategory {
    const id = String(raw.slug ?? raw.code ?? raw.id);
    const fallback = FALLBACK_CATEGORIES.find(cat => cat.id === id);
    return {
        id,
        title: raw.title ?? raw.name ?? fallback?.title ?? id,
        icon: raw.icon ?? fallback?.icon ?? ICON_BY_SLUG[id] ?? 'cube-outline',
        type: raw.type === 'size' || fallback?.type === 'size' ? 'size' : 'quantity',
    };
}
