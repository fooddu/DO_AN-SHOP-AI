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

import client from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';

const COLORS = {
    primary: '#E91E63', // pink
    text: '#222',
    muted: '#888',
    bg: '#ffffff',
    surface: '#F6F6F6',
    shadow: '#000',
    lightGrey: '#E0E0E0',
    disabled: '#BDBDBD', // Màu xám cho nút disable
};

const SIZES = ['S', 'M', 'L', 'XL'];

export default function ProductDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState(null); 
    const [quantity, setQuantity] = useState(1); 
    
    const { user, token } = useAuth(); 
    const { isFavorited, toggleFavorite } = useFavorites();

    useEffect(() => {
        if (!id) return;
        
        const fetchProduct = async () => {
            setLoading(true);
            try {
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

    // --- LOGIC XỬ LÝ TỒN KHO ---
    // Lấy số lượng tồn kho (Ưu tiên 'stock', fallback 'countInStock')
    const stockCount = product ? (product.stock ?? product.countInStock ?? 0) : 0;
    const isOutOfStock = stockCount <= 0;

    const addToCart = async (item) => {
        if (isOutOfStock) {
            Alert.alert('Thông báo', 'Sản phẩm này hiện đang hết hàng.');
            return;
        }

        if (!selectedSize) { 
            Alert.alert('Lỗi', 'Vui lòng chọn size');
            return;
        }

        if (quantity > stockCount) {
             Alert.alert('Lỗi', `Chỉ còn ${stockCount} sản phẩm trong kho.`);
             return;
        }

        try {
             const raw = await AsyncStorage.getItem('cart');
             const cart = raw ? JSON.parse(raw) : [];
             
             const idx = cart.findIndex((it) => 
                 it.productId === item._id && it.size === selectedSize
             );
             
             if (idx >= 0) {
                 cart[idx].quantity += quantity; 
             } else {
                 cart.push({
                     productId: item._id, 
                     name: item.name, 
                     price: item.price,
                     image: item.image, 
                     size: selectedSize, 
                     quantity: quantity
                 });
             }
             
             await AsyncStorage.setItem('cart', JSON.stringify(cart));
             
             Alert.alert(
                 'Thành công', 
                 `${item.name} (Size ${selectedSize}, SL: ${quantity}) đã được thêm vào giỏ.`
             );
             
             setQuantity(1); 
             
        } catch (e) {
             console.error('Lỗi thêm vào giỏ:', e);
             Alert.alert('Lỗi', 'Thêm vào giỏ thất bại');
        }
    };
    
    const updateQuantity = (amount) => {
        setQuantity(prev => {
            const newVal = prev + amount;
            // Không cho giảm dưới 1
            if (newVal < 1) return 1;
            // Không cho tăng quá số lượng tồn kho
            if (newVal > stockCount) {
                Alert.alert('Thông báo', `Chỉ còn ${stockCount} sản phẩm.`);
                return prev;
            }
            return newVal;
        });
    };
    
    const handleToggleFavorite = () => {
        if (!user || !token) {
            Alert.alert('Yêu cầu Đăng nhập', 'Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích.');
            router.push('/(auth)/login'); 
            return;
        }
        toggleFavorite(product);
    };

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
                <Text style={{textAlign: 'center', marginTop: 50}}>Không tìm thấy sản phẩm.</Text>
            </SafeAreaView>
           );
    }

    const isLiked = isFavorited(product._id);

    // Xử lý URL ảnh an toàn
    const imageUrl = (product.image && product.image.length > 0) 
        ? (product.image[0].startsWith('http') ? product.image[0] : 'https://via.placeholder.com/400')
        : 'https://via.placeholder.com/400';

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* 1. Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chi tiết</Text>
                    <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerBtn}>
                        <Ionicons 
                            name={isLiked ? "heart" : "heart-outline"}
                            size={24} 
                            color={isLiked ? COLORS.primary : COLORS.text}
                        />
                    </TouchableOpacity>
                </View>

                {/* 2. Hình ảnh sản phẩm */}
                <Image source={{ uri: imageUrl }} style={styles.productImage} />

                {/* 3. Chi tiết */}
                <View style={styles.detailsContainer}>
                    
                    {/* Tên & Badge Category */}
                    <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start'}}>
                        <View style={{flex: 1}}>
                            <Text style={styles.productCategory}>{product.category || 'Thời trang'}</Text>
                            <Text style={styles.productName}>{product.name}</Text>
                        </View>
                        {/* Hiển thị trạng thái kho */}
                        <View style={[styles.stockBadge, { backgroundColor: isOutOfStock ? '#ffebee' : '#e8f5e9' }]}>
                            <Text style={[styles.stockText, { color: isOutOfStock ? '#ef5350' : '#4caf50' }]}>
                                {isOutOfStock ? 'Hết hàng' : `Còn ${stockCount}`}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.productPrice}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </Text>
                    
                    {/* Mô tả sản phẩm */}
                    <Text style={styles.sectionTitle}>Mô tả</Text>
                    <Text style={styles.descriptionText}>
                        {product.description || "Không có mô tả chi tiết cho sản phẩm này."}
                    </Text>

                    {/* Chọn Size (Ẩn nếu hết hàng cho đỡ rối - hoặc giữ lại tùy ý) */}
                    {!isOutOfStock && (
                        <>
                            <Text style={[styles.sectionTitle, {marginTop: 20}]}>Size</Text>
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
                        </>
                    )}
                    
                </View>
            </ScrollView>

            {/* Footer: Nút Thêm vào giỏ */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.addToCartBtn, isOutOfStock && styles.disabledBtn]} 
                    onPress={() => addToCart(product)}
                    disabled={isOutOfStock} // Vô hiệu hóa nút bấm
                >
                    <Text style={styles.addToCartText}>
                        {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
    headerBtn: { padding: 5 },
    productImage: { width: '100%', height: 350, resizeMode: 'cover', backgroundColor: '#f9f9f9' },
    detailsContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100, 
    },
    productCategory: {
        fontSize: 14,
        color: COLORS.muted,
        marginBottom: 4,
        textTransform: 'uppercase',
        fontWeight: '600'
    },
    productName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
        lineHeight: 30
    },
    stockBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        marginLeft: 10,
        marginTop: 5
    },
    stockText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    productPrice: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
        textAlign: 'justify'
    },
    sizeRow: { flexDirection: 'row', marginBottom: 20 },
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
    sizeText: { fontSize: 16, fontWeight: '500', color: COLORS.text },
    sizeTextSelected: { color: '#fff' },
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
        elevation: 10,
    },
    addToCartBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledBtn: {
        backgroundColor: COLORS.disabled, // Màu xám khi hết hàng
    },
    addToCartText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
});