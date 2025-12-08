import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
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

const COLORS = {
    primary: '#FF3366',
    text: '#222',
    muted: '#888',
    bg: '#ffffff',
    surface: '#F6F6F6',
    borderColor: '#E8E8E8',
    shadow: '#000',
};

// Lấy URL cần thiết để thay thế localhost
const API_BASE_URL_FOR_IMAGES = client.defaults.baseURL.replace('/api', '');
const LOCALHOST_URL = 'http://localhost:4000';
const FALLBACK_IMAGE_URL = 'https://picsum.photos/400';

// Sample data for fallback
const sampleProducts = [
    {
        _id: 's1', name: 'POLK DRESS', price: 75.00, category: 'T-Shirt',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', stock: 50
    },
    {
        _id: 's2', name: 'Basic Black T-Shirt', price: 35.00, category: 'T-Shirt',
        image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500', stock: 100
    },
    {
        _id: 's3', name: 'White Plain T-Shirt', price: 33.00, category: 'Polo',
        image: 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=500', stock: 80
    },
    {
        _id: 's4', name: 'POLK DRESS Beige', price: 28.00, category: 'Short',
        image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500', stock: 60
    },
];

const FIXED_CATEGORIES = ['T-Shirt', 'Polo', 'Short', 'Pant', 'Jean', 'Jacket', 'Hoodie', 'Dress'];

// Component Header cho FlatList (Gồm TopBar, Search và Categories)
const ListHeader = ({ search, onSearch, categoriesList, activeCategory, onCategory, router, styles, COLORS, loading, status }) => (
    <View>
        {/* TopBar: logo + cart */}
        <View style={styles.topBar}>
            <View style={{ width: 30 }} />
            <Text style={styles.logoText}>AI Shop</Text>
            <TouchableOpacity onPress={() => router.push('/cart')} style={styles.cartBtn}>
                <Ionicons name="cart-outline" size={24} color={COLORS.text} />
            </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={COLORS.muted} />
            <TextInput
                placeholder="Tìm kiếm sản phẩm..."
                placeholderTextColor={COLORS.muted}
                style={styles.searchInput}
                value={search}
                onChangeText={onSearch}
            />
        </View>

        {/* Featured categories */}
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featureScroll}
            keyboardShouldPersistTaps="handled"
        >
            {categoriesList.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                    <TouchableOpacity
                        key={cat}
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

        {/* Status message and Loading state */}
        {loading ? (
            <View style={styles.statusContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        ) : status ? (
            <View style={styles.statusBox}>
                <Text style={styles.statusText}>{status}</Text>
            </View>
        ) : <View style={{ height: 10 }} />}
    </View>
);


function ProductCard({ item, onAdd, onPress }) {
    // Sử dụng fallback cho Image Source
    const imageSource = {
        uri: item.image || FALLBACK_IMAGE_URL
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.imageContainer}>
                <Image source={imageSource} style={styles.image} />
            </View>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>

            {/* Khối cardFooter (ĐÃ SỬA LỖI CÚ PHÁP) */}
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
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const categoriesList = useMemo(() => ['All', ...FIXED_CATEGORIES], []);

    useEffect(() => {
        loadProducts();
    }, []);


    const loadProducts = async () => {
        setLoading(true);
        setStatus(null);
        try {

            const response = await client.get('/products');

            let apiData = response.data;
            if (typeof apiData === 'string' || !apiData.success) {
                throw new Error("Invalid API response format: Did not receive JSON.");
            }

            let list = Array.isArray(apiData.data) ? apiData.data : [];

            // FIX LỖI ẢNH: Chuẩn hóa URL ảnh 
            list = list.map(product => {
                let imageUrl = product.image;

                // 1. Nếu là Mảng ảnh
                if (Array.isArray(product.image) && product.image.length > 0) {
                    imageUrl = product.image[0];
                }

                // 2. Thay thế URL localhost bằng BASE_URL của client
                if (imageUrl && imageUrl.includes(LOCALHOST_URL)) {
                    imageUrl = imageUrl.replace(LOCALHOST_URL, API_BASE_URL_FOR_IMAGES);
                }

                // 3. Trả về product mới với ảnh đã được chuẩn hóa
                return {
                    ...product,
                    image: imageUrl
                };
            });

            if (list.length > 0) {
                setProducts(list);
                setFiltered(list);
                setStatus(null);
            } else {
                setProducts(sampleProducts);
                setFiltered(sampleProducts);
                setStatus('Server trả về dữ liệu trống - hiển thị sản phẩm mẫu.');
            }
        } catch (err) {
            console.error('[HomeScreen] API Error (Network/Parsing):', err.message);

            if (err.message.includes('Invalid API response')) {
                setStatus('LỖI DỮ LIỆU: Server trả về text/HTML thay vì JSON.');
            } else {
                setStatus('Kết nối mạng thất bại - hiển thị sản phẩm mẫu.');
            }

            setProducts(sampleProducts);
            setFiltered(sampleProducts);

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
                    productId: product._id, name: product.name, price: product.price,
                    image: product.image, quantity: 1
                });
            }

            await AsyncStorage.setItem('cart', JSON.stringify(cart));
            Alert.alert('Đã thêm vào giỏ', `${product.name} đã được thêm vào giỏ hàng.`);
        } catch (e) {
            console.error('Error adding to cart:', e);
            Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng.');
        }
    };

    const onSearch = (text) => {
        setSearch(text);
        const q = text.trim().toLowerCase();

        const baseList = activeCategory === 'All'
            ? products
            : products.filter(p => (p.category || '').toLowerCase() === activeCategory.toLowerCase());

        if (!q) {
            setFiltered(baseList);
            return;
        }
        setFiltered(baseList.filter((p) => (p.name || '').toLowerCase().includes(q)));
    };

    const onCategory = (cat) => {
        setActiveCategory(cat);

        const low = cat.toLowerCase();

        const filteredByCategory = cat === 'All'
            ? products
            : products.filter((p) => (p.category || '').toLowerCase() === low);

        const q = search.trim().toLowerCase();
        if (q) {
            setFiltered(filteredByCategory.filter((p) => (p.name || '').toLowerCase().includes(q)));
        } else {
            setFiltered(filteredByCategory);
        }
    };

    const handleProductPress = (item) => {

        router.push(`/products/${item._id}`);
    };


    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>

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
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"

                    ListHeaderComponent={
                        <ListHeader
                            search={search}
                            onSearch={onSearch}
                            categoriesList={categoriesList}
                            activeCategory={activeCategory}
                            onCategory={onCategory}
                            router={router}
                            styles={styles}
                            COLORS={COLORS}
                            loading={loading}
                            status={status}
                        />
                    }
                />
            </View>
        </SafeAreaView>
    );
}

