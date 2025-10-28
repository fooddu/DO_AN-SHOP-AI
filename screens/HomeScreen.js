import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ⚠️ Thay IP cho đúng: ipconfig -> IPv4 Address
  const API_URL = 'http://192.168.1.28:5000/api/products';

  // Dữ liệu mẫu 
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      // nếu fetch bị lỗi mạng sẽ nhảy catch
      const data = await res.json();
      // backend của bạn trả dạng { success: true, data: [...] }
      if (data && (data.success || Array.isArray(data))) {
        // chấp nhận cả 2 dạng trả về: trực tiếp array hoặc object {success,data}
        const list = Array.isArray(data) ? data : data.data || [];
        if (list.length > 0) {
          setProducts(list);
          setFiltered(list);
        } else {
          // nếu backend trả mảng rỗng → dùng sample để test giao diện
          setProducts(sampleProducts);
          setFiltered(sampleProducts);
          setError('Server trả về danh sách rỗng — đang hiển thị mẫu');
        }
      } else {
        // dữ liệu không đúng định dạng
        setProducts(sampleProducts);
        setFiltered(sampleProducts);
        setError('Dữ liệu API không hợp lệ — hiển thị dữ liệu mẫu');
      }
    } catch (err) {
      console.warn('Fetch products error:', err.message);
      // lỗi mạng / không kết nối được server
      setProducts(sampleProducts);
      setFiltered(sampleProducts);
      setError('Không kết nối tới server — đang hiển thị mẫu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    const filteredData = products.filter((p) =>
      p.name.toLowerCase().includes(text.toLowerCase())
    );
    setFiltered(filteredData);
  };

  const handleCategoryPress = (cat) => {
    setActiveCategory(cat);
    if (cat === 'Tất cả') {
      setFiltered(products);
    } else {
      const filteredData = products.filter((p) =>
        (p.category || '').toLowerCase().includes(cat.toLowerCase())
      );
      setFiltered(filteredData);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        // nếu bạn có màn ProductDetail, navigation.navigate('ProductDetail', { id: item._id })
        console.log('Pressed', item.name);
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.price}>$ {item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header: search + logo + cart */}
      <View style={styles.topBar}>
        <Ionicons name="search-outline" size={22} color="#333" />
        {/* Logo: đặt file vào /assets/logo-Shop.png */}
        <Image
          source={require('../assets/logo-Shop.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Ionicons name="cart-outline" size={22} color="#333" />
      </View>

      {/* Search box */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#888" />
        <TextInput
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Feature categories (3 nút lớn) */}
      <View style={styles.featureRow}>
        {['T-Shirt', 'Shirt', 'Polo'].map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.featureBtn,
              activeCategory === c && styles.featureBtnActive,
            ]}
            onPress={() => handleCategoryPress(c)}
          >
            <Text
              style={[
                styles.featureText,
                activeCategory === c && styles.featureTextActive,
              ]}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Small brand categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.brandScroll}
      >
        {['nike', 'louis vuitton', 'addidas', 'Gucci', 'Chanel'].map((b) => (
          <TouchableOpacity
            key={b}
            style={styles.brandItem}
            onPress={() => handleCategoryPress(b)}
          >
            <Text style={styles.brandText}>{b}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status */}
      {loading ? (
        <View style={{ paddingVertical: 30 }}>
          <ActivityIndicator size="large" color="#E91E63" />
        </View>
      ) : error ? (
        <Text style={{ color: '#e74c3c', marginBottom: 6 }}>{error}</Text>
      ) : null}

      {/* Product grid */}
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item._id || item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40, paddingHorizontal: 15 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: { width: 70, height: 70 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchInput: { marginLeft: 8, flex: 1, fontSize: 15, color: '#333' },
  featureRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 6 },
  featureBtn: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 6,
    backgroundColor: '#fff',
  },
  featureBtnActive: { backgroundColor: '#E91E63', borderColor: '#E91E63' },
  featureText: { color: '#333' },
  featureTextActive: { color: '#fff', fontWeight: '700' },
  brandScroll: { marginBottom: 8 },
  brandItem: { marginRight: 14 },
  brandText: { color: '#888', textTransform: 'lowercase' },
  list: { paddingBottom: 100, paddingTop: 6 },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 18,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: { width: 140, height: 140, borderRadius: 10, marginBottom: 6 },
  name: { fontSize: 14, color: '#333', textAlign: 'center' },
  price: { marginTop: 6, color: '#111', fontWeight: '700' },
});
      