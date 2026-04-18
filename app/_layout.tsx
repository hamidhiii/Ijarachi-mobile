import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

export default function RootLayout() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="checkout/Summary" />
          <Stack.Screen name="checkout/Payment" />
          <Stack.Screen name="auth/login" options={{ animation: 'fade' }} />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="auth/verify" />
          <Stack.Screen name="auth/myid" />
          <Stack.Screen name="chat/[id]" />
          <Stack.Screen name="seller/[id]" />
          <Stack.Screen name="notifications/index" />
          <Stack.Screen name="my-listings/index" />
          <Stack.Screen name="my-listings/[id]/edit" />
          <Stack.Screen name="profile/edit" />
          <Stack.Screen name="profile/settings" />
        </Stack>
      </WishlistProvider>
    </AuthProvider>
  );
}
