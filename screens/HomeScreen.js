import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

/**
 * HomeScreen (optimized)
 * - Animated press feedback for cards & category buttons
 * - Clean layout: top bar (logo + cart), search row, featured categories, brand scroll, product grid
 * - API fallback to sampleProducts
 * - Add to Cart saved in AsyncStorage (key: 'CART')
 *
 * Actions:
 * - Change API_URL to your backend IPv4
 * - Ensure logo at ../assets/logo-Shop.png (or edit path)
 * - Ensure app/cart.js exists for router.push('/cart')
 */

const COLORS = {
  primary: '#E91E63', // pink
  text: '#222',
  muted: '#888',
  bg: '#ffffff',
  surface: '#F6F6F6',
  shadow: '#000',
};

const API_URL = 'http://192.168.1.28:5000/api/products'; // <-- đổi IP thành IPv4 máy bạn

const CATEGORIES = {
  features: ['T-Shirt', 'Shirt', 'Polo'],
  brands: ['Nike', 'Louis Vuitton', 'Adidas', 'Gucci', 'Chanel'],
};

const sampleProducts = [
  {
    _id: 's1',
    name: 'Polo Gucci',
    price: 12,
    image:
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=60',
    category: 'Gucci',
  },
  {
    _id: 's2',
    name: 'T-Shirt Nike',
    price: 25,
    image:
      'https://images.unsplash.com/photo-1520975912544-2d9f1f0b8a5b?auto=format&fit=crop&w=500&q=60',
    category: 'Nike',
  },
  {
    _id: 's3',
    name: 'Shirt Louisvuitton',
    price: 20,
    image:
      'https://images.unsplash.com/photo-1541099649105-9f6d3d6d6d1b?auto=format&fit=crop&w=500&q=60',
    category: 'Louis Vuitton',
  },
  {
    _id: 's4',
    name: 'T-shirt Nike Black',
    price: 50,
    image:
      'https://images.unsplash.com/photo-1519400190538-6fbcf7b4b9f4?auto=format&fit=crop&w=500&q=60',
    category: 'Nike',
  },
];

function AnimatedButton({ children, style, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.timing(scale, { toValue: 0.96, duration: 100, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.timing(scale, {
      toValue: 1,
      duration: 100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

function ProductCard({ item, onAdd }) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.timing(scale, { toValue: 0.98, duration: 120, useNativeDriver: true }).start();
  const pressOut = () => Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <Pressable
        onPress={() => console.log('Open product', item._id || item.id)}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={{ width: '100%', alignItems: 'center' }}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
      </Pressable>

      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.price}>$ {Number(item.price).toFixed(2)}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(item)}>
          <Ionicons name="cart" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
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

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(API_URL);
      const body = await res.json();
      const list = Array.isArray(body) ? body : body?.data || [];
      if (list.length) {
        setProducts(list);
        setFiltered(list);
      } else {
        setProducts(sampleProducts);
        setFiltered(sampleProducts);
        setStatus('Server trả về rỗng — hiển thị mẫu');
      }
    } catch (err) {
      console.warn('fetch error', err);
      setProducts(sampleProducts);
      setFiltered(sampleProducts);
      setStatus('Không kết nối tới server — hiển thị mẫu');
    } finally {
      setLoading(false);
    }
  };

  // Add to cart saved to AsyncStorage (CART)
  const addToCart = async (product) => {
    try {
      const raw = await AsyncStorage.getItem('CART');
      const cart = raw ? JSON.parse(raw) : [];
      const idx = cart.findIndex((it) => it._id === product._id);
      if (idx >= 0) cart[idx].qty = (cart[idx].qty || 1) + 1;
      else cart.push({ ...product, qty: 1 });
      await AsyncStorage.setItem('CART', JSON.stringify(cart));
      Alert.alert('Đã thêm', `${product.name} đã được thêm vào giỏ hàng.`);
    } catch (e) {
      console.error('addToCart', e);
      Alert.alert('Lỗi', 'Thêm vào giỏ thất bại');
    }
  };

  const onSearch = (text) => {
    setSearch(text);
    const q = text.trim().toLowerCase();
    if (!q) {
      setFiltered(products);
      return;
    }
    setFiltered(products.filter((p) => (p.name || '').toLowerCase().includes(q)));
  };

  const onCategory = (cat) => {
    setActiveCategory(cat);
    if (cat === 'Tất cả') {
      setFiltered(products);
      return;
    }
    const low = cat.toLowerCase();
    setFiltered(products.filter((p) => (p.category || '').toLowerCase().includes(low)));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* TopBar: search icon + logo + cart */}
        <View style={styles.topBar}>
          <Ionicons name="search-outline" size={22} color={COLORS.text} />
          <Image source={require('../assets/logo-Shop.png')} style={styles.logo} resizeMode="contain" />
          <TouchableOpacity onPress={() => router.push('/cart')} style={styles.cartBtn}>
            <Ionicons name="cart-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Search */}
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

        {/* Featured categories */}
        <View style={styles.featureRow}>
          <AnimatedButton
            style={[styles.featureBtn, activeCategory === 'Tất cả' && styles.featureActive]}
            onPress={() => onCategory('Tất cả')}
          >
            <Text style={[styles.featureText, activeCategory === 'Tất cả' && styles.featureTextActive]}>Tất cả</Text>
          </AnimatedButton>

          {CATEGORIES.features.map((f) => {
            const isActive = activeCategory === f;
            return (
              <AnimatedButton
                key={f}
                style={[styles.featureBtn, isActive && styles.featureActive]}
                onPress={() => onCategory(f)}
              >
                <Text style={[styles.featureText, isActive && styles.featureTextActive]}>{f}</Text>
              </AnimatedButton>
            );
          })}
        </View>

        {/* Brands scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandScroll}>
          {CATEGORIES.brands.map((b) => (
            <TouchableOpacity key={b} style={styles.brandItem} onPress={() => onCategory(b)}>
              <Text style={styles.brandText}>{b}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Status */}
        {loading ? (
          <View style={{ paddingVertical: 30 }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : status ? (
          <Text style={styles.statusText}>{status}</Text>
        ) : null}

        {/* Grid */}
        <FlatList
          data={filtered}
          renderItem={({ item }) => <ProductCard item={item} onAdd={addToCart} />}
          keyExtractor={(it) => it._id || it.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrap}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

/* Styles */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingTop: 12, paddingHorizontal: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
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

  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, flexWrap: 'nowrap' },
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

  brandScroll: { marginBottom: 8 },
  brandItem: { marginRight: 12, backgroundColor: '#F3F3F3', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 18 },
  brandText: { color: COLORS.muted, textTransform: 'capitalize', fontSize: 13 },

  statusText: { color: '#e74c3c', marginBottom: 6 },

  list: { paddingBottom: 120, paddingTop: 6 },
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
