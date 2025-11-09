// [File] app/(auth)/_layout.js

import { Redirect, Stack } from 'expo-router';
// Đảm bảo đường dẫn này đúng
import { useAuth } from '../../context/AuthContext';

export default function AuthLayout() {
  const { user, loading } = useAuth(); 

  if (loading) {
    return null; 
  }

  if (user) {
    return <Redirect href="/tabs" />;
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      
      {/* ⬇️ THÊM 3 DÒNG MỚI ⬇️ */}
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="verify-otp" options={{ headerShown: false }} />
      <Stack.Screen name="set-new-password" options={{ headerShown: false }} />
      
    </Stack>
  );}