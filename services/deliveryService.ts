import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, MOCK_MODE } from '../api/client';

const DELIVERY_CACHE_KEY = 'rentoo_delivery_estimates';
const CACHE_TTL_MS = 30 * 60 * 1000;

export interface DeliveryEstimateRequest {
    fromDistrict?: string;
    toAddress: string;
    category?: string;
    fromLat?: number;
    fromLng?: number;
    toLat?: number;
    toLng?: number;
}

export interface DeliveryEstimate {
    price: number;
    etaMinutes: number;
    serviceType: 'standard' | 'express' | 'same_day';
    validUntil: string;
    note: string;
}

type CachedEstimate = DeliveryEstimate & { cachedAt: number };

export async function estimateYandexDelivery(
    params: DeliveryEstimateRequest
): Promise<DeliveryEstimate> {
    const cacheKey = buildCacheKey(params);
    const cached = await readCachedEstimate(cacheKey);
    if (cached) return cached;

    if (!MOCK_MODE) {
        const response = await apiRequest<any>('POST', '/delivery/calculate/', {
            from_lat: params.fromLat ?? 41.2995,
            from_lng: params.fromLng ?? 69.2401,
            to_lat: params.toLat ?? 41.3111,
            to_lng: params.toLng ?? 69.2797,
        });
        const estimate = normalizeEstimate(response);
        await writeCachedEstimate(cacheKey, estimate);
        return estimate;
    }

    await delay(450);
    const price = mockPrice(params);
    const estimate: DeliveryEstimate = {
        price,
        etaMinutes: price > 30000 ? 75 : 45,
        serviceType: 'standard',
        validUntil: new Date(Date.now() + CACHE_TTL_MS).toISOString(),
        note: 'Стоимость может незначительно измениться при оформлении заказа',
    };
    await writeCachedEstimate(cacheKey, estimate);
    return estimate;
}

function normalizeEstimate(response: any): DeliveryEstimate {
    return {
        price: Number(response.price ?? response.cost ?? response.delivery_cost ?? 0),
        etaMinutes: Number(response.eta_minutes ?? response.eta ?? 45),
        serviceType: response.service_type ?? 'standard',
        validUntil: response.valid_until ?? new Date(Date.now() + CACHE_TTL_MS).toISOString(),
        note: response.note ?? 'Стоимость может незначительно измениться при оформлении заказа',
    };
}

function buildCacheKey(params: DeliveryEstimateRequest) {
    return [
        params.fromDistrict || 'unknown',
        params.toAddress.trim().toLowerCase(),
        params.category || 'general',
    ].join('|');
}

async function readCachedEstimate(cacheKey: string): Promise<DeliveryEstimate | null> {
    try {
        const raw = await AsyncStorage.getItem(DELIVERY_CACHE_KEY);
        if (!raw) return null;
        const cache = JSON.parse(raw) as Record<string, CachedEstimate>;
        const item = cache[cacheKey];
        if (!item || Date.now() - item.cachedAt > CACHE_TTL_MS) return null;
        return {
            price: item.price,
            etaMinutes: item.etaMinutes,
            serviceType: item.serviceType,
            validUntil: item.validUntil,
            note: item.note,
        };
    } catch {
        return null;
    }
}

async function writeCachedEstimate(cacheKey: string, estimate: DeliveryEstimate) {
    try {
        const raw = await AsyncStorage.getItem(DELIVERY_CACHE_KEY);
        const cache = raw ? JSON.parse(raw) as Record<string, CachedEstimate> : {};
        cache[cacheKey] = { ...estimate, cachedAt: Date.now() };
        await AsyncStorage.setItem(DELIVERY_CACHE_KEY, JSON.stringify(cache));
    } catch {
        // Cache is an optimisation; checkout should keep working without it.
    }
}

function mockPrice(params: DeliveryEstimateRequest) {
    const base = params.category === 'furniture' ? 36000 : 18000;
    const distanceHint = Math.min(params.toAddress.length, 40) * 350;
    return Math.round((base + distanceHint) / 1000) * 1000;
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
