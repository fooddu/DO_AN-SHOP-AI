// File: app/(main)/orders/[id].js

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import io from 'socket.io-client';

import client from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
// 👇 IMPORT COMPONENT MỚI
import ConfirmModal from '../../components/ConfirmModal';

// --- CONFIG ---
const SOCKET_SERVER_URL = 'http://localhost:4000'; 
const COLORS = {
    primary: '#FF3366',     
    secondary: '#2D3436',   
    muted: '#A4B0BE',       
    bg: '#F5F7FA',          
    card: '#FFFFFF',        
    success: '#00B894',     
    warning: '#FDCB6E',     
    info: '#0984E3',        
    danger: '#D63031',      
    border: '#DFE6E9',
};

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

// --- API ---
const fetchOrderDetailsAPI = async (orderId) => {
    try {
        const response = await client.get(`/orders/${orderId}`);
        return response.data.data;
    } catch (e) {
        throw new Error(e.response?.data?.message || e.message || "Lỗi tải đơn hàng.");
    }
};

const updateOrderStatusAPI = async (orderId, newStatus) => {
    try {
        const response = await client.put(`/orders/${orderId}`, { status: newStatus });
        return response.data.data;
    } catch (e) {
        throw new Error(e.response?.data?.message || e.message || "Lỗi cập nhật trạng thái.");
    }
};

