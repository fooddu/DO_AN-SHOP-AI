// File: app/(tabs)/_layout.js (ĐÃ SỬA LỖI LOGIC CHẶN)

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';

import client from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const BADGE_COLOR = '#E91E63'; 
const ACTIVE_COLOR = '#E91E63';
const INACTIVE_COLOR = '#43464b';

// HOOK: LẤY SỐ LƯỢNG THÔNG BÁO CHƯA ĐỌC (GIỮ NGUYÊN)
const useNotificationCount = () => {
    const { user, token } = useAuth();
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
    const { user, loading } = useAuth(); // Vẫn giữ user/loading

    if (loading) {
        return null;
    }
    
    return (
        <Tabs 
            screenOptions={{ 
                headerShown: false,
                tabBarActiveTintColor: ACTIVE_COLOR, 
                tabBarInactiveTintColor: INACTIVE_COLOR,
                tabBarLabelStyle: { 
                    fontSize: 10,
                    fontWeight: '600',
                    marginBottom: 2
                },
                tabBarStyle: { height: 60 }
            }}
        >
            {/* 1. HOME (Public) - KHÔNG CẦN THAY ĐỔI */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            
            {/* 2. FAVORITES (Guest Access) */}
            <Tabs.Screen
                name="favorites"
                options={{
                    title: 'Like',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="heart-outline" size={size} color={color} />
                    ),
                    unmountOnBlur: true,
                }}
                // ❌ XÓA listeners để cho phép người dùng chưa đăng nhập truy cập
                // Logic kiểm tra sẽ nằm trong file favorites.js
            />
            
            {/* 3. NOTIFICATIONS (Guest Access) */}
            <Tabs.Screen
                name="notifications"
                options={{
                    title: 'Notification',
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
                    },
                    unmountOnBlur: true,
                }}
                // ❌ XÓA listeners để cho phép người dùng chưa đăng nhập truy cập
                // Logic kiểm tra sẽ nằm trong file notifications.js
            />
            
            {/* 4. ACCOUNT (Nếu bạn muốn giữ hành vi Chuyển hướng cho Account) */}
            <Tabs.Screen
                name="account"
                options={{
                    title: 'Account',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                    unmountOnBlur: true,
                }}
                // ❌ XÓA listeners
                // Logic kiểm tra sẽ nằm trong file account.js
            />
        </Tabs>
    );
}