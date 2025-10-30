// File: app/_layout.tsx (Đã gộp)

import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';

// Component Layout riêng để kiểm tra loading và điều hướng
function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isLoggedIn, loading } = useAuth();

  // 1. Giữ lại Màn hình Chờ (Loading)
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // 2. Giữ lại Logic Xác thực (Auth)
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    
    if (!isLoggedIn && !inAuthGroup) {
      // Nếu chưa đăng nhập VÀ không ở trong nhóm (auth), đẩy về login
      router.replace('/(auth)/login');
    } else if (isLoggedIn && inAuthGroup) {
      // Nếu đã đăng nhập VÀ đang ở trong nhóm (auth), đẩy về trang chủ
      router.replace('/');
    }
  }, [isLoggedIn, segments]);

  // 3. Kết hợp TẤT CẢ các màn hình từ cả hai nhánh
  return (
    <Stack>
      {/* Các màn hình từ nhánh 'main' và 'HEAD' */}
      <Stack.Screen name="index" options={{ title: 'Trang Chủ' }} />
      <Stack.Screen name="product/[id]" options={{ title: 'Chi Tiết Sản Phẩm' }} />
      <Stack.Screen name="favorites" options={{ title: 'Sản Phẩm Yêu Thích' }} />
      
      {/* Các màn hình từ nhánh 'HEAD' (Giỏ hàng) */}
      <Stack.Screen name="cart" options={{ title: 'Giỏ hàng' }} />
      <Stack.Screen name="checkout" options={{ title: 'Thanh toán' }} />
      <Stack.Screen name="order-success" options={{ title: 'Thành công' }} />
      <Stack.Screen name="orders" options={{ title: 'Đơn hàng' }} />

      {/* Nhóm (auth) từ nhánh 'main' */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

// 4. Giữ nguyên cấu trúc Provider
export default function RootLayout() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <RootLayoutNav />
      </FavoritesProvider>
    </AuthProvider>
  );
}