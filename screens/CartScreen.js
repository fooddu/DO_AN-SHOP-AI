import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CartScreen() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [promoCode, setPromoCode] = useState('');

  const DELIVERY_FEE = 5.00;

  useEffect(() => {
    loadCart();
  }, []);

  // Lấy giỏ hàng từ Local Storage
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

  // Lưu giỏ hàng vào Local Storage
  const saveCart = async (newCart) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(newCart));
      setCart(newCart);
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  // Tăng số lượng
  const increaseQuantity = (productId) => {
    const newCart = cart.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    saveCart(newCart);
  };

  // Giảm số lượng
  const decreaseQuantity = (productId) => {
    const newCart = cart.map(item => {
      if (item.productId === productId && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    });
    saveCart(newCart);
  };

  // Xóa sản phẩm
  const removeProduct = (productId) => {
    Alert.alert(
      'Confirm',
      'Do you want to remove this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => {
            const newCart = cart.filter(item => item.productId !== productId);
            saveCart(newCart);
          }
        }
      ]
    );
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

  // Chuyển sang màn hình thanh toán
  const goToCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Notice', 'Your cart is empty!');
      return;
    }
    router.push('/checkout');
  };

  // Hiển thị 1 sản phẩm trong giỏ
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image 
        source={{ uri: item.image }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>$ {item.price.toFixed(2)}</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => decreaseQuantity(item.productId)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => increaseQuantity(item.productId)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => removeProduct(item.productId)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My cart</Text>
        <View style={styles.backButton} />
      </View>

      {/* Danh sách sản phẩm */}
      {cart.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyText}>Cart is empty</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.productId}
            contentContainerStyle={styles.cartList}
          />

          {/* Promo Code */}
          <View style={styles.promoContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter your promo code"
              value={promoCode}
              onChangeText={setPromoCode}
            />
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Tổng tiền */}
          <View style={styles.summaryContainer}>
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

          {/* Nút Check out */}
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={goToCheckout}
          >
            <Text style={styles.checkoutButtonText}>Check out</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  cartList: {
    paddingHorizontal: 15,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 5,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 15,
    color: '#000',
  },
  deleteButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#999',
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  promoContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 15,
  },
  promoInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 14,
  },
  promoButton: {
    width: 50,
    height: 50,
    backgroundColor: '#000',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  promoButtonText: {
    color: '#FFF',
    fontSize: 20,
  },
  summaryContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
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
  checkoutButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

