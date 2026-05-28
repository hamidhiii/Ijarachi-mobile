import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Базовый URL API. Можно передать backend root или уже готовый /api/v1 URL.
 * Примеры:
 *   EXPO_PUBLIC_API_URL=https://api.rentoo.uz
 *   EXPO_PUBLIC_API_URL=https://staging-api.rentoo.uz/api/v1
 */
export const BASE_URL = normalizeApiBaseUrl(
    process.env.EXPO_PUBLIC_API_URL || 'https://api.rentoo.uz/api/v1'
);

/**
 * Mock-режим. Пока нет реального бэкенда — все сервисы возвращают
 * данные из памяти. Когда API будет готов, установите
 * EXPO_PUBLIC_MOCK_MODE=false (или не задавайте вовсе).
 */
export const MOCK_MODE =
    (process.env.EXPO_PUBLIC_MOCK_MODE ?? 'true').toLowerCase() !== 'false';

export const AUTH_TOKEN_KEY = 'rentoo_access_token';
export const AUTH_REFRESH_KEY = 'rentoo_refresh_token';
export const AUTH_USER_KEY = 'rentoo_user_data';

export class ApiError extends Error {
    status: number;
    code?: string;
    constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}

export async function apiRequest<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    path: string,
    body?: object,
    opts?: { headers?: Record<string, string>; signal?: AbortSignal; skipRefresh?: boolean }
): Promise<T> {
    if (MOCK_MODE) {
        throw new ApiError(
            `MOCK_MODE активен: сервис должен вернуть mock-данные напрямую, без вызова apiRequest. Path: ${path}`,
            0,
            'MOCK_MODE'
        );
    }

    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(opts?.headers ?? {}),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    let res: Response;
    try {
        res = await fetch(`${BASE_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            signal: opts?.signal,
        });
    } catch (e: any) {
        throw new ApiError(
            e?.message || 'Проблема с соединением. Проверьте интернет.',
            0,
            'NETWORK'
        );
    }

    if (res.status === 401) {
        if (opts?.skipRefresh) {
            await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_REFRESH_KEY, AUTH_USER_KEY]);
            throw new ApiError('Сессия истекла. Войдите заново.', 401, 'UNAUTHORIZED');
        }
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            return apiRequest<T>(method, path, body, { ...opts, skipRefresh: true });
        }
        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_REFRESH_KEY, AUTH_USER_KEY]);
        throw new ApiError('Сессия истекла. Войдите заново.', 401, 'UNAUTHORIZED');
    }

    if (!res.ok) {
        let message = `HTTP ${res.status}`;
        let code: string | undefined;
        try {
            const err = await res.json();
            message = err.detail || err.message || err.error || message;
            code = err.code;
        } catch {
            // не JSON — оставим HTTP-код
        }
        throw new ApiError(message, res.status, code);
    }

    // 204 No Content
    if (res.status === 204) return undefined as unknown as T;

    return res.json() as Promise<T>;
}

export async function apiFormRequest<T>(
    method: 'POST' | 'PATCH' | 'PUT',
    path: string,
    body: FormData,
    opts?: { headers?: Record<string, string>; signal?: AbortSignal; skipRefresh?: boolean }
): Promise<T> {
    if (MOCK_MODE) {
        throw new ApiError(
            `MOCK_MODE активен: сервис должен вернуть mock-данные напрямую, без вызова apiFormRequest. Path: ${path}`,
            0,
            'MOCK_MODE'
        );
    }

    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const headers: Record<string, string> = {
        Accept: 'application/json',
        ...(opts?.headers ?? {}),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    let res: Response;
    try {
        res = await fetch(`${BASE_URL}${path}`, {
            method,
            headers,
            body,
            signal: opts?.signal,
        });
    } catch (e: any) {
        throw new ApiError(
            e?.message || 'Проблема с соединением. Проверьте интернет.',
            0,
            'NETWORK'
        );
    }

    if (res.status === 401) {
        if (opts?.skipRefresh) {
            await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_REFRESH_KEY, AUTH_USER_KEY]);
            throw new ApiError('Сессия истекла. Войдите заново.', 401, 'UNAUTHORIZED');
        }
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            return apiFormRequest<T>(method, path, body, { ...opts, skipRefresh: true });
        }
        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_REFRESH_KEY, AUTH_USER_KEY]);
        throw new ApiError('Сессия истекла. Войдите заново.', 401, 'UNAUTHORIZED');
    }

    if (!res.ok) {
        let message = `HTTP ${res.status}`;
        let code: string | undefined;
        try {
            const err = await res.json();
            message = err.detail || err.message || err.error || message;
            code = err.code;
        } catch {
            // не JSON — оставим HTTP-код
        }
        throw new ApiError(message, res.status, code);
    }

    if (res.status === 204) return undefined as unknown as T;
    return res.json() as Promise<T>;
}

function normalizeApiBaseUrl(input: string) {
    const trimmed = input.replace(/\/+$/, '');
    return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
}

async function refreshAccessToken(): Promise<boolean> {
    const refresh = await AsyncStorage.getItem(AUTH_REFRESH_KEY);
    if (!refresh) return false;

    try {
        const res = await fetch(`${BASE_URL}/auth/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ refresh }),
        });
        if (!res.ok) return false;
        const json = await res.json();
        if (!json.access) return false;
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, json.access);
        return true;
    } catch {
        return false;
    }
}
