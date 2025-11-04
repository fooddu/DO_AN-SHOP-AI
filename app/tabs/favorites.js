import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Import API client (đảm bảo đường dẫn này đúng)
import client from '../../api/axiosConfig';

const FavoritesScreen = () => {
  const router = useRouter();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // Để hiển thị thông báo

  // 1. SAO CHÉP LOGIC GỌI API TỪ HOMESCREEN
  const loadProducts = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const response = await client.get('/products');
      
      // LOG
      console.log('[FavoritesScreen] Phản hồi API:', response);

      // Lấy data từ response.data.data
      const list = Array.isArray(response.data.data) ? response.data.data : [];
      
      if (list.length > 0) {
        setProducts(list); // Hiển thị 6 sản phẩm
      } else {
        setProducts([]);
        setStatus('Server trả về rỗng.'); // Thông báo
      }
    } catch (err) {
      console.error('[FavoritesScreen] Lỗi API:', err);
      setStatus('Không thể kết nối tới server.'); // Thông báo lỗi
    } finally {
      setLoading(false);
    }
  };

  // 2. GỌI API KHI MÀN HÌNH MỞ RA
  useEffect(() => {
    loadProducts();
  }, []);

  // (Các hàm này tạm thời chỉ để ví dụ)
  const removeFromFavorites = (id) => {
    // Tạm thời xóa khỏi state
    setProducts((prev) => prev.filter(item => item._id !== id));
  };
  const addToCart = (item) => {
    console.log('Đã thêm vào giỏ:', item.name);
  };

  // Render từng item (theo layout bạn gửi)
  const renderFavoriteItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>$ {Number(item.price).toFixed(2)}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => removeFromFavorites(item._id)}>
          <Ionicons name="close-circle-outline" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => addToCart(item)} style={styles.bagIcon}>
          <Ionicons name="bag-handle-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Hàm hiển thị khi loading hoặc danh sách rỗng
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
        </View>
      );
    }

    if (products.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.statusText}>{status || 'Không có sản phẩm nào.'}</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={products}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item._id} // Dùng _id
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <TouchableOpacity onPress={() => router.push('/cart')}>
          <Ionicons name="cart-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Danh sách sản phẩm */}
      {renderContent()}

      {/* Nút "Add all to my cart" */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add all to my cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: { // Dùng cho cả loading và text rỗng
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // Trừ hao footer
  },
  statusText: {
    fontSize: 16,
    color: '#888',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, 
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginRight: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1, 
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  itemActions: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
    paddingVertical: 5,
  },
  bagIcon: {
    marginTop: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  addButton: {
    backgroundColor: '#212121',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

