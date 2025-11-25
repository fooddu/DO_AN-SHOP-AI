// File: app/tabs/account.js
// Đặt trong thư mục app/tabs/

import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import useProfileData from '../../hooks/useProfileData';


const COLORS = {
    primary: '#E91E63', 
    text: '#222',
    muted: '#888',
    bg: '#ffffff', 
    cardBackground: '#fff',
    borderColor: '#F0F0F0',
    danger: '#D32F2F',
    backgroundSecondary: '#FAFAFA',
};

// Hàm getBaseUrl (Xác định Base URL của Server)
const getBaseUrl = (useLocal = true) => {
    // ⚠️ CHÚ Ý: Cần thay '192.168.1.2' bằng IP local hiện tại nếu chạy trên thiết bị vật lý
    const LOCAL_IP = '192.168.1.2'; 
    const LOCAL_PORT = 4000;
    
    if (Platform.OS === 'web' && useLocal) {
        return `http://localhost:${LOCAL_PORT}`;
    }
    return `http://${LOCAL_IP}:${LOCAL_PORT}`;
};

// Logic hiển thị avatar: Nối Base URL nếu avatar là đường dẫn tương đối
const getDisplayAvatarUrl = (userObj, defaultAvatarIcon, baseUrl) => {
    const avatarUrl = userObj?.avatar;
    if (!avatarUrl || avatarUrl === defaultAvatarIcon || avatarUrl.includes('/uploads/avatars/guest')) {
        return defaultAvatarIcon; 
    }
    
    let url = avatarUrl.startsWith('http') 
        ? avatarUrl 
        : `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${avatarUrl.startsWith('/') ? avatarUrl : '/' + avatarUrl}`;

    if (Platform.OS === 'web' && url.includes('localhost') && url.includes(':8081')) {
        url = url.replace(':8081', ':4000'); 
    }
    
    console.log(`[DEBUG AVATAR] Avatar URL: ${url}`);
    return url;
};


// Component CARD
const ProfileMenuItemCard = ({ title, subtitle, onPress, isLast = false }) => (
    <TouchableOpacity 
        style={[styles.card, !isLast && styles.cardSeparator]} 
        onPress={onPress}
    >
        <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
    </TouchableOpacity>
);


