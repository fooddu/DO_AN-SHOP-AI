import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator, Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';

// Dùng chung client config đã fix (dynamic IP)
import client from '../api/axiosConfig';
import { useStripe } from '../components/StripeWrapper';
import { useAuth } from '../context/AuthContext';

const APP_PINK = '#FF3366';
const DELIVERY_FEE = 5.00;

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // State chứa thông tin nhập liệu
  const [shippingInfo, setShippingInfo] = useState({
    recipientName: '',
    phoneNumber: '',
    address: ''
  });

  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCart();
      fetchAddresses();
    }, [])
  );

  const fetchAddresses = async () => {
    try {
      const res = await client.get('/addresses');
      if (res.data.success) {
        setAddresses(res.data.data);
        // Tự động điền địa chỉ mặc định vào form nếu form đang trống
        if (res.data.data.length > 0 && !shippingInfo.recipientName) {
          const defaultAddr = res.data.data.find(a => a.isDefault) || res.data.data[0];
          fillAddressToForm(defaultAddr);
        }
      }
    } catch (error) {
      console.log("Error loading addresses:", error);
    }
  };

  // Hàm điền thông tin từ địa chỉ chọn sẵn vào Form
  const fillAddressToForm = (addr) => {
    setShippingInfo({
      recipientName: addr.recipientName,
      phoneNumber: addr.phoneNumber,
      address: addr.fullAddress
    });
  };

  const loadCart = async () => {
    const data = await AsyncStorage.getItem('cart');
    if (data) setCart(JSON.parse(data));
  };

  // Tính tổng phụ (giá * số lượng)
  const calculateSubtotal = () => {
    if (!cart || cart.length === 0) return 0;
    return cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
  };

  // Tính tổng cuối cùng
  const calculateTotal = () => {
    return calculateSubtotal() + DELIVERY_FEE;
  };

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'STRIPE'

  // ... (keep existing setup) ...

  const fetchPaymentSheetParams = async () => {
    try {
      const response = await client.post('/payments/intents', {
        amount: calculateTotal() * 100, // cents
      });
      const { paymentIntent, ephemeralKey, customer } = response.data;
      return {
        paymentIntent,
        ephemeralKey,
        customer,
      };
    } catch (error) {
      console.error("Error fetching payment params:", error);
      Alert.alert("Error", "Could not initialize payment.");
      return null;
    }
  };

  const createCheckoutSession = async () => {
    try {
      const response = await client.post('/payments/checkout-session', {
        amount: calculateTotal() * 100, // cents
        successUrl: window.location.origin + '/order-success?session_id={CHECKOUT_SESSION_ID}',
        cancelUrl: window.location.origin + '/checkout',
      });
      return response.data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      Alert.alert('Error', 'Could not initialize payment.');
      return null;
    }
  };

  const initializePaymentSheet = async () => {
    if (Platform.OS === 'web') return true; // Skip on Web

    const params = await fetchPaymentSheetParams();
    if (!params) return false;

    const { error } = await initPaymentSheet({
      merchantDisplayName: "Shop AI",
      customerId: params.customer,
      customerEphemeralKeySecret: params.ephemeralKey,
      paymentIntentClientSecret: params.paymentIntent,
      // Set to true for Apple Pay
      applePay: {
        merchantCountryCode: 'US',
      },
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: {
        name: shippingInfo.recipientName,
        phone: shippingInfo.phoneNumber,
      }
    });

    if (error) {
      Alert.alert("Error", error.message);
      return false;
    }
    return true;
  };

  const openPaymentSheet = async () => {
    if (Platform.OS === 'web') {
      // Redirect to Stripe Checkout for Web
      const session = await createCheckoutSession();
      if (!session || !session.url) return false;

      // Redirect to Stripe Checkout page
      window.location.href = session.url;
      return true; // Will redirect away
    }

    // Mobile: Use Payment Sheet
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
      return false;
    } else {
      Alert.alert('Success', 'Your order is confirmed!');
      return true;
    }
  };

  const submitOrder = async () => {
    if (!shippingInfo.recipientName || !shippingInfo.phoneNumber || !shippingInfo.address) {
      return Alert.alert('Missing Information', 'Please fill in all delivery details.');
    }

    if (!user || (!user._id && !user.id)) {
      Alert.alert('Error', 'Session expired. Please login again.');
      return;
    }

    if (paymentMethod === 'STRIPE') {
      // 1. Initialize Stripe
      const isReady = await initializePaymentSheet();
      if (!isReady) return;

      // 2. Open Sheet
      const isPaid = await openPaymentSheet();
      if (!isPaid) return;

      // 3. Paid successfully -> Continue to save order to backend
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const orderData = {
        user: user._id || user.id,
        products: cart.map(i => ({
          product: i.productId,
          quantity: i.quantity,
          price: i.price
        })),
        totalPrice: calculateTotal(),
        total: calculateTotal(),
        shippingAddress: {
          recipientName: shippingInfo.recipientName,
          fullAddress: shippingInfo.address,
          phoneNumber: shippingInfo.phoneNumber,
        },
        paymentMethod: paymentMethod, // 'COD' or 'STRIPE'
        status: 'pending' // Always pending initially, paymentMethod indicates payment type
      };

      const res = await client.post('/orders', orderData);

      if (res.data.success) {
        await AsyncStorage.removeItem('cart');
        router.replace('/order-success');
      } else {
        Alert.alert('Error', res.data?.message || 'Order Saving Failed');
      }
    } catch (error) {
      console.error("Order Error:", error.response?.data);
      Alert.alert('Error', 'Order Failed');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Item in Address Modal ---
  const renderAddressItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        fillAddressToForm(item); // Fill form
        setShowAddressModal(false); // Close modal
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.modalName}>{item.recipientName} - {item.phoneNumber}</Text>
        <Text style={styles.modalAddress}>{item.fullAddress}</Text>
      </View>
      <Ionicons name="arrow-forward-circle-outline" size={24} color={APP_PINK} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>

      {/* --- INPUT FORM SECTION (Editable & Selectable) --- */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          {/* Button to open quick select list */}
          <TouchableOpacity onPress={() => setShowAddressModal(true)} style={styles.selectBtn}>
            <Text style={styles.selectBtnText}>Select from address book</Text>
            <Ionicons name="chevron-down" size={16} color={APP_PINK} />
          </TouchableOpacity>
        </View>

        {/* 3 Editable TextInputs */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Recipient Name"
              value={shippingInfo.recipientName}
              onChangeText={(t) => setShippingInfo({ ...shippingInfo, recipientName: t })}
            />
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={shippingInfo.phoneNumber}
              onChangeText={(t) => setShippingInfo({ ...shippingInfo, phoneNumber: t })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { height: 'auto', minHeight: 40 }]}
              placeholder="Address (House number, Street...)"
              value={shippingInfo.address}
              onChangeText={(t) => setShippingInfo({ ...shippingInfo, address: t })}
              multiline
            />
          </View>
        </View>
      </View>

      {/* --- MODAL SELECT EXISTING ADDRESS --- */}
      <Modal visible={showAddressModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Existing Address</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={addresses}
              renderItem={renderAddressItem}
              keyExtractor={item => item._id}
              style={{ maxHeight: 400 }}
              ListEmptyComponent={<Text style={{ textAlign: 'center', padding: 20 }}>No address found.</Text>}
            />

            {/* Button to switch to add new address form */}
            <TouchableOpacity
              style={styles.modalAddBtn}
              onPress={() => { setShowAddressModal(false); router.push('/add-address-form'); }}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 5 }}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Method Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>

        {/* Option 1: COD */}
        <TouchableOpacity
          style={styles.paymentOption}
          onPress={() => setPaymentMethod('COD')}
        >
          <View style={styles.radioOuter}>
            {paymentMethod === 'COD' && <View style={styles.radioInner} />}
          </View>
          <Text style={styles.paymentText}>Cash on Delivery (COD)</Text>
        </TouchableOpacity>

        {/* Option 2: Stripe - Now available on all platforms */}
        <TouchableOpacity
          style={styles.paymentOption}
          onPress={() => setPaymentMethod('STRIPE')}
        >
          <View style={styles.radioOuter}>
            {paymentMethod === 'STRIPE' && <View style={styles.radioInner} />}
          </View>
          <Text style={styles.paymentText}>Credit Card (Stripe)</Text>
        </TouchableOpacity>
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>${calculateSubtotal().toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Delivery Fee</Text>
          <Text style={styles.value}>${DELIVERY_FEE.toFixed(2)}</Text>
        </View>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={submitOrder} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>PLACE ORDER</Text>}
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  section: { padding: 20, marginBottom: 10, backgroundColor: '#FFF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },

  selectBtn: { flexDirection: 'row', alignItems: 'center' },
  selectBtnText: { color: APP_PINK, fontWeight: 'bold', marginRight: 5 },

  // Style for Input Form
  inputContainer: { gap: 12 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8,
    paddingHorizontal: 10, backgroundColor: '#FAFAFA'
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#333' },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalName: { fontWeight: 'bold', fontSize: 14 },
  modalAddress: { fontSize: 13, color: '#444', marginTop: 2 },
  modalAddBtn: { backgroundColor: APP_PINK, padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15 },

  // Payment UI
  paymentOption: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#000', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: APP_PINK },
  paymentText: { fontSize: 14, color: '#000' },

  // Summary & Button
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { color: '#666' }, value: { fontWeight: '500' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10, marginTop: 5 },
  totalLabel: { fontWeight: 'bold', fontSize: 16 }, totalValue: { fontWeight: 'bold', fontSize: 16, color: APP_PINK },
  submitButton: { backgroundColor: APP_PINK, padding: 16, borderRadius: 8, margin: 20, alignItems: 'center' },
  submitButtonText: { color: '#FFF', fontWeight: 'bold' },
});
