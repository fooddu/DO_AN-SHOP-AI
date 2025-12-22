import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// BỎ import Elements, loadStripe
// BỎ import NewStripePayment
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import client from '../../api/axiosConfig';
import ToastMessage from '../../components/ToastMessage';
import { useAuth } from '../../context/AuthContext';
// Nếu bạn muốn giữ Native Mobile Payment (Sheet) thì giữ lại useStripe, không thì bỏ luôn cũng được
import { useStripe } from '../../utils/stripe-helper';

const APP_PINK = '#FF3366';
const DELIVERY_FEE = 5.00;

export default function CheckoutScreen() {
    const router = useRouter();
    const { user } = useAuth();
    // Giữ cái này nếu muốn dùng Sheet cho Mobile App, nếu muốn chuyển hết sang màn hình riêng thì bỏ
    const { initPaymentSheet, presentPaymentSheet } = useStripe(); 
    
    const [cart, setCart] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [shippingInfo, setShippingInfo] = useState({ recipientName: '', phoneNumber: '', address: '' });
    const [addresses, setAddresses] = useState([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

    // KHÔNG CẦN state showWebPayment nữa

    useFocusEffect(useCallback(() => { loadCart(); fetchAddresses(); }, []));

    const showToast = (message, type = 'error') => setToast({ visible: true, message, type });

    const fetchAddresses = async () => {
        try {
            const res = await client.get('/addresses');
            if (res.data.success) {
                setAddresses(res.data.data);
                if (res.data.data.length > 0 && !shippingInfo.recipientName) {
                    const defaultAddr = res.data.data.find(a => a.isDefault) || res.data.data[0];
                    fillAddressToForm(defaultAddr);
                }
            }
        } catch (error) { console.log(error); }
    };

    const fillAddressToForm = (addr) => {
        setShippingInfo({ recipientName: addr.recipientName, phoneNumber: addr.phoneNumber, address: addr.fullAddress });
    };

    const loadCart = async () => {
        const data = await AsyncStorage.getItem('cart');
        if (data) setCart(JSON.parse(data));
    };

    const calculateTotal = () => {
        const sub = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        return sub + DELIVERY_FEE;
    };

    // --- XỬ LÝ CHUYỂN HƯỚNG SANG TRANG THANH TOÁN THẺ ---
    const goToCardPayment = () => {
        // 1. Validate địa chỉ trước
        if (!shippingInfo.recipientName || !shippingInfo.address || !shippingInfo.phoneNumber) {
            return showToast('Vui lòng nhập đầy đủ thông tin giao hàng.', 'error');
        }

        // 2. Chuyển hướng và mang theo dữ liệu cần thiết
        router.push({
            pathname: '/payment', // Đường dẫn tới file payment.js vừa tạo
            params: {
                total: calculateTotal(),
                cart: JSON.stringify(cart), // Phải stringify vì params chỉ nhận chuỗi
                shippingInfo: JSON.stringify(shippingInfo)
            }
        });
    };

    const submitOrderCOD = async () => {
        if (!shippingInfo.recipientName || !shippingInfo.address) return showToast('Thiếu thông tin giao hàng.', 'error');
        setIsLoading(true);

        try {
            const orderData = {
                user: user._id,
                products: cart.map(i => ({ product: i.productId, quantity: i.quantity, price: i.price })),
                total: calculateTotal(),
                shippingAddress: {
                    recipientName: shippingInfo.recipientName,
                    fullAddress: shippingInfo.address,
                    phoneNumber: shippingInfo.phoneNumber,
                },
                status: 'pending',
                paymentMethod: 'COD',
                isPaid: false
            };
            const res = await client.post('/orders', orderData);
            if (res.data.success) {
                await AsyncStorage.removeItem('cart');
                router.replace('/order-success');
            }
        } catch (error) {
            showToast('Đặt hàng thất bại.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const renderAddressItem = ({ item }) => (
        <TouchableOpacity style={styles.modalItem} onPress={() => { fillAddressToForm(item); setShowAddressModal(false); }}>
            <View style={{ flex: 1 }}>
                <Text style={styles.modalName}>{item.recipientName} - {item.phoneNumber}</Text>
                <Text style={styles.modalAddress}>{item.fullAddress}</Text>
            </View>
            <Ionicons name="checkmark-circle-outline" size={24} color={APP_PINK} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.responsiveContainer}>
                <ToastMessage visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast({ ...toast, visible: false })} />

                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Checkout</Text>
                    <View style={{ width: 40 }} /> 
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Delivery Info */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Delivery Information</Text>
                            <TouchableOpacity onPress={() => setShowAddressModal(true)} style={styles.linkButton}>
                                <Text style={styles.linkText}>Select Address</Text>
                                <Ionicons name="chevron-down" size={16} color={APP_PINK} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.formGroup}>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={20} color="#888" />
                                <TextInput style={styles.textInput} placeholder="Recipient Name" value={shippingInfo.recipientName} onChangeText={t => setShippingInfo({ ...shippingInfo, recipientName: t })} />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="call-outline" size={20} color="#888" />
                                <TextInput style={styles.textInput} placeholder="Phone Number" value={shippingInfo.phoneNumber} onChangeText={t => setShippingInfo({ ...shippingInfo, phoneNumber: t })} keyboardType="phone-pad" />
                            </View>
                            <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 12 }]}>
                                <Ionicons name="location-outline" size={20} color="#888" style={{ marginTop: 2 }} />
                                <TextInput style={[styles.textInput, { height: 'auto', minHeight: 40 }]} placeholder="Full Address" value={shippingInfo.address} onChangeText={t => setShippingInfo({ ...shippingInfo, address: t })} multiline />
                            </View>
                        </View>
                    </View>

                    {/* Order Summary */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Order Summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>${(calculateTotal() - DELIVERY_FEE).toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee</Text>
                            <Text style={styles.summaryValue}>${DELIVERY_FEE.toFixed(2)}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
                        </View>
                    </View>

                    {/* Payment Buttons - ĐÃ LÀM GỌN LẠI */}
                    <View style={styles.paymentContainer}>
                        {/* NÚT THANH TOÁN THẺ - Bấm phát chuyển trang luôn */}
                        <TouchableOpacity style={styles.visaButton} onPress={goToCardPayment}>
                            <Ionicons name="card" size={24} color="#FFF" style={{ marginRight: 10 }} />
                            <Text style={styles.visaButtonText}>PAY WITH VISA / MASTER</Text>
                            <Ionicons name="chevron-forward" size={20} color="#FFF" style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>

                        {/* NÚT THANH TOÁN COD */}
                        <TouchableOpacity style={styles.codButton} onPress={submitOrderCOD} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#000"/> : (
                                <Text style={styles.codButtonText}>PAY ON DELIVERY (COD)</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                </ScrollView>

                {/* MODAL Address giữ nguyên */}
                <Modal visible={showAddressModal} animationType="slide" transparent={true}>
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Address</Text>
                                <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                                    <Ionicons name="close" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>
                            <FlatList data={addresses} renderItem={renderAddressItem} keyExtractor={item => item._id} style={{ maxHeight: 300 }} />
                            <TouchableOpacity style={styles.modalAddButton} onPress={() => { setShowAddressModal(false); router.push('/add-address-form'); }}>
                                <Ionicons name="add" size={20} color="#fff"/>
                                <Text style={styles.modalAddText}>Add New Address</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </View>
        </SafeAreaView>
    );
}

