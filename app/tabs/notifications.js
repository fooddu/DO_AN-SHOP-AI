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

// Sử dụng COLORS bạn đã định nghĩa
const COLORS = {
    text: '#222',
    muted: '#888',
    bg: '#ffffff',
    surface: '#f6f6f6', 
    green: '#27ae60', 
    borderColor: '#E8E8E8',
    warning: '#f39c12', 
    primary: '#E91E63', 
};

// ======================================================
// ProfileWarningCard (Giữ lại định nghĩa nhưng không sử dụng trong FlatList)
// ======================================================
const ProfileWarningCard = ({ onPress }) => (
    <TouchableOpacity style={styles.warningCard} onPress={onPress}>
        <Ionicons name="alert-circle-outline" size={24} color={COLORS.warning} />
        <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Cảnh báo Hồ sơ</Text>
            <Text style={styles.warningText}>Vui lòng cập nhật SĐT và Địa chỉ để giao dịch.</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
    </TouchableOpacity>
);


// ======================================================
// Component cho từng hàng thông báo
// ======================================================
const NotificationItem = ({ item, deleteNotification }) => (
    // itemContainer: Đã loại bỏ hiệu ứng card, sử dụng viền dưới
    <View style={[styles.itemContainer, !item.read && styles.unreadItem]}>
        
        <Image 
            // ⭐️ Đã sửa URL placeholder lỗi và chỉnh kích thước về 50x50 ⭐️
            source={{ uri: item.image || 'https://via.placeholder.com/50/f0f0f0?text=IMG' }} 
            style={styles.itemImage} 
        />
        
        <View style={styles.itemTextContainer}> 
            {/* Title: Tiêu đề chưa đọc sẽ dùng COLORS.text (màu đậm) */}
            <Text 
                style={[styles.itemTitle, !item.read && { color: COLORS.text }]}
                numberOfLines={1}
            >
                {item.title}
            </Text>
            
            {/* Description */}
            <Text 
                style={styles.itemDescription} 
                numberOfLines={2}
            >
                {item.description}
            </Text>
            
            {/* Bottom Row - Chỉ hiển thị Tag "New" */}
            <View style={styles.bottomRow}>
                {item.isNew && (
                    <Text style={styles.newTagText}>New</Text>
                )}
            </View>
            
        </View>
    </View>
);

// ======================================================
// Màn hình chính NotificationsScreen
// ======================================================
export default function NotificationsScreen() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth(); 
    const [notifications, setNotifications] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

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
                    isNew: !item.read 
                }));
                // Sắp xếp: ưu tiên thông báo chưa đọc lên đầu
                const sortedData = dataWithIdKey.sort((a, b) => b.isNew - a.isNew);
                
                setNotifications(sortedData || []); 
            }
        } catch (error) {
            console.error("Lỗi tải thông báo:", error);
            if (error.response && error.response.status === 401) {
                Alert.alert("Phiên hết hạn", "Vui lòng đăng nhập lại.");
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

    // Lược bỏ logic deleteNotification vì không có nút xóa trên UI

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
                <Ionicons name="search-outline" size={24} color={COLORS.text} style={styles.searchIcon} />
                <Text style={styles.headerTitle}>Notification</Text>
                <View style={styles.searchIconPlaceholder} /> 
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
                    <NotificationItem item={item} />
                )}

                ListEmptyComponent={() => (
                    !loading && !authLoading && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Bạn chưa có thông báo nào.</Text>
                        </View>
                    )
                )}
            />
        </SafeAreaView>
    );
}

// ======================================================
// Stylesheets (Đã hoàn thiện theo UI mẫu)
// ======================================================
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10, 
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18, 
        fontWeight: 'bold',
        color: COLORS.text,
    },
    searchIcon: {
        padding: 5,
    },
    searchIconPlaceholder: {
        width: 34, 
    },
    emptyContainer: {
        flex: 1,
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.muted,
        fontSize: 16,
    },
    listContainer: {},
    
    // Item Container (Phẳng)
    itemContainer: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'flex-start',
        backgroundColor: COLORS.bg, 
        borderBottomWidth: 1, 
        borderBottomColor: '#eee', 
    },
    unreadItem: {
        // Tùy chọn: backgroundColor: COLORS.surface, 
    },
    itemImage: {
        width: 50, 
        height: 50, 
        borderRadius: 4, 
        marginRight: 15,
        backgroundColor: '#eee', 
        resizeMode: 'cover', 
    },
    itemTextContainer: {
        flex: 1, 
        flexShrink: 1, 
        justifyContent: 'space-between',
    },
    itemTitle: {
        fontSize: 14, 
        fontWeight: 'bold', 
        color: COLORS.muted, 
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 13, 
        color: COLORS.muted,
        lineHeight: 18,
        marginBottom: 8, 
        flexShrink: 1,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end', 
        alignItems: 'center',
        marginTop: 5,
    },
    
    newTagText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.green,
        borderColor: COLORS.green,
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    
    // Styles cho ProfileWarningCard (không sử dụng)
    warningCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffbe6', 
        borderColor: COLORS.warning,
        borderLeftWidth: 4,
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 20,
        elevation: 2,
    },
    warningContent: {
        flex: 1,
        marginLeft: 10,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.warning,
    },
    warningText: {
        fontSize: 13,
        color: COLORS.muted,
        marginTop: 2,
    },
});