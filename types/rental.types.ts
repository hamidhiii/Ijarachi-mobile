// ─── Rental Types ────────────────────────────────────────────────────────────
// Все типы, связанные с арендой, бронированием и фотопротоколом.
// Когда будет подключён реальный API — меняем только сервис, компоненты не трогаем.

export type UserRole = 'owner' | 'renter';

export type BookingStatus =
  | 'pending_payment'      // Оплата ещё не прошла
  | 'pending_handover'     // Ожидание передачи (владелец должен сфотографировать)
  | 'pending_renter_confirm' // Владелец сфоткал, ждём подтверждения арендатора
  | 'active'               // Аренда идёт (обе стороны подтвердили)
  | 'pending_return'       // Арендатор инициировал возврат, ждём фото
  | 'pending_owner_confirm'// Арендатор вернул, ждём владельца
  | 'completed'            // Завершено успешно, деньги разморожены
  | 'in_dispute'           // Открыт спор
  | 'moderating'           // Модератор рассматривает спор
  | 'cancelled';           // Отменено

// Тип снимка — для подсказок при съёмке
export type PhotoShotType =
  | 'overview_1'    // Общий вид с угла 1
  | 'overview_2'    // Общий вид с угла 2
  | 'close_up'      // Крупный план основного элемента / дефектов
  | 'label'         // Бирка / серийный номер
  | 'with_person';  // На фоне владельца / арендатора

// Фаза протокола
export type ProtocolPhase = 'handover_owner' | 'handover_renter' | 'return_renter' | 'dispute';

export interface ProtocolPhoto {
  id: string;
  uri: string;           // Локальный URI или URL с сервера
  shotType: PhotoShotType;
  phase: ProtocolPhase;
  timestamp: string;     // ISO 8601
  gpsLat?: number;
  gpsLng?: number;
  hash: string;          // SHA-256 хэш файла (заглушка на MVP)
}

export interface DisputeEvidence {
  id: string;
  authorRole: UserRole;
  photoUris: string[];
  comment: string;
  uploadedAt: string;
}

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

  // Фотопротокол
  ownerHandoverPhotos: ProtocolPhoto[];  // Фото владельца при передаче
  renterHandoverPhotos: ProtocolPhoto[]; // Фото арендатора при получении
  renterReturnPhotos: ProtocolPhoto[];   // Фото арендатора при возврате
  disputeEvidence: DisputeEvidence[];

  // Временные метки
  createdAt: string;
  handoverConfirmedAt?: string;
  renterConfirmedAt?: string;
  returnInitiatedAt?: string;
  ownerConfirmedAt?: string;
  completedAt?: string;
  disputeOpenedAt?: string;
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
