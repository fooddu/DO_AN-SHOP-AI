// [File] app/(auth)/_layout.js

import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function AuthLayout() {
    const { user, loading } = useAuth(); 

    if (loading) {
        return null; 
    }

    // Nếu user đã đăng nhập, chuyển hướng ra khỏi khu vực auth về trang chủ
    if (user) {
        return <Redirect href="/(tabs)" />;
    }

    return (
        <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="verify-otp" options={{ headerShown: false }} />
            <Stack.Screen name="set-new-password" options={{ headerShown: false }} />
        </Stack>
    );
}