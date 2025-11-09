// [File] app/tabs/favorites.js

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import { useFavorites } from '../../contexts/FavoritesContext';

// Bảng màu
const COLORS = {
    primary: '#E91E63',
    text: '#222',
    muted: '#888',
    bg: '#ffffff',
    surface: '#F6F6F6',
    lightGrey: '#E0E0E0', // Màu xám cho icon
};

// Component Card cho sản phẩm yêu thích (Render Item)
const FavoriteCard = ({ item }) => {
    const router = useRouter();
    const { toggleFavorite } = useFavorites();

    const goToDetail = () => {
        router.push(`/products/${item._id}`);
    };

    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={goToDetail}>
                <Image source={{ uri: item.image }} style={styles.image} />
            </TouchableOpacity>

            <View style={styles.infoContainer}>
                <TouchableOpacity onPress={goToDetail}>
                    <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                </TouchableOpacity>
                <Text style={styles.price}>$ {Number(item.price).toFixed(2)}</Text>
            </View>

            {/* NÚT BỎ THÍCH */}
            <TouchableOpacity 
                style={styles.heartBtn} 
                onPress={() => toggleFavorite(item)}
            >
                <Ionicons name="heart" size={24} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );
};


export default function FavoritesScreen() {
    const router = useRouter();
    const { favoriteProducts, loading, loadFavorites } = useFavorites();
    
    // Hàm điều hướng về trang chủ
    const goToHome = () => router.push('/');

    // Component Hiển thị khi danh sách rỗng (Đã căn giữa và giảm kích thước)
    const EmptyListPlaceholder = () => (
        <View style={styles.emptyContainer}>
            {/* ICON TRÁI TIM GẠCH CHÉO (LỚN) */}
            <Ionicons name="heart-dislike-outline" size={80} color={COLORS.lightGrey} style={styles.emptyIcon} /> 
            
            {/* GIẢM KÍCH THƯỚC CHỮ VÀ CĂN GIỮA */}
            <Text style={styles.emptyTitle}>Danh sách yêu thích của bạn đang trống.</Text>
            <Text style={styles.emptySubText}>Hãy khám phá và thêm sản phẩm!</Text>
            
            <TouchableOpacity onPress={goToHome} style={styles.exploreButton}>
                <Text style={styles.exploreButtonText}>Khám phá ngay</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && favoriteProducts.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                 <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Mục yêu thích</Text>
                </View>
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Mục yêu thích</Text>
            </View>
            
            <FlatList
                data={favoriteProducts} 
                renderItem={({ item }) => <FavoriteCard item={item} />}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer} 
                showsVerticalScrollIndicator={false}
                onRefresh={loadFavorites}
                refreshing={loading}
                // SỬ DỤNG COMPONENT MỚI
                ListEmptyComponent={EmptyListPlaceholder}
            />
        </SafeAreaView>
    );
}

// Styles
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    headerContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surface,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    listContainer: { 
        flexGrow: 1, // Quan trọng để ListEmptyComponent chiếm hết không gian và căn giữa
        paddingHorizontal: 16, 
        paddingTop: 10,
        paddingBottom: 20, 
    }, 
    // ⭐️ STYLE MỚI CHO EMPTY LIST ⭐️
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100, // Đẩy nội dung xuống một chút (thay cho paddingTop)
        paddingHorizontal: 30,
    },
    emptyIcon: {
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18, // Giảm kích thước
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14, // Giảm kích thước
        color: COLORS.muted,
        textAlign: 'center',
        marginBottom: 30,
    },
    exploreButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 25,
    },
    exploreButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // STYLE CHO CARD ITEMS (Giữ nguyên)
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    infoContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    price: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.primary,
    },
    heartBtn: {
        padding: 8,
        justifyContent: 'flex-start',
    },

  });