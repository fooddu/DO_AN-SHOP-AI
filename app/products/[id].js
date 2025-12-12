import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import client from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
// 1. IMPORT HOOK TOAST
import { useToast } from '../../context/ToastContext';

const COLORS = {
    primary: '#E91E63',
    text: '#222',
    muted: '#888',
    bg: '#ffffff',
    surface: '#F6F6F6',
    shadow: '#000',
    lightGrey: '#E0E0E0',
    disabled: '#BDBDBD',
    star: '#FFD700',
};

const SIZES = ['S', 'M', 'L', 'XL'];

const ReviewItem = ({ review }) => {
    const userName = typeof review.user === 'object' ? review.user?.name : review.user;
    const displayName = userName || 'Anonymous';
    const firstChar = displayName.charAt(0).toUpperCase();

    return (
        <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{firstChar}</Text>
                    </View>
                    <Text style={styles.reviewUser}>{displayName}</Text>
                </View>
            </View>
            <Text style={styles.reviewContent}>{review.comment}</Text>
            <Text style={styles.reviewDate}>
                {new Date(review.createdAt).toLocaleDateString('en-US')}
            </Text>
        </View>
    );
};

export default function ProductDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    
    // 2. KHAI BÁO TOAST
    const { showToast } = useToast(); 

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState(null); 
    const [quantity, setQuantity] = useState(1); 
    
    const [reviews, setReviews] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const { user, token } = useAuth(); 
    const { isFavorited, toggleFavorite } = useFavorites();

    useEffect(() => {
        if (!id) return;
        fetchProduct();
        fetchReviews();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await client.get(`/products/${id}`); 
            setProduct(response.data.data);
        } catch (err) {
            showToast("Không thể tải thông tin sản phẩm", "error");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await client.get(`/reviews/${id}`);
            if (response.data.success) {
                setReviews(response.data.data);
            }
        } catch (error) {
            console.log("Review fetch error", error);
        }
    };

    const submitReview = async () => {
        if (!user) {
            showToast("Vui lòng đăng nhập để đánh giá!", "info");
            return;
        }
        if (!newComment.trim()) {
            showToast("Nội dung đánh giá không được để trống", "error");
            return;
        }

        setSubmittingReview(true);
        try {
            const payload = {
                productId: id,
                rating: 5, 
                comment: newComment
            };
            const response = await client.post('/reviews', payload);
            if (response.data.success) {
                setReviews([response.data.data, ...reviews]);
                setNewComment('');
                showToast("Cảm ơn đánh giá của bạn!", "success");
            }
        } catch (error) {
            showToast("Gửi đánh giá thất bại", "error");
        } finally {
            setSubmittingReview(false);
        }
    };

    const stockCount = product ? (product.stock ?? product.countInStock ?? 0) : 0;
    const isOutOfStock = stockCount <= 0;

    // --- HÀM THÊM GIỎ HÀNG DÙNG TOAST ---
    const addToCart = async (item) => {
        // 1. Check hết hàng
        if (isOutOfStock) {
            showToast('Sản phẩm này hiện đang hết hàng', 'error');
            return;
        }
        
        // 2. Check Size
        if (!selectedSize) { 
            showToast('Vui lòng chọn Size trước!', 'info'); // Màu xanh dương nhắc nhở
            return;
        }

        // 3. Check số lượng
        if (quantity > stockCount) {
             showToast(`Chỉ còn lại ${stockCount} sản phẩm trong kho`, 'error');
             return;
        }

        try {
             const raw = await AsyncStorage.getItem('cart');
             const cart = raw ? JSON.parse(raw) : [];
             const idx = cart.findIndex((it) => it.productId === item._id && it.size === selectedSize);
             
             if (idx >= 0) {
                 cart[idx].quantity += quantity; 
             } else {
                 cart.push({
                     productId: item._id, name: item.name, price: item.price,
                     image: item.image, size: selectedSize, quantity: quantity
                 });
             }
             await AsyncStorage.setItem('cart', JSON.stringify(cart));
             
             // THÔNG BÁO THÀNH CÔNG ĐẸP
             showToast('Đã thêm vào giỏ hàng!', 'success');
             setQuantity(1); 
        } catch (e) {
             showToast('Lỗi khi thêm vào giỏ hàng', 'error');
        }
    };
    
    const updateQuantity = (amount) => {
        setQuantity(prev => {
            const newVal = prev + amount;
            if (newVal < 1) return 1;
            if (newVal > stockCount) {
                showToast(`Chỉ còn ${stockCount} sản phẩm`, 'info');
                return prev;
            }
            return newVal;
        });
    };
    
    const handleToggleFavorite = () => {
        if (!user || !token) {
            showToast('Vui lòng đăng nhập để yêu thích', 'info');
            router.push('/(auth)/login'); 
            return;
        }
        toggleFavorite(product);
        if (!isFavorited(product._id)) {
            showToast("Đã thêm vào yêu thích", "success");
        } else {
            showToast("Đã bỏ yêu thích", "info");
        }
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
    let imageUrl = 'https://via.placeholder.com/400';
    if (product.image) {
        if (Array.isArray(product.image) && product.image.length > 0) {
             imageUrl = product.image[0].startsWith('http') ? product.image[0] : 'https://via.placeholder.com/400';
        } else if (typeof product.image === 'string' && product.image.startsWith('http')) {
             imageUrl = product.image;
        }
    }
    const categoryName = typeof product.category === 'object' ? product.category?.name : (product.category || 'Fashion');

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
                <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerBtn}>
                    <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? COLORS.primary : COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
                <Image source={{ uri: imageUrl }} style={styles.productImage} />

                <View style={styles.detailsContainer}>
                    <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start'}}>
                        <View style={{flex: 1}}>
                            <Text style={styles.productCategory}>{categoryName}</Text>
                            <Text style={styles.productName}>{product.name}</Text>
                        </View>
                        <View style={[styles.stockBadge, { backgroundColor: isOutOfStock ? '#ffebee' : '#e8f5e9' }]}>
                            <Text style={[styles.stockText, { color: isOutOfStock ? '#ef5350' : '#4caf50' }]}>
                                {isOutOfStock ? 'Hết hàng' : `Kho: ${stockCount}`}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.productPrice}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)}
                    </Text>
                    
                    <Text style={styles.sectionTitle}>Mô tả</Text>
                    <Text style={styles.descriptionText}>
                        {product.description || "Không có mô tả."}
                    </Text>

                    {!isOutOfStock && (
                        <>
                            <Text style={[styles.sectionTitle, {marginTop: 20}]}>
                                Chọn Size <Text style={{color: 'red', fontSize: 12}}>*</Text>
                            </Text>
                            <View style={styles.sizeRow}>
                                {SIZES.map((size) => (
                                    <TouchableOpacity 
                                        key={size}
                                        style={[styles.sizeBox, selectedSize === size && styles.sizeBoxSelected]}
                                        onPress={() => setSelectedSize(size)} 
                                    >
                                        <Text style={[styles.sizeText, selectedSize === size && styles.sizeTextSelected]}>{size}</Text>
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

                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Đánh giá ({reviews.length})</Text>
                    
                    <View style={styles.addReviewContainer}>
                        <Text style={styles.subTitle}>Viết đánh giá của bạn</Text>
                        <TextInput
                            style={styles.reviewInput}
                            placeholder="Chia sẻ cảm nghĩ của bạn..."
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                        />
                        <TouchableOpacity 
                            style={styles.submitReviewBtn} 
                            onPress={submitReview}
                            disabled={submittingReview}
                        >
                            {submittingReview ? (
                                <ActivityIndicator color="#fff" size="small"/>
                            ) : (
                                <Text style={styles.submitReviewText}>Gửi đánh giá</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {reviews.map((item) => (
                        <ReviewItem key={item._id} review={item} />
                    ))}
                    
                    {reviews.length === 0 && (
                        <Text style={styles.noReviewsText}>Chưa có đánh giá nào.</Text>
                    )}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.addToCartBtn, isOutOfStock && styles.disabledBtn]} 
                    onPress={() => addToCart(product)}
                    disabled={isOutOfStock} 
                >
                    <Text style={styles.addToCartText}>
                        {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
    headerBtn: { padding: 5 },
    productImage: { width: '100%', height: 350, resizeMode: 'cover', backgroundColor: '#f9f9f9' },
    detailsContainer: { paddingHorizontal: 20, paddingTop: 20 },
    productCategory: { fontSize: 14, color: COLORS.muted, marginBottom: 4, textTransform: 'uppercase', fontWeight: '600' },
    productName: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 8, lineHeight: 30 },
    stockBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, marginLeft: 10, marginTop: 5 },
    stockText: { fontSize: 12, fontWeight: 'bold' },
    productPrice: { fontSize: 22, fontWeight: '700', color: COLORS.primary, marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
    descriptionText: { fontSize: 15, color: '#555', lineHeight: 22, textAlign: 'justify' },
    sizeRow: { flexDirection: 'row', marginBottom: 20 },
    sizeBox: { width: 50, height: 50, borderRadius: 8, borderWidth: 1, borderColor: COLORS.lightGrey, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    sizeBoxSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    sizeText: { fontSize: 16, fontWeight: '500', color: COLORS.text },
    sizeTextSelected: { color: '#fff' },
    quantityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    quantityBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
    quantityValue: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginHorizontal: 20 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: '#f0f0f0', elevation: 10 },
    addToCartBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
    disabledBtn: { backgroundColor: COLORS.disabled },
    addToCartText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
    addReviewContainer: { marginBottom: 25, backgroundColor: COLORS.surface, padding: 15, borderRadius: 12 },
    subTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10, color: COLORS.text },
    reviewInput: { backgroundColor: '#fff', borderRadius: 8, padding: 12, height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 15, fontSize: 15 },
    submitReviewBtn: { backgroundColor: '#333', padding: 12, borderRadius: 8, alignItems: 'center' },
    submitReviewText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    reviewItem: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 15 },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    avatarPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#bdbdbd', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    reviewUser: { fontWeight: '700', fontSize: 15, color: COLORS.text },
    reviewContent: { fontSize: 15, color: '#444', marginBottom: 6, lineHeight: 22 },
    reviewDate: { fontSize: 12, color: COLORS.muted },
    noReviewsText: { fontStyle: 'italic', color: COLORS.muted, marginTop: 10, textAlign: 'center' },
});