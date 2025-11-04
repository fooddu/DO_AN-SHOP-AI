// [File] app/_layout.js

import { Stack } from 'expo-router';
// (Đảm bảo đường dẫn này đúng)
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    // Bọc AuthProvider ở đây
    <AuthProvider>
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
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="orders" 
          options={{ 
            title: 'Đơn hàng', 
            headerShown: true 
          }} 
        />
        
        {/* Trang chi tiết sản phẩm (header: false vì nó có header tùy chỉnh) */}
        <Stack.Screen 
          name="products/[id]" 
          options={{ 
            headerShown: false 
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}