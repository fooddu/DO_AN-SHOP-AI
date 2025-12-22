import { Stack } from 'expo-router';
// 1. IMPORT TỪ UTILS ĐỂ TRÁNH LỖI CRASH WEB
import { StripeProvider } from '../utils/stripe-helper';

// Import các Providers khác
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';

export default function RootLayout() {
    return (
        // ⭐️ KEY CỦA BẠN ĐÃ ĐƯỢC ĐIỀN VÀO ĐÂY
        <StripeProvider 
            publishableKey="pk_test_51SgIYkJytB1k3bNs1HdOwHmFmjgLsVuhwnoD8FKOK0UPDwGXGDlgbFqONIWQy3Xm2GeBE6nPaCdfTQ8145fKAujR00e6nexZKY"
        >
            <ToastProvider>
                <AuthProvider>
                    <FavoritesProvider>
                        <Stack>
                            <Stack.Screen name="index" options={{ headerShown: false }} />
                            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                            <Stack.Screen name="(main)" options={{ headerShown: false }} />
                        </Stack>
                    </FavoritesProvider>
                </AuthProvider>
            </ToastProvider>
        </StripeProvider>
    );
}