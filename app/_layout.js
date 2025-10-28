import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext'; // 1. IMPORT
import { FavoritesProvider } from '../context/FavoritesContext'; // 2. IMPORT

// Tạo một component Layout riêng để kiểm tra loading
function RootLayoutNav() {
  const { loading } = useAuth();

  // Nếu context đang load token từ storage, hiển thị màn hình chờ
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Khi load xong, hiển thị Stack Navigator
  return (
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Trang Chủ' }} />
        <Stack.Screen name="product/[id]" options={{ title: 'Chi Tiết Sản Phẩm' }} />
        <Stack.Screen name="favorites" options={{ title: 'Sản Phẩm Yêu Thích' }} />
        <Stack.Screen name="login" options={{ title: 'Đăng Nhập' }} />
        {/* Thêm các màn hình khác của bạn ở đây (register, profile...) */}
      </Stack>
  );
}


export default function RootLayout() {
  return (
    // 3. BỌC AuthProvider ngoài cùng
    <AuthProvider>
      {/* 4. BỌC FavoritesProvider bên trong */}
      <FavoritesProvider> 
        <RootLayoutNav />
      </FavoritesProvider>
    </AuthProvider>
  );
}