export type CategoryType = 'size' | 'quantity';

export interface ListingSeller {
    id: string;
    name: string;
    role: string;
}

export interface Listing {
    id: string;
    title: string;
    price: string;
    priceNum: number;
    category: string;
    categoryType: CategoryType;
    location: string;
    image: any;
    description: string;
    seller: ListingSeller;
    availableSizes?: string[];
    maxQuantity?: number;
    unit?: string;
    rating: number;
    reviewCount: number;
    blockedDates?: string[];
}
