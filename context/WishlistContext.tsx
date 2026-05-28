import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_MODE } from '../api/client';
import { getFavorites, addFavorite, removeFavorite } from '../services/favoriteService';

const WISHLIST_STORAGE_KEY = 'wishlist';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    const loadWishlist = async () => {
      let localWishlist: string[] = [];
      try {
        const saved = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
        localWishlist = saved ? JSON.parse(saved) : [];
        setWishlist(localWishlist);
      } catch {
        await AsyncStorage.removeItem(WISHLIST_STORAGE_KEY);
      }

      if (!MOCK_MODE) {
        getFavorites()
          .then(async serverWishlist => {
            setWishlist(serverWishlist);
            await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(serverWishlist));
          })
          .catch(() => setWishlist(localWishlist));
      }
    };
    loadWishlist();
  }, []);

  const toggleWishlist = useCallback(async (id: string) => {
    setWishlist(prev => {
      const wasFavorite = prev.includes(id);
      const next = wasFavorite
        ? prev.filter(item => item !== id)
        : [...prev, id];
      AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      const sync = wasFavorite ? removeFavorite(id) : addFavorite(id);
      sync.catch(() => {});
      return next;
    });
  }, []);

  const isInWishlist = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