// Copy y nguyên phần styles từ code cũ của bạn vào đây (chỉ cần đảm bảo responsiveContainer, card, header... đã có style)
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F0F2F5' },
    responsiveContainer: {
        flex: 1, width: '100%', maxWidth: 500, alignSelf: 'center', backgroundColor: '#FFFFFF',
        ...Platform.select({ web: { boxShadow: '0 0 20px rgba(0,0,0,0.1)', minHeight: '100vh', borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#E5E7EB' } })
    },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: '#FFF', paddingTop: Platform.OS === 'android' ? 40 : 12 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
    backButton: { padding: 4 },
    card: { backgroundColor: '#FFF', padding: 16, marginHorizontal: 16, marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
    linkButton: { flexDirection: 'row', alignItems: 'center' },
    linkText: { color: APP_PINK, fontWeight: '600', marginRight: 4, fontSize: 13 },
    formGroup: { gap: 12 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, height: 'auto', minHeight: 48 },
    textInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#111', paddingVertical: 12 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { color: '#666', fontSize: 14 },
    summaryValue: { color: '#111', fontWeight: '500', fontSize: 14 },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 8 },
    totalLabel: { fontSize: 16, fontWeight: '700', color: '#111' },
    totalValue: { fontSize: 18, fontWeight: '700', color: APP_PINK },
    paymentContainer: { padding: 16, marginTop: 8 },
    visaButton: { backgroundColor: '#FF3366', flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 10, marginBottom: 12, shadowColor: "#5433FF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
    visaButtonText: { color: '#FFF', fontWeight: '700', fontSize: 16, flex: 1, textAlign: 'center' },
    codButton: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#111', alignItems: 'center', paddingVertical: 16, borderRadius: 10 },
    codButtonText: { color: '#111', fontWeight: '700', fontSize: 15 },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, width: '100%', maxWidth: 500, alignSelf: 'center' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '700' },
    modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    modalName: { fontWeight: '700', fontSize: 14, marginBottom: 4 },
    modalAddress: { fontSize: 13, color: '#555' },
    modalAddButton: { backgroundColor: APP_PINK, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 10, marginTop: 20 },
    modalAddText: { color: '#FFF', fontWeight: '700', marginLeft: 6 },
});