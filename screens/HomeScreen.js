// [File] HomeScreen.js (Giả định nằm ở app/tabs/index.js)

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import client from '../../api/axiosConfig'; // API client

const COLORS = {
    primary: '#E91E63', 
    text: '#222',
    muted: '#888',
    bg: '#ffffff',
    surface: '#F6F6F6',
    shadow: '#000',
};

// Dữ liệu mẫu fallback (Giữ nguyên)
const sampleProducts = [
    { _id: 's1', name: 'POLK DRESS', price: 75.00, category: 'T-Shirt', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', stock: 50 },
    { _id: 's2', name: 'Basic Black T-Shirt', price: 35.00, category: 'Hoodie', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500', stock: 100 },
    { _id: 's3', name: 'White Plain T-Shirt', price: 33.00, category: 'Polo', image: 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=500', stock: 80 },
    { _id: 's4', name: 'POLK DRESS Beige', price: 28.00, category: 'Jean', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500', stock: 60 },
];

function ProductCard({ item, onAdd, onPress }) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <View style={{ width: '100%', alignItems: 'center' }}>
                <Image source={{ uri: item.image }} style={styles.image} />
            </View>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <View style={styles.cardFooter}>
                <Text style={styles.price}>$ {Number(item.price).toFixed(2)}</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(item)}>
                    <Ionicons name="cart" size={14} color="#fff" />
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
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [availableCategories, setAvailableCategories] = useState([]);

    useEffect(() => {
        loadProducts();
    }, []);

    // HÀM LẤY CATEGORY DUY NHẤT
    const loadCategories = (productList) => {
        const categories = new Set();
        productList.forEach(p => {
            if (p.category && typeof p.category === 'string') {
                categories.add(p.category); 
            }
        });
        setAvailableCategories(Array.from(categories)); 
    };


    const loadProducts = async () => {
        setLoading(true);
        setStatus(null);
        try {
            const response = await client.get('/products');
            const list = Array.isArray(response.data.data) ? response.data.data : [];
            
            if (list.length > 0) {
                setProducts(list);
                setFiltered(list);
                loadCategories(list); 
                setStatus(null);
            } else {
                setProducts(sampleProducts);
                setFiltered(sampleProducts);
                loadCategories(sampleProducts); 
                setStatus('Server trả về rỗng — hiển thị mẫu');
            }
        } catch (err) {
            console.error('[HomeScreen] Lỗi API:', err);
            setProducts(sampleProducts);
            setFiltered(sampleProducts);
            loadCategories(sampleProducts);
            setStatus('Không kết nối tới server — hiển thị mẫu');
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
            Alert.alert('Đã thêm', `${product.name} đã được thêm vào giỏ hàng.`);
        } catch (e) {
            console.error('Lỗi thêm vào giỏ:', e);
            Alert.alert('Lỗi', 'Thêm vào giỏ thất bại');
        }
    };

    const onSearch = (text) => {
        setSearch(text);
        const q = text.trim().toLowerCase();

        if (!q) {
            onCategory('Tất cả'); 
            return;
        }
        
        const searchResults = products.filter((p) => {
            const searchString = [p.name, p.category, p.brand, p.description].join(' ').toLowerCase();
            return searchString.includes(q);
        });

        setFiltered(searchResults);
        setActiveCategory('Tất cả'); 
    };

    const onCategory = (cat) => {
        setActiveCategory(cat);
        
        let listToFilter = products;
        
        const q = search.trim().toLowerCase();
        if (q) {
            listToFilter = products.filter((p) => {
                const searchString = [p.name, p.category].join(' ').toLowerCase();
                return searchString.includes(q);
            });
        }

        if (cat === 'Tất cả') {
            setFiltered(listToFilter);
            return;
        }
        
        const low = cat.toLowerCase();
        setFiltered(listToFilter.filter((p) => (p.category || '').toLowerCase().includes(low)));
    };

    const handleProductPress = (item) => {
        router.push(`/products/${item._id}`);
    };


    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}> 
                {/* TopBar: logo + cart */}
                <View style={styles.topBar}>
                    <View style={styles.topBarLeft} /> 
                    <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
                    <TouchableOpacity onPress={() => router.push('/cart')} style={styles.cartBtn}>
                        <Ionicons name="cart-outline" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {/* SEARCH INPUT */}
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={18} color={COLORS.muted} />
                    <TextInput
                        placeholder="Tìm kiếm sản phẩm..."
                        placeholderTextColor="#999"
                        style={styles.searchInput}
                        value={search}
                        onChangeText={onSearch} 
                    />
                </View>

                {/* ⭐️ HÀNG CATEGORY CÓ THỂ KÉO NGANG ⭐️ */}
                {/* THAY ĐỔI: Sử dụng style mới cho scroll view để không bị padding */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.featureScrollContent} 
                    style={styles.categoryScrollContainer} // Đặt margin/padding cho container scroll
                >
                    <View style={styles.featureRow}>
                        {/* Nút 'Tất cả' */}
                        <TouchableOpacity
                            style={[styles.featureBtn, activeCategory === 'Tất cả' && styles.featureActive]}
                            onPress={() => onCategory('Tất cả')}
                        >
                            <Text style={[styles.featureText, activeCategory === 'Tất cả' && styles.featureTextActive]}>Tất cả</Text>
                        </TouchableOpacity>

                        {/* MAP QUA availableCategories ĐỘNG */}
                        {availableCategories.map((f) => {
                            const isActive = activeCategory === f;
                            return (
                                <TouchableOpacity
                                    key={f}
                                    style={[styles.featureBtn, isActive && styles.featureActive]}
                                    onPress={() => onCategory(f)}
                                >
                                    <Text style={[styles.featureText, isActive && styles.featureTextActive]}>{f}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>


                {/* Status message */}
                {loading ? (
                    <View style={styles.statusPadding}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : status ? (
                    <Text style={styles.statusText}>{status}</Text>
                ) : null}

                {/* Grid sản phẩm */}
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
                    style={styles.flatListStyle} // Style cho FlatList
                />
                
            </View>
        </SafeAreaView>
    );
}

/* Styles */
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },
    // ⭐️ THAY ĐỔI 1: ÁP DỤNG PADDING CHUNG CHO CONTAINER
    container: { flex: 1, paddingTop: 12, paddingHorizontal: 16 }, 

    // Status padding (có thể giữ lại nếu muốn)
    statusPadding: { paddingVertical: 30, paddingHorizontal: 16 },

    // Các phần tử khác đã có padding trong container (TopBar, SearchBox)
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    topBarLeft: { width: 22 },
    logo: { width: 72, height: 72 },
    cartBtn: { padding: 6, borderRadius: 20 },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 22,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 10,
    },
    searchInput: { marginLeft: 8, flex: 1, fontSize: 15, color: COLORS.text },
    
    // ⭐️ THAY ĐỔI 2: STYLE CHO SCROLLVIEW CONTAINER
    categoryScrollContainer: {
        marginBottom: 10,
        // Đặt padding ngang bằng 0 để cuộn qua cạnh
        marginHorizontal: -16, 
        // Thay đổi: Xóa padding ở đây và đặt lại vào contentContainerStyle
    },
    // ⭐️ THAY ĐỔI 3: STYLE CHO NỘI DUNG SCROLL
    featureScrollContent: {
        paddingLeft: 16, // Đẩy hàng nút vào 
        paddingRight: 16, // Đảm bảo nút cuối cùng không bị cắt
        alignItems: 'center',
    },
    featureRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
    },
    featureBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        marginRight: 8,
        backgroundColor: '#fff',
    },
    featureActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    featureText: { color: COLORS.text, fontSize: 13 },
    featureTextActive: { color: '#fff', fontWeight: '700' },
    statusText: { color: '#e74c3c', marginBottom: 6, textAlign: 'center' },
    
    // STYLE CHO FLATLIST
    flatListStyle: {
        // FlatList cần chiếm hết không gian còn lại
        flex: 1,
    },
    list: { paddingBottom: 20, paddingTop: 6 }, 
    columnWrap: { justifyContent: 'space-between' },
    card: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        marginBottom: 18,
        alignItems: 'center',
        elevation: 3,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    image: { width: 140, height: 140, borderRadius: 10, marginBottom: 8 },
    name: { fontSize: 14, color: COLORS.text, textAlign: 'center' },
    cardFooter: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
    price: { color: COLORS.text, fontWeight: '700' },
    addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },

  });