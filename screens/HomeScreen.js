import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  // ⚠️ Xem IP của máy(xem bằng lệnh "ipconfig" → IPv4)
  const API_URL = 'http://192.168.1.28:5000/api/products';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setFiltered(data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm:', error);
    }
  };

  // Tìm kiếm
  const handleSearch = (text) => {
    setSearch(text);
    const filteredData = products.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    setFiltered(filteredData);
  };

  // Lọc theo danh mục
  const handleCategoryPress = (cat) => {
    setActiveCategory(cat);
    if (cat === 'Tất cả') {
      setFiltered(products);
    } else {
      const filteredData = products.filter((item) =>
        item.category?.toLowerCase().includes(cat.toLowerCase())
      );
      setFiltered(filteredData);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.price}>$ {item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* --- Header tìm kiếm --- */}
      <View style={styles.header}>
        <Ionicons name="search-outline" size={22} color="#555" />
        <TextInput
          placeholder="Tìm kiếm sản phẩm..."
          style={styles.searchInput}
          value={search}
          onChangeText={handleSearch}
        />
        <Ionicons name="cart-outline" size={24} color="#555" />
      </View>

      {/* --- Thanh danh mục --- */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {['Tất cả', 'T-Shirt', 'Shirt', 'Polo', 'Nike', 'Louis Vuitton', 'Adidas', 'Gucci', 'Chanel'].map(
          (cat, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                activeCategory === cat && styles.activeCategory,
              ]}
              onPress={() => handleCategoryPress(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat && styles.activeText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      {/* --- Danh sách sản phẩm --- */}
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 15,
    color: '#333',
  },
  categories: {
    flexGrow: 0,
    marginBottom: 12,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  activeCategory: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 10,
  },
  name: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    color: '#444',
  },
  price: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#E91E63',
    marginTop: 4,
  },
});
