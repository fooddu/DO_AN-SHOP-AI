import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';

export default function CheckoutScreen() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({
    recipientName: '',
    address: '',
    phoneNumber: ''
  });

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

  // Tính tổng tiền sản phẩm
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Tính tổng cộng
  const calculateTotal = () => {
    return calculateSubtotal() + DELIVERY_FEE;
  };

  // Xác nhận đặt hàng
  const submitOrder = async () => {
    // Kiểm tra thông tin
    if (!shippingInfo.recipientName || !shippingInfo.address || !shippingInfo.phoneNumber) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      // Chuẩn bị dữ liệu đơn hàng
      const orderData = {
        user: '674e3c5a9d1b2f3a4e5d6c7b', // ID user mẫu (sau này lấy từ đăng nhập)
        products: cart.map(item => ({
          product: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        total: calculateTotal(),
        shippingAddress: shippingInfo.address,
        phoneNumber: shippingInfo.phoneNumber,
        recipientName: shippingInfo.recipientName
      };

      // Gọi API tạo đơn hàng
      const response = await client.post('/orders', orderData);

      if (response.success) {
        // Xóa giỏ hàng
        await AsyncStorage.removeItem('cart');
        
        // Chuyển sang màn hình thành công
        router.push('/order-success');
      }
    } catch (error) {
      console.error('Lỗi đặt hàng:', error);
      Alert.alert('Lỗi', 'Không thể đặt hàng. Vui lòng thử lại!');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check out</Text>
        <View style={styles.backButton} />
      </View>

      {/* Shipping Address */}
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

      {/* Payment Method */}
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

      {/* Order Summary */}
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
      >
        <Text style={styles.submitButtonText}>SUBMIT ORDER</Text>
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
    paddingTop: 50,
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
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
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
    marginBottom: 10,
    backgroundColor: '#FFF',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
    marginBottom: 10,
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

