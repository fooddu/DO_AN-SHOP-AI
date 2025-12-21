import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
// Sử dụng hook thực tế để lấy dữ liệu thống kê
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

const getBaseUrl = (useLocal = true) => {
    const LOCAL_IP = '192.168.1.18'; // Match with API config
    const LOCAL_PORT = 5000; // Server running on port 5000
    if (Platform.OS === 'web' && useLocal) {
        return `http://localhost:${LOCAL_PORT}`;
    }
    return `http://${LOCAL_IP}:${LOCAL_PORT}`;
};

const getDisplayAvatarUrl = (userObj, defaultAvatarIcon, baseUrl) => {
    const avatarUrl = userObj?.avatar;

    // If no avatar or is default/guest, use initials avatar
    if (!avatarUrl || avatarUrl === defaultAvatarIcon || avatarUrl.includes('/uploads/avatars/guest')) {
        return defaultAvatarIcon;
    }

    // Build full URL if relative path
    let url = avatarUrl.startsWith('http')
        ? avatarUrl
        : `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${avatarUrl.startsWith('/') ? avatarUrl : '/' + avatarUrl}`;

    // Fix port for web
    if (Platform.OS === 'web' && url.includes('localhost') && url.includes(':8081')) {
        url = url.replace(':8081', ':5000');
    }

    return url;
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

    // Use UI Avatars with user's name initials (consistent, not random)
    const userName = user?.name || 'User';
    const defaultAvatarIcon = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&size=128&background=ec4899&color=fff&bold=true`;
    const baseUrl = getBaseUrl();

    // Lấy dữ liệu thống kê từ Hook
    const { orderCount, addressCount, cardCount, isCounting } = useProfileData();

    const [displayName, setDisplayName] = useState(user?.name || "User");
    const [displayEmail, setDisplayEmail] = useState(user?.email || "Email");
    const [displayAvatar, setDisplayAvatar] = useState(getDisplayAvatarUrl(user, defaultAvatarIcon, baseUrl));

    useEffect(() => {
        if (user) {
            setDisplayName(user.name || "User");
            setDisplayEmail(user.email || "Email");
            const newAvatarUrl = getDisplayAvatarUrl(user, defaultAvatarIcon, baseUrl);
            setDisplayAvatar(newAvatarUrl);
        }
    }, [user, baseUrl]);

    // --- Navigation Functions ---
    const goToOrders = () => router.push('/orders');
    const goToShippingAddresses = () => router.push('/shipping-addresses');
    const goToEditInformation = () => router.push('/account-settings');
    const handleLogout = () => logout();

    if (loading || isCounting) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    if (!user) {
        // Guest View
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <View style={styles.headerIconLeft} />
                    <Text style={styles.headerTitle}>Account</Text>
                    <View style={styles.headerIconRight} />
                </View>
                <View style={[styles.center, { padding: 30 }]}>
                    <Ionicons name="person-circle-outline" size={100} color={COLORS.muted} style={{ marginBottom: 20 }} />
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: COLORS.text }}>Guest Account</Text>
                    <Text style={{ textAlign: 'center', color: COLORS.muted, marginBottom: 30 }}>
                        Login to view your profile, orders, and saved addresses.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(auth)/login')}
                        style={{ backgroundColor: COLORS.primary, paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 }}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Log In / Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerIconLeft} />
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity style={styles.headerIconRight} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Profile Info */}
                <View style={styles.profileInfoContainer}>
                    <Image
                        source={{ uri: displayAvatar }}
                        style={styles.avatar}
                        resizeMode="cover"
                        onError={() => setDisplayAvatar(defaultAvatarIcon)}
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

                {/* GROUP 1: ORDERS & ADDRESSES */}
                <View style={styles.menuGroup}>
                    <ProfileMenuItemCard
                        title="My Orders"
                        subtitle={orderCount === 0 ? "No orders yet." : `You have ${orderCount} orders.`}
                        onPress={goToOrders}
                    />
                    <ProfileMenuItemCard
                        title="Shipping Addresses"
                        subtitle={addressCount === 0 ? "No addresses saved." : `${addressCount} saved addresses.`}
                        onPress={goToShippingAddresses}
                        isLast={true}
                    />
                </View>

                {/* GROUP 2: SETTINGS */}
                <View style={styles.menuGroup}>
                    <ProfileMenuItemCard
                        title="Settings"
                        subtitle="Update personal info and security."
                        onPress={goToEditInformation}
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: COLORS.cardBackground, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
    headerIconLeft: { width: 30, alignItems: 'center' },
    headerIconRight: { width: 30, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    profileInfoContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 15, marginBottom: 10, backgroundColor: COLORS.bg },
    avatar: { width: 70, height: 70, borderRadius: 35, marginRight: 15, borderWidth: 1, borderColor: COLORS.borderColor },
    userInfo: { flex: 1, justifyContent: 'center' },
    userName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    userEmail: { fontSize: 14, color: COLORS.muted, marginBottom: 5 },
    editProfileButton: { marginTop: 5, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5, borderWidth: 1, borderColor: COLORS.primary, alignSelf: 'flex-start' },
    editProfileText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
    menuGroup: { backgroundColor: COLORS.cardBackground, marginBottom: 15, marginHorizontal: 10, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.borderColor },
    card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 15, backgroundColor: COLORS.cardBackground },
    cardSeparator: { borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
    cardTextContainer: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
    cardSubtitle: { fontSize: 12, color: COLORS.muted },
});