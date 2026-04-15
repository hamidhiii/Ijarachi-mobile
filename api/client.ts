import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.ijarachi.uz/api/v1';
const MOCK_MODE = true; // ← Переключить на false когда будет API

export async function apiRequest<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    body?: object,
): Promise<T> {
    if (MOCK_MODE) {
        // Все методы в mock mode обрабатываются в сервисах
        throw new Error(`MOCK_MODE: используй сервисы напрямую. Path: ${path}`);
    }

    const token = await AsyncStorage.getItem('ijarachi_access_token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
        // TODO: refresh token logic
        await AsyncStorage.removeItem('ijarachi_access_token');
        throw new Error('UNAUTHORIZED');
    }

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `HTTP ${res.status}`);
    }

    return res.json() as Promise<T>;
}
