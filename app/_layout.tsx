import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="checkout/Summary" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="auth/verify" />
          <Stack.Screen name="protocol/handover/[bookingId]" />
          <Stack.Screen name="protocol/return/[bookingId]" />
          <Stack.Screen name="protocol/dispute/[bookingId]" />
          <Stack.Screen name="protocol/success/[bookingId]" />
        </Stack>
      </WishlistProvider>
    </AuthProvider>
  );
}