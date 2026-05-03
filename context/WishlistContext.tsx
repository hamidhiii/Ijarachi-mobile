import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (id: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Загружаем при старте
  useEffect(() => {
    const loadWishlist = async () => {
      const saved = await AsyncStorage.getItem('wishlist');
      if (saved) setWishlist(JSON.parse(saved));
    };
    loadWishlist();
  }, []);

  const toggleWishlist = async (id: string) => {
    let newWishlist = [...wishlist];
    if (newWishlist.includes(id)) {
      newWishlist = newWishlist.filter(item => item !== id);
    } else {
      newWishlist.push(id);
    }
    setWishlist(newWishlist);
    await AsyncStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
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