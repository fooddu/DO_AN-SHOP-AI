import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
// Import icon từ thư viện
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// DỮ LIỆU GIẢ (DUMMY DATA) - Đã cập nhật để có ảnh và giá
const DUMMY_FAVORITES = [
  { 
    _id: '1', 
    name: 'POLO_GUCCI', 
    price: '50.00', 
    imageUri: 'https://cdn.example.com/polo1.png' // Thay thế bằng link ảnh thật
  },
  { 
    _id: '2', 
    name: 'POLO_GUCCI', 
    price: '20.00', 
    imageUri: 'https://cdn.example.com/polo2.png' 
  },
  { 
    _id: '3', 
    name: 'POLO_GUCCI', 
    price: '25.00', 
    imageUri: 'https://cdn.example.com/polo3.png' 
  },
  { 
    _id: '4', 
    name: 'POLO_GUCCI', 
    price: '50.00', 
    imageUri: 'https://cdn.example.com/polo4.png' 
  },
];
// (Bạn có thể tìm link ảnh polo gucci để dán vào 'imageUri' cho giống thật)

// Component Row (Mỗi hàng sản phẩm)
const ProductItem = ({ item }) => (
    <View style={styles.productRow}>
        {/* Cột 1: Hình ảnh */}
        <Image 
            source={{ uri: item.imageUri || 'https://via.placeholder.com/80' }} // Dùng placeholder nếu không có ảnh
            style={styles.productImage} 
        />
        
        {/* Cột 2: Tên và Giá */}
        <View style={styles.productDetails}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>$ {item.price}</Text>
        </View>
        
        {/* Cột 3: Nút Bấm (Xóa và Thêm giỏ hàng) */}
        <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="close-circle-outline" size={24} color="#888" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.bagButton}>
                <MaterialCommunityIcons name="shopping-outline" size={20} color="#000" />
            </TouchableOpacity>
        </View>
    </View>
);

// Component Header (Thanh tiêu đề)
const FavoritesHeader = () => (
    <View style={styles.headerContainer}>
        <TouchableOpacity>
            <Ionicons name="search-outline" size={28} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Favorites</Text>
        
        <TouchableOpacity>
            <Ionicons name="cart-outline" size={28} color="#000" />
        </TouchableOpacity>
    </View>
);

// Component Footer (Nút "Add all to my cart")
const FavoritesFooter = () => (
    <TouchableOpacity style={styles.footerButton}>
        <Text style={styles.footerButtonText}>Add all to my cart</Text>
    </TouchableOpacity>
);

// Màn hình chính
export default function FavoritesScreen() {
    return (
        <SafeAreaView style={styles.container}>
            {/* 1. Header */}
            <FavoritesHeader />
            
            {/* 2. Danh sách sản phẩm */}
            <FlatList
                style={styles.list}
                data={DUMMY_FAVORITES}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <ProductItem item={item} />}
                // Đường kẻ ngăn cách giữa các item
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            
            {/* 3. Footer Button */}
            <FavoritesFooter />
        </SafeAreaView>
    );
}

// --- CSS/Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    list: {
        flex: 1, // Cho phép FlatList chiếm không gian ở giữa
    },
    // Header
    headerContainer: {
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
    },
    // Product Row
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
    },
    productImage: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        borderRadius: 8,
        marginRight: 15,
    },
    productDetails: {
        flex: 1, // Chiếm không gian còn lại ở giữa
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 16,
        color: '#555',
    },
    // Action Buttons
    actionButtons: {
        justifyContent: 'space-between', // Đẩy 2 nút ra xa nhau
        alignItems: 'center',
        height: 80, // Cho 2 nút cao bằng hình ảnh
    },
    iconButton: {
        // Style cho nút X
    },
    bagButton: {
        backgroundColor: '#f0f0f0', // Màu nền xám nhạt
        padding: 5,
        borderRadius: 20, // Bo tròn
    },
    // Separator
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginLeft: 20, // Không cho kẻ vạch chạm lề trái
    },
    // Footer
    footerButton: {
        backgroundColor: '#111',
        padding: 20,
        margin: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    footerButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    }
});