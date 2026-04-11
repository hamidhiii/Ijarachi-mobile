import { PhotoShotType } from '../types/rental.types';

// ─── Конфиги фотопротокола ────────────────────────────────────────────────────

export const PROTOCOL = {
    MIN_PHOTOS: 5,
    OWNER_CONFIRM_HOURS: 24, // Авто-подтверждение если владелец не ответил
    DISPUTE_EVIDENCE_HOURS: 48, // Срок загрузки доказательств при споре
    MODERATION_DAYS: 3, // Срок решения модератора
} as const;

// Подсказки для каждого из 5 обязательных снимков
export interface PhotoShotGuide {
    shotType: PhotoShotType;
    title: string;
    subtitle: string;
    icon: string; // Имя иконки из @expo/vector-icons (Ionicons)
}

export const PHOTO_SHOT_GUIDES: PhotoShotGuide[] = [
    {
        shotType: 'overview_1',
        title: 'Общий вид (угол 1)',
        subtitle: 'Снимите вещь целиком с одной стороны',
        icon: 'cube-outline',
    },
    {
        shotType: 'overview_2',
        title: 'Общий вид (угол 2)',
        subtitle: 'Снимите вещь целиком с другой стороны',
        icon: 'sync-outline',
    },
    {
        shotType: 'close_up',
        title: 'Крупный план',
        subtitle: 'Сфокусируйтесь на основном элементе или дефектах',
        icon: 'scan-outline',
    },
    {
        shotType: 'label',
        title: 'Бирка / серийный номер',
        subtitle: 'Бирка, маркировка или серийный номер (если есть)',
        icon: 'pricetag-outline',
    },
    {
        shotType: 'with_person',
        title: 'На фоне участника',
        subtitle: 'Вещь и вы в одном кадре — подтверждает присутствие',
        icon: 'person-outline',
    },
];
