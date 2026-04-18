import { apiRequest, MOCK_MODE } from '../api/client';
import { MOCK_BOOKINGS } from '../mocks/bookings';
import { Booking, BookingStatus } from '../types/rental.types';

// ─── Rental Service ──────────────────────────────────────────────────────────
// Упрощённая модель: физической передачей вещей занимаются курьеры Rentoo,
// поэтому пользователь не загружает фото и не подтверждает приёмку.
// Бронирование:   pending_payment → confirmed → active → completed
//                                                     ↘ cancelled / in_dispute
//
// Предполагаемые эндпоинты:
//   GET    /users/:userId/bookings
//   GET    /bookings/:id
//   POST   /bookings                 — создать (из Payment)
//   PATCH  /bookings/:id/status      — сменить статус (курьер / модерация)
//   POST   /bookings/:id/dispute     — открыть спор

// В памяти (имитация базы)
let _bookings: Booking[] = [...MOCK_BOOKINGS];

/** Список бронирований пользователя */
export async function getBookings(userId: string): Promise<Booking[]> {
    if (!MOCK_MODE) {
        return apiRequest<Booking[]>('GET', `/users/${encodeURIComponent(userId)}/bookings`);
    }
    await _delay(300);
    return _bookings.filter(b => b.ownerId === userId || b.renterId === userId);
}

/** Детали одного бронирования */
export async function getBookingById(id: string): Promise<Booking | null> {
    if (!MOCK_MODE) {
        return apiRequest<Booking>('GET', `/bookings/${encodeURIComponent(id)}`);
    }
    await _delay(200);
    return _bookings.find(b => b.id === id) ?? null;
}

/** Обновить статус (обычно вызывается бэкендом/курьером) */
export async function updateBookingStatus(
    id: string,
    status: BookingStatus
): Promise<Booking> {
    if (!MOCK_MODE) {
        return apiRequest<Booking>('PATCH', `/bookings/${encodeURIComponent(id)}/status`, { status });
    }
    await _delay(200);
    return _updateBooking(id, { status });
}

/**
 * Создать новое бронирование после оплаты.
 * Статус сразу `confirmed` — владелец получает уведомление, курьер назначается.
 */
export async function createBooking(
    data: Omit<Booking, 'id' | 'createdAt' | 'status'> & { status?: BookingStatus }
): Promise<Booking> {
    if (!MOCK_MODE) {
        return apiRequest<Booking>('POST', '/bookings', data);
    }
    await _delay(300);
    const booking: Booking = {
        ...data,
        id: `booking_${Date.now()}`,
        status: data.status ?? 'confirmed',
        createdAt: new Date().toISOString(),
        confirmedAt: new Date().toISOString(),
    };
    _bookings = [booking, ..._bookings];
    return booking;
}

/** Отменить бронирование */
export async function cancelBooking(id: string): Promise<Booking> {
    if (!MOCK_MODE) {
        return apiRequest<Booking>('POST', `/bookings/${encodeURIComponent(id)}/cancel`);
    }
    await _delay(200);
    return _updateBooking(id, { status: 'cancelled', cancelledAt: new Date().toISOString() });
}

/** Открыть спор */
export async function openDispute(id: string, reason: string): Promise<Booking> {
    if (!MOCK_MODE) {
        return apiRequest<Booking>('POST', `/bookings/${encodeURIComponent(id)}/dispute`, { reason });
    }
    await _delay(300);
    return _updateBooking(id, {
        status: 'in_dispute',
        disputeOpenedAt: new Date().toISOString(),
        disputeReason: reason,
    });
}

// ── Приватные хэлперы ─────────────────────────────────────────────────────────

function _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function _updateBooking(id: string, patch: Partial<Booking>): Booking {
    let updated: Booking | undefined;
    _bookings = _bookings.map(b => {
        if (b.id !== id) return b;
        updated = { ...b, ...patch };
        return updated;
    });
    if (!updated) throw new Error(`Booking ${id} not found`);
    return updated;
}