/* Styles */
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },
    container: { flex: 1, paddingHorizontal: 16 },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingTop: 12 },
    logoText: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
    logo: { width: 40, height: 40 },
    cartBtn: { padding: 4 },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 15,
    },
    searchInput: { marginLeft: 10, flex: 1, fontSize: 16, color: COLORS.text },

    // Categories
    featureScroll: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 8,
        paddingRight: 20
    },
    featureBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        marginRight: 8,
        backgroundColor: '#fff',
        elevation: 0,
        shadowOpacity: 0,
        shadowRadius: 0,
    },
    featureActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        elevation: 0,
        shadowOpacity: 0,
        shadowRadius: 0,
    },
    featureText: {
        color: COLORS.text,
        fontSize: 14
    },
    featureTextActive: {
        color: '#fff',
        fontWeight: 'bold'
    },

    // Status Box & Loading
    statusContainer: { paddingVertical: 30 },
    statusBox: {
        backgroundColor: COLORS.surface,
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },
    statusText: { color: COLORS.text, marginBottom: 0, textAlign: 'center', fontSize: 13, fontWeight: '500' },

    list: { paddingBottom: 20, paddingTop: 0 },
    columnWrap: { justifyContent: 'space-between' },

    // Product Card
    card: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 8,
        marginBottom: 18,
        alignItems: 'flex-start',
        elevation: 1,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    imageContainer: { width: '100%', alignItems: 'center', marginBottom: 5 },
    image: { width: '100%', aspectRatio: 1, borderRadius: 6 },
    name: { fontSize: 14, color: COLORS.text, textAlign: 'left', fontWeight: '600', width: '100%', marginTop: 4 },
    cardFooter: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    price: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
    addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
});
