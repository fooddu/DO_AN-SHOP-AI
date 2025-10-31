import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isLoggedIn, loading } = useAuth();

  ///// không đăng nhập - đăng ki đc , tạm thời bỏ để log vào trong app
  
  // useEffect(() => {
  //   if (loading) return;
    
  //   const inAuthGroup = segments[0] === '(auth)';
    
  //   if (!isLoggedIn && !inAuthGroup) {
  //     router.replace('/(auth)/login');
  //   } else if (isLoggedIn && inAuthGroup) {
  //     router.replace('/');
  //   }
  // }, [isLoggedIn, loading, segments, router]);

  // if (loading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" color="#0000ff" />
  //     </View>
  //   );
  // }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
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