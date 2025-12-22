import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import client from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const COLORS = {
    primary: '#E91E63',
    text: '#222',
    muted: '#888',
    background: '#F9F9F9',
    card: '#FFFFFF',
    success: '#4CAF50',
    danger: '#D32F2F',
    border: '#E8E8E8',
};

// --- HELPER: Xử lý URL ảnh ---
const API_BASE_URL_FOR_IMAGES = client.defaults.baseURL.replace('/api', '');
const FALLBACK_IMAGE = 'https://via.placeholder.com/150';

const getImageUrl = (url) => {
    if (!url) return FALLBACK_IMAGE;
    if (url.startsWith('http')) {
        if (Platform.OS === 'android' && url.includes('localhost')) {
            return url.replace('localhost', '10.0.2.2');
        }
        return url;
    }
    return `${API_BASE_URL_FOR_IMAGES}${url.startsWith('/') ? '' : '/'}${url}`;
};

// --- API SERVICES ---
const fetchOrderDetailsAPI = async (orderId) => {
    try {
        const response = await client.get(`/orders/${orderId}`);
        // console.log("DEBUG DETAIL: Shipping Address Object (Populated):", JSON.stringify(response.data.data.shippingAddress, null, 2));
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
    const { showToast } = useToast();

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [hasConfirmed, setHasConfirmed] = useState(false); // Local state to hide button after click
    const [isUpdating, setIsUpdating] = useState(false);

    const loadOrderDetails = useCallback(async () => {
        if (!id || !token) return;

        setIsLoading(true);
        try {
            const details = await fetchOrderDetailsAPI(id);
            setOrder(details);

            // Check Local Storage for confirmation
            const confirmedContext = await AsyncStorage.getItem(`ORDER_CONFIRMED_${id}`);
            if (confirmedContext === 'true') {
                setHasConfirmed(true);
            }
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
            "Are you sure you have received this order? This action will mark the order as Delivered.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    style: "default",
                    onPress: async () => {
                        setIsUpdating(true);
                        try {
                            const result = await updateOrderStatusAPI(id, 'delivered');
                            setOrder(prev => ({ ...prev, ...(result || {}), status: 'delivered' }));
                            Alert.alert("Success", "Order has been delivered!");
                        } catch (e) {
                            Alert.alert("Error", e.message);
                        } finally {
                            setIsUpdating(false);
                        }
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }

    if (!order) {
        return <View style={styles.center}><Text>Order not found.</Text></View>;
    }

    // Xử lý hiển thị danh sách sản phẩm linh hoạt (products hoặc orderItems)
    const itemsList = order.products || order.orderItems || [];
    const totalItems = itemsList.reduce((sum, item) => sum + item.quantity, 0);

    // Status Color Helper
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return COLORS.success;
            case 'completed': return COLORS.success; // Handle completed
            case 'cancelled': return COLORS.danger;
            case 'processing': return '#FF9800'; // Orange
            case 'shipped': return COLORS.primary;
            default: return COLORS.muted;
        }
    };

    // Shipping Info
    const shippingAddress = order.shippingAddress || {};
    const recipientName = shippingAddress.recipientName || 'N/A';
    const fullAddress = shippingAddress.fullAddress || shippingAddress.street || 'N/A';
    const phoneNumber = shippingAddress.phoneNumber || 'N/A';

    // Total Price Logic
    const displayTotal = order.totalPrice !== undefined ? order.totalPrice : (order.total || 0);

    return (
        <View style={styles.fullContainer}>
            <Stack.Screen options={{ title: `Order #${order._id.slice(-6).toUpperCase()}` }} />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* 1. Status Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Order Status</Text>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                        {order.status.toUpperCase()}
                    </Text>
                    <Text style={styles.dateText}>
                        Placed on: {new Date(order.dateOrdered || order.createdAt).toLocaleDateString('en-US')}
                    </Text>
                </View>

                {/* 2. Shipping Address */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Shipping Address</Text>
                    <View style={styles.addressRow}>
                        <Ionicons name="person-outline" size={16} color={COLORS.muted} style={styles.icon} />
                        <Text style={styles.detailText}>{recipientName}</Text>
                    </View>
                    <View style={styles.addressRow}>
                        <Ionicons name="call-outline" size={16} color={COLORS.muted} style={styles.icon} />
                        <Text style={styles.detailText}>{phoneNumber}</Text>
                    </View>
                    <View style={styles.addressRow}>
                        <Ionicons name="location-outline" size={16} color={COLORS.muted} style={styles.icon} />
                        <Text style={[styles.detailText, { flex: 1 }]}>{fullAddress}</Text>
                    </View>
                </View>

                {/* 3. Payment Method */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.addressRow}>
                        <Ionicons
                            name={order.paymentMethod === 'STRIPE' ? 'card-outline' : 'cash-outline'}
                            size={16}
                            color={COLORS.muted}
                            style={styles.icon}
                        />
                        <Text style={styles.detailText}>
                            {order.paymentMethod === 'STRIPE' ? 'Credit Card (Stripe)' : 'Cash on Delivery'}
                        </Text>
                    </View>
                </View>

                {/* 4. Product List */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Products ({totalItems} items)</Text>
                    {itemsList.map((item, index) => {
                        // Logic lấy tên và ảnh thông minh
                        let pName = "Unknown Product";
                        let pImage = FALLBACK_IMAGE;
                        let pPrice = item.price || 0;

                        if (item.product) {
                            // Nếu populate
                            if (item.product.name) pName = item.product.name;
                            if (item.product.image) pImage = getImageUrl(item.product.image[0] || item.product.image);
                        } else if (item.name) {
                            // Nếu lưu cứng
                            pName = item.name;
                            if (item.image) pImage = getImageUrl(item.image);
                        }

                        return (
                            <View key={index} style={itemStyles.productRow}>
                                <Image source={{ uri: pImage }} style={itemStyles.productImage} />
                                <View style={itemStyles.productInfo}>
                                    <Text style={itemStyles.productName} numberOfLines={2}>{pName}</Text>
                                    <Text style={itemStyles.productQty}>QTY: {item.quantity}</Text>
                                </View>
                                <Text style={itemStyles.productPrice}>
                                    ${(pPrice * item.quantity).toFixed(2)}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* 5. Total Summary */}
                <View style={[styles.card, styles.totalCard]}>
                    <Text style={styles.summaryTitle}>Total Payment</Text>
                    <Text style={styles.totalText}>
                        ${Number(displayTotal).toFixed(2)}
                    </Text>
                </View>
            </ScrollView>

            {/* 6. Footer Action Button */}
            {/* Logic: 
                1. Status = Delivered AND Chưa bấm confirm -> Hiện nút
                2. Status = Delivered AND Đã bấm confirm -> Hiện "Thank You"
                3. Status khác (Completed) -> Hiện Status Text
            */}
            {order.status === 'delivered' && !hasConfirmed ? (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.receiveButton}
                        onPress={async () => {
                            setHasConfirmed(true);
                            showToast("Order Completed! ❤️", "success");

                            // 0. Save to Local Storage (Client-side persistence rule)
                            await AsyncStorage.setItem(`ORDER_CONFIRMED_${id}`, 'true');

                            // Call API to persist state (Delivered -> Completed)
                            try {
                                await updateOrderStatusAPI(id, 'completed');
                                setOrder(prev => ({ ...prev, status: 'completed' }));
                            } catch (e) {
                                console.log("Status update failed", e);
                            }

                            setTimeout(() => {
                                Alert.alert("Thank You", "Thank you for shopping with AI Shop!\nWe hope you enjoy your purchase. 🎉");
                            }, 500);
                        }}
                    >
                        <Text style={styles.receiveButtonText}>I RECEIVED THE ORDER</Text>
                    </TouchableOpacity>
                </View>
            ) : (order.status === 'delivered' && hasConfirmed) ? (
                <View style={[styles.footerStatus, { backgroundColor: '#E8F5E9' }]}>
                    <Text style={{ color: COLORS.success, fontWeight: 'bold', fontSize: 16 }}>
                        ✅ Thank you for your purchase!
                    </Text>
                </View>
            ) : (
                <View style={styles.footerStatus}>
                    <Text style={{ color: getStatusColor(order.status), fontWeight: 'bold' }}>
                        This order is {order.status.toUpperCase()}.
                    </Text>
                </View>
            )}
        </View>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: COLORS.background },
    scrollContainer: { flexGrow: 1, paddingBottom: 100 }, // Padding for Footer
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    card: {
        backgroundColor: COLORS.card,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
    },
    totalCard: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderLeftWidth: 4, borderLeftColor: COLORS.primary
    },

    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: COLORS.text },
    summaryTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },

    statusText: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
    dateText: { fontSize: 13, color: COLORS.muted },

    addressRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
    icon: { marginRight: 8, marginTop: 2 },
    detailText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },

    totalText: { fontSize: 20, fontWeight: '800', color: COLORS.primary },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 16,
        backgroundColor: COLORS.card,
        borderTopWidth: 1, borderTopColor: COLORS.border,
    },
    footerStatus: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderTopWidth: 1, borderTopColor: COLORS.border,
    },
    receiveButton: {
        backgroundColor: COLORS.success,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 3
    },
    receiveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

const itemStyles = StyleSheet.create({
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    productImage: {
        width: 50, height: 50,
        borderRadius: 6,
        backgroundColor: '#F0F0F0',
        marginRight: 12,
    },
    productInfo: { flex: 1, marginRight: 10 },
    productName: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
    productQty: { fontSize: 12, color: COLORS.muted },
    productPrice: { fontSize: 14, fontWeight: '700', color: COLORS.text, minWidth: 60, textAlign: 'right' }
});