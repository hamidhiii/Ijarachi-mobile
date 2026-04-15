// Все размеры одежды для категории 'dresses' и 'suits'
export const CLOTHING_SIZES_LETTER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
export const CLOTHING_SIZES_NUMERIC = ['38', '40', '42', '44', '46', '48', '50', '52', '54', '56'];
export const ALL_CLOTHING_SIZES = [...CLOTHING_SIZES_LETTER, ...CLOTHING_SIZES_NUMERIC];

// Категории которые используют РАЗМЕРЫ (а не количество)
export const CLOTHING_CATEGORIES = ['dresses', 'suits', 'costumes', 'national_dress'];
