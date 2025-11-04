// [File] app/products/[id].js

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import client from '../../api/axiosConfig'; // Đảm bảo đường dẫn này đúng

// Sử dụng lại bảng màu của bạn
const COLORS = {
  primary: '#E91E63', // pink
  text: '#222',
  muted: '#888',
  bg: '#ffffff',
  surface: '#F6F6F6',
  shadow: '#000',
};

const SIZES = ['S', 'M', 'L', 'XL']; // Dữ liệu size mẫu

export default function ProductDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); // Lấy [id] từ URL
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Các state cho "nút thường có"
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // 1. Load data sản phẩm từ API
    useEffect(() => {
        if (!id) return;
        
        const fetchProduct = async () => {
            setLoading(true);
            try {
                // (Sửa endpoint nếu cần)
                const response = await client.get(`/products/${id}`); 
                setProduct(response.data.data);
            } catch (err) {
                console.error("Lỗi fetch chi tiết sản phẩm:", err);
                Alert.alert("Lỗi", "Không thể tải sản phẩm này.");
                router.back();
            } finally {
                setLoading(false);
            }
        };
        
        fetchProduct();
    }, [id]);

    // 2. Logic thêm vào giỏ hàng (từ trang Home)
    const addToCart = async (item) => {
        if (!selectedSize) {
            Alert.alert('Lỗi', 'Vui lòng chọn size');
            return;
        }
        
        try {
            const raw = await AsyncStorage.getItem('cart');
            const cart = raw ? JSON.parse(raw) : [];
            
            // Tìm xem có sản phẩm + size này trong giỏ chưa
            const idx = cart.findIndex((it) => 
                it.productId === item._id && it.size === selectedSize
            );
            
            if (idx >= 0) {
                // Đã có, tăng số lượng
                cart[idx].quantity += quantity;
            } else {
                // Chưa có, thêm mới
                cart.push({
                  productId: item._id, 
                  name: item.name, 
                  price: item.price,
                  image: item.image, 
                  size: selectedSize, // Thêm size
                  quantity: quantity  // Thêm số lượng
                });
            }
            
            await AsyncStorage.setItem('cart', JSON.stringify(cart));
            Alert.alert(
                'Thành công', 
                `${item.name} (Size ${selectedSize}) đã được thêm vào giỏ.`
            );
        } catch (e) {
            console.error('Lỗi thêm vào giỏ:', e);
            Alert.alert('Lỗi', 'Thêm vào giỏ thất bại');
        }
    };
    
    // Hàm tăng/giảm số lượng
    const updateQuantity = (amount) => {
        setQuantity(prev => Math.max(1, prev + amount)); // Số lượng không < 1
    };

    // ------ RENDER ------

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}} />
            </SafeAreaView>
        );
    }
    
    if (!product) {
         return (
            <SafeAreaView style={styles.safeArea}>
                <Text>Không tìm thấy sản phẩm.</Text>
            </SafeAreaView>
         );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* 1. Header tùy chỉnh */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chi tiết</Text>
                    <TouchableOpacity onPress={() => router.push('/cart')} style={styles.headerBtn}>
                        <Ionicons name="cart-outline" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {/* 2. Hình ảnh sản phẩm */}
                <Image source={{ uri: product.image }} style={styles.productImage} />

                {/* 3. Tên và Giá */}
                <View style={styles.detailsContainer}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>$ {Number(product.price).toFixed(2)}</Text>
                    
                    {/* 4. Chọn Size */}
                    <Text style={styles.sectionTitle}>Size</Text>
                    <View style={styles.sizeRow}>
                        {SIZES.map((size) => (
                            <TouchableOpacity 
                                key={size}
                                style={[
                                    styles.sizeBox, 
                                    selectedSize === size && styles.sizeBoxSelected
                                ]}
                                onPress={() => setSelectedSize(size)}
                            >
                                <Text style={[
                                    styles.sizeText,
                                    selectedSize === size && styles.sizeTextSelected
                                ]}>{size}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* 5. Chọn Số lượng */}
                    <Text style={styles.sectionTitle}>Số lượng</Text>
                    <View style={styles.quantityRow}>
                        <TouchableOpacity style={styles.quantityBtn} onPress={() => updateQuantity(-1)}>
                            <Ionicons name="remove" size={20} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.quantityValue}>{quantity}</Text>
                        <TouchableOpacity style={styles.quantityBtn} onPress={() => updateQuantity(1)}>
                            <Ionicons name="add" size={20} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>
                    
                </View>
            </ScrollView>

            {/* 6. Nút "Thêm vào giỏ" (Footer) */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.addToCartBtn} 
                    onPress={() => addToCart(product)}
                >
                    <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// Styles
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
    },
    headerBtn: {
        padding: 5,
    },
    productImage: {
        width: '100%',
        height: 400, // Ảnh lớn
        resizeMode: 'cover',
    },
    detailsContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100, // Chừa chỗ cho nút footer
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 10,
    },
    sizeRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    sizeBox: {
        width: 50,
        height: 50,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.lightGrey,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    sizeBoxSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    sizeText: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text,
    },
    sizeTextSelected: {
        color: '#fff',
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    quantityBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityValue: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginHorizontal: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: COLORS.bg,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    addToCartBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        borderRadius: 8,
        alignItems: 'center',
    },
    addToCartText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});