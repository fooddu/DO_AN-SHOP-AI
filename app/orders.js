import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
// ⚠️ Thay thế đường dẫn này bằng đường dẫn thực tế đến AuthContext của bạn
import { useAuth } from '../../DO_AN-SHOP-AI/context/AuthContext';
// ⚠️ THAY THẾ BẰNG ĐƯỜNG DẪN THỰC TẾ ĐẾN FILE AXIOS CLIENT CỦA BẠN
import client from '../../DO_AN-SHOP-AI/api/axiosConfig';


// Colors (Kept for consistency)
const COLORS = {
    primary: '#E91E63',
    text: '#222',
    muted: '#808080',
    background: '#F9F9F9',
    card: '#FFFFFF',
    danger: 'red',
    success: 'green',
};

// ⭐️ API SERVICE: Sử dụng Axios đã cấu hình ⭐️
const fetchOrdersAPI = async () => {
    const url = `/orders/`; 
    
    try {
        const response = await client.get(url); 
        if (!response.data || !response.data.success) {
            throw new Error(response.data.message || "Failed to load orders.");
        }
        return response.data.data;
    } catch (error) {
        const errorMessage = error.message || error.response?.data?.message || 'Network error or server failed to respond.';
        throw new Error(errorMessage);
    }
};

// Order Item Component (Translated Text)
const OrderItem = ({ order, onPress }) => {
    const firstProductItem = order.products && order.products[0];
    const firstProductDetail = firstProductItem ? firstProductItem.product : null;

    const itemQuantity = order.products ? order.products.length : 0;
    
    const productName = firstProductDetail?.name || "Unknown Product"; 
    const productImage = firstProductDetail?.image?.[0] || 'https://via.placeholder.com/60';
    
    const statusColor = (status) => {
        switch (status) {
            case 'delivered': return COLORS.success;
            case 'processing': return COLORS.primary;
            case 'cancelled': return COLORS.danger;
            default: return COLORS.muted;
        }
    };

    return (
        <TouchableOpacity style={itemStyles.card} onPress={onPress}>
            <View style={itemStyles.header}>
                <Text style={itemStyles.idText}>Order ID: #{order._id.slice(-6)}</Text> 
                <Text style={{ ...itemStyles.statusText, color: statusColor(order.status) }}>
                    {order.status.toUpperCase()}
                </Text>
            </View>

            <View style={itemStyles.contentRow}>
                {/* Thumbnail product */}
                <Image 
                    source={{ uri: productImage }} 
                    style={itemStyles.image}
                    resizeMode="cover"
                />
                
                {/* Main Info */}
                <View style={itemStyles.infoContainer}>
                    <Text style={itemStyles.productName} numberOfLines={1}>
                        {productName}
                    </Text>
                    <Text style={itemStyles.dateText}>
                        {itemQuantity} item type{itemQuantity > 1 ? 's' : ''} | Date: {new Date(order.orderDate).toLocaleDateString('en-US')}
                    </Text>
                </View>
            </View>

            <Text style={itemStyles.totalText}>
                Total: {order.total ? order.total.toLocaleString('en-US', { style: 'currency', currency: 'VND' }) : '0₫'}
            </Text>
        </TouchableOpacity>
    );
};

export default function OrdersScreen() {
    const router = useRouter();
    const { token } = useAuth(); 

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // ⭐️ LOGIC TẢI LẠI TỰ ĐỘNG BẰNG useFocusEffect ⭐️
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
                    setError(err.message || 'Could not load orders. Please check your connection.'); 
                } finally {
                    setIsLoading(false);
                }
            };

            loadOrders();
        }, [token]) 
    );

    const handleOrderPress = (orderId) => {
        // Điều hướng đến trang chi tiết
        router.push(`/orders/${orderId}`);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <View style={styles.content}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={[styles.subtitle, { marginTop: 10 }]}>Loading orders...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.content}>
                    <Ionicons name="alert-circle-outline" size={32} color={COLORS.danger} />
                    <Text style={[styles.subtitle, { marginTop: 10, color: COLORS.danger, textAlign: 'center' }]}>{error}</Text>
                </View>
            );
        }

        if (orders.length === 0) {
            return (
                <View style={styles.content}>
                    <Ionicons name="sad-outline" size={32} color={COLORS.muted} />
                    <Text style={[styles.subtitle, { marginTop: 10 }]}>You have no orders yet.</Text> 
                    <TouchableOpacity>
                        <Text style={styles.emptyButton}>START SHOPPING</Text> 
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
            />
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text> 
                <View style={styles.backButton} />
            </View>

            {renderContent()}
        </View>
    );
}

// ... (STYLES) ...
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background, 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 50, 
        paddingBottom: 15,
        backgroundColor: COLORS.card, 
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        width: 30, 
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
        textAlign: 'center',
    },
    listContainer: {
        padding: 10,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.muted,
    },
    emptyButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: COLORS.primary,
        color: '#fff',
        borderRadius: 8,
        fontWeight: 'bold',
    }
});

const itemStyles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.card,
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 8,
    },
    idText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: COLORS.background
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.text,
        marginBottom: 4,
    },
    dateText: {
        fontSize: 12,
        color: COLORS.muted,
    },
    totalText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 8,
        textAlign: 'right'
    }
});