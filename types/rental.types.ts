// ─── Rental Types ────────────────────────────────────────────────────────────
// Все типы, связанные с арендой и бронированием.
// Физическую передачу вещей обеспечивают курьеры Rentoo (для одежды)
// или выездная бригада (для мебели/техники) — поэтому никакого фотопротокола
// от пользователя не требуется.

export type UserRole = 'owner' | 'renter';

export type BookingStatus =
  | 'pending_payment'       // Оплата ещё не прошла (промежуточное)
  | 'confirmed'             // Оплачено, курьер Rentoo назначен
  | 'active'                // Вещь у арендатора, аренда идёт
  | 'completed'             // Завершено успешно
  | 'cancelled'             // Отменено
  | 'in_dispute';           // Спор (на модерации Rentoo)

export interface Booking {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImage: any;             // require(...) или URL
  itemPricePerDay: number;    // В сумах

  ownerId: string;
  ownerName: string;

  renterId: string;
  renterName: string;

  startDate: string;          // YYYY-MM-DD
  endDate: string;            // YYYY-MM-DD
  totalDays: number;
  totalAmount: number;        // В сумах

  status: BookingStatus;

  // Временные метки
  createdAt: string;
  confirmedAt?: string;       // Момент, когда курьер назначен
  activatedAt?: string;       // Курьер передал вещь арендатору
  completedAt?: string;       // Курьер забрал вещь обратно
  cancelledAt?: string;
  disputeOpenedAt?: string;
  disputeReason?: string;
}

// ─── Chat Types ─────────────────────────────────────────────────────────────

export type MessageType = 'text' | 'rental_request';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  text?: string;
  bookingId?: string; // Для сообщений типа rental_request
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: any;
  }[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}
