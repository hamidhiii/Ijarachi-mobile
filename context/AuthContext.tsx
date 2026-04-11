import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    isLoggedIn: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ijarachi_auth_session';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const session = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
            if (session) {
                const { timestamp } = JSON.parse(session);
                const now = Date.now();

                // ЛОГИКА ДЛЯ ТЕСТА: Забывать через 24 часа
                if (now - timestamp > ONE_DAY_MS) {
                    console.log('[Auth] Session expired (24h test logic)');
                    await logout();
                } else {
                    setIsLoggedIn(true);
                }
            }
        } catch (e) {
            console.error('Failed to load auth session', e);
        } finally {
            setLoading(false);
        }
    };

    const login = async () => {
        const session = { timestamp: Date.now() };
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
        setIsLoggedIn(true);
    };

    const logout = async () => {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
