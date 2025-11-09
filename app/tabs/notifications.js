// [File] app/tabs/notifications.js

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

// Định nghĩa màu sắc
const COLORS = {
    text: '#222',
    muted: '#888',
    bg: '#ffffff',
    surface: '#f6f6f6', 
    green: '#27ae60', 
    borderColor: '#E8E8E8',
    warning: '#f39c12', // Màu vàng cảnh báo
    primary: '#E91E63', // Màu hồng cho nút xóa
};

// ======================================================
// Dữ liệu mẫu (Mock Data)
// ======================================================
const sampleNotifications = [
    {
        id: '1',
        title: 'Your order #123456789 has been confirmed',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Turpis pretium et in arcu adipiscing nec.',
        image: 'https://images.unsplash.com/photo-1596706268132-bk04235e197c?w=100', 
        isNew: true,
        read: false, 
    },
    {
        id: '2',
        title: 'Your order #123456789 has been canceled',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Turpis pretium et in in arcu adipiscing nec.',
        image: 'https://images.unsplash.com/photo-1571455269707-38f3aff4447a?w=100', 
        isNew: false,
        read: true, 
    },
];

// Component Cảnh báo Yêu cầu Cập nhật Profile (Giữ nguyên)
const ProfileWarningCard = ({ onPress }) => (
    <TouchableOpacity style={styles.warningCard} onPress={onPress}>
        <Ionicons name="alert-circle-outline" size={24} color={COLORS.warning} />
        <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Cần Cập nhật Hồ sơ</Text>
            <Text style={styles.warningText}>Vui lòng thêm **Số điện thoại & Địa chỉ** để giao hàng.</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={COLORS.warning} />
    </TouchableOpacity>
);

// ======================================================
// Component cho từng hàng thông báo
// ======================================================
const NotificationItem = ({ item, deleteNotification }) => (
    // THAY ĐỔI: Sử dụng styles cho card item chính
    <View style={styles.notificationWrapper}> 
        <View style={[styles.itemContainer, !item.read && styles.unreadItem]}>
            
            {/* Hình ảnh sản phẩm */}
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            
            {/* Cụm text (title, description, tag) */}
            {/* THAY ĐỔI: Thêm actionRow bên trong itemTextContainer */}
            <View style={styles.itemTextContainer}> 
                
                {/* Text Nội dung */}
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription} numberOfLines={3}>{item.description}</Text>
                
                {/* ⭐️ NÚT DELETE VÀ NEW TAG NẰM TRONG HÀNG NÀY ⭐️ */}
                <View style={styles.bottomRow}>
                    
                    {/* NÚT DELETE (Tối giản, không viền) */}
                    <TouchableOpacity 
                        style={styles.compactDeleteButton} 
                        onPress={() => deleteNotification(item.id)}
                    >
                        <Text style={styles.compactDeleteText}>Delete</Text>
                    </TouchableOpacity>
                    
                    {/* Tag "New" */}
                    {item.isNew && (
                        <Text style={styles.newTagText}>New</Text>
                    )}
                </View>
                
            </View>
        </View>
    </View>
);

// ======================================================
// Component màn hình chính
// ======================================================
export default function NotificationsScreen() {
    const router = useRouter();
    const { user, loading } = useAuth(); 
    const [notifications, setNotifications] = useState(sampleNotifications);

    // LOGIC XÓA THÔNG BÁO
    const deleteNotification = (id) => {
        Alert.alert(
            "Xác nhận xóa",
            "Bạn có chắc chắn muốn xóa thông báo này?",
            [
                { text: "Hủy", style: "cancel" },
                { 
                    text: "Xóa", 
                    onPress: () => {
                        const newNotifications = notifications.filter(n => n.id !== id);
                        setNotifications(newNotifications);
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    const isProfileIncomplete = user && (!user.phone || user.phone.trim() === '' || !user.address || user.address.trim() === '');
    
    const handleGoToEditProfile = () => {
        router.push('/account-settings'); 
    };

    return (
        <SafeAreaView style={styles.safeArea}>
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
                renderItem={({ item }) => (
                    <NotificationItem item={item} deleteNotification={deleteNotification} />
                )}
                
                ListHeaderComponent={() => (
                    !loading && isProfileIncomplete ? <ProfileWarningCard onPress={handleGoToEditProfile} /> : null
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    searchIcon: {
        padding: 5,
    },
    searchIconPlaceholder: {
        width: 34, 
    },
    listContainer: {
        paddingTop: 10,
    },
    // STYLE CHO CONTAINER CHỨA NOTIFICATION VÀ NÚT XÓA
    notificationWrapper: {
        marginBottom: 10, 
        backgroundColor: COLORS.bg,
        marginHorizontal: 16, 
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 1,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
    },
    // STYLE CHO NỘI DUNG THÔNG BÁO CHÍNH
    itemContainer: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'flex-start',
        backgroundColor: COLORS.bg, 
    },
    unreadItem: {
        backgroundColor: COLORS.surface, 
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 15,
        backgroundColor: '#eee', 
        resizeMode: 'contain', 
    },
    itemTextContainer: {
        flex: 1,
        justifyContent: 'space-between', // Đảm bảo text và bottomRow được căn cách nhau
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 14,
        color: COLORS.muted,
        lineHeight: 20,
        marginBottom: 8, // Thêm margin để tách khỏi hàng dưới
    },
    // ⭐️ STYLE MỚI CHO HÀNG NÚT DELETE VÀ NEW TAG
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Căn cách Delete và New
        alignItems: 'center',
        marginTop: 5,
    },
    // ⭐️ STYLE MỚI CHO NÚT DELETE TỐI GIẢN
    compactDeleteButton: {
        // Tối giản: không padding lớn, không viền
        paddingHorizontal: 8, 
        paddingVertical: 4,
        backgroundColor: COLORS.primary, 
        borderRadius: 5,
    },
    compactDeleteText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12, // Kích thước nhỏ gọn
    },
    newTagText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.green,
    },
    // STYLE CẢNH BÁO (Giữ nguyên)
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