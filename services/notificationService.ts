import { apiRequest, MOCK_MODE } from '../api/client';

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    type: 'booking' | 'system' | 'chat';
}

const MOCK_NOTIFICATIONS: AppNotification[] = [
    {
        id: '1',
        title: 'Новое бронирование',
        message: 'Ваше свадебное платье забронировали на 15-17 апреля.',
        time: '5 мин назад',
        isRead: false,
        type: 'booking',
    },
    {
        id: '2',
        title: 'Верификация MyID',
        message: 'Личность подтверждена. Теперь рядом с вашим профилем появится зелёная галочка.',
        time: '2 часа назад',
        isRead: true,
        type: 'system',
    },
    {
        id: '3',
        title: 'Новое сообщение',
        message: 'Алина: "Здравствуйте! Подскажите, какой длины шлейф?"',
        time: 'Вчера',
        isRead: true,
        type: 'chat',
    },
];

export async function getNotifications(): Promise<AppNotification[]> {
    if (MOCK_MODE) {
        await delay(150);
        return MOCK_NOTIFICATIONS;
    }
    const response = await apiRequest<any>('GET', '/notifications/');
    return readList(response).map(mapNotification);
}

export async function markNotificationRead(id: string): Promise<void> {
    if (MOCK_MODE) {
        await delay(100);
        return;
    }
    await apiRequest<void>('POST', `/notifications/${encodeURIComponent(id)}/read/`);
}

function readList(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.results)) return response.results;
    if (Array.isArray(response?.items)) return response.items;
    return [];
}

function mapNotification(raw: any): AppNotification {
    const createdAt = raw.created_at ?? raw.createdAt;
    return {
        id: String(raw.id),
        title: raw.title ?? typeTitle(raw.type),
        message: raw.message ?? raw.body ?? raw.text ?? '',
        time: raw.time ?? formatRelative(createdAt),
        isRead: Boolean(raw.is_read ?? raw.isRead ?? raw.read),
        type: normalizeType(raw.type),
    };
}

function normalizeType(type: string): AppNotification['type'] {
    if (type === 'booking' || type === 'deal' || type === 'rental') return 'booking';
    if (type === 'chat' || type === 'message') return 'chat';
    return 'system';
}

function typeTitle(type: string) {
    const normalized = normalizeType(type);
    if (normalized === 'booking') return 'Бронирование';
    if (normalized === 'chat') return 'Сообщение';
    return 'Уведомление';
}

function formatRelative(input?: string) {
    if (!input) return '';
    const diffMs = Date.now() - new Date(input).getTime();
    const minutes = Math.max(1, Math.round(diffMs / 60000));
    if (minutes < 60) return `${minutes} мин назад`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;
    const days = Math.round(hours / 24);
    return `${days} дн. назад`;
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
