import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, AUTH_REFRESH_KEY, MOCK_MODE } from '../api/client';
import { User } from '../types/user.types';

// Мок текущего пользователя
export const MOCK_USER: User = {
    id: 'user_me',
    name: 'Хамидулло',
    phone: '+998 90 123 45 67',
    isPinflVerified: false,
    rating: 4.7,
    reviewCount: 3,
    createdAt: new Date().toISOString(),
};

/** ОТПРАВИТЬ OTP код */
export async function sendOTP(phone: string): Promise<boolean> {
    if (MOCK_MODE) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        if (__DEV__) console.log(`[AUTH mock] OTP for ${phone}: ${code}`);
        await _delay(800);
        return true;
    }
    await apiRequest<{ ok: boolean }>('POST', '/auth/sms/send/', { phone });
    return true;
}

/** ПРОВЕРИТЬ OTP код */
export async function verifyOTP(
    phone: string,
    code: string
): Promise<{ user: User; token: string; refreshToken?: string }> {
    if (MOCK_MODE) {
        if (__DEV__) console.log(`[AUTH mock] Verifying OTP ${code} for ${phone}`);
        await _delay(800);
        return {
            user: { ...MOCK_USER, phone },
            token: 'mock_jwt_token_rentoo',
            refreshToken: 'mock_refresh_token_rentoo',
        };
    }
    const response = await apiRequest<{
        user?: any;
        access?: string;
        token?: string;
        refresh?: string;
        refreshToken?: string;
    }>(
        'POST',
        '/auth/login/',
        { phone, code }
    );
    return normalizeAuthResponse(response, phone);
}

/** РЕГИСТРАЦИЯ */
export async function register(
    userData: Partial<User>
): Promise<{ user: User; token: string; refreshToken?: string }> {
    if (MOCK_MODE) {
        if (__DEV__) console.log(`[AUTH mock] Registering user ${userData.phone}`);
        await _delay(800);
        return {
            user: { ...MOCK_USER, ...userData } as User,
            token: 'mock_jwt_token_rentoo',
            refreshToken: 'mock_refresh_token_rentoo',
        };
    }
    const response = await apiRequest<{
        user?: any;
        access?: string;
        token?: string;
        refresh?: string;
        refreshToken?: string;
    }>(
        'POST',
        '/auth/register/',
        { phone: userData.phone }
    );
    return normalizeAuthResponse(response, userData.phone);
}

/** ВЫЙТИ */
export async function logout(): Promise<void> {
    if (MOCK_MODE) {
        await _delay(200);
        return;
    }
    try {
        const refresh = await AsyncStorage.getItem(AUTH_REFRESH_KEY);
        await apiRequest<void>('POST', '/auth/logout/', refresh ? { refresh } : undefined);
    } catch {
        // молча игнорируем — всё равно чистим локально
    }
}

/** Текущий пользователь (для refresh профиля) */
export async function getMe(): Promise<User> {
    if (MOCK_MODE) {
        await _delay(150);
        return MOCK_USER;
    }
    const profile = await apiRequest<any>('GET', '/profile/');
    return normalizeUser(profile);
}

export async function updateProfile(patch: Partial<User>): Promise<User> {
    if (MOCK_MODE) {
        await _delay(150);
        return { ...MOCK_USER, ...patch };
    }
    const profile = await apiRequest<any>('PATCH', '/profile/', {
        full_name: patch.name,
    });
    return normalizeUser(profile);
}

export async function getVerificationStatus(): Promise<boolean> {
    if (MOCK_MODE) {
        await _delay(150);
        return MOCK_USER.isPinflVerified;
    }
    const response = await apiRequest<any>('GET', '/users/me/verification/');
    return Boolean(response.is_verified_myid ?? response.is_verified ?? response.verified);
}

export async function startMyIdVerification(): Promise<{ url?: string; state?: string }> {
    if (MOCK_MODE) {
        await _delay(400);
        return { url: undefined, state: 'mock-myid-state' };
    }
    const response = await apiRequest<any>('POST', '/myid/start/');
    return {
        url: response.url || response.auth_url || response.authorization_url || response.redirect_url,
        state: response.state,
    };
}

function normalizeAuthResponse(
    response: { user?: any; access?: string; token?: string; refresh?: string; refreshToken?: string },
    phone?: string
): { user: User; token: string; refreshToken?: string } {
    return {
        user: response.user ? normalizeUser(response.user) : { ...MOCK_USER, phone: phone || MOCK_USER.phone },
        token: response.access || response.token || '',
        refreshToken: response.refresh || response.refreshToken,
    };
}

function normalizeUser(raw: any): User {
    return {
        id: String(raw.id ?? raw.uuid ?? MOCK_USER.id),
        name: raw.full_name ?? raw.name ?? MOCK_USER.name,
        phone: raw.phone ?? MOCK_USER.phone,
        avatar: raw.avatar,
        isPinflVerified: Boolean(raw.is_verified_myid ?? raw.isPinflVerified ?? raw.is_verified),
        rating: Number(raw.rating ?? MOCK_USER.rating),
        reviewCount: Number(raw.review_count ?? raw.reviewCount ?? MOCK_USER.reviewCount),
        createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    };
}

function _delay(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}