// --- COMPONENT: STATUS TIMELINE ---
const OrderTimeline = ({ currentStatus }) => {
    const steps = [
        { key: 'processing', label: 'Xử lý', icon: 'clipboard-list-outline' },
        { key: 'shipped', label: 'Vận chuyển', icon: 'truck-delivery-outline' },
        { key: 'delivered', label: 'Hoàn tất', icon: 'check-circle-outline' },
    ];

    let activeIndex = 0;
    if (currentStatus === 'shipped') activeIndex = 1;
    if (currentStatus === 'delivered') activeIndex = 2;
    if (currentStatus === 'cancelled') activeIndex = -1;

    if (activeIndex === -1) {
        return (
            <View style={[styles.timelineContainer, { borderColor: COLORS.danger, borderLeftWidth: 4 }]}>
                <Text style={{ color: COLORS.danger, fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                    ĐƠN HÀNG ĐÃ BỊ HỦY
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.timelineContainer}>
            {steps.map((step, index) => {
                const isActive = index <= activeIndex;
                const isLast = index === steps.length - 1;
                return (
                    <View key={step.key} style={styles.stepItem}>
                        <View style={[styles.stepCircle, isActive ? styles.stepActive : styles.stepInactive]}>
                            <MaterialCommunityIcons 
                                name={step.icon} 
                                size={18} 
                                color={isActive ? '#fff' : COLORS.muted} 
                            />
                        </View>
                        <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                            {step.label}
                        </Text>
                        {!isLast && (
                            <View style={[styles.stepLine, index < activeIndex ? styles.lineActive : styles.lineInactive]} />
                        )}
                    </View>
                );
            })}
        </View>
    );
};

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams();
    const { token } = useAuth();
    const router = useRouter();
    
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // ⭐ STATE CHO MODAL XÁC NHẬN ⭐
    const [modalVisible, setModalVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- LOAD DATA ---
    const loadOrderDetails = useCallback(async () => {
        if (!id || !token) return;
        setIsLoading(true);
        try {
            const details = await fetchOrderDetailsAPI(id);
            setOrder(details);
        } catch (e) {
            Alert.alert("Lỗi", e.message);
            router.back();
        } finally {
            setIsLoading(false);
        }
    }, [id, token]);

    useEffect(() => { loadOrderDetails(); }, [loadOrderDetails]);

    // --- SOCKET.IO ---
    useEffect(() => {
        let socket;
        const connect = async () => {
            if (!token) return;
            socket = io(SOCKET_SERVER_URL, { transports: ['websocket'], auth: { token } });
            socket.on('orderStatusUpdated', (updatedOrder) => {
                if (updatedOrder._id === id) {
                    setOrder(updatedOrder);
                }
            });
        };
        connect();
        return () => { if (socket) { socket.off('orderStatusUpdated'); socket.disconnect(); } };
    }, [id, token]);

    // --- LOGIC XỬ LÝ NHẬN HÀNG ---
    
    // 1. Khi bấm nút -> Hiện Modal
    const handlePressReceive = () => {
        setModalVisible(true);
    };

    // 2. Khi bấm "Đồng ý" trong Modal
    const confirmReceiveOrder = async () => {
        setIsProcessing(true); // Loading trong modal
        try {
            const updated = await updateOrderStatusAPI(id, 'delivered');
            setOrder(updated);
            setModalVisible(false); // Tắt modal khi thành công
        } catch (e) {
            alert("Lỗi: " + e.message); // Alert native nhẹ báo lỗi
        } finally {
            setIsProcessing(false);
        }
    };

    // --- RENDER ---
    if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    if (!order) return <View style={styles.center}><Text>Không tìm thấy đơn hàng.</Text></View>;

    const itemsList = order.products || order.orderItems || [];
    const shipping = order.shippingAddress || {};
    const totalPrice = order.totalPrice !== undefined ? order.totalPrice : (order.total || 0);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'delivered': return { bg: '#E3FDFD', text: COLORS.success, label: 'Giao thành công' };
            case 'shipped': return { bg: '#E3F2FD', text: COLORS.info, label: 'Đang vận chuyển' };
            case 'processing': return { bg: '#FFF8E1', text: COLORS.warning, label: 'Đang xử lý' };
            case 'cancelled': return { bg: '#FFEBEE', text: COLORS.danger, label: 'Đã hủy' };
            default: return { bg: '#F5F5F5', text: COLORS.muted, label: status };
        }
    };
    const statusMeta = getStatusStyle(order.status);

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen 
                options={{ 
                    title: 'Chi tiết đơn hàng',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: COLORS.bg },
                    headerTintColor: COLORS.secondary,
                }} 
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* HEADER */}
                <View style={styles.headerSection}>
                    <View>
                        <Text style={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</Text>
                        <Text style={styles.orderDate}>{new Date(order.dateOrdered || order.createdAt).toLocaleString('vi-VN')}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
                        <Text style={[styles.statusText, { color: statusMeta.text }]}>{statusMeta.label}</Text>
                    </View>
                </View>

                {/* TIMELINE */}
                <OrderTimeline currentStatus={order.status} />

                {/* INFO CARDS */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="location" size={20} color={COLORS.primary} />
                        <Text style={styles.cardTitle}>Thông tin giao hàng</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Người nhận</Text>
                        <Text style={styles.infoValue}>{shipping.recipientName || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Số điện thoại</Text>
                        <Text style={styles.infoValue}>{shipping.phoneNumber || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Địa chỉ</Text>
                        <Text style={[styles.infoValue, { flex: 1, textAlign: 'right' }]}>
                            {shipping.fullAddress || shipping.address || 'N/A'}
                        </Text>
                    </View>
                </View>

                {/* PRODUCTS */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="bag-handle" size={20} color={COLORS.primary} />
                        <Text style={styles.cardTitle}>Sản phẩm đã đặt</Text>
                    </View>
                    <View style={styles.divider} />
                    {itemsList.map((item, index) => {
                        let pName = item.product?.name || item.name || "Sản phẩm";
                        let pImgRaw = item.product?.image?.[0] || item.product?.image || item.image;
                        let pImage = getImageUrl(pImgRaw);
                        let pPrice = item.price || 0;
                        return (
                            <View key={index} style={styles.productItem}>
                                <Image source={{ uri: pImage }} style={styles.productImage} resizeMode="cover" />
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName} numberOfLines={2}>{pName}</Text>
                                    <Text style={styles.productMeta}>x{item.quantity}</Text>
                                </View>
                                <Text style={styles.productPrice}>${(pPrice * item.quantity).toFixed(2)}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* TOTAL */}
                <View style={[styles.card, styles.totalCard]}>
                    <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                    <Text style={styles.totalValue}>${Number(totalPrice).toFixed(2)}</Text>
                </View>
            </ScrollView>

            {/* FOOTER ACTION */}
            {order.status === 'shipped' ? (
                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.btnSuccess} 
                        onPress={handlePressReceive} // 👈 Mở Modal
                        activeOpacity={0.8}
                    >
                        <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.btnText}>ĐÃ NHẬN ĐƯỢC HÀNG</Text>
                    </TouchableOpacity>
                </View>
            ) : order.status === 'delivered' ? (
                 <View style={[styles.footer, { backgroundColor: 'transparent', borderTopWidth: 0 }]}>
                    <View style={styles.completedBadge}>
                        <Ionicons name="star" size={16} color="#fff" />
                        <Text style={styles.completedText}>Đơn hàng đã hoàn tất</Text>
                    </View>
                </View>
            ) : null}

            {/* ⭐ MODAL XÁC NHẬN (LUÔN NẰM CUỐI CÙNG) ⭐ */}
            <ConfirmModal
                visible={modalVisible}
                title="Xác nhận nhận hàng"
                message="Bạn có chắc chắn đã nhận được gói hàng này không? Trạng thái đơn sẽ chuyển thành 'Thành công'."
                onConfirm={confirmReceiveOrder}
                onCancel={() => setModalVisible(false)}
                loading={isProcessing}
                confirmText="Xác nhận"
                cancelText="Quay lại"
            />
        </SafeAreaView>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 16, paddingBottom: 100 },

    headerSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    orderId: { fontSize: 20, fontWeight: '800', color: COLORS.secondary },
    orderDate: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    statusText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },

    timelineContainer: { 
        flexDirection: 'row', justifyContent: 'space-between', 
        backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 20,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 2 }
        })
    },
    stepItem: { alignItems: 'center', flex: 1, position: 'relative' },
    stepCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
    stepActive: { backgroundColor: COLORS.primary },
    stepInactive: { backgroundColor: '#EEE' },
    stepLabel: { fontSize: 11, marginTop: 6, color: COLORS.muted, fontWeight: '600' },
    stepLabelActive: { color: COLORS.primary },
    stepLine: { position: 'absolute', top: 16, left: '50%', width: '100%', height: 2, zIndex: 1 },
    lineActive: { backgroundColor: COLORS.primary },
    lineInactive: { backgroundColor: '#EEE' },

    card: {
        backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 6 },
            android: { elevation: 3 }
        })
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.secondary, marginLeft: 8 },
    divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 12 },

    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    infoLabel: { fontSize: 14, color: COLORS.muted },
    infoValue: { fontSize: 14, color: COLORS.secondary, fontWeight: '500' },

    productItem: { flexDirection: 'row', marginBottom: 16, alignItems: 'center' },
    productImage: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#F0F0F0' },
    productInfo: { flex: 1, marginLeft: 12 },
    productName: { fontSize: 14, fontWeight: '600', color: COLORS.secondary },
    productMeta: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
    productPrice: { fontSize: 15, fontWeight: '700', color: COLORS.primary },

    totalCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
    totalLabel: { fontSize: 16, fontWeight: '600', color: COLORS.secondary },
    totalValue: { fontSize: 22, fontWeight: '800', color: COLORS.primary },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', padding: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 20,
        borderTopWidth: 1, borderTopColor: COLORS.border,
        alignItems: 'center',
        zIndex: 10, elevation: 10
    },
    btnSuccess: {
        backgroundColor: COLORS.success, flexDirection: 'row',
        width: '100%', paddingVertical: 16, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: COLORS.success, shadowOffset: {width:0,height:4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
    },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    
    completedBadge: { 
        flexDirection: 'row', alignItems: 'center', 
        backgroundColor: COLORS.success, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 
    },
    completedText: { color: '#fff', fontWeight: '600', marginLeft: 6 }
});