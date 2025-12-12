import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import client from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

// --- CONFIG MÀU SẮC ---
const COLORS = {
    primary: '#E91E63',
    text: '#222',
    muted: '#888',
    background: '#F9F9F9',
    card: '#FFFFFF',
    danger: '#D32F2F',
    success: '#388E3C',
    warning: '#FBC02D',
    border: '#F0F0F0',
    bgSuccess: '#E8F5E9',
    bgProcessing: '#FFF3E0', 
    bgDanger: '#FFEBEE',
};

// --- HÀM HỖ TRỢ HIỂN THỊ ẢNH ---
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
    // Lấy Base URL của client ( AxiosConfig ) và nối vào đường dẫn tương đối
    const BASE_URL = API_BASE_URL_FOR_IMAGES || (Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000');
    return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

// --- API SERVICE ---
const fetchOrdersAPI = async () => {
    try {
        const response = await client.get('/orders/get/userorders');
        if (!response.data || !response.data.success) {
            // Lỗi từ server hoặc response body
            throw new Error(response.data.message || "Cannot load orders.");
        }
        return response.data.data;
    } catch (error) {
        // Lỗi mạng hoặc server không phản hồi
        const errorMessage = error.message || error.response?.data?.message || 'Network error or server not responding.';
        throw new Error(errorMessage);
    }
};

// --- ITEM COMPONENT (ĐÃ FIX HIỂN THỊ) ---
const OrderItem = ({ order, onPress }) => {
    // ⭐️ FIX: Linh hoạt lấy products hoặc orderItems
    const itemsList = order.products || order.orderItems || [];
    const firstItem = itemsList.length > 0 ? itemsList[0] : null;
    const itemQuantity = itemsList.length;
    
    // ⭐️ FIX: Lấy tên và ảnh thông minh (Populate hoặc lưu cứng)
    let productName = "Unknown Product";
    let productUrl = "";

    if (firstItem) {
        // Tên sản phẩm
        if (firstItem.product && firstItem.product.name) {
            productName = firstItem.product.name;
        } else if (firstItem.name) {
            productName = firstItem.name;
        }

        // Ảnh sản phẩm
        if (firstItem.product && firstItem.product.image) {
            const imgRaw = firstItem.product.image;
            productUrl = Array.isArray(imgRaw) ? imgRaw[0] : imgRaw;
        } else if (firstItem.image) {
            productUrl = firstItem.image;
        }
    }

    const productImage = getImageUrl(productUrl);

    // ⭐️ FIX: Tổng tiền (totalPrice hoặc total)
    const displayTotal = order.totalPrice !== undefined ? order.totalPrice : (order.total || 0);

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return { color: COLORS.success, bg: COLORS.bgSuccess, label: 'Delivered' };
            case 'processing': 
            case 'pending': return { color: '#FF9800', bg: '#FFF3E0', label: 'Processing' };
            case 'shipped': return { color: COLORS.primary, bg: '#FCE4EC', label: 'Shipped' };
            case 'cancelled': return { color: COLORS.danger, bg: COLORS.bgDanger, label: 'Cancelled' };
            default: return { color: COLORS.muted, bg: '#F5F5F5', label: status || 'Unknown' };
        }
    };

    const statusInfo = getStatusStyle(order.status);

    return (
        <TouchableOpacity style={itemStyles.card} onPress={onPress} activeOpacity={0.9}>
            <View style={itemStyles.header}>
                <View style={itemStyles.orderIdContainer}>
                    <Ionicons name="receipt-outline" size={16} color={COLORS.muted} style={{marginRight:4}} />
                    <Text style={itemStyles.idText}>Order #{order._id.slice(-6).toUpperCase()}</Text>
                </View>
                
                <View style={[itemStyles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Text style={[itemStyles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.label}
                    </Text>
                </View>
            </View>

            <View style={itemStyles.contentRow}>
                <Image
                    source={{ uri: productImage }}
                    style={itemStyles.image}
                    resizeMode="cover"
                />
                
                <View style={itemStyles.infoContainer}>
                    <Text style={itemStyles.productName} numberOfLines={1}>{productName}</Text>
                    
                    {itemQuantity > 1 && (
                        <Text style={itemStyles.moreItemsText}>+ {itemQuantity - 1} more items</Text>
                    )}
                    
                    <Text style={itemStyles.dateText}>
                        {new Date(order.dateOrdered || order.createdAt).toLocaleDateString('en-US')}
                    </Text>
                </View>
            </View>

            <View style={itemStyles.footer}>
                <Text style={itemStyles.totalLabel}>Total Amount:</Text>
                <Text style={itemStyles.totalValue}>
                    $ {Number(displayTotal).toFixed(2)}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

// --- MAIN SCREEN ---
export default function OrdersScreen() {
    const router = useRouter();
    const { token } = useAuth();

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const loadOrders = async () => {
                if (!token) {
                    setIsLoading(false);
                    return;
                }
                setIsLoading(true);
                setError(null);
                try {
                    const fetchedOrders = await fetchOrdersAPI();
                    setOrders(fetchedOrders);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            loadOrders();
        }, [token])
    );

    const handleOrderPress = (orderId) => {
        router.push(`/orders/${orderId}`); 
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.centerContainer}>
                    <Ionicons name="warning-outline" size={48} color={COLORS.danger} />
                    <Text style={styles.errorText}>Something went wrong.</Text>
                    <TouchableOpacity onPress={() => fetchOrdersAPI()} style={styles.retryButton}>
                        <Text style={styles.retryText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (orders.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Ionicons name="cart-outline" size={64} color={COLORS.muted} />
                    <Text style={styles.emptyTitle}>No orders yet</Text>
                    <Text style={styles.emptySub}>Looks like you haven't placed any orders yet.</Text>
                    <TouchableOpacity style={styles.shopNowButton} onPress={() => router.push('/')}>
                        <Text style={styles.shopNowText}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <FlatList
                data={orders}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <OrderItem
                        order={item}
                        onPress={() => handleOrderPress(item._id)}
                    />
                )}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text>
                <View style={styles.backButton} /> 
            </View>

            {renderContent()}
        </View>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 50, paddingBottom: 15,
        backgroundColor: COLORS.card,
        borderBottomWidth: 1, borderBottomColor: COLORS.border,
        zIndex: 10
    },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, flex: 1, textAlign: 'center' },
    
    listContainer: { padding: 16, paddingBottom: 30 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    
    errorText: { marginTop: 10, color: COLORS.muted, fontSize: 16 },
    retryButton: { marginTop: 15, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: COLORS.text, borderRadius: 8 },
    retryText: { color: '#fff', fontWeight: 'bold' },

    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginTop: 20 },
    emptySub: { fontSize: 14, color: COLORS.muted, marginTop: 5, textAlign: 'center', marginBottom: 25 },
    shopNowButton: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
    shopNowText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

const itemStyles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
            android: { elevation: 3 }
        }),
    },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12, paddingBottom: 12,
        borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
    },
    orderIdContainer: { flexDirection: 'row', alignItems: 'center' },
    idText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
    
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },

    contentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    image: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#F0F0F0', marginRight: 15 },
    infoContainer: { flex: 1, justifyContent: 'center' },
    productName: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
    moreItemsText: { fontSize: 13, color: COLORS.muted, marginBottom: 4, fontStyle: 'italic' },
    dateText: { fontSize: 12, color: '#999' },

    footer: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 4, paddingTop: 12,
        borderTopWidth: 1, borderTopColor: '#F5F5F5'
    },
    totalLabel: { fontSize: 14, color: COLORS.muted },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
});