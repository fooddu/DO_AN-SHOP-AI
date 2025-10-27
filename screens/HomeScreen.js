import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Image,
         TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  const handleSearch = (text) => {
    setSearch(text);
    const filteredData = products.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    setFiltered(filteredData);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      setFiltered(products);
    } else {
      const filteredData = products.filter((item) =>
        item.name.toLowerCase().includes(cat.toLowerCase())
      );
      setFiltered(filteredData);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>$ {item.price}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Thanh tìm kiếm + Logo + Giỏ hàng */}
      <View style={styles.headerRow}>
        <Ionicons name="search-outline" size={22} color="#333" />
        <Image
          source={{ uri: 'https://i.imgur.com/v8jFhDk.png' }} // logo AI Shop
          style={styles.logo}
        />
        <Ionicons name="cart-outline" size={22} color="#333" />
      </View>

      {/* Tìm Kiếm Sản Phẩm */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          placeholder="Tìm kiếm sản phẩm..."
          style={styles.searchInput}
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* Danh mục */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {['All', 'T-Shirt', 'Shirt', 'Polo', 'Nike', 'Louis Vuitton', 'Adidas', 'Gucci', 'Chanel'].map(
          (cat, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                selectedCategory === cat && styles.categorySelected,
              ]}
              onPress={() => handleCategorySelect(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      {/* Danh sách sản phẩm */}
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Tab */}
      <View style={styles.bottomTab}>
        <TouchableOpacity style={styles.tabButton}>
          <Ionicons name="home" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton}>
          <Ionicons name="heart-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton}>
          <Ionicons name="person-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40, paddingHorizontal: 15 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: { width: 60, height: 60, resizeMode: 'contain' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 15,
  },
  searchInput: { flex: 1, marginHorizontal: 10 },
  categories: { marginBottom: 10 },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginRight: 10,
  },
  categorySelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  categoryText: { fontSize: 14, color: '#333' },
  categoryTextSelected: { color: '#fff' },
  list: { paddingBottom: 100 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    padding: 10,
  },
  image: { width: 120, height: 120, borderRadius: 10 },
  name: { fontSize: 14, marginTop: 8 },
  price: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  bottomTab: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabButton: { alignItems: 'center' },
});
