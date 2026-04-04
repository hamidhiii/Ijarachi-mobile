import { Stack } from 'expo-router';

export default function RootLayout() {
  // Мы убрали useEffect с редиректом. Теперь вход свободный.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="product/[id]" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
      <Stack.Screen name="auth/verify" />
    </Stack>
  );
}