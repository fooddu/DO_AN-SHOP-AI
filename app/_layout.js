import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { FavoritesProvider } from '../context/FavoritesContext';

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
      {/* Màn hình chính */}
      <Stack.Screen name="index" options={{ title: 'Trang Chủ', headerShown: false }} />
      
      {/* Màn hình shopping cart (Quang Trung) */}
      <Stack.Screen name="cart" options={{ title: 'Giỏ hàng', headerShown: false }} />
      <Stack.Screen name="checkout" options={{ title: 'Thanh toán', headerShown: false }} />
      <Stack.Screen name="order-success" options={{ title: 'Thành công', headerShown: false }} />
      <Stack.Screen name="orders" options={{ title: 'Đơn hàng', headerShown: false }} />
      
      {/* Màn hình từ team */}
      <Stack.Screen name="product/[id]" options={{ title: 'Chi Tiết Sản Phẩm' }} />
      <Stack.Screen name="favorites" options={{ title: 'Sản Phẩm Yêu Thích' }} />
      
      {/* Auth screens */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <RootLayoutNav />
      </FavoritesProvider>
    </AuthProvider>
  );
}
