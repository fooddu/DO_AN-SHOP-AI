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
import client from '../../api/axiosConfig';
import { useFavorites } from '../../contexts/FavoritesContext';

// 🎨 COLORS: Định nghĩa bảng màu rõ ràng
const COLORS = {
    primary: '#E91E63', // Hồng nổi bật
    text: '#222', // Màu chữ đậm
    muted: '#888', // Màu chữ phụ
    bg: '#ffffff', // Nền chính (Trắng)
    surface: '#F6F6F6', // Nền phụ (Light Gray)
    lightGrey: '#E0E0E0', // Màu viền/placeholder
};

// ⭐️ IMAGE FIX: Lấy BASE URL từ client đã cấu hình ⭐️
const API_BASE_URL_FOR_IMAGES = client.defaults.baseURL.replace('/api', '');
const LOCALHOST_URL = 'http://localhost:4000';
const FALLBACK_IMAGE_URL = 'https://picsum.photos/200';

// Component Card cho sản phẩm yêu thích (Render Item)
const FavoriteCard = ({ item }) => {
    const router = useRouter();
    const { toggleFavorite } = useFavorites();

    const goToDetail = () => {
        router.push(`/products/${item._id}`);
    };

    // Xử lý URL ảnh (Đảm bảo lấy ảnh đầu tiên và thay thế localhost)
    let displayImageUrl = '';

    if (Array.isArray(item.image) && item.image.length > 0) {
        displayImageUrl = item.image[0];
    } else if (typeof item.image === 'string') {
        displayImageUrl = item.image;
    }

    if (displayImageUrl && displayImageUrl.includes(LOCALHOST_URL)) {
        displayImageUrl = displayImageUrl.replace(LOCALHOST_URL, API_BASE_URL_FOR_IMAGES);
    }

    const imageSource = {
        uri: displayImageUrl || FALLBACK_IMAGE_URL
    };


    return (
        <View style={styles.card}>
            {/* Ảnh sản phẩm */}
            <TouchableOpacity onPress={goToDetail} activeOpacity={0.8}>
                <Image
                    source={imageSource}
                    style={styles.image}
                />
            </TouchableOpacity>

            {/* Thông tin sản phẩm */}
            <View style={styles.infoContainer}>
                <TouchableOpacity onPress={goToDetail}>
                    <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                </TouchableOpacity>
                <Text style={styles.price}>$ {Number(item.price).toFixed(2)}</Text>
            </View>

            {/* NÚT BỎ THÍCH - Đặt trong luồng flex để căn giữa dọc */}
            <TouchableOpacity
                style={styles.heartBtn}
                onPress={() => toggleFavorite(item)}
                activeOpacity={0.7}
            >
                <Ionicons name="heart" size={24} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );
};


// Component Chính
export default function FavoritesScreen() {
    const router = useRouter();
    const { favoriteProducts, loading, loadFavorites } = useFavorites();

    const goToHome = () => router.push('/tabs');
    const goToCart = () => router.push('/cart');
    const goToSearch = () => router.push('/search');

    const EmptyListPlaceholder = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="heart-dislike-outline" size={80} color={COLORS.lightGrey} style={styles.emptyIcon} />

            <Text style={styles.emptyTitle}>Favorites List Empty</Text>
            <Text style={styles.emptySubText}>Explore great products and add them to favorites!</Text>

            <TouchableOpacity onPress={goToHome} style={styles.exploreButton} activeOpacity={0.8}>
                <Text style={styles.exploreButtonText}>Explore Now</Text>
            </TouchableOpacity>
        </View>
    );

    // Component Header với Icons (Search - Favorites - Cart)
    const HeaderWithIcons = () => (
        <View style={styles.newHeaderContainer}>
            <TouchableOpacity onPress={goToSearch} style={styles.headerIcon}>
                <Ionicons name="search-outline" size={26} color={COLORS.text} />
            </TouchableOpacity>

            <Text style={styles.newHeaderTitle}>Favorites</Text>

            <TouchableOpacity onPress={goToCart} style={styles.headerIcon}>
                <Ionicons name="cart-outline" size={26} color={COLORS.text} />
            </TouchableOpacity>
        </View>
    );

    if (loading && favoriteProducts.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <HeaderWithIcons />
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <HeaderWithIcons />

            <FlatList
                data={favoriteProducts}
                renderItem={({ item }) => <FavoriteCard item={item} />}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                onRefresh={loadFavorites}
                refreshing={loading}
                ListEmptyComponent={EmptyListPlaceholder}
            />
        </SafeAreaView>
    );
}

// 💅 STYLES ĐÃ ĐƯỢC CẬP NHẬT VÀ TỐI ƯU HÓA 💅
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },

    // Header
    newHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.bg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGrey,
    },
    newHeaderTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: COLORS.text,
        textAlign: 'center',
        flex: 1,
    },
    headerIcon: {
        padding: 8,
    },

    // List Container
    listContainer: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 20,
    },

    // Card (Sản phẩm) - Đã làm nhỏ chiều cao và căn giữa nút tim
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.bg,
        borderRadius: 15,
        padding: 12, // Giảm padding
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: COLORS.lightGrey,
        alignItems: 'center', // Căn giữa các thành phần con theo chiều dọc
    },
    image: {
        width: 90, // Giảm kích thước ảnh
        height: 90, // Giảm kích thước ảnh
        borderRadius: 8,
        backgroundColor: COLORS.surface,
        marginRight: 15,
        resizeMode: 'cover',
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center', // Căn giữa nội dung info container theo chiều dọc
        paddingVertical: 0,
    },
    name: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.text,
        marginBottom: 4,
        lineHeight: 20,
    },
    price: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.primary,
        marginTop: 0,
    },
    heartBtn: {
        // Không dùng position: 'absolute' nữa để nó nằm trong luồng flex và được căn giữa bởi card.
        padding: 8,
        backgroundColor: 'transparent',
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 30,
    },
    emptyIcon: {
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 15,
        color: COLORS.muted,
        textAlign: 'center',
        marginBottom: 30,
    },
    exploreButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 30,
        paddingVertical: 14,
        borderRadius: 30,
    },
    exploreButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
