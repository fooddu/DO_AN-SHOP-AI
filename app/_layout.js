import { Stack } from 'expo-router';
// 1. IMPORT ToastProvider (Đảm bảo đường dẫn đúng với nơi bạn tạo file context)
import { ToastProvider } from '../context/ToastContext';

import { AuthProvider } from '../context/AuthContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        {/* 2. BỌC ToastProvider Ở ĐÂY (Bên trong FavoritesProvider hoặc ngoài cùng đều được) */}
        <ToastProvider> 
          <Stack>
            {/* Auth and Tabs groups have no header */}
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="tabs" options={{ headerShown: false }} />
            
            {/* Index file also has no header */}
            <Stack.Screen name="index" options={{ headerShown: false }} />

            {/* AUXILIARY SCREENS */}
            <Stack.Screen 
              name="cart" 
              options={{ 
                title: 'Cart', 
                headerShown: false 
              }} 
            />
            <Stack.Screen 
              name="orders" 
              options={{ 
                title: 'Orders', 
                headerShown: false 
              }} 
            />
            
            {/* Product Detail Page */}
            <Stack.Screen 
              name="products/[id]" 
              options={{ 
                headerShown: false 
              }} 
            />

            {/* Account Settings Page */}
            <Stack.Screen 
              name="account-settings" 
              options={{ 
                headerShown: false 
              }} 
            />

              {/* Shipping Address Management */}
            <Stack.Screen 
              name="shipping-addresses" 
              options={{ 
                title: 'Shipping Addresses',
                headerShown: false 
              }} 
            />
              
              {/* Add/Edit Address Form */}
            <Stack.Screen 
              name="add-address-form" 
              options={{ 
                title: 'Add Address',
                headerShown: false 
              }} 
            />
              
          </Stack>
        </ToastProvider> 
        {/* Kết thúc ToastProvider */}
      </FavoritesProvider>
    </AuthProvider>
  );
}