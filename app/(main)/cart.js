// File: app/(main)/cart.js

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { useAuth } from '../../context/AuthContext';

const DELIVERY_FEE = 5.00;
const PROMO_DISCOUNT = 0.00;

export default function CartScreen() {
    const router = useRouter();
    const { user } = useAuth(); // ⭐️ Lấy trạng thái user ⭐️

    const [cart, setCart] = useState([]);
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(PROMO_DISCOUNT);

    useEffect(() => {
        loadCart();
    }, []);

    // --- DATA STORAGE LOGIC (loadCart, saveCart giữ nguyên) ---

    const loadCart = async () => {
        try {
            const data = await AsyncStorage.getItem('cart');
            if (data) {
                const parsedData = JSON.parse(data);
                setCart(parsedData);
                console.log("--- LOAD CART: Loaded", parsedData.length, "items from AsyncStorage.");
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    };

    const saveCart = async (newCart) => {
        try {
            const cleanCart = newCart.filter(item => item.quantity > 0);
            console.log("--- SAVE CART: Saving new cart:", cleanCart.length, "items.");
            
            await AsyncStorage.setItem('cart', JSON.stringify(cleanCart));
            setCart(cleanCart);
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    };

    // --- CART LOGIC (increaseQuantity, decreaseQuantity, removeProduct, applyPromoCode giữ nguyên) ---

    const increaseQuantity = (productId) => {
        const newCart = cart.map(item => {
            if (item.productId === productId) {
                return { ...item, quantity: item.quantity + 1 };
            }
            return item;
        });
        saveCart(newCart);
    };

    const decreaseQuantity = (productId) => {
        const newCart = cart.map(item => {
            if (item.productId === productId && item.quantity > 1) {
                return { ...item, quantity: item.quantity - 1 };
            }
            return item;
        });
        saveCart(newCart);
    };

    const removeProduct = (productId) => {
        console.log("--- DELETE ACTION: Removing ID:", productId); 
        
        const targetId = productId ? productId.toString() : null; 
        
        const newCart = cart.filter(item => {
            const itemId = item.productId ? item.productId.toString() : null;
            return itemId !== targetId;
        });
        
        console.log("--- DELETE RESULT: New cart size:", newCart.length); 

        if (newCart.length < cart.length) {
            saveCart(newCart);
        } else {
            console.warn("Error: Product ID mismatch. Deletion failed.");
        }
    };

    const applyPromoCode = () => {
        if (promoCode.toUpperCase() === 'FREE5') {
            setDiscount(5.00); 
            Alert.alert('Success', 'Promo code applied! $5 discount.');
        } else {
            setDiscount(0.00);
            Alert.alert('Error', 'Invalid promo code.');
        }
    };
    
    // --- CALCULATIONS (giữ nguyên) ---

    const calculateSubtotal = () => {
        return cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const finalOrder = subtotal - discount;
        return (finalOrder > 0 ? finalOrder : 0) + DELIVERY_FEE; 
    };
    
    // --- NAVIGATION (Thêm kiểm tra đăng nhập) ---

    const goToCheckout = () => {
        if (cart.length === 0) {
            Alert.alert('Notification', 'Your cart is empty!');
            return;
        }

        // ⭐️ KIỂM TRA ĐĂNG NHẬP ⭐️
        if (!user) {
            Alert.alert(
                'Access Denied', 
                'You must be logged in to proceed to checkout.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Sign In', onPress: () => router.push('/(auth)/login') }
                ]
            );
            return;
        }

        // Nếu đã đăng nhập và giỏ hàng không trống
        router.push('/(main)/checkout'); 
    };

    // --- RENDER CART ITEM (giữ nguyên) ---

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <Image
                source={{ uri: item.image }}
                style={styles.itemImage}
            />

            <View style={styles.itemMainContent}>
                <View>
                    <Text style={styles.itemName} numberOfLines={1}>
                        {item.name}
                    </Text>
                    {item.size && <Text style={styles.itemSize}>Size: {item.size}</Text>} 
                    <Text style={styles.itemPrice}>
                        $ {(item.price * item.quantity).toFixed(2)}
                    </Text>
                </View>

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

            {/* DELETE BUTTON */}
            <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => {
                    Alert.alert(
                        "Remove Item",
                        "Are you sure you want to remove this item?",
                        [
                            { text: "Cancel", style: "cancel" },
                            { text: "Remove", onPress: () => removeProduct(item.productId), style: 'destructive' }
                        ]
                    );
                }}
            >
                <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
        </View>
    );

    const subtotal = calculateSubtotal();
    const finalOrder = subtotal - discount;
    const total = calculateTotal();


    // --- RENDER UI ---

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header tùy chỉnh */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Your Cart</Text>
                    <View style={styles.backButton} /> 
                </View>

                {/* Cart List */}
                {cart.length === 0 ? (
                    <View style={styles.emptyCart}>
                         <Ionicons name="cart-outline" size={80} color="#999" style={{ marginBottom: 15 }} />
                        <Text style={styles.emptyText}>Your cart is empty</Text>
                        <Text style={{ color: '#888', marginTop: 5 }}>Add some great products!</Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={cart}
                            renderItem={renderCartItem}
                            keyExtractor={(item, index) => `${item.productId.toString()}_${item.size}_${index}`}
                            contentContainerStyle={styles.cartList}
                            showsVerticalScrollIndicator={false}
                        />

                        {/* Promo Code Input */}
                        <View style={styles.promoContainer}>
                            <TextInput
                                style={styles.promoInput}
                                placeholder="Enter promo code" 
                                placeholderTextColor="#888"
                                autoCapitalize="none"
                                value={promoCode}
                                onChangeText={setPromoCode}
                            />
                            <TouchableOpacity
                                style={styles.promoButton}
                                onPress={applyPromoCode}
                            >
                                <Text style={styles.promoButtonText}>→</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Order Summary */}
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal:</Text>
                                <Text style={styles.summaryValue}>
                                    $ {subtotal.toFixed(2)}
                                </Text>
                            </View>
                            
                             {/* Display Discount Row */}
                            {discount > 0.00 && (
                                <View style={styles.summaryRow}>
                                    <Text style={[styles.summaryLabel, { color: '#4caf50' }]}>Promo Discount:</Text>
                                    <Text style={[styles.summaryValue, { color: '#4caf50' }]}>
                                        - $ {discount.toFixed(2)}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Delivery Fee:</Text>
                                <Text style={styles.summaryValue}>$ {DELIVERY_FEE.toFixed(2)}</Text>
                            </View>

                            <View style={[styles.summaryRow, styles.totalRow]}>
                                <Text style={styles.totalLabel}>Total:</Text>
                                <Text style={styles.totalValue}>
                                    $ {total.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </>
                )}
            </View>
            
            {/* Checkout Button Footer */}
            {cart.length > 0 && (
                <View style={styles.checkoutFooter}>
                    <TouchableOpacity
                        style={styles.checkoutButton}
                        onPress={goToCheckout}
                    >
                        <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFF' },
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7', // Đổi màu nền cho đẹp hơn
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFF'
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        flex: 1,
        textAlign: 'center',
    },
    cartList: {
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 20,
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
    itemMainContent: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'space-between',
        paddingRight: 35,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        marginBottom: 3,
    },
    itemSize: {
        fontSize: 12,
        color: '#888',
        marginBottom: 5
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#E91E63',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        alignSelf: 'flex-start'
    },
    quantityButton: {
        width: 25,
        height: 25,
        borderRadius: 12.5,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    quantityText: {
        fontSize: 15,
        fontWeight: '600',
        marginHorizontal: 10,
        color: '#000',
    },
    deleteButton: { 
        position: 'absolute',
        top: 5, 
        right: 5, 
        width: 30, 
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        zIndex: 10,
    },
    deleteButtonText: {
        fontSize: 20, 
        fontWeight: 'bold',
        color: '#555',
    },
    emptyCart: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    promoContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        marginTop: 10,
        marginBottom: 20,
    },
    promoInput: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 14,
        backgroundColor: '#FFF'
    },
    promoButton: {
        width: 50,
        height: 50,
        backgroundColor: '#E91E63',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    promoButtonText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold'
    },
    summaryContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 10,
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginHorizontal: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 15,
        color: '#555',
    },
    summaryValue: {
        fontSize: 15,
        color: '#000',
        fontWeight: '600'
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 10,
        marginTop: 5,
    },
    totalLabel: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#000',
    },
    totalValue: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#E91E63',
    },
    checkoutFooter: {
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    checkoutButton: {
        backgroundColor: '#E91E63',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});