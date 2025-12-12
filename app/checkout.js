import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator, Alert,
  FlatList,
  Modal,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';

import client from '../api/axiosConfig';
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
<<<<<<< HEAD
=======
  const [isLoading, setIsLoading] = useState(false);
>>>>>>> 222a6cbd36dce12fad6709f000cf508bf2eb00ea

  const [addresses, setAddresses] = useState([]); 
  const [showAddressModal, setShowAddressModal] = useState(false); 

  useFocusEffect(
    useCallback(() => {
      loadCart();
      fetchAddresses();
    }, [])
  );

<<<<<<< HEAD
  const fetchAddresses = async () => {
=======
  const loadCart = async () => {
>>>>>>> 222a6cbd36dce12fad6709f000cf508bf2eb00ea
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
<<<<<<< HEAD
    } catch (error) { console.log(error); }
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
      if(data) setCart(JSON.parse(data));
  };

  const calculateTotal = () => { 
      const sub = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      return sub + DELIVERY_FEE;
  };

  const submitOrder = async () => {
    if (!shippingInfo.recipientName || !shippingInfo.phoneNumber || !shippingInfo.address) {
        return Alert.alert('Missing Information', 'Please fill in all delivery details.');
    }
    
    setIsLoading(true);
    try {
        const orderData = {
            user: user._id,
            products: cart.map(i => ({ 
                product: i.productId, 
                quantity: i.quantity, 
                price: i.price 
            })),
            
            // ⚠️ Lưu ý: Nếu backend dùng 'total' thì để 'total', nếu 'totalPrice' thì sửa thành 'totalPrice'
            // Dựa trên model mẫu thường là 'totalPrice', nhưng mình để cả 2 hoặc bạn check lại model
            totalPrice: calculateTotal(), 
            total: calculateTotal(), 

            shippingAddress: {
                recipientName: shippingInfo.recipientName,
                
                // ⭐ FIX QUAN TRỌNG: Đổi 'address' thành 'fullAddress' để khớp Backend
                fullAddress: shippingInfo.address, 
                
                phoneNumber: shippingInfo.phoneNumber,
            },
            
            // ⭐ FIX STATUS: Đổi thành chữ thường 'pending'
            status: 'pending' 
        };

        const res = await client.post('/orders', orderData);
        
        if(res.data.success) {
            await AsyncStorage.removeItem('cart');
            router.replace('/order-success');
        }
    } catch(error) { 
        console.error("Order Error:", error.response?.data);
        const msg = error.response?.data?.message || 'Order Failed';
        Alert.alert('Error', msg); 
    } finally { 
        setIsLoading(false); 
=======
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const calculateSubtotal = () => {
    if (!cart || cart.length === 0) {
      return 0;
    }
    return cart.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + DELIVERY_FEE;
  };

  const submitOrder = async () => {
    // 1. Kiểm tra giỏ hàng
    if (cart.length === 0) {
      Alert.alert('Notice', 'Your cart is empty!');
      return;
    }
    // 2. Kiểm tra thông tin giao hàng
    if (!shippingInfo.recipientName || !shippingInfo.address || !shippingInfo.phoneNumber) {
      Alert.alert('Notice', 'Please fill in all shipping details!');
      return;
    }
    // 3. Kiểm tra trạng thái đăng nhập
    if (!user || !user._id) {
      Alert.alert('Error', 'Session expired. Please login again.');
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const orderData = {
        user: user._id,
        products: cart.map(item => ({
          product: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        total: calculateTotal(),
        shippingAddress: {
          recipientName: shippingInfo.recipientName,
          fullAddress: shippingInfo.address,
          phoneNumber: shippingInfo.phoneNumber,
        },
        status: 'pending'
      };

      const response = await client.post('/orders', orderData);

      if (response.data && response.data.success) {
        await AsyncStorage.removeItem('cart');
        router.replace('/order-success');
      } else {
        Alert.alert('Error', response.data?.message || 'Unknown server error.');
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Connection error.';
      Alert.alert('Order Failed', errorMessage);
    } finally {
      setIsLoading(false);
>>>>>>> 222a6cbd36dce12fad6709f000cf508bf2eb00ea
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
        <View style={{flex: 1}}>
            <Text style={styles.modalName}>{item.recipientName} - {item.phoneNumber}</Text>
            <Text style={styles.modalAddress}>{item.fullAddress}</Text>
        </View>
        <Ionicons name="arrow-forward-circle-outline" size={24} color={APP_PINK} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      
      {/* --- INPUT FORM SECTION (EDITABLE) --- */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
<<<<<<< HEAD
            <Text style={styles.sectionTitle}>Delivery Information</Text>
            {/* Button to open quick select list */}
            <TouchableOpacity onPress={() => setShowAddressModal(true)} style={styles.selectBtn}>
                <Text style={{color: APP_PINK, fontWeight: 'bold', marginRight: 5}}>Select from address book</Text>
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
                    onChangeText={(t) => setShippingInfo({...shippingInfo, recipientName: t})}
                />
            </View>

            <View style={styles.inputRow}>
                <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput 
                    style={styles.input} 
                    placeholder="Phone Number"
                    value={shippingInfo.phoneNumber}
                    onChangeText={(t) => setShippingInfo({...shippingInfo, phoneNumber: t})}
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.inputRow}>
                <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput 
                    style={[styles.input, {height: 'auto', minHeight: 40}]} 
                    placeholder="Address (House number, Street...)"
                    value={shippingInfo.address}
                    onChangeText={(t) => setShippingInfo({...shippingInfo, address: t})}
                    multiline
                />
            </View>
        </View>
=======
          <Text style={styles.sectionTitle}>Shipping Information</Text>
          <TouchableOpacity>
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Recipient Name"
          value={shippingInfo.recipientName}
          onChangeText={(text) => setShippingInfo({ ...shippingInfo, recipientName: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={shippingInfo.address}
          onChangeText={(text) => setShippingInfo({ ...shippingInfo, address: text })}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={shippingInfo.phoneNumber}
          onChangeText={(text) => setShippingInfo({ ...shippingInfo, phoneNumber: text })}
          keyboardType="phone-pad"
        />
>>>>>>> 222a6cbd36dce12fad6709f000cf508bf2eb00ea
      </View>

      {/* --- MODAL SELECT EXISTING ADDRESS --- */}
      <Modal visible={showAddressModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Existing Address</Text>
                    <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                        <Ionicons name="close" size={24} color="#000"/>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={addresses}
                    renderItem={renderAddressItem}
                    keyExtractor={item => item._id}
                    style={{maxHeight: 400}}
                    ListEmptyComponent={<Text style={{textAlign:'center', padding: 20}}>No address found.</Text>}
                />
                
                {/* Button to switch to add new address form */}
                <TouchableOpacity 
                    style={styles.modalAddBtn} 
                    onPress={() => { setShowAddressModal(false); router.push('/add-address-form'); }}
                >
                    <Ionicons name="add" size={20} color="#fff"/>
                    <Text style={{color:'#fff', fontWeight:'bold', marginLeft: 5}}>Add New Address</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* Order Summary */}
      <View style={styles.section}>
<<<<<<< HEAD
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.row}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>${(calculateTotal() - DELIVERY_FEE).toFixed(2)}</Text>
=======
        <Text style={styles.sectionTitle}>Payment Method</Text>

        <View style={styles.paymentOption}>
          <View style={styles.radioOuter}>
            <View style={styles.radioInner} />
          </View>
          <Text style={styles.paymentText}>Visa</Text>
>>>>>>> 222a6cbd36dce12fad6709f000cf508bf2eb00ea
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

<<<<<<< HEAD
      <TouchableOpacity style={styles.submitButton} onPress={submitOrder} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>PLACE ORDER</Text>}
=======
      {/* TÓM TẮT ĐƠN HÀNG */}
      <View style={styles.section}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Order:</Text>
          <Text style={styles.summaryValue}>
            $ {calculateSubtotal().toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee:</Text>
          <Text style={styles.summaryValue}>$ {DELIVERY_FEE.toFixed(2)}</Text>
        </View>

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>
            $ {calculateTotal().toFixed(2)}
          </Text>
        </View>
      </View>

      {/* NÚT ĐẶT HÀNG */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={submitOrder}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitButtonText}>PLACE ORDER</Text>
        )}
>>>>>>> 222a6cbd36dce12fad6709f000cf508bf2eb00ea
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

  // Style for Input Form
  inputContainer: { gap: 12 },
  inputRow: { 
      flexDirection: 'row', alignItems: 'center', 
      borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, 
      paddingHorizontal: 10, backgroundColor: '#FAFAFA' 
  },
<<<<<<< HEAD
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

  // Summary & Button
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { color: '#666' }, value: { fontWeight: '500' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10, marginTop: 5 },
  totalLabel: { fontWeight: 'bold', fontSize: 16 }, totalValue: { fontWeight: 'bold', fontSize: 16, color: APP_PINK },
  submitButton: { backgroundColor: APP_PINK, padding: 16, borderRadius: 8, margin: 20, alignItems: 'center' },
  submitButtonText: { color: '#FFF', fontWeight: 'bold' },
});
=======
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  editIcon: {
    fontSize: 18,
    color: '#808080',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 8,
    backgroundColor: '#FFF',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: APP_PINK,
  },
  paymentText: {
    fontSize: 14,
    color: '#000',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#808080',
  },
  summaryValue: {
    fontSize: 14,
    color: '#000',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 10,
    marginTop: 5,
  },
  // ⭐️ Đã đổi chữ "Tổng cộng" thành màu Hồng
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_PINK,
  },
  // ⭐️ Đã đổi số tiền "Tổng cộng" thành màu Hồng
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_PINK,
  },
  submitButton: {
    backgroundColor: APP_PINK,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 20,
    alignItems: 'center',
    shadowColor: APP_PINK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
>>>>>>> 222a6cbd36dce12fad6709f000cf508bf2eb00ea
