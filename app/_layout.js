import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isLoggedIn, loading } = useAuth();

  // TẠM THỜI BỎ QUA AUTHENTICATION ĐỂ TEST CHỨC NĂNG MUA HÀNG
  // useEffect(() => {
  //   if (loading) return;

  //   const inAuthGroup = segments[0] === '(auth)';
    
  //   if (!isLoggedIn && !inAuthGroup) {
  //     router.replace('/(auth)/login');
  //   } else if (isLoggedIn && inAuthGroup) {
  //     router.replace('/');
  //   }
  // }, [isLoggedIn, loading, segments]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Trang Chủ', headerShown: false }} />
      <Stack.Screen name="cart" options={{ title: 'Giỏ hàng', headerShown: false }} />
      <Stack.Screen name="checkout" options={{ title: 'Thanh toán', headerShown: false }} />
      <Stack.Screen name="order-success" options={{ title: 'Thành công', headerShown: false }} />
      <Stack.Screen name="orders" options={{ title: 'Đơn hàng', headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
