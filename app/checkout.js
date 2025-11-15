import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, // Đã sửa lỗi cú pháp import
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import client from '../api/client'; // Import client Axios đã cấu hình

export default function CheckoutScreen() {
  const router = useRouter();
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
      console.error('Lỗi lấy giỏ hàng:', error);
    }
  };

  // FIX: Đảm bảo trả về số 0 nếu cart rỗng hoặc giá/số lượng không hợp lệ
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
    if (cart.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng của bạn đang trống!');
      return;
    }
    if (!shippingInfo.recipientName || !shippingInfo.address || !shippingInfo.phoneNumber) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin giao hàng!');
      return;
    }
    
    if (isLoading) return;
    setIsLoading(true); 

    console.log('--- [DEBUG] Bắt đầu gọi API đặt hàng (POST /orders) ---');

    try {
      const orderData = {
        user: '690f70a1e440a80ae3a4cec2', 
        products: cart.map(item => ({
          product: item.productId, 
          quantity: item.quantity,
          price: item.price
        })),
        total: calculateTotal(),
        shippingAddress: shippingInfo.address,
        phoneNumber: shippingInfo.phoneNumber,
        recipientName: shippingInfo.recipientName,
        status: 'pending'
      };

      console.log('[DEBUG] Dữ liệu gửi đi:', orderData);
      
      const response = await client.post('/orders', orderData);

      console.log('[DEBUG] Phản hồi từ Server:', response.data);

      if (response.data && response.data.success) { 
        console.log('✅ [DEBUG] Đặt hàng THÀNH CÔNG! Chuyển hướng.');
        
        await AsyncStorage.removeItem('cart');
        
        router.replace('/order-success');
      } else {
        console.error('❌ [DEBUG] Server báo lỗi logic:', response.data?.message);
        Alert.alert('Lỗi', response.data?.message || 'Lỗi server không rõ.');
      }

    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Lỗi kết nối hoặc server.';
        console.error('❌ [DEBUG] Lỗi đặt hàng chi tiết:', error);
        Alert.alert('Lỗi đặt hàng', errorMessage);
    } finally {
        setIsLoading(false);
        console.log('--- [DEBUG] Kết thúc xử lý đặt hàng ---');
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
          placeholder="Tên người nhận"
          value={shippingInfo.recipientName}
          onChangeText={(text) => setShippingInfo({...shippingInfo, recipientName: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Địa chỉ"
          value={shippingInfo.address}
          onChangeText={(text) => setShippingInfo({...shippingInfo, address: text})}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 30, 
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
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
    backgroundColor: '#000',
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
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});