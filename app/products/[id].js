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
    TextInput,
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
    disabled: '#BDBDBD',
    star: '#FFD700', // Màu vàng cho ngôi sao
};

const SIZES = ['S', 'M', 'L', 'XL'];

// Component hiển thị 1 bình luận
const ReviewItem = ({ review }) => (
    <View style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Avatar giả lập từ chữ cái đầu tên */}
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                        {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                </View>
                <Text style={styles.reviewUser}>{review.user?.name || 'Anonymous'}</Text>
            </View>
            {/* Hiển thị sao */}
            <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, i) => (
                    <Ionicons
                        key={i}
                        name={i < review.rating ? "star" : "star-outline"}
                        size={14}
                        color={COLORS.star}
                    />
                ))}
            </View>
        </View>
        <Text style={styles.reviewContent}>{review.comment}</Text>
        <Text style={styles.reviewDate}>
            {new Date(review.createdAt).toLocaleDateString('en-US')}
        </Text>
    </View>
);

export default function ProductDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // State Sản phẩm & Giỏ hàng
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // State Bình luận
    const [reviews, setReviews] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [userRating, setUserRating] = useState(5);
    const [submittingReview, setSubmittingReview] = useState(false);

    const { user, token } = useAuth();
    const { isFavorited, toggleFavorite } = useFavorites();

    useEffect(() => {
        if (!id) return;
        fetchProduct();
        fetchReviews(); // Gọi API lấy bình luận khi vào màn hình
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await client.get(`/products/${id}`);
            setProduct(response.data.data);
        } catch (err) {
            console.error("Error fetching product:", err);
            Alert.alert("Error", "Could not load product details.");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    // Hàm lấy danh sách bình luận từ Server
    const fetchReviews = async () => {
        try {
            const response = await client.get(`/reviews/${id}`);
            if (response.data.success) {
                setReviews(response.data.data);
            }
        } catch (error) {
            console.log("Error fetching reviews:", error);
        }
    };

    // Hàm gửi bình luận mới lên Server
    const submitReview = async () => {
        if (!user) {
            Alert.alert("Login Required", "Please login to write a review.");
            return;
        }
        if (!newComment.trim()) {
            Alert.alert("Empty Review", "Please write something about the product.");
            return;
        }

        setSubmittingReview(true);
        try {
            const payload = {
                productId: id,
                rating: userRating,
                comment: newComment
            };

            const response = await client.post('/reviews', payload);

            if (response.data.success) {
                // Thêm review mới vào đầu danh sách (để hiển thị ngay mà không cần reload lại API)
                setReviews([response.data.data, ...reviews]);
                setNewComment(''); // Reset form
                setUserRating(5);
                Alert.alert("Success", "Thank you for your review!");
            }
        } catch (error) {
            console.error("Review Error:", error);
            Alert.alert("Error", "Failed to submit review. Please try again.");
        } finally {
            setSubmittingReview(false);
        }
    };

    // Logic Tồn kho & Giỏ hàng (Giữ nguyên)
    const stockCount = product ? (product.stock ?? product.countInStock ?? 0) : 0;
    const isOutOfStock = stockCount <= 0;

    const addToCart = async (item) => {
        if (isOutOfStock) {
            Alert.alert('Notice', 'This product is out of stock.');
            return;
        }
        if (!selectedSize) {
            Alert.alert('Notice', 'Please select a size.');
            return;
        }
        if (quantity > stockCount) {
            Alert.alert('Notice', `Only ${stockCount} items left in stock.`);
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
            Alert.alert('Success', `Added to cart!`);
            setQuantity(1);
        } catch (e) {
            Alert.alert('Error', 'Failed to add to cart');
        }
    };

    const updateQuantity = (amount) => {
        setQuantity(prev => {
            const newVal = prev + amount;
            if (newVal < 1) return 1;
            if (newVal > stockCount) {
                Alert.alert('Notice', `Only ${stockCount} items left.`);
                return prev;
            }
            return newVal;
        });
    };

    const handleToggleFavorite = () => {
        if (!user || !token) {
            Alert.alert('Login Required', 'Please login to add to favorites.');
            router.push('/(auth)/login');
            return;
        }
        toggleFavorite(product);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            </SafeAreaView>
        );
    }

    if (!product) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <Text style={{ textAlign: 'center', marginTop: 50 }}>Product not found.</Text>
            </SafeAreaView>
        );
    }

    const isLiked = isFavorited(product._id);
    const imageUrl = (product.image && product.image.length > 0)
        ? (product.image[0].startsWith('http') ? product.image[0] : 'https://via.placeholder.com/400')
        : 'https://via.placeholder.com/400';

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Details</Text>
                <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerBtn}>
                    <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? COLORS.primary : COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <Image source={{ uri: imageUrl }} style={styles.productImage} />

                <View style={styles.detailsContainer}>
                    {/* Thông tin cơ bản */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.productCategory}>{product.category || 'Fashion'}</Text>
                            <Text style={styles.productName}>{product.name}</Text>
                        </View>
                        <View style={[styles.stockBadge, { backgroundColor: isOutOfStock ? '#ffebee' : '#e8f5e9' }]}>
                            <Text style={[styles.stockText, { color: isOutOfStock ? '#ef5350' : '#4caf50' }]}>
                                {isOutOfStock ? 'Out of Stock' : `In Stock: ${stockCount}`}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.productPrice}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)}
                    </Text>

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>
                        {product.description || "No description available."}
                    </Text>

                    {/* Chọn Size & Số lượng */}
                    {!isOutOfStock && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Size</Text>
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

                            <Text style={styles.sectionTitle}>Quantity</Text>
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

                    {/* --- PHẦN BÌNH LUẬN (REVIEWS SECTION) --- */}
                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>

                    {/* Form viết bình luận */}
                    <View style={styles.addReviewContainer}>
                        <Text style={styles.subTitle}>Write a review</Text>
                        {/* Chọn sao */}
                        <View style={styles.ratingInputRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                                    <Ionicons
                                        name={star <= userRating ? "star" : "star-outline"}
                                        size={28}
                                        color={COLORS.star}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        {/* Ô nhập nội dung */}
                        <TextInput
                            style={styles.reviewInput}
                            placeholder="Share your thoughts..."
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                        />
                        {/* Nút gửi */}
                        <TouchableOpacity
                            style={styles.submitReviewBtn}
                            onPress={submitReview}
                            disabled={submittingReview}
                        >
                            {submittingReview ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.submitReviewText}>Post Review</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Danh sách bình luận */}
                    {reviews.map((item) => (
                        <ReviewItem key={item._id} review={item} />
                    ))}

                    {reviews.length === 0 && (
                        <Text style={styles.noReviewsText}>No reviews yet. Be the first to review!</Text>
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
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
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

    // --- STYLES CHO PHẦN BÌNH LUẬN ---
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
    addReviewContainer: { marginBottom: 25, backgroundColor: COLORS.surface, padding: 15, borderRadius: 12 },
    subTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10, color: COLORS.text },
    ratingInputRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
    reviewInput: { backgroundColor: '#fff', borderRadius: 8, padding: 12, height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 15, fontSize: 15 },
    submitReviewBtn: { backgroundColor: '#333', padding: 12, borderRadius: 8, alignItems: 'center' },
    submitReviewText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

    reviewItem: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 15 },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    avatarPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#bdbdbd', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    reviewUser: { fontWeight: '700', fontSize: 15, color: COLORS.text },
    ratingContainer: { flexDirection: 'row' },
    reviewContent: { fontSize: 15, color: '#444', marginBottom: 6, lineHeight: 22 },
    reviewDate: { fontSize: 12, color: COLORS.muted },
    noReviewsText: { fontStyle: 'italic', color: COLORS.muted, marginTop: 10, textAlign: 'center' },
});
