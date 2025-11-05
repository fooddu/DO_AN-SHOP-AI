// [File] app/_layout.js

import { Stack } from 'expo-router';
// (Đảm bảo đường dẫn này đúng)
import { AuthProvider } from '../context/AuthContext';
// <-- 1. IMPORT FAVORITES PROVIDER
import { FavoritesProvider } from '../context/FavoritesContext';

export default function RootLayout() {
  return (
    // Bọc AuthProvider ở ngoài cùng
    <AuthProvider>
      {/* <-- 2. BỌC FAVORITESPROVIDER (BÊN TRONG AUTH) */}
      <FavoritesProvider>
        <Stack>
          {/* Nhóm (auth) và (tabs) không có header riêng */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="tabs" options={{ headerShown: false }} />
          
          {/* File index (cổng chính) cũng không có header */}
          <Stack.Screen name="index" options={{ headerShown: false }} />

          {/* Các trang con này SẼ CÓ HEADER (và nút back) */}
          <Stack.Screen 
            name="cart" 
            options={{ 
              title: 'Giỏ hàng', 
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="orders" 
            options={{ 
              title: 'Đơn hàng', 
              headerShown: false 
            }} 
          />
          
          {/* Trang chi tiết sản phẩm (header: false vì nó có header tùy chỉnh) */}
          <Stack.Screen 
            name="products/[id]" 
            options={{ 
              headerShown: false 
            }} 
          />
        <Stack.Screen 
    name="account-settings" // <-- Tên file mới (không có đuôi .js)
    options={{ 
        headerShown: false // Để sử dụng header tùy chỉnh bên trong file
    }} 
/>
        </Stack>
      </FavoritesProvider>
    </AuthProvider>
  );
}