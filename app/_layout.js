// File: app/_layout.tsx

import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

// 1. IMPORTS: Đã kết hợp import từ cả hai nhánh
import { AuthProvider, useAuth } from '../contexts/AuthContext'; // Giả sử dùng đường dẫn 'contexts' của 'main'
import { FavoritesProvider } from '../contexts/FavoritesContext'; // Thêm Provider từ 'HEAD'

// Tạo một component Layout riêng để kiểm tra loading và điều hướng
function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isLoggedIn, loading } = useAuth();

  // 2. LOADING: Lấy logic màn hình chờ từ nhánh 'HEAD'
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // 3. AUTH LOGIC: Lấy logic điều hướng tự động từ nhánh 'main'
  useEffect(() => {
    // Không cần 'if (loading) return;' vì đã xử lý ở trên
    const inAuthGroup = segments[0] === '(auth)';
    
    if (!isLoggedIn && !inAuthGroup) {
      // Nếu chưa đăng nhập VÀ không ở trong nhóm (auth), đẩy về login
      router.replace('/(auth)/login');
    } else if (isLoggedIn && inAuthGroup) {
      // Nếu đã đăng nhập VÀ đang ở trong nhóm (auth), đẩy về trang chủ
      router.replace('/');
    }
  }, [isLoggedIn, segments]); // Bỏ 'loading' khỏi dependency array

  // 4. STACK: Kết hợp các màn hình từ cả hai nhánh
  return (
    <Stack>
      {/* Các màn hình chính (từ 'HEAD' và 'main') */}
      <Stack.Screen name="index" options={{ title: 'Trang Chủ' }} />
      <Stack.Screen name="product/[id]" options={{ title: 'Chi Tiết Sản Phẩm' }} />
      <Stack.Screen name="favorites" options={{ title: 'Sản Phẩm Yêu Thích' }} />
      
      {/* Nhóm (auth) để chứa các màn hình đăng nhập/đăng ký (từ 'main') */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      
      {/* Màn hình 'login' từ 'HEAD' không cần ở đây
          vì nó nên nằm trong file (auth)/login.tsx */}
    </Stack>
  );
}

// 5. PROVIDERS: Bọc các provider từ cả hai nhánh
export default function RootLayout() {
  return (
    // 'AuthProvider' từ 'main'
    <AuthProvider>
      {/* 'FavoritesProvider' từ 'HEAD' lồng bên trong */}
      <FavoritesProvider>
        <RootLayoutNav />
      </FavoritesProvider>
    </AuthProvider>
  );
}