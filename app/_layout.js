import { Ionicons } from '@expo/vector-icons';
import { Stack, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';

/** 
 * RootLayoutNav: chứa Stack chính cho toàn app
 * - Có cả Tabs ở phần home
 * - Có thêm các màn riêng (cart, checkout, orders, auth)
 */
function RootLayoutNav() {
  const { isLoggedIn, loading } = useAuth();

  // Khi đang loading, hiển thị vòng quay
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E91E63" />
      </View>
    );
  }

  return (
    <Stack>
      {/* Tabs chính của app */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Các màn riêng nằm ngoài Tabs */}
      <Stack.Screen name="cart" options={{ title: 'Giỏ hàng', headerShown: false }} />
      <Stack.Screen name="checkout" options={{ title: 'Thanh toán', headerShown: false }} />
      <Stack.Screen name="order-success" options={{ title: 'Thành công', headerShown: false }} />
      <Stack.Screen name="orders" options={{ title: 'Đơn hàng', headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

/**
 * Tabs layout (Home, Like, Thông báo, Account)
 */
function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#E91E63',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#ddd',
          height: 65,
          paddingBottom: 8,
          paddingTop: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Like',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

/**
 * RootLayout: Bao bọc toàn bộ app bằng AuthProvider
 * Gọi RootLayoutNav để điều hướng Stack + Tabs
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

// Xuất thêm layout Tabs để expo-router hiểu file con
export { TabsLayout };

