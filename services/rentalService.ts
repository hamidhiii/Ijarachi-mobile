import { apiRequest, MOCK_MODE } from '../api/client';
import { MOCK_BOOKINGS } from '../mocks/bookings';
import { Booking, BookingStatus } from '../types/rental.types';

// ─── Rental Service ──────────────────────────────────────────────────────────
// Упрощённая модель: пользователь выбирает самовывоз или Yandex Доставку.
// Фотопротокол передачи удалён из пользовательского сценария.
// Бронирование:   pending_payment → confirmed → active → completed
//                                                     ↘ cancelled / in_dispute
//
// Backend API из Postman collection:
//   GET    /deals/?role=renter
//   GET    /deals/list/?role=owner
//   POST   /deals/
//   GET    /deals/:id/
//   POST   /deals/:id/pay/
//   PATCH  /deals/:id/status/
//   POST   /deals/:id/confirm-return/
//   POST   /deals/:id/dispute/

// В памяти (имитация базы)
let _bookings: Booking[] = [...MOCK_BOOKINGS];

/** Список бронирований пользователя */
export async function getBookings(userId: string): Promise<Booking[]> {
    if (!MOCK_MODE) {
        const [renter, owner] = await Promise.all([
            apiRequest<any>('GET', '/deals/?role=renter'),
            apiRequest<any>('GET', '/deals/list/?role=owner').catch(() => []),
        ]);
        return [...readList(renter), ...readList(owner)].map(mapDeal);
    }
    await _delay(300);
    return _bookings.filter(b => b.ownerId === userId || b.renterId === userId);
}

/** Детали одного бронирования */
export async function getBookingById(id: string): Promise<Booking | null> {
    if (!MOCK_MODE) {
        const response = await apiRequest<any>('GET', `/deals/${encodeURIComponent(id)}/`);
        return mapDeal(response);
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
        const response = await apiRequest<any>('PATCH', `/deals/${encodeURIComponent(id)}/status/`, {
            status: toApiStatus(status),
        });
        return mapDeal(response);
    }
    await _delay(200);
    return _updateBooking(id, { status });
}

/**
 * Создать новое бронирование после оплаты.
 * Статус сразу `confirmed` — владелец получает уведомление, способ получения уже выбран.
 */
export async function createBooking(
    data: Omit<Booking, 'id' | 'createdAt' | 'status'> & { status?: BookingStatus }
): Promise<Booking> {
    if (!MOCK_MODE) {
        const response = await apiRequest<any>('POST', '/deals/', toApiDealPayload(data));
        return mapDeal(response);
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
        const response = await apiRequest<any>('PATCH', `/deals/${encodeURIComponent(id)}/status/`, { status: 'cancelled' });
        return mapDeal(response);
    }
    await _delay(200);
    return _updateBooking(id, { status: 'cancelled', cancelledAt: new Date().toISOString() });
}

/** Открыть спор */
export async function openDispute(id: string, reason: string): Promise<Booking> {
    if (!MOCK_MODE) {
        const response = await apiRequest<any>('POST', `/deals/${encodeURIComponent(id)}/dispute/`, { reason });
        return mapDeal(response);
    }
    await _delay(300);
    return _updateBooking(id, {
        status: 'in_dispute',
        disputeOpenedAt: new Date().toISOString(),
        disputeReason: reason,
    });
}

export async function confirmReturn(id: string): Promise<Booking> {
    if (!MOCK_MODE) {
        const response = await apiRequest<any>('POST', `/deals/${encodeURIComponent(id)}/confirm-return/`);
        return mapDeal(response);
    }
    await _delay(200);
    return _updateBooking(id, { status: 'completed', completedAt: new Date().toISOString() });
}

export async function startDealPayment(id: string, provider: 'click' | 'payme'): Promise<{ paymentUrl?: string; deeplink?: string }> {
    if (!MOCK_MODE) {
        const response = await apiRequest<any>('POST', `/deals/${encodeURIComponent(id)}/pay/`, { provider });
        return {
            paymentUrl: response.payment_url || response.url,
            deeplink: response.deeplink || response.deep_link,
        };
    }
    await _delay(300);
    return {};
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

function readList(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.results)) return response.results;
    if (Array.isArray(response?.items)) return response.items;
    return [];
}

