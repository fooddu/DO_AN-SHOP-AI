import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
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

// 1. CẬP NHẬT BASE URL (Port 5001 theo server.js)
const getBaseUrl = () => {
    const LOCAL_IP = '192.168.1.5'; // IPv4 máy tính của bạn
    const PORT =4000; 
    if (Platform.OS === 'web') {
        return `http://localhost:${PORT}`;
    }
    return `http://${LOCAL_IP}:${PORT}`;
};

// 2. FIX LOGIC HIỂN THỊ AVATAR
const getDisplayAvatarUrl = (userObj, baseUrl) => {
    const avatarUrl = userObj?.avatar;
    const defaultAvatar = 'https://i.pravatar.cc/150?u=guest';

    if (!avatarUrl || avatarUrl.includes('pravatar.cc') || avatarUrl.includes('guest')) {
        return defaultAvatar;
    }

    if (avatarUrl.startsWith('http')) {
        return `${avatarUrl}?t=${Date.now()}`;
    }

    // Đảm bảo không bị lặp chữ /public nếu server serve cả folder public
    let cleanPath = avatarUrl;
    if (avatarUrl.startsWith('/public')) {
        cleanPath = avatarUrl.replace('/public', '');
    }

    // Nối URL chuẩn xác
    const finalUrl = `${baseUrl.replace(/\/$/, '')}/public${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
    
    return `${finalUrl}?t=${Date.now()}`;
};

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
    const baseUrl = getBaseUrl();
    const { orderCount, addressCount, cardCount, isCounting } = useProfileData();

    const [displayAvatar, setDisplayAvatar] = useState('https://i.pravatar.cc/150?u=guest');

    useEffect(() => {
        if (user) {
            setDisplayAvatar(getDisplayAvatarUrl(user, baseUrl));
        }
    }, [user, baseUrl]);

    if (loading || isCounting) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <View style={styles.guestContainer}>
                <Ionicons name="person-circle-outline" size={80} color={COLORS.muted} />
                <Text style={styles.guestTitle}>Sign In to view your Account</Text>
                <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/login')}>
                    <Text style={styles.loginButtonText}>Sign In / Register</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Tắt header hệ thống nếu dùng Stack */}
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <View style={{ width: 30 }} />
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity onPress={logout}>
                    <Ionicons name="log-out-outline" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.profileInfoContainer}>
                    <Image
                        source={{ uri: displayAvatar }}
                        style={styles.avatar}
                        resizeMode="cover"
                        onError={() => setDisplayAvatar('https://i.pravatar.cc/150?u=guest')}
                    />
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.name || "User"}</Text>
                        <Text style={styles.userEmail}>{user?.email || "Email"}</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/account-settings')}
                            style={styles.editProfileButton}
                        >
                            <Text style={styles.editProfileText}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.menuGroup}>
                    <ProfileMenuItemCard
                        title="My Orders"
                        subtitle={orderCount === 0 ? "No orders yet." : `You have ${orderCount} orders.`}
                        onPress={() => router.push('/orders')}
                    />
                    <ProfileMenuItemCard
                        title="Shipping Addresses"
                        subtitle={addressCount === 0 ? "No addresses saved." : `${addressCount} saved addresses.`}
                        onPress={() => router.push('/shipping-addresses')}
                        isLast={true}
                    />
                </View>

                <View style={styles.menuGroup}>
                    <ProfileMenuItemCard
                        title="Payment Method"
                        subtitle={cardCount === 0 ? "No cards added." : `You have ${cardCount} cards.`}
                        onPress={() => router.push('/payment')} 
                    />
                    <ProfileMenuItemCard
                        title="Settings"
                        subtitle="Update personal info and security."
                        onPress={() => router.push('/account-settings')}
                        isLast={true}
                    />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    center: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    scrollContainer: { paddingVertical: 15, backgroundColor: COLORS.backgroundSecondary },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 15, 
        paddingVertical: 12, 
        backgroundColor: COLORS.cardBackground, 
        borderBottomWidth: 1, 
        borderBottomColor: COLORS.borderColor 
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    profileInfoContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 20, 
        paddingHorizontal: 15, 
        marginBottom: 10, 
        backgroundColor: COLORS.bg 
    },
    avatar: { 
        width: 75, 
        height: 75, 
        borderRadius: 37.5, 
        marginRight: 15, 
        borderWidth: 1, 
        borderColor: COLORS.borderColor,
        backgroundColor: '#eee'
    },
    userInfo: { flex: 1, justifyContent: 'center' },
    userName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    userEmail: { fontSize: 14, color: COLORS.muted, marginBottom: 5 },
    editProfileButton: { 
        marginTop: 5, 
        paddingVertical: 4, 
        paddingHorizontal: 10, 
        borderRadius: 5, 
        borderWidth: 1, 
        borderColor: COLORS.primary, 
        alignSelf: 'flex-start' 
    },
    editProfileText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
    menuGroup: { 
        backgroundColor: COLORS.cardBackground, 
        marginBottom: 15, 
        marginHorizontal: 12, 
        borderRadius: 12, 
        overflow: 'hidden', 
        borderWidth: 1, 
        borderColor: COLORS.borderColor,
        ...Platform.select({
            web: { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
            android: { elevation: 2 }
        })
    },
    card: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 16, 
        paddingHorizontal: 15, 
        backgroundColor: COLORS.cardBackground 
    },
    cardSeparator: { borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
    cardTextContainer: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
    cardSubtitle: { fontSize: 12, color: COLORS.muted },
    
    guestContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.bg },
    guestTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 15, marginBottom: 25 },
    loginButton: { backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 30 },
    loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});