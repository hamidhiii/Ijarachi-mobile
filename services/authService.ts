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
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[AUTH] OTP for ${phone}: ${code}`);
    await _delay(800);
    return true;
}

/** ПРОВЕРИТЬ OTP код */
export async function verifyOTP(phone: string, code: string): Promise<{ user: User; token: string }> {
    console.log(`[Auth] Verifying OTP ${code} for ${phone}`);
    await _delay(1000);
    return {
        user: MOCK_USER,
        token: 'mock_jwt_token_for_ijarachi',
    };
}

/** РЕГИСТРАЦИЯ */
export async function register(userData: Partial<User>): Promise<{ user: User; token: string }> {
    console.log(`[Auth] Registering user ${userData.phone}`);
    await _delay(1000);
    return {
        user: { ...MOCK_USER, ...userData } as User,
        token: 'mock_jwt_token_for_ijarachi',
    };
}

/** ВЫЙТИ */
export async function logout(): Promise<void> {
    await _delay(300);
}

function _delay(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}
