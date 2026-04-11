import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WishlistContext = createContext<any>(null);

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

export const useWishlist = () => useContext(WishlistContext);