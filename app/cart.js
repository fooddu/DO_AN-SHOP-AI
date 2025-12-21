import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator, // Keep Alert for other potential uses
    FlatList,
    Image,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DELIVERY_FEE = 5.00;
const PROMO_DISCOUNT = 0.00;

// ⭐️ FIX LOCALHOST IMAGE URL ⭐️
const getImageUrl = (input) => {
    if (!input) return 'https://via.placeholder.com/80';

    // Handle if input is an array (take first image)
    let url = Array.isArray(input) ? input[0] : input;

    // Ensure it's a string
    if (typeof url !== 'string') return 'https://via.placeholder.com/80';

    if (url.startsWith('http') && !url.includes('localhost')) return url;

    // Android Emulator
    if (Platform.OS === 'android' && url.includes('localhost')) {
        return url.replace('localhost', '10.0.2.2');
    }

    // Relative path, append Base URL
    const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
    if (url.startsWith('/')) {
        return `${BASE_URL}${url}`;
    }
    return url;
};

export default function CartScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [cart, setCart] = useState([]);
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(PROMO_DISCOUNT);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCart();
    }, []);

    // --- DATA STORAGE LOGIC (AsyncStorage) ---

    const loadCart = async () => {
        setLoading(true);
        try {
            const data = await AsyncStorage.getItem('cart');
            if (data) {
                const parsedData = JSON.parse(data);
                setCart(parsedData);
                console.log("--- LOAD CART: Loaded", parsedData.length, "items.");
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            showToast('Failed to load cart', 'error');
        } finally {
            setLoading(false);
        }
    };

    const saveCart = async (newCart) => {
        try {
            const cleanCart = newCart.filter(item => item.quantity > 0);
            await AsyncStorage.setItem('cart', JSON.stringify(cleanCart));
            setCart(cleanCart);
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    };

    // --- CART LOGIC ---

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
        const targetId = productId ? productId.toString() : null;
        const newCart = cart.filter(item => {
            const itemId = item.productId ? item.productId.toString() : null;
            return itemId !== targetId;
        });

        if (newCart.length < cart.length) {
            saveCart(newCart);
            showToast('Item removed', 'success');
        } else {
            showToast('Could not remove item', 'error');
        }
    };

    const applyPromoCode = () => {
        if (promoCode.toUpperCase() === 'FREE5') {
            setDiscount(5.00);
            showToast('Promo code applied! $5 discount.', 'success');
        } else {
            setDiscount(0.00);
            showToast('Invalid promo code.', 'error');
        }
    };

    // --- CALCULATIONS ---

    const calculateSubtotal = () => {
        return cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const finalOrder = subtotal - discount;
        return finalOrder > 0 ? finalOrder + DELIVERY_FEE : 0;
    };

    // --- NAVIGATION ---

    const goToCheckout = () => {
        if (cart.length === 0) {
            showToast('Your cart is empty!', 'error');
            return;
        }

        // 🛡️ AUTH CHECK FOR GUEST
        if (!user || !user.email || Object.keys(user).length === 0) {
            showToast('Login required to checkout', 'error');
            // Do NOT redirect automatically
            return;
        }

        router.push('/checkout');
    };

    // --- RENDER CART ITEM ---

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <Image
                source={{ uri: getImageUrl(item.image) }}
                style={styles.itemImage}
            />

            <View style={styles.itemMainContent}>
                <View>
                    <Text style={styles.itemName} numberOfLines={1}>
                        {item.name}
                    </Text>
                    {/* SHOW SIZE */}
                    {item.size && (
                        <Text style={styles.sizeText}>
                            Size: {item.size}
                        </Text>
                    )}
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
                onPress={() => removeProduct(item.productId)}
            >
                <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
        </View>
    );

    const subtotal = calculateSubtotal();
    const finalOrder = subtotal - discount;
    const total = calculateTotal();

    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#000" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Cart</Text>
                    <View style={styles.backButton} />
                </View>

                {/* Cart List */}
                {cart.length === 0 ? (
                    <View style={styles.emptyCart}>
                        <Ionicons name="cart-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>Your cart is empty</Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={cart}
                            renderItem={renderCartItem}
                            keyExtractor={(item) => item.productId ? item.productId.toString() : Math.random().toString()}
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
                                <Ionicons name="arrow-forward" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Order Summary */}
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal:</Text>
                                <Text style={styles.summaryValue}>
                                    $ {finalOrder.toFixed(2)}
                                </Text>
                            </View>

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

            {/* Checkout Button */}
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
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
    },
    itemMainContent: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'space-between',
        paddingRight: 30, // Space for delete button
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    sizeText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E91E63',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: '#F0F0F0',
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
        marginHorizontal: 12,
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
        zIndex: 10,
    },
    deleteButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ccc',
    },
    emptyCart: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 10
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
    summaryContainer: {
        paddingHorizontal: 15,
        paddingVertical: 15,
        marginBottom: 10,
        backgroundColor: '#F9F9F9',
        borderRadius: 10,
        marginHorizontal: 15
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        color: '#000',
        fontWeight: '500'
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 10,
        marginTop: 5,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E91E63',
    },
    checkoutFooter: {
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 30, // Safe area
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    checkoutButton: {
        backgroundColor: '#000',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    checkoutButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});