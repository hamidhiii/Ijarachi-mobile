/**
 * Rentoo design tokens.
 * Используется практически во всех экранах: импорт
 *   `import { Colors } from '@/constants/Colors'` (или `../../constants/Colors`).
 *
 * Палитра подобрана под rental-marketplace: доверие (deep navy) + энергия (amber accent),
 * нейтралы для фона и текста — мягкие, не «больничные».
 */

export const Colors = {
    // Бренд
    primary: '#0F172A',        // deep navy — основной цвет (шапки, кнопки)
    primaryDark: '#020617',
    primarySoft: '#1E293B',    // темнее фон/тени
    accent: '#F59E0B',         // amber — кнопка «арендовать», важные CTA
    accentSoft: '#FEF3C7',
    secondary: '#E0F2FE',      // активная категория
    secondaryDark: '#BAE6FD',

    // Фон и поверхности
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceMuted: '#F8FAFC',
    surfaceStrong: '#F1F5F9',
    white: '#FFFFFF',

    // Текст
    text: '#0F172A',
    textMuted: '#64748B',
    textSubtle: '#94A3B8',

    // Системные
    border: '#F1F5F9',
    borderStrong: '#E2E8F0',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#0EA5E9',
};

export const Radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    pill: 999,
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const FontSize = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    display: 32,
};

export const FontWeight = {
    regular: '500' as const,
    semi: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
    black: '900' as const,
};

export const Shadow = {
    sm: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
    },
    lg: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
    },
};