export default function AccountScreen() {
    const router = useRouter(); 
    const { user, logout, loading } = useAuth();
    
    const defaultAvatarIcon = 'https://i.pravatar.cc/60?text=PH'; 
    const baseUrl = getBaseUrl(); 

    const { orderCount, addressCount, cardCount, isCounting } = useProfileData();
    
    const [displayName, setDisplayName] = useState(user?.name || "Người dùng"); 
    const [displayEmail, setDisplayEmail] = useState(user?.email || "Email"); 
    const [displayAvatar, setDisplayAvatar] = useState(getDisplayAvatarUrl(user, defaultAvatarIcon, baseUrl));

    useEffect(() => {
        if (user) {
            console.log('[DEBUG RENDER] User object loaded, synchronizing local state.');
            
            setDisplayName(user.name || "");
            setDisplayEmail(user.email || "");
            
            const newAvatarUrl = getDisplayAvatarUrl(user, defaultAvatarIcon, baseUrl);
            if (displayAvatar !== newAvatarUrl) setDisplayAvatar(newAvatarUrl);
        }
    }, [user]); 

    // --- Các hàm Navigation (Thêm log) ---
    const goToOrders = () => {
        console.log('[NAVIGATE] Chuyển đến trang Orders.');
        router.push('/orders');
    }
    const goToShippingAddresses = () => {
        console.log('[NAVIGATE] Chuyển đến trang Shipping Addresses.');
        router.push('/shipping-addresses');
    }
    const goToPaymentMethod = () => {
        console.log('[NAVIGATE] Chuyển đến trang Payment Method.');
        // router.push('/payment-method');
    }
    const goToEditInformation = () => {
        console.log('[NAVIGATE] Chuyển đến trang Account Settings.');
        router.push('/account-settings');
    }
    const handleLogout = () => {
        console.log('[ACTION] Đang thực hiện Logout.');
        logout();
    }
    
    
    // --- Render Logic ---
    if (loading || isCounting) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }
    
    if (!user) {
        console.log('[REDIRECT] Không có User. Chuyển đến trang Login.');
        return <Redirect href="/login" />;
    }
    

    return (
        <SafeAreaView style={styles.safeArea}>
            
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerIconLeft} /> 
                <Text style={styles.headerTitle}>Profile</Text>
                
                {/* NÚT LOG OUT CHÍNH */}
                <TouchableOpacity style={styles.headerIconRight} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            {/* Dùng ScrollView */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                
                {/* Profile Info */}
                <View style={styles.profileInfoContainer}>
                    <Image 
                        source={{ uri: displayAvatar }} 
                        style={styles.avatar} 
                        resizeMode="cover"
                        onError={() => {
                            console.log('[DEBUG RENDER] Lỗi tải avatar. Chuyển về mặc định.');
                            setDisplayAvatar(defaultAvatarIcon);
                        }}
                    /> 
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{displayName}</Text>
                        <Text style={styles.userEmail}>{displayEmail}</Text> 
                        <TouchableOpacity 
                             onPress={goToEditInformation}
                             style={styles.editProfileButton}
                        >
                             <Text style={styles.editProfileText}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* KHỐI 1: ORDERS & ADDRESSES */}
                <View style={styles.menuGroup}>
                    <ProfileMenuItemCard
                        title="My orders"
                        subtitle={
                            orderCount === 0 ? "Chưa có đơn hàng nào." : `Đã có ${orderCount} đơn hàng.`
                        }
                        onPress={goToOrders}
                    />
                    <ProfileMenuItemCard
                        title="Shipping Addresses"
                        subtitle={
                            addressCount === 0 ? "Chưa có địa chỉ nào." : `${addressCount} Addresses.`
                        }
                        onPress={goToShippingAddresses} 
                        isLast={true} 
                    />
                </View>

                {/* KHỐI 2: PAYMENT & EDIT */}
                <View style={styles.menuGroup}>
                    <ProfileMenuItemCard
                        title="Payment Method"
                        subtitle={
                            cardCount === 0 ? "You have no cards." : `You have ${cardCount} cards.`
                        }
                        onPress={goToPaymentMethod}
                    />
                    <ProfileMenuItemCard
                        title="Settings" 
                        subtitle="Cập nhật thông tin cá nhân và bảo mật"
                        onPress={goToEditInformation}
                        isLast={true}
                    />
                </View>
                
                <View style={{ height: 40 }} /> 
            </ScrollView>
        </SafeAreaView>
    );
}


// ---------------------------
// STYLES
// ---------------------------
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        paddingVertical: 15,
        backgroundColor: COLORS.backgroundSecondary, 
    },
    // --- Header Style ---
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: COLORS.cardBackground, 
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    headerIconLeft: { width: 30, alignItems: 'center' }, 
    headerIconRight: { width: 30, alignItems: 'center' },
    headerTitle: {
        fontSize: 18, 
        fontWeight: 'bold',
        color: COLORS.text,
    },
    // --- Profile Info ---
    profileInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 15,
        marginBottom: 10, 
        backgroundColor: COLORS.bg,
    },
    avatar: {
        width: 70,
        height: 70, 
        borderRadius: 35,
        marginRight: 15,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
    },
    userInfo: { flex: 1, justifyContent: 'center' },
    userName: {
        fontSize: 18, 
        fontWeight: 'bold',
        color: COLORS.text,
    },
    userEmail: {
        fontSize: 14, 
        color: COLORS.muted,
        marginBottom: 5,
    },
    editProfileButton: {
        marginTop: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: COLORS.primary,
        alignSelf: 'flex-start',
    },
    editProfileText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    // --- Menu Grouping & Cards ---
    menuGroup: {
        backgroundColor: COLORS.cardBackground,
        marginBottom: 15,
        marginHorizontal: 10,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.borderColor,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 15,
        backgroundColor: COLORS.cardBackground,
    },
    cardSeparator: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 15, 
        fontWeight: '600',
        color: COLORS.text,
    },
    cardSubtitle: {
        fontSize: 12, 
        color: COLORS.muted,
    },
});