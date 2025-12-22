import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'; // Thêm Stack
import { useMemo, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import client from '../../api/axiosConfig';
import CustomStripePayment from '../../components/CustomStripePayment';
import { useAuth } from '../../context/AuthContext';

const stripePromise = loadStripe('pk_test_51SgIYkJytB1k3bNs1HdOwHmFmjgLsVuhwnoD8FKOK0UPDwGXGDlgbFqONIWQy3Xm2GeBE6nPaCdfTQ8145fKAujR00e6nexZKY');

export default function PaymentScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    const { totalAmount, cart, shippingInfo } = useMemo(() => {
        try {
            return {
                totalAmount: parseFloat(params.total || '0'),
                cart: params.cart ? JSON.parse(params.cart) : [],
                shippingInfo: params.shippingInfo ? JSON.parse(params.shippingInfo) : {}
            };
        } catch (e) {
            console.error("Params Parse Error:", e);
            return { totalAmount: 0, cart: [], shippingInfo: {} };
        }
    }, [params]);

    const handlePaymentSuccess = async (paymentMethodId) => {
        setIsProcessing(true);
        try {
            const response = await client.post('/payments/web-confirm', {
                amount: totalAmount,
                paymentMethodId: paymentMethodId
            });

            if (response.data.success) {
                await createOrder();
            } else {
                Alert.alert('Payment Failed', response.data.message || 'Please try again.');
                setIsProcessing(false);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('System Error', 'Could not connect to the server.');
            setIsProcessing(false);
        }
    };

    const createOrder = async () => {
        try {
            const orderData = {
                user: user._id,
                products: cart.map(i => ({ product: i.productId, quantity: i.quantity, price: i.price })),
                total: totalAmount,
                shippingAddress: {
                    recipientName: shippingInfo.recipientName,
                    fullAddress: shippingInfo.address,
                    phoneNumber: shippingInfo.phoneNumber,
                },
                status: 'processing',
                paymentMethod: 'VISA/STRIPE (Custom UI)',
                isPaid: true
            };

            const res = await client.post('/orders', orderData);
            if (res.data.success) {
                await AsyncStorage.removeItem('cart');
                router.replace('/order-success');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Payment successful but order creation failed.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            
            {/* Tắt Header của expo-router tại đây */}
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.responsiveContainer}>
                
                {/* Internal Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                        <Ionicons name="chevron-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Secure Payment</Text>
                    <View style={{ width: 40 }} /> 
                </View>

                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"} 
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        
                        <View style={styles.summaryCard}>
                            <Text style={styles.sectionTitle}>Order Summary</Text>
                            <View style={styles.row}>
                                <Text style={styles.label}>Recipient:</Text>
                                <Text style={styles.value}>{shippingInfo.recipientName || 'Customer'}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Phone:</Text>
                                <Text style={styles.value}>{shippingInfo.phoneNumber || '---'}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total Payment</Text>
                                <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
                            </View>
                        </View>

                        <View style={styles.paymentCard}>
                            <Text style={styles.sectionTitle}>Payment Information</Text>
                            
                            <Elements stripe={stripePromise}>
                                <CustomStripePayment 
                                    amount={totalAmount.toFixed(2)} 
                                    onSuccess={handlePaymentSuccess}
                                    isProcessing={isProcessing}
                                />
                            </Elements>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F6F9FC' },
    responsiveContainer: {
        flex: 1,
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
        backgroundColor: '#F6F9FC',
        ...Platform.select({
            web: { boxShadow: '0 0 20px rgba(0,0,0,0.05)' }
        })
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    iconButton: { padding: 5 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
    scrollContent: { padding: 16, paddingBottom: 50 },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    paymentCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#eee',
    },
    sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 15, color: '#32325d' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    label: { fontSize: 14, color: '#6b7c93' },
    value: { fontSize: 14, fontWeight: '600', color: '#32325d' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 16, fontWeight: '700', color: '#32325d' },
    totalValue: { fontSize: 22, fontWeight: '800', color: '#5433FF' },
});