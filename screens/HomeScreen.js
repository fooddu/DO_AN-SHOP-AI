import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import client from '../api/client';

export default function HomeScreen() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('T-Shirt');
  const [loading, setLoading] = useState(true);

  const categories = ['T-Shirt', 'Short', 'Pant', 'Polo', 'Jean'];

  // Lấy danh sách sản phẩm từ API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await client.get('/products');
      setProducts(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi lấy sản phẩm:', error);
      setLoading(false);
      Alert.alert('Lỗi', 'Không thể lấy danh sách sản phẩm');
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (product) => {
    try {
      // Lấy giỏ hàng hiện tại
      const existingCart = await AsyncStorage.getItem('cart');
      let cart = existingCart ? JSON.parse(existingCart) : [];

      // Kiểm tra sản phẩm đã có trong giỏ chưa
      const index = cart.findIndex(item => item.productId === product._id);

      if (index !== -1) {
        // Nếu đã có, tăng số lượng
        cart[index].quantity += 1;
      } else {
        // Nếu chưa có, thêm mới
        cart.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1
        });
      }

      // Lưu lại vào Local Storage
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      Alert.alert('Thành công', 'Đã thêm vào giỏ hàng!');
    } catch (error) {
      console.error('Lỗi thêm vào giỏ:', error);
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng');
    }
  };

  // Hiển thị 1 sản phẩm
  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <Image 
        source={{ uri: item.image }} 
        style={styles.productImage}
        resizeMode="cover"
      />
      <Text style={styles.productName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.productPrice}>
        $ {item.price.toFixed(2)}
      </Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => addToCart(item)}
      >
        <Text style={styles.addButtonText}>Add to cart</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WELCOME</Text>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
        >
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === cat && styles.categoryTextActive
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Danh sách sản phẩm */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  cartButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartIcon: {
    fontSize: 24,
  },
  categoriesContainer: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  categoryButtonActive: {
    backgroundColor: '#000',
  },
  categoryText: {
    fontSize: 14,
    color: '#808080',
  },
  categoryTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  productList: {
    paddingHorizontal: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginTop: 10,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 5,
  },
  addButton: {
    backgroundColor: '#000',
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

