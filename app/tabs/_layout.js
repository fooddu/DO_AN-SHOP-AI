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
                tabBarActiveTintColor: ACTIVE_COLOR,
                tabBarInactiveTintColor: INACTIVE_COLOR,
                // ⭐ FIX: Tối ưu Label Style để tránh bị cắt chữ
                tabBarLabelStyle: {
                    fontSize: 10, // Giảm kích thước font chữ
                    fontWeight: '600',
                    marginBottom: 2 // Đẩy nhãn lên một chút
                },
                // ⭐ FIX PHỤ: Đảm bảo Tab Bar Item có đủ không gian (sử dụng style này trên Tab Bar chính)
                // tabBarItemStyle: { paddingVertical: 2 }, 
                tabBarStyle: { height: 60 } // Tăng nhẹ chiều cao nếu cần
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