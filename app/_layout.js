import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isLoggedIn, loading } = useAuth();

  // useEffect(() => {
    
  //   if (loading) return;
  //   router.replace('/product');

  //   // const inAuthGroup = segments[0] === '(auth)';
    
  //   // if (!isLoggedIn && !inAuthGroup) {
  //   //   // router.replace('/(auth)/login');
  //   //   router.replace('/product');
  //   // } else if (isLoggedIn && inAuthGroup) {
  //   //   router.replace('/');
  //   // }
  // }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Trang Chủ' }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="product" options={{ headerShown: false }} />
      <Stack.Screen name="notification" options={{ headerShown: false }} />
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
