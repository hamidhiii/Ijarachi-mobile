// Rental domain types for booking, transfer method, and chat cards.

export type UserRole = 'owner' | 'renter';

export type DeliveryMethod = 'pickup' | 'yandex_delivery';

export type YandexDeliveryStatus =
  | 'created'
  | 'courier_assigned'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'return_scheduled'
  | 'return_in_transit'
  | 'returned';

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'in_dispute';

export interface Booking {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImage: any;
  itemPricePerDay: number;

  ownerId: string;
  ownerName: string;
  ownerVerified?: boolean;
  ownerPhone?: string;
  ownerWorkingHours?: string;

  renterId: string;
  renterName: string;
  renterVerified?: boolean;

  startDate: string;
  endDate: string;
  totalDays: number;
  rentAmount?: number;
  totalAmount: number;

  status: BookingStatus;
  deliveryMethod?: DeliveryMethod;
  deliveryLocation?: string;
  deliveryAddress?: string;
  deliveryComment?: string;
  deliveryPrice?: number;

  pickupDistrict?: string;
  pickupAddress?: string;

  yandexOrderId?: string;
  yandexStatus?: YandexDeliveryStatus;
  yandexEtaMinutes?: number;

  createdAt: string;
  confirmedAt?: string;
  activatedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  disputeOpenedAt?: string;
  disputeReason?: string;
}

export type MessageType = 'text' | 'rental_request';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  text?: string;
  bookingId?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: any;
    isVerified?: boolean;
  }[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}
