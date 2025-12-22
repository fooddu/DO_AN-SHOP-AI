// File: app/(tabs)/_layout.js
// Nhiệm vụ: Tạo 4 tab bar và fix lỗi cắt chữ.

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';

// ⭐ IMPORT HOOK/CONTEXT: Giả định hook này tồn tại và trả về số chưa đọc ⭐
import client from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const BADGE_COLOR = '#E91E63';
const ACTIVE_COLOR = '#E91E63';
const INACTIVE_COLOR = '#43464b';

// HOOK: LẤY SỐ LƯỢNG THÔNG BÁO CHƯA ĐỌC (GIỮ NGUYÊN)
const useNotificationCount = () => {
    const { user = null, token = null } = useAuth() || {};
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchCount = async () => {
        if (!user || !token) {
            setUnreadCount(0);
            return;
        }
        try {
            const response = await client.get('/notifications/count');
            if (response.data?.success && typeof response.data.count === 'number') {
                setUnreadCount(response.data.count);
            }
        } catch (error) {
            setUnreadCount(0);
        }
    };

    useEffect(() => {
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, [user, token]);

    return unreadCount;
};


export default function TabsLayout() {
    const unreadCount = useNotificationCount();
    const badgeValue = unreadCount > 0 ? unreadCount : undefined;
    const { cartCount } = useCart();
    const cartBadge = cartCount > 0 ? cartCount : undefined;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#FFFFFF',
                tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginTop: -4,
                },
                tabBarStyle: {
                    height: 65,
                    backgroundColor: '#2D3142',
                    borderRadius: 35,
                    borderTopWidth: 0,
                    paddingTop: 5,
                    paddingBottom: 5,
                    paddingHorizontal: 20,
                    position: 'absolute',
                    bottom: 8,
                    left: 50,
                    right: 50,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 12,
                },
                tabBarItemStyle: {
                    paddingVertical: 8,
                },
                tabBarIconStyle: {
                    marginTop: 4,
                },
            }}
        >
            <Tabs.Screen
                name="index" // Home
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="favorites" // Like
                options={{
                    title: 'Like',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="heart-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="notifications" // Notification
                options={{
                    title: 'Notification', // ⭐ Giữ nguyên title này
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="notifications-outline" size={size} color={color} />
                    ),
                    tabBarBadge: badgeValue,
                    tabBarBadgeStyle: {
                        backgroundColor: BADGE_COLOR,
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 10,
                        minWidth: 18,
                        lineHeight: 18,
                    }
                }}
            />
            <Tabs.Screen
                name="account" // Profile/Account
                options={{
                    title: 'Account',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}