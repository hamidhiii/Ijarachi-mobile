export interface User {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
    isPinflVerified: boolean;
    rating: number;
    reviewCount: number;
    createdAt: string;
}
