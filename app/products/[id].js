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
import { useToast } from '../../context/ToastContext';
import { useFavorites } from '../../contexts/FavoritesContext';

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

// Component hiển thị 1 bình luận
const ReviewItem = ({ review }) => {
    const userName = typeof review.user === 'object' ? review.user?.name : review.user;
    const displayName = userName || 'Anonymous';
    const firstChar = displayName.charAt(0).toUpperCase();

    return (
        <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{firstChar}</Text>
                    </View>
                    <Text style={styles.reviewUser}>{displayName}</Text>
                </View>
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
};

export default function ProductDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { showToast } = useToast();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // Review States
    const [reviews, setReviews] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [userRating, setUserRating] = useState(5);

    const { user } = useAuth();
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
            showToast("Cannot load product details", "error");
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
            showToast("Please login to review!", "info");
            return;
        }
        if (!newComment.trim()) {
            showToast("Review content cannot be empty", "error");
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
                setReviews([response.data.data, ...reviews]);
                setNewComment('');
                showToast("Review submitted successfully!", "success");
            }
        } catch (error) {
            showToast("Failed to submit review", "error");
        } finally {
            setSubmittingReview(false);
        }
    };

    const stockCount = product ? (product.stock ?? product.countInStock ?? 0) : 0;
    const isOutOfStock = stockCount <= 0;

    const addToCart = async (item) => {
        if (isOutOfStock) {
            showToast('This product is out of stock', 'error');
            return;
        }
        
        if (!selectedSize) {
            showToast('Please select a size first!', 'info');
            return;
        }

        if (quantity > stockCount) {
            showToast(`Only ${stockCount} items left in stock`, 'error');
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
            
            showToast('Added to cart!', 'success');
            setQuantity(1);
        } catch (e) {
            showToast('Failed to add to cart', 'error');
        }
    };

    const updateQuantity = (amount) => {
        setQuantity(prev => {
            const newVal = prev + amount;
            if (newVal < 1) return 1;
            if (newVal > stockCount) {
                showToast(`Only ${stockCount} items left`, 'info');
                return prev;
            }
            return newVal;
        });
    };

    const handleToggleFavorite = () => {
        if (!user) {
            showToast('Please login to add favorites', 'info');
            // router.push('/(auth)/login'); 
            return;
        }
        toggleFavorite(product);
        if (!isFavorited(product._id)) {
            showToast("Added to favorites", "success");
        } else {
            showToast("Removed from favorites", "info");
        }
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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Product Details</Text>
                <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerBtn}>
                    <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? COLORS.primary : COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <Image source={{ uri: imageUrl }} style={styles.productImage} />

                <View style={styles.detailsContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.productCategory}>{categoryName}</Text>
                            <Text style={styles.productName}>{product.name}</Text>
                        </View>
                        <View style={[styles.stockBadge, { backgroundColor: isOutOfStock ? '#ffebee' : '#e8f5e9' }]}>
                            <Text style={[styles.stockText, { color: isOutOfStock ? '#ef5350' : '#4caf50' }]}>
                                {isOutOfStock ? 'Out of Stock' : `Stock: ${stockCount}`}
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

                    {!isOutOfStock && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                                Select Size <Text style={{ color: 'red', fontSize: 12 }}>*</Text>
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

                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>

                    <View style={styles.addReviewContainer}>
                        <Text style={styles.subTitle}>Write a review</Text>
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
                        <TextInput
                            style={styles.reviewInput}
                            placeholder="Share your thoughts..."
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
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.submitReviewText}>Submit Review</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {reviews.map((item) => (
                        <ReviewItem key={item._id} review={item} />
                    ))}

                    {reviews.length === 0 && (
                        <Text style={styles.noReviewsText}>No reviews yet.</Text>
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

    divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
    addReviewContainer: { marginBottom: 25, backgroundColor: COLORS.surface, padding: 15, borderRadius: 12 },
    subTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10, color: COLORS.text },
    ratingInputRow: { flexDirection: 'row', marginBottom: 10 },
    reviewInput: { backgroundColor: '#fff', borderRadius: 8, padding: 12, height: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 15, fontSize: 15 },
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
    noReviewsText: { fontStyle: 'italic', color: COLORS.muted, marginTop: 10, textAlign: 'center' }
});