import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  const API_URL = 'http://192.168.1.28:5000/api/products'; // ⚠️ đổi IP cho phù hợp

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

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.infoBox}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Thanh tìm kiếm */}
      <View style={styles.header}>
        <Text style={styles.title}>AL-Shop</Text>
        <Ionicons name="cart-outline" size={24} color="#333" />
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          placeholder="Tìm kiếm sản phẩm..."
          style={styles.searchInput}
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* Thanh danh mục */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
      >
        {['T-Shirt', 'Shirt', 'Polo', 'Nike', 'Adidas', 'Gucci', 'LV', 'Chanel'].map((cat, index) => (
          <TouchableOpacity key={index} style={styles.categoryButton}>
            <Text style={styles.categoryText}>{cat}</Text>
          </TouchableOpacity>
        ))}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    letterSpacing: 0.5,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 15,
    color: '#333',
  },
  categories: {
    flexGrow: 0,
    marginBottom: 10,
  },
  categoryButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    padding: 10,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  infoBox: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
  },
  price: {
    fontWeight: '700',
    fontSize: 15,
    color: '#E67E22',
    marginTop: 4,
  },
});
