import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import client from '../../../DO_AN-SHOP-AI/api/axiosConfig';
import { useAuth } from '../../../DO_AN-SHOP-AI/context/AuthContext';

const COLORS = {
    primary: '#E91E63',
    text: '#222',
    muted: '#888',
    background: '#F9F9F9',
    success: '#4CAF50', 
    danger: 'red',
};

// ... (API Service functions remain the same) ...

const fetchOrderDetailsAPI = async (orderId) => {
    try {
        const response = await client.get(`/orders/${orderId}`);
        console.log("DEBUG DETAIL: Shipping Address Object (Populated):", JSON.stringify(response.data.data.shippingAddress, null, 2));
        return response.data.data;
    } catch (e) {
        throw new Error(e.response?.data?.message || e.message || "Could not load order details.");
    }
};

const updateOrderStatusAPI = async (orderId, newStatus) => {
    try {
        const response = await client.put(`/orders/${orderId}`, { status: newStatus });
        return response.data.data;
    } catch (e) {
        throw new Error(e.response?.data?.message || e.message || "Failed to update order status.");
    }
};

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams(); 
    const { token } = useAuth();
    const router = useRouter();

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const loadOrderDetails = useCallback(async () => {
        if (!id || !token) return;

        setIsLoading(true);
        try {
            const details = await fetchOrderDetailsAPI(id); 
            setOrder(details);
        } catch (e) {
            Alert.alert("Error", e.message);
            router.back();
        } finally {
            setIsLoading(false);
        }
    }, [id, token]);
    
    useEffect(() => {
        loadOrderDetails();
    }, [loadOrderDetails]);


    const handleReceiveOrder = () => {
        Alert.alert(
            "Xác nhận đã nhận hàng",
            "Bạn có chắc muốn đánh dấu đơn hàng này là Đã Giao Hàng (DELIVERED)? Hành động này không thể hoàn tác.",
            [
                { text: "Hủy", style: "cancel" },
                { 
                    text: "Xác nhận", 
                    style: "default",
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            const updatedOrder = await updateOrderStatusAPI(id, 'delivered');
                            setOrder(updatedOrder); 
                            Alert.alert("Thành công", `Đơn hàng #${id.slice(-6)} đã được hoàn tất!`);
                        } catch (e) {
                            Alert.alert("Lỗi", e.message);
                        } finally {
                            setIsLoading(false);
                        }
                    }
                },
            ]
        );
    };

    if (isLoading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }
    
    if (!order) {
        return <View style={styles.center}><Text>Order not found.</Text></View>;
    }
    
    const totalItems = order.products.reduce((sum, item) => sum + item.quantity, 0);
    const orderStatusColor = order.status === 'delivered' ? COLORS.success : (order.status === 'cancelled' ? COLORS.danger : COLORS.primary);
    
    // Dữ liệu Địa chỉ
    const shippingAddress = order.shippingAddress;
    const recipientName = shippingAddress?.recipientName || shippingAddress?.name || 'N/A';
    const fullAddress = shippingAddress?.fullAddress || shippingAddress?.street || 'N/A';
    const phoneNumber = shippingAddress?.phoneNumber || 'N/A';

    return (
        <View style={styles.fullContainer}>
            <Stack.Screen options={{ title: `Order #${order._id.slice(-6)}` }} />
            
            {/* ⭐ XÓA emptySpacer VÀ SỬ DỤNG paddingBottom TRONG STYLES ⭐ */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                
                {/* 1. Status Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Order Status</Text>
                    <Text style={[styles.statusText, { color: orderStatusColor }]}>
                        {order.status.toUpperCase()}
                    </Text>
                    <Text style={styles.dateText}>Placed on: {new Date(order.orderDate).toLocaleDateString('en-US')}</Text>
                </View>

                {/* 2. Shipping Address */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Shipping Address</Text>
                    <Text style={styles.detailText}>Người nhận: {recipientName}</Text>
                    <Text style={styles.detailText}>Địa chỉ: {fullAddress}</Text>
                    <Text style={styles.detailText}>SĐT: {phoneNumber}</Text>
                </View>
                
                {/* 3. Product List */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Products ({totalItems} items)</Text>
                    {order.products.map((item, index) => (
                        <View key={index} style={itemStyles.productRow}>
                            <Image 
                                source={{ uri: item.product?.image?.[0] || 'https://via.placeholder.com/50' }} 
                                style={itemStyles.productImage}
                            />
                            <View style={itemStyles.productInfo}>
                                <Text style={itemStyles.productName} numberOfLines={1}>
                                    {item.product?.name || 'Unknown Product'}
                                </Text>
                                <Text style={itemStyles.productQty}>
                                    QTY: {item.quantity}
                                </Text>
                            </View>
                            <Text style={itemStyles.productPrice}>
                                {(item.price * item.quantity).toLocaleString('en-US', { style: 'currency', currency: 'VND' })}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* 4. Total Summary */}
                <View style={[styles.card, styles.totalCard]}>
                    <Text style={styles.summaryTitle}>Total Payment</Text>
                    <Text style={styles.totalText}>
                        {order.total.toLocaleString('en-US', { style: 'currency', currency: 'VND' })}
                    </Text>
                </View>
                
            </ScrollView>

            {/* 5. Footer Button: Receive Order (Giữ nguyên vị trí cố định) */}
            {order.status === 'shipped' || order.status === 'processing' ? (
                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.receiveButton}
                        onPress={handleReceiveOrder}
                    >
                        <Text style={styles.receiveButtonText}>NHẬN HÀNG (Mark as Delivered)</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.footerStatus}>
                    <Text style={{ color: orderStatusColor, fontWeight: 'bold' }}>
                        Đơn hàng đã {order.status.toUpperCase()}.
                    </Text>
                </View>
            )}
        </View>
    );
}

// ---------------------------
// STYLES (Đã Fix ScrollView)
// ---------------------------

const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: COLORS.background },
    // ⭐ FIX FINAL: Đảm bảo ScrollView chỉ có đủ không gian cho nội dung + Footer
    scrollContainer: { 
        flexGrow: 1, 
        paddingBottom: 85 // Tăng paddingBottom nhẹ để tránh bị Footer che mất item cuối
    },
    emptySpacer: {
        height: 65, // Chiều cao ước tính của footer (Đã xóa khỏi JSX)
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { 
        backgroundColor: COLORS.card, 
        padding: 15, 
        marginHorizontal: 10, 
        marginTop: 10,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    totalCard: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderLeftWidth: 5,
        borderLeftColor: COLORS.primary
    },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: COLORS.text },
    summaryTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
    statusText: { fontSize: 18, fontWeight: '700', marginBottom: 5 },
    dateText: { fontSize: 13, color: COLORS.muted },
    detailText: { fontSize: 14, color: COLORS.text, marginBottom: 4 },
    totalText: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },

    // ⭐ Cần đảm bảo Footer nằm ở dưới cùng (position: 'absolute')
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 15,
        backgroundColor: COLORS.card,
        borderTopWidth: 1,
        borderTopColor: COLORS.background,
    },
    footerStatus: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 15,
        backgroundColor: COLORS.card,
        alignItems: 'center',
    },
    receiveButton: { 
        backgroundColor: COLORS.success, 
        paddingVertical: 15, 
        borderRadius: 8, 
        alignItems: 'center' 
    },
    receiveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

const itemStyles = StyleSheet.create({
    productRow: {
        flexDirection: 'row',
        alignItems: 'flex-start', 
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.background,
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 4,
        marginRight: 10,
    },
    productInfo: {
        flex: 1, 
        marginRight: 10,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.text,
        marginBottom: 4,
        flexWrap: 'wrap', 
    },
    productQty: {
        fontSize: 12,
        color: COLORS.muted,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        alignSelf: 'flex-start', 
        minWidth: 60, 
        textAlign: 'right'
    }
});