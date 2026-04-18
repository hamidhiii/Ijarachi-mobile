import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../api/client';
import * as authService from '../services/authService';
import { User } from '../types/user.types';

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    login: (phone: string, otp: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (patch: Partial<User>) => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            const userData = await AsyncStorage.getItem(AUTH_USER_KEY);

            if (token && userData) {
                setUser(JSON.parse(userData));
                setIsLoggedIn(true);
            }
        } catch (e) {
            console.error('Failed to load auth session', e);
        } finally {
            setLoading(false);
        }
    };

    const login = async (phone: string, otp: string) => {
        const { user: userData, token } = await authService.verifyOTP(phone, otp);
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        setUser(userData);
        setIsLoggedIn(true);
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (e) {
            console.warn('logout API failed, clearing session anyway', e);
        }
        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
        setUser(null);
        setIsLoggedIn(false);
    };

    const updateUser = async (patch: Partial<User>) => {
        setUser(prev => {
            const next = prev ? { ...prev, ...patch } : prev;
            if (next) AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(next)).catch(() => {});
            return next;
        });
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout, updateUser, loading }}>
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