function mapDeal(raw: any): Booking {
    const listing = raw.listing || raw.item || {};
    const owner = raw.owner || listing.owner || {};
    const renter = raw.renter || {};
    const deliveryMethod = raw.delivery_method === 'delivery' || raw.delivery_method === 'yandex_delivery'
        ? 'yandex_delivery'
        : 'pickup';
    const pricePerDay = Number(listing.price_per_day ?? raw.itemPricePerDay ?? 0);
    const totalDays = Number(raw.total_days ?? raw.totalDays ?? 1);
    const totalAmount = Number(raw.total_price ?? raw.totalAmount ?? raw.amount ?? 0);

    return {
        id: String(raw.id),
        itemId: String(listing.id ?? raw.item ?? raw.listing_id ?? ''),
        itemTitle: listing.title ?? raw.itemTitle ?? 'Объявление',
        itemImage: listing.photos?.[0]?.url ? { uri: listing.photos[0].url } : raw.itemImage,
        itemPricePerDay: pricePerDay,
        ownerId: String(owner.id ?? raw.owner_id ?? ''),
        ownerName: owner.full_name ?? owner.name ?? raw.ownerName ?? 'Арендодатель',
        ownerVerified: Boolean(owner.is_verified_myid ?? owner.is_verified),
        ownerPhone: owner.phone,
        ownerWorkingHours: owner.working_hours,
        renterId: String(renter.id ?? raw.renter_id ?? ''),
        renterName: renter.full_name ?? renter.name ?? raw.renterName ?? 'Арендатор',
        renterVerified: Boolean(renter.is_verified_myid ?? renter.is_verified),
        startDate: raw.start_date ?? raw.startDate,
        endDate: raw.end_date ?? raw.endDate,
        totalDays,
        rentAmount: Number(raw.rent_amount ?? raw.rentAmount ?? totalAmount),
        totalAmount,
        status: fromApiStatus(raw.status),
        deliveryMethod,
        deliveryLocation: raw.delivery_address ?? raw.deliveryLocation,
        deliveryAddress: raw.delivery_address,
        deliveryComment: raw.renter_comment ?? raw.deliveryComment,
        deliveryPrice: Number(raw.delivery_cost ?? raw.deliveryPrice ?? 0),
        pickupDistrict: raw.pickup_district ?? owner.district,
        pickupAddress: raw.pickup_address ?? owner.address,
        yandexOrderId: raw.yandex_order_id,
        yandexStatus: raw.yandex_status,
        yandexEtaMinutes: raw.yandex_eta_minutes,
        createdAt: raw.created_at ?? new Date().toISOString(),
        confirmedAt: raw.paid_at ?? raw.confirmedAt,
        activatedAt: raw.started_at ?? raw.activatedAt,
        completedAt: raw.completed_at ?? raw.completedAt,
        cancelledAt: raw.cancelled_at ?? raw.cancelledAt,
        disputeOpenedAt: raw.dispute_opened_at ?? raw.disputeOpenedAt,
        disputeReason: raw.dispute_reason ?? raw.disputeReason,
    };
}

function toApiDealPayload(data: Omit<Booking, 'id' | 'createdAt' | 'status'> & { status?: BookingStatus }) {
    return {
        item: data.itemId,
        start_date: data.startDate,
        end_date: data.endDate,
        delivery_method: data.deliveryMethod === 'yandex_delivery' ? 'delivery' : 'pickup',
        delivery_address: data.deliveryAddress || data.deliveryLocation || '',
        renter_comment: data.deliveryComment || '',
    };
}

function fromApiStatus(status: string): BookingStatus {
    if (status === 'paid') return 'confirmed';
    if (status === 'in_progress' || status === 'returned') return 'active';
    if (status === 'disputed') return 'in_dispute';
    if (status === 'draft') return 'pending_payment';
    if (status === 'completed' || status === 'cancelled' || status === 'pending_payment') return status;
    return 'confirmed';
}

function toApiStatus(status: BookingStatus) {
    if (status === 'confirmed') return 'paid';
    if (status === 'active') return 'in_progress';
    if (status === 'in_dispute') return 'disputed';
    return status;
}
