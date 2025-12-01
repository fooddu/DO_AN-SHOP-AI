import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import client from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

// 🎨 MÀU HỒNG CHỦ ĐẠO
const APP_PINK = '#FF3366';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({
    recipientName: '',
    address: '',
    phoneNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false); 

  const DELIVERY_FEE = 5.00;

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => { 
    try {
      const data = await AsyncStorage.getItem('cart');
      if (data) {
        setCart(JSON.parse(data));
      }
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
    // 1. Validate Cart
    if (cart.length === 0) {
      Alert.alert('Notice', 'Your cart is empty!');
      return;
    }
    // 2. Validate Info
    if (!shippingInfo.recipientName || !shippingInfo.address || !shippingInfo.phoneNumber) {
      Alert.alert('Notice', 'Please enter all shipping details!');
      return;
    }
    // 3. Validate User
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
        const errorMessage = error.response?.data?.message || error.message || 'Connection or server error.';
        Alert.alert('Order Error', errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* SHIPPING ADDRESS */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <TouchableOpacity>
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Recipient Name"
          value={shippingInfo.recipientName}
          onChangeText={(text) => setShippingInfo({...shippingInfo, recipientName: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={shippingInfo.address}
          onChangeText={(text) => setShippingInfo({...shippingInfo, address: text})}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={shippingInfo.phoneNumber}
          onChangeText={(text) => setShippingInfo({...shippingInfo, phoneNumber: text})}
          keyboardType="phone-pad"
        />
      </View>

      {/* PAYMENT METHOD */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment method</Text>
        
        <View style={styles.paymentOption}>
          <View style={styles.radioOuter}>
            <View style={styles.radioInner} />
          </View>
          <Text style={styles.paymentText}>Visa</Text>
        </View>

        <View style={styles.paymentOption}>
          <View style={styles.radioOuter} />
          <Text style={styles.paymentText}>Master card</Text>
        </View>
      </View>

      {/* ORDER SUMMARY */}
      <View style={styles.section}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Order:</Text>
          <Text style={styles.summaryValue}>
            $ {calculateSubtotal().toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery:</Text>
          <Text style={styles.summaryValue}>$ {DELIVERY_FEE.toFixed(2)}</Text>
        </View>

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>
            $ {calculateTotal().toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={styles.submitButton}
        onPress={submitOrder}
        disabled={isLoading} 
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitButtonText}>SUBMIT ORDER</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
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
  // ⭐️ Đã đổi chữ Total thành màu Hồng
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_PINK, 
  },
  // ⭐️ Đã đổi số tiền Total thành màu Hồng
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