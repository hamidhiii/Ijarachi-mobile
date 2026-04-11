import { MOCK_BOOKINGS } from '../mocks/bookings';
import { Booking, DisputeEvidence, PhotoShotType, ProtocolPhase, ProtocolPhoto } from '../types/rental.types';

// ─── Rental Service ───────────────────────────────────────────────────────────
// API-ready сервис. Все методы возвращают Promise.
// Замените тела функций на реальные fetch/axios вызовы при подключении бэкенда.

// В памяти (имитация базы) — для тестирования
let _bookings: Booking[] = [...MOCK_BOOKINGS];

// ── Утилиты ──────────────────────────────────────────────────────────────────

function generateId(): string {
    return Math.random().toString(36).slice(2, 10);
}

function generatePhotoHash(uri: string): string {
    // На MVP — просто имитация хэша. На реальном API — SHA-256 файла.
    return `sha256_${generateId()}_${Date.now()}`;
}

// ── Методы ───────────────────────────────────────────────────────────────────

/** Список бронирований пользователя */
export async function getBookings(userId: string): Promise<Booking[]> {
    await _delay(300);
    return _bookings.filter(
        (b) => b.ownerId === userId || b.renterId === userId
    );
}

/** Детали одного бронирования */
export async function getBookingById(id: string): Promise<Booking | null> {
    await _delay(200);
    return _bookings.find((b) => b.id === id) ?? null;
}

/** Обновить статус бронирования вручную (например, из чата) */
export async function updateBookingStatus(
    id: string,
    status: Booking['status']
): Promise<Booking> {
    await _delay(300);
    return _updateBooking(id, { status });
}

/**
 * Создать новое бронирование после оплаты.
 * На реальном API: POST /bookings → возвращает { id, ... }
 */
export async function createBooking(
    data: Omit<Booking, 'id' | 'createdAt'>
): Promise<Booking> {
    await _delay(300);
    const booking: Booking = {
        ...data,
        id: `booking_${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    _bookings = [..._bookings, booking];
    return booking;
}

/**
 * Загружает фото протокола.
 * На реальном API — multipart upload → S3/Cloudflare R2.
 */
export async function uploadProtocolPhoto(
    bookingId: string,
    phase: ProtocolPhase,
    photoUri: string,
    shotType: PhotoShotType
): Promise<ProtocolPhoto> {
    await _delay(500);

    const photo: ProtocolPhoto = {
        id: generateId(),
        uri: photoUri,
        shotType,
        phase,
        timestamp: new Date().toISOString(),
        // GPS — заглушка; на реальном API использовать expo-location
        gpsLat: 41.299496 + (Math.random() - 0.5) * 0.01,
        gpsLng: 69.240073 + (Math.random() - 0.5) * 0.01,
        hash: generatePhotoHash(photoUri),
    };

    _bookings = _bookings.map((b) => {
        if (b.id !== bookingId) return b;
        switch (phase) {
            case 'handover_owner':
                return { ...b, ownerHandoverPhotos: [...b.ownerHandoverPhotos, photo] };
            case 'handover_renter':
                return { ...b, renterHandoverPhotos: [...b.renterHandoverPhotos, photo] };
            case 'return_renter':
                return { ...b, renterReturnPhotos: [...b.renterReturnPhotos, photo] };
            default:
                return b;
        }
    });

    return photo;
}

/**
 * Владелец подаёт фото и подтверждает передачу.
 * Статус: pending_handover → pending_renter_confirm
 */
export async function submitOwnerHandover(bookingId: string): Promise<Booking> {
    await _delay(400);
    return _updateBooking(bookingId, {
        status: 'pending_renter_confirm',
        handoverConfirmedAt: new Date().toISOString(),
    });
}

/**
 * Арендатор осматривает вещь и подтверждает получение + загружает свои фото.
 * Статус: pending_renter_confirm → active
 */
export async function submitRenterHandoverConfirm(bookingId: string): Promise<Booking> {
    await _delay(400);
    return _updateBooking(bookingId, {
        status: 'active',
        renterConfirmedAt: new Date().toISOString(),
    });
}

/**
 * Арендатор загружает фото и инициирует возврат.
 * Статус: active → pending_owner_confirm
 */
export async function submitReturn(bookingId: string): Promise<Booking> {
    await _delay(400);
    return _updateBooking(bookingId, {
        status: 'pending_owner_confirm',
        returnInitiatedAt: new Date().toISOString(),
    });
}

/**
 * Владелец подтверждает: всё в порядке.
 * Статус: pending_owner_confirm → completed
 */
export async function confirmReturnOk(bookingId: string): Promise<Booking> {
    await _delay(400);
    return _updateBooking(bookingId, {
        status: 'completed',
        ownerConfirmedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
    });
}

/**
 * Владелец открывает спор.
 * Статус: pending_owner_confirm → in_dispute
 */
export async function openDispute(bookingId: string): Promise<Booking> {
    await _delay(400);
    return _updateBooking(bookingId, {
        status: 'in_dispute',
        disputeOpenedAt: new Date().toISOString(),
    });
}

/**
 * Добавить доказательства в спор (от любой стороны).
 */
export async function addDisputeEvidence(
    bookingId: string,
    evidence: Omit<DisputeEvidence, 'id' | 'uploadedAt'>
): Promise<Booking> {
    await _delay(500);
    const newEvidence: DisputeEvidence = {
        ...evidence,
        id: generateId(),
        uploadedAt: new Date().toISOString(),
    };
    return _updateBooking(bookingId, (b) => ({
        disputeEvidence: [...b.disputeEvidence, newEvidence],
        status: 'moderating' as const,
    }));
}

// ── Приватные хэлперы ─────────────────────────────────────────────────────────

function _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function _updateBooking(
    id: string,
    patch: Partial<Booking> | ((b: Booking) => Partial<Booking>)
): Booking {
    let updated: Booking | undefined;
    _bookings = _bookings.map((b) => {
        if (b.id !== id) return b;
        const changes = typeof patch === 'function' ? patch(b) : patch;
        updated = { ...b, ...changes };
        return updated;
    });
    if (!updated) throw new Error(`Booking ${id} not found`);
    return updated;
}
