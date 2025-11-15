import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useEffect, useState } from 'react';
// ⚠️ Thay đổi đường dẫn này nếu cần
import { useAuth } from '../../context/AuthContext';

// Định nghĩa màu sắc
const COLORS = {
    text: '#222',
    muted: '#888',
    bg: '#ffffff', // Màu nền tổng thể (Trắng)
    cardBackground: '#fff', // Màu nền cho các thẻ (Trắng)
    borderColor: '#E8E8E8',
    shadow: '#000',
};

// Component CARD (THẺ)
const ProfileMenuItemCard = ({ title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        {/* Biểu tượng mũi tên giữ nguyên */}
        <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
    </TouchableOpacity>
);

// ⭐️ HÀM MOCKUP FETCH API (Giữ nguyên)
const fetchOrderCountAPI = async (token) => {
    // Giả lập độ trễ (ví dụ: 500ms) để mô phỏng việc gọi API
    await new Promise(resolve => setTimeout(resolve, 500)); 
    // Giả lập trả về số lượng đơn hàng
    return Math.floor(Math.random() * 50) + 5; 
};

export default function AccountScreen() {
    const router = useRouter(); 
    
    // Lấy token từ AuthContext để dùng cho việc gọi API
    const { user, logout, loading, token } = useAuth();

    // STATE để lưu số lượng đơn hàng thực tế
    const [orderCount, setOrderCount] = useState(0); 
    const [isCounting, setIsCounting] = useState(true); // Bắt đầu là đang tải

    // Dữ liệu giả định cho các thẻ khác
    const addressCount = 3;
    const cardCount = 2;

    // LOGIC GỌI API KHI COMPONENT ĐƯỢC LOAD
    useEffect(() => {
        const loadOrderCount = async () => {
            if (user && token) {
                setIsCounting(true);
                try {
                    // Gọi hàm Mockup hoặc API thực tế
                    const count = await fetchOrderCountAPI(token);
                    setOrderCount(count);
                } catch (error) {
                    console.error("Lỗi tải số lượng đơn hàng:", error);
                    setOrderCount(0); // Đặt về 0 nếu có lỗi
                } finally {
                    setIsCounting(false);
                }
            } else {
                 setIsCounting(false); // Nếu chưa đăng nhập, kết thúc loading count
            }
        };

        loadOrderCount();
    }, [user, token]); 
    
    // --- Các hàm Navigation ---
    const goToOrders = () => router.push('/orders'); 
    const goToShippingAddresses = () => router.push('/shipping-addresses'); 
    const goToPaymentMethod = () => console.log('Go to Payment');
    const goToEditInformation = () => router.push('/account-settings');
    
    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, {justifyContent: 'center', alignItems: 'center'}]}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }
    
    if (!user) {
        return <Redirect href="/login" />;
    }
    
    // ⭐️ FIX LỖI: Định nghĩa URL avatar mặc định ⭐️
    const defaultAvatarUrl = 'https://i.pravatar.cc/150?img=1'; 

    // Sử dụng user data từ Context
    const displayName = user.name || "Bruno Pham"; 
    const displayEmail = user.email || "bruno203@gmail.com"; 
    
    // SỬA LỖI: Sử dụng defaultAvatarUrl thay vì biến chưa định nghĩa
    const displayAvatar = user.avatar || defaultAvatarUrl; 

    return (
        <SafeAreaView style={styles.safeArea}>
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerIconLeft}>
                    {/* Biểu tượng kính lúp (Search) */}
                    <Ionicons name="search-outline" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                
                {/* NÚT LOGOUT */}
                <TouchableOpacity style={styles.headerIconRight} onPress={logout}>
                    <Ionicons name="refresh-circle-outline" size={28} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            {/* Dùng ScrollView */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                
                {/* Profile Info - HIỂN THỊ USER THẬT */}
                <View style={styles.profileInfoContainer}>
                    <Image 
                        source={{ uri: displayAvatar }} 
                        style={styles.avatar} 
                        // Thêm onError để xử lý lỗi tải ảnh
                        onError={() => console.log('Lỗi tải avatar')}
                    /> 
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{displayName}</Text>
                        <Text style={styles.userEmail}>{displayEmail}</Text> 
                    </View>
                </View>

                {/* 4 Card Menu */}
                <ProfileMenuItemCard
                    title="My orders"
                    // HIỂN THỊ SỐ LƯỢNG ĐỘNG / TRẠNG THÁI TẢI
                    subtitle={
                        isCounting 
                        ? "Đang tải..." 
                        : (orderCount === 0 ? "Chưa có đơn hàng nào." : `Đã có ${orderCount} đơn hàng.`)
                    }
                    onPress={goToOrders}
                />
                <ProfileMenuItemCard
                    title="Shipping Addresses"
                    subtitle={`${addressCount} Addresses`}
                    onPress={goToShippingAddresses} 
                />
                <ProfileMenuItemCard
                    title="Payment Method"
                    subtitle={`You have ${cardCount} cards`}
                    onPress={goToPaymentMethod}
                />
                <ProfileMenuItemCard
                    title="Edit Infomation" 
                    subtitle="Notification, Password, FAQ, Contact"
                    onPress={goToEditInformation}
                />

            </ScrollView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    scrollContainer: {
        paddingHorizontal: 10, 
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15, 
        paddingVertical: 10, 
        backgroundColor: COLORS.cardBackground, 
    },
    headerIconLeft: { width: 30, alignItems: 'center' },
    headerIconRight: { width: 30, alignItems: 'center' },
    headerTitle: {
        fontSize: 18, 
        fontWeight: 'bold',
        color: COLORS.text,
    },
    profileInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: COLORS.bg, 
        marginBottom: 10, 
        paddingHorizontal: 15, 
    },
    avatar: {
        width: 60, 
        height: 60, 
        borderRadius: 30,
        marginRight: 10,
        backgroundColor: COLORS.borderColor,
    },
    userInfo: { flex: 1, justifyContent: 'center' },
    userName: {
        fontSize: 16, 
        fontWeight: 'bold',
        color: COLORS.text,
    },
    userEmail: {
        fontSize: 13, 
        color: COLORS.muted,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.cardBackground,
        borderRadius: 0, 
        paddingVertical: 20, 
        paddingHorizontal: 15, 
        marginBottom: 8, 
        elevation: 0, 
        shadowOpacity: 0,
        shadowRadius: 0,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 15, 
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 12, 
        color: COLORS.muted,
    },
});