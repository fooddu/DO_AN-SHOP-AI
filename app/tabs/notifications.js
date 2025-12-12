import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import client from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

// --- COLOR CONFIG ---
const COLORS = {
    text: '#222',
    muted: '#888',
    bg: '#ffffff',
    surface: '#f8f9fa',
    primary: '#FF3366',
    unreadBg: '#fff0f5',
    borderColor: '#E8E8E8',
    warning: '#f39c12',
};

// ⭐️ FIX LOCALHOST IMAGE URL ⭐️
const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/60';
    if (url.startsWith('http') && !url.includes('localhost')) return url;

    // Android Emulator
    if (Platform.OS === 'android' && url.includes('localhost')) {
        return url.replace('localhost', '10.0.2.2');
    }

    // Relative path, append Base URL
    const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
    if (url.startsWith('/')) {
        return `${BASE_URL}${url}`;
    }
    return url;
};

// Item Component
const NotificationItem = ({ item, markAsRead }) => {
    const isSystemAlert = item.type === 'SYSTEM_ALERT';

    return (
        <TouchableOpacity
            style={[styles.itemContainer, !item.read && styles.unreadItem]}
            onPress={() => markAsRead(item)}
        >
            {isSystemAlert ? (
                <View style={[styles.itemImage, styles.systemIconContainer]}>
                    <Ionicons name="alert-circle" size={28} color="#FFF" />
                </View>
            ) : (
                <Image
                    source={{ uri: getImageUrl(item.image) }}
                    style={styles.itemImage}
                    resizeMode="cover"
                />
            )}

            <View style={styles.itemTextContainer}>
                <View style={styles.itemHeader}>
                    <Text style={[styles.itemTitle, !item.read && styles.itemTitleUnread]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    {!item.read ? (
                        <View style={styles.newDot} />
                    ) : (
                        <Text style={styles.timeText}>{item.timeDisplay}</Text>
                    )}
                </View>

                <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                </Text>

                {!item.read && (
                    <View style={styles.bottomRow}>
                        <Text style={styles.newTagText}>NEW</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default function NotificationsScreen() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // ⭐️ USER INFO CHECK LOGIC ⭐️
    const checkUserInfo = () => {
        if (!user) return null;
        if (!user.phone || !user.address || user.address.trim() === "") {
            return {
                id: 'local-alert-missing-info',
                title: 'Missing Information',
                description: 'Please update your phone number and address to verify your account.',
                type: 'SYSTEM_ALERT',
                read: false,
                image: null,
                createdAt: new Date().toISOString(),
                timeDisplay: 'Now',
                action: '/account-settings'
            };
        }
        return null;
    };

    const markAsRead = async (item) => {
        if (item.type === 'SYSTEM_ALERT' && item.action) {
            router.push(item.action);
            return;
        }
        try {
            if (!item.read) {
                await client.put(`/notifications/${item.id}/read`);
                setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
            }
        } catch (error) {
            console.error("Error marking read:", error);
        }
    };

    const fetchNotifications = async (isRefresh = false) => {
        if (!user) return;
        if (!isRefresh) setLoading(true); else setIsRefreshing(true);

        try {
            const response = await client.get('/notifications');
            if (response.data.success) {
                let fetchedData = response.data.data.map(item => ({
                    ...item,
                    id: item._id,
                    timeDisplay: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));

                // Prepend system alert
                const reminder = checkUserInfo();
                if (reminder) {
                    fetchedData = [reminder, ...fetchedData];
                }
                setNotifications(fetchedData);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (user) fetchNotifications();
    }, [user]);

    if (authLoading || loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Ionicons name="notifications-outline" size={24} color={COLORS.text} style={{ width: 24 }} />
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => fetchNotifications(true)} tintColor={COLORS.primary} />}
                renderItem={({ item }) => <NotificationItem item={item} markAsRead={markAsRead} />}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="file-tray-outline" size={48} color={COLORS.muted} />
                        <Text style={styles.emptyText}>No notifications yet.</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor, backgroundColor: COLORS.bg },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
    listContainer: { paddingBottom: 20 },
    emptyContainer: { flex: 1, marginTop: 100, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: COLORS.muted, fontSize: 16, marginTop: 10 },
    itemContainer: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: COLORS.surface },
    unreadItem: { backgroundColor: COLORS.unreadBg, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
    itemImage: { width: 50, height: 50, borderRadius: 8, marginRight: 15, backgroundColor: '#eee' },
    systemIconContainer: { backgroundColor: COLORS.warning, justifyContent: 'center', alignItems: 'center' },
    itemTextContainer: { flex: 1, justifyContent: 'center' },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    itemTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, flex: 1, marginRight: 10 },
    itemTitleUnread: { fontWeight: '700', color: '#000' },
    itemDescription: { fontSize: 13, color: COLORS.muted, lineHeight: 18 },
    timeText: { fontSize: 12, color: COLORS.muted },
    newDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
    bottomRow: { marginTop: 5 },
    newTagText: { fontSize: 10, fontWeight: '700', color: COLORS.primary, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 4, paddingHorizontal: 6, alignSelf: 'flex-start' },
});