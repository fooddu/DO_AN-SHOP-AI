import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

// Use defined COLORS
const COLORS = {
    text: '#222',         // Main text
    muted: '#888',        // Secondary text
    bg: '#ffffff',        // General background
    surface: '#f3f4f6',   // Read item background (Light Gray)
    primary: '#E91E63',   // Primary color (Pink/Red)
    unreadBg: '#ffe6f0',  // Unread item background (Very light pink)
    green: '#27ae60',     // NEW tag color
    borderColor: '#E8E8E8',
    warning: '#f39c12',
};

// ======================================================
// Notification Item Component
// ======================================================
const NotificationItem = ({ item, markAsRead }) => (
    <TouchableOpacity 
        style={[
            styles.itemContainer, 
            !item.read && styles.unreadItem
        ]}
        onPress={() => markAsRead(item.id)}
    >
        <Image 
            source={{ uri: item.image || 'https://via.placeholder.com/50/f0f0f0?text=IMG' }} 
            style={styles.itemImage} 
        />
        
        <View style={styles.itemTextContainer}> 
            <View style={styles.itemHeader}>
                {/* Title */}
                <Text 
                    style={[
                        styles.itemTitle, 
                        !item.read && styles.itemTitleUnread 
                    ]}
                    numberOfLines={1}
                >
                    {item.title || "Notification Title"}
                </Text>

                {/* Unread Dot or Time */}
                {!item.read ? (
                    <View style={styles.newDot} />
                ) : (
                    <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
                )}
            </View>
            
            {/* Description */}
            <Text 
                style={styles.itemDescription} 
                numberOfLines={2}
            >
                {item.description || "Notification content is not available."}
            </Text>
            
            <View style={styles.bottomRow}>
                {/* NEW Tag */}
                {item.isNew && (
                    <Text style={styles.newTagText}>NEW</Text>
                )}
            </View>
            
        </View>
    </TouchableOpacity>
);


// ======================================================
// Main Notifications Screen
// ======================================================
export default function NotificationsScreen() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth(); 
    const [notifications, setNotifications] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Function to mark as read (Unchanged logic)
    const markAsRead = async (notificationId) => {
        try {
            await client.put(`/notifications/${notificationId}/read`); 
            
            setNotifications(prevNotifs => 
                prevNotifs.map(notif => 
                    notif.id === notificationId ? { ...notif, read: true, isNew: false } : notif
                )
            );
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };


    const fetchNotifications = async (isRefresh = false) => {
        if (!user) return;
        if (!isRefresh) setLoading(true);
        else setIsRefreshing(true);

        try {
            const response = await client.get('/notifications'); 
            
            if (response.data.success) {
                const dataWithIdKey = response.data.data.map(item => ({ 
                    ...item, 
                    id: item._id, 
                    isNew: !item.read,
                    createdAt: item.createdAt || new Date(), 
                }));
                // Sort: unread first
                const sortedData = dataWithIdKey.sort((a, b) => b.isNew - a.isNew || new Date(b.createdAt) - new Date(a.createdAt));
                
                setNotifications(sortedData || []); 
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
            if (error.response && error.response.status === 401) {
                Alert.alert("Session Expired", "Please log in again.");
            }
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
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
            {/* Header */}
            <View style={styles.header}>
                {/* ICON: outline/không viền */}
                <Ionicons name="notifications-outline" size={24} color={COLORS.text} style={styles.iconPlaceholder} /> 
                <Text style={styles.headerTitle}>Notifications</Text>
                {/* Empty placeholder for centering */}
                <View style={styles.iconPlaceholder} /> 
            </View>
            
            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => fetchNotifications(true)}
                        tintColor={COLORS.primary}
                    />
                }
                
                renderItem={({ item }) => (
                    <NotificationItem item={item} markAsRead={markAsRead} />
                )}

                ListEmptyComponent={() => (
                    !loading && !authLoading && (
                        <View style={styles.emptyContainer}>
                            {/* ICON: mail-open-outline */}
                            <Ionicons name="mail-open-outline" size={48} color={COLORS.muted} />
                            <Text style={styles.emptyText}>You don't have any notifications.</Text>
                        </View>
                    )
                )}
            />
        </SafeAreaView>
    );
}

// ======================================================
// Stylesheets (Color changes for icons)
// ======================================================
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bg,
    },
    
    // --- Header Style ---
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12, 
        backgroundColor: COLORS.bg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    headerTitle: {
        fontSize: 18, 
        fontWeight: '700',
        color: COLORS.text,
    },
    iconPlaceholder: { // Used for icon sizing/spacing
        width: 24, 
        height: 24,
        padding: 5,
    },
    
    // --- List Styles ---
    listContainer: {
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        marginTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    emptyText: {
        color: COLORS.muted,
        fontSize: 16,
        marginTop: 10,
    },
    
    // --- Item Styles ---
    itemContainer: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'flex-start',
        backgroundColor: COLORS.surface, 
        borderBottomWidth: 1, 
        borderBottomColor: '#eee', 
    },
    unreadItem: {
        backgroundColor: COLORS.unreadBg, 
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary, 
    },
    itemImage: {
        width: 50, 
        height: 50, 
        borderRadius: 8, 
        marginRight: 15,
        backgroundColor: '#eee', 
        resizeMode: 'cover', 
    },
    itemTextContainer: {
        flex: 1, 
        justifyContent: 'center',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 15, 
        fontWeight: '500', 
        color: COLORS.muted, 
        flexShrink: 1,
        marginRight: 10,
    },
    itemTitleUnread: {
        fontWeight: '700', 
        color: COLORS.text, // Black/Darker color
    },
    itemDescription: {
        fontSize: 13, 
        color: COLORS.muted,
        lineHeight: 18,
        flexShrink: 1,
    },
    timeText: {
        fontSize: 12,
        color: COLORS.muted,
    },
    newDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary, 
    },
    
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start', 
        marginTop: 5,
    },
    newTagText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primary,
        borderColor: COLORS.primary,
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
});