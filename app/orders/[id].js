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

// ⚠️ Đã điều chỉnh các đường dẫn Import
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

// ==========================================================
// ⭐️ API SERVICE CHO DETAIL VÀ UPDATE ⭐️
// ==========================================================

// Hàm fetch chi tiết đơn hàng (GET /api/orders/:id)
const fetchOrderDetailsAPI = async (orderId) => {
    try {
        const response = await client.get(`/orders/${orderId}`);
        return response.data.data;
    } catch (e) {
        throw new Error(e.response?.data?.message || e.message || "Could not load order details.");
    }
};

// Hàm cập nhật trạng thái (PUT /api/orders/:id)
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
    
    // Tải chi tiết đơn hàng
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


    // ⭐️ CHỨC NĂNG NHẬN HÀNG VÀ HOÀN THÀNH ĐƠN ⭐️
    const handleReceiveOrder = () => {
        Alert.alert(
            "Confirm Delivery",
            "Are you sure you want to mark this order as DELIVERED? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Confirm Receive", 
                    style: "default",
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            const updatedOrder = await updateOrderStatusAPI(id, 'delivered');
                            setOrder(updatedOrder); // Cập nhật UI với trạng thái mới
                            Alert.alert("Success", `Order #${id.slice(-6)} has been completed!`);
                        } catch (e) {
                            Alert.alert("Error", e.message);
                        } finally {
                            setIsLoading(false);
                            // Sau khi hoàn thành, có thể tự động quay lại danh sách
                            // router.replace('/orders'); 
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
    
    return (
        <View style={styles.fullContainer}>
            <Stack.Screen options={{ title: `Order #${order._id.slice(-6)}` }} />
            
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
                    <Text style={styles.detailText}>{order.shippingAddress?.street || 'N/A'}</Text>
                    <Text style={styles.detailText}>{order.shippingAddress?.city || 'N/A'}</Text>
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
                                <Text style={itemStyles.productName}>{item.product?.name || 'Unknown Product'}</Text>
                                <Text style={itemStyles.productQty}>QTY: {item.quantity}</Text>
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

            {/* 5. Footer Button: Receive Order */}
            {order.status === 'shipped' || order.status === 'processing' ? (
                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.receiveButton}
                        onPress={handleReceiveOrder}
                    >
                        <Text style={styles.receiveButtonText}>RECEIVE ORDER (Mark as Delivered)</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.footerStatus}>
                    <Text style={{ color: orderStatusColor, fontWeight: 'bold' }}>
                        Order is already {order.status.toUpperCase()}.
                    </Text>
                </View>
            )}
        </View>
    );
}

// ---------------------------
// STYLES (Giữ nguyên)
// ---------------------------

const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: COLORS.background },
    scrollContainer: { paddingBottom: 100 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { 
        backgroundColor: COLORS.card, 
        padding: 15, 
        marginHorizontal: 10, 
        marginTop: 10,
        borderRadius: 8,
        elevation: 2,
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
        alignItems: 'center',
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
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.text,
    },
    productQty: {
        fontSize: 12,
        color: COLORS.muted,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
    }
});