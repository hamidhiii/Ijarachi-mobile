import { apiRequest, MOCK_MODE } from '../api/client';
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
        console.log(`[AUTH mock] OTP for ${phone}: ${code}`);
        await _delay(800);
        return true;
    }
    await apiRequest<{ ok: boolean }>('POST', '/auth/otp/send', { phone });
    return true;
}

/** ПРОВЕРИТЬ OTP код */
export async function verifyOTP(
    phone: string,
    code: string
): Promise<{ user: User; token: string; refreshToken?: string }> {
    if (MOCK_MODE) {
        console.log(`[AUTH mock] Verifying OTP ${code} for ${phone}`);
        await _delay(800);
        return {
            user: { ...MOCK_USER, phone },
            token: 'mock_jwt_token_rentoo',
        };
    }
    return apiRequest<{ user: User; token: string; refreshToken?: string }>(
        'POST',
        '/auth/otp/verify',
        { phone, code }
    );
}

/** РЕГИСТРАЦИЯ */
export async function register(
    userData: Partial<User>
): Promise<{ user: User; token: string; refreshToken?: string }> {
    if (MOCK_MODE) {
        console.log(`[AUTH mock] Registering user ${userData.phone}`);
        await _delay(800);
        return {
            user: { ...MOCK_USER, ...userData } as User,
            token: 'mock_jwt_token_rentoo',
        };
    }
    return apiRequest<{ user: User; token: string; refreshToken?: string }>(
        'POST',
        '/auth/register',
        userData
    );
}

/** ВЫЙТИ */
export async function logout(): Promise<void> {
    if (MOCK_MODE) {
        await _delay(200);
        return;
    }
    try {
        await apiRequest<void>('POST', '/auth/logout');
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
    return apiRequest<User>('GET', '/auth/me');
}

function _delay(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}
