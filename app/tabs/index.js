import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    RefreshControl, // Add RefreshControl
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import client from '../../api/axiosConfig';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const COLORS = {
    primary: '#FF3366',
    text: '#222',
    muted: '#888',
    bg: '#ffffff',
    surface: '#F6F6F6',
    borderColor: '#E8E8E8',
    shadow: '#000',
};

const API_BASE_URL_FOR_IMAGES = client.defaults.baseURL.replace('/api', '');
const LOCALHOST_URL = 'http://localhost:4000';
const FALLBACK_IMAGE_URL = 'https://picsum.photos/400';

// --- FIXED HEADER ---
const FixedHeader = ({ search, onSearch, categoriesList, activeCategory, onCategory, router, cartCount }) => (
    <View style={styles.fixedHeaderContainer}>
        {/* TopBar */}
        <View style={styles.topBar}>
            <View style={{ width: 30 }} />
            <Text style={styles.logoText}>AI Shop</Text>
            <TouchableOpacity onPress={() => router.push('/cart')} style={styles.cartBtn}>
                <Ionicons name="cart-outline" size={24} color={COLORS.text} />
                {cartCount > 0 && (
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{cartCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={COLORS.muted} />
            <TextInput
                placeholder="Find products..."
                placeholderTextColor={COLORS.muted}
                style={styles.searchInput}
                value={search}
                onChangeText={onSearch}
            />
        </View>

        {/* Categories */}
        <View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featureScroll}
                keyboardShouldPersistTaps="handled"
            >
                {categoriesList.map((cat, index) => {
                    const isActive = activeCategory === cat;
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.featureBtn, isActive && styles.featureActive]}
                            onPress={() => onCategory(cat)}
                        >
                            <Text style={[styles.featureText, isActive && styles.featureTextActive]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    </View>
);

const StatusIndicator = ({ loading, status }) => {
    if (loading) {
        return (
            <View style={styles.statusContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }
    if (status) {
        return (
            <View style={styles.statusBox}>
                <Text style={styles.statusText}>{status}</Text>
            </View>
        );
    }
    return <View style={{ height: 10 }} />;
};

function ProductCard({ item, onAdd, onPress }) {
    const imageSource = { uri: item.image || FALLBACK_IMAGE_URL };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.imageContainer}>
                <Image source={imageSource} style={styles.image} />
            </View>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <View style={styles.cardFooter}>
                <Text style={styles.price}>$ {Number(item.price).toFixed(2)}</Text>

                <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(item)}>
                    <Ionicons name="cart-outline" size={16} color="#fff" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

export default function HomeScreen() {
    const router = useRouter();
    const { showToast } = useToast();
    const { cartCount, updateCartCount } = useCart();

    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [categoriesList, setCategoriesList] = useState(['All']);

    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    // Thay useEffect bằng useFocusEffect để tự động load lại khi vào màn hình
    useFocusEffect(
        useCallback(() => {
            loadCategories();
            loadProducts();
        }, [])
    );

    const loadCategories = async () => {
        try {
            const response = await client.get('/categories');
            if (response.data && response.data.success) {
                const serverCategories = response.data.data
                    .filter(cat => cat.isActive)
                    .map(cat => cat.name);
                setCategoriesList(['All', ...serverCategories]);
            }
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        setStatus(null);
        try {
            const response = await client.get('/products');
            let apiData = response.data;
            let list = Array.isArray(apiData.data) ? apiData.data : [];
            if (list.length > 0) {
                console.log("--- PRODUCT DEBUG ---", JSON.stringify(list[0], null, 2));
            }

            list = list.map(product => {
                let imageUrl = product.image;
                if (Array.isArray(product.image) && product.image.length > 0) imageUrl = product.image[0];
                if (imageUrl && imageUrl.includes(LOCALHOST_URL)) imageUrl = imageUrl.replace(LOCALHOST_URL, API_BASE_URL_FOR_IMAGES);
                const catName = typeof product.category === 'object' ? product.category?.name : product.category;
                return { ...product, image: imageUrl, categoryName: catName };
            }).filter(p => {
                // Filter logic: Check multiple possible flags
                if (p.isHidden === true) return false;
                if (p.hidden === true) return false;
                if (p.isActive === false) return false;
                return true;
            });

            if (list.length > 0) {
                setProducts(list);
                setFiltered(list);
            } else {
                setStatus('No products found.');
            }
        } catch (err) {
            setStatus('Server connection error.');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product) => {
        try {
            const raw = await AsyncStorage.getItem('cart');
            const cart = raw ? JSON.parse(raw) : [];

            const idx = cart.findIndex((it) => it.productId === product._id);

            if (idx >= 0) {
                cart[idx].quantity = (cart[idx].quantity || 1) + 1;
            } else {
                cart.push({
                    productId: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1,
                    size: 'M'
                });
            }
            await AsyncStorage.setItem('cart', JSON.stringify(cart));

            // Update cart badge immediately
            updateCartCount();

            showToast(`Added ${product.name} to cart!`, 'success');

        } catch (e) {
            showToast('Failed to add to cart.', 'error');
        }
    };

    const onSearch = (text) => {
        setSearch(text);
        filterData(text, activeCategory);
    };

    const onCategory = (cat) => {
        setActiveCategory(cat);
        filterData(search, cat);
    };

    const filterData = (searchText, category) => {
        const q = searchText.trim().toLowerCase();
        let result = products;

        if (category !== 'All') {
            result = result.filter(p => {
                const pCat = p.categoryName || p.category || '';
                return pCat.toLowerCase() === category.toLowerCase();
            });
        }

        if (q) {
            result = result.filter(p => (p.name || '').toLowerCase().includes(q));
        }
        setFiltered(result);
    };

    const handleProductPress = (item) => {
        router.push(`/products/${item._id}`);
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <FixedHeader
                    search={search}
                    onSearch={onSearch}
                    categoriesList={categoriesList}
                    activeCategory={activeCategory}
                    onCategory={onCategory}
                    router={router}
                    cartCount={cartCount}
                />

                <View style={styles.listContainer}>
                    <FlatList
                        data={filtered}
                        renderItem={({ item }) => (
                            <ProductCard
                                item={item}
                                onAdd={addToCart}
                                onPress={() => handleProductPress(item)}
                            />
                        )}
                        keyExtractor={(it) => it._id || it.id}
                        numColumns={2}
                        columnWrapperStyle={styles.columnWrap}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"

                        ListHeaderComponent={
                            <StatusIndicator loading={loading} status={status} />
                        }
                        refreshControl={
                            <RefreshControl refreshing={loading} onRefresh={loadProducts} colors={[COLORS.primary]} />
                        }
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

/* Styles */
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },

    fixedHeaderContainer: {
        backgroundColor: COLORS.bg,
        paddingHorizontal: 16,
        paddingBottom: 10,
        zIndex: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
            android: { elevation: 4 }
        })
    },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingTop: 10 },
    logoText: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
    cartBtn: { padding: 4, position: 'relative' },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    cartBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },

    searchBox: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.surface, borderRadius: 10,
        paddingHorizontal: 15, paddingVertical: 10, marginBottom: 10,
    },
    searchInput: { marginLeft: 10, flex: 1, fontSize: 16, color: COLORS.text },

    featureScroll: { flexDirection: 'row', alignItems: 'center', paddingRight: 20 },
    featureBtn: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
        borderWidth: 1, borderColor: COLORS.borderColor, marginRight: 8,
        backgroundColor: '#fff',
    },
    featureActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    featureText: { color: COLORS.text, fontSize: 14 },
    featureTextActive: { color: '#fff', fontWeight: 'bold' },

    listContainer: { flex: 1, backgroundColor: '#f9f9f9' },
    listContent: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 10 },
    columnWrap: { justifyContent: 'space-between' },

    statusContainer: { paddingVertical: 20 },
    statusBox: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
    statusText: { color: COLORS.text, fontSize: 13 },

    card: {
        width: '48%', backgroundColor: '#fff', borderRadius: 8, padding: 8, marginBottom: 15,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2
    },
    imageContainer: { width: '100%', alignItems: 'center', marginBottom: 5 },
    image: { width: '100%', aspectRatio: 1, borderRadius: 6, backgroundColor: '#eee' },
    name: { fontSize: 14, color: COLORS.text, fontWeight: '600', marginTop: 4 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    price: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
    addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
});