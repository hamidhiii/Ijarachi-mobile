export type CategoryType = 'size' | 'quantity';

export interface ListingCharacteristic {
    label: string;
    value: string;
}

export interface ListingSeller {
    id: string;
    name: string;
    role: string;
    isVerified?: boolean;
    phone?: string;
    district?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    workingHours?: string;
}

export interface Listing {
    id: string;
    title: string;
    price: string;
    priceNum: number;
    deposit?: string;
    depositNum?: number;
    category: string;
    categoryType: CategoryType;
    location: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    image: { uri: string } | number;
    images?: ({ uri: string } | number)[];
    description: string;
    tags?: string[];
    characteristics?: ListingCharacteristic[];
    seller: ListingSeller;
    availableSizes?: string[];
    maxQuantity?: number;
    unit?: string;
    minRentalDays?: number;
    moderationStatus?: 'draft' | 'pending' | 'approved' | 'rejected';
    rating: number;
    reviewCount: number;
    blockedDates?: string[];
}
