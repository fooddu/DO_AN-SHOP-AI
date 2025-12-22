// File: app/(tabs)/favorites.js

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
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';

const COLORS = {
    primary: '#E91E63',
    text: '#222',
    muted: '#888',
    bg: '#ffffff',
    surface: '#F6F6F6',
    lightGrey: '#E0E0E0',
};

// Đảm bảo URL này khớp với cấu hình của bạn
const API_BASE_URL_FOR_IMAGES = client.defaults.baseURL.replace('/api', '');
const LOCALHOST_URL = 'http://localhost:4000';
const FALLBACK_IMAGE_URL = 'https://picsum.photos/200';

const FavoriteCard = ({ item }) => {
    const router = useRouter();
    const { toggleFavorite } = useFavorites(); // Dùng hook từ context đã sửa lỗi

    const goToDetail = () => {
        // Giả định màn hình chi tiết sản phẩm nằm ở /products/[id]
        router.push(`/(main)/products/${item._id}`); 
    };

    let displayImageUrl = '';
    if (Array.isArray(item.image) && item.image.length > 0) {
        displayImageUrl = item.image[0];
    } else if (typeof item.image === 'string') {
        displayImageUrl = item.image;
    }

    if (displayImageUrl && displayImageUrl.includes(LOCALHOST_URL)) {
        displayImageUrl = displayImageUrl.replace(LOCALHOST_URL, API_BASE_URL_FOR_IMAGES);
    }

    const imageSource = { uri: displayImageUrl || FALLBACK_IMAGE_URL };

    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={goToDetail} activeOpacity={0.8}>
                <Image source={imageSource} style={styles.image} />
            </TouchableOpacity>

            <View style={styles.infoContainer}>
                <TouchableOpacity onPress={goToDetail}>
                    <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                </TouchableOpacity>
                <Text style={styles.price}>$ {Number(item.price).toFixed(2)}</Text>
            </View>

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

export function FavoritesScreen() { 
    const router = useRouter();
    const { favoriteProducts, loading, loadFavorites } = useFavorites();
    const { user } = useAuth();

    // Sửa đường dẫn điều hướng (Unmatched Route Fix)
    const goToHome = () => router.push('/(tabs)'); 
    const goToCart = () => router.push('/(main)/cart'); 
    const goToSearch = () => router.push('/search'); // Giả định /search nằm ở root hoặc group khác

    const EmptyListPlaceholder = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="heart-dislike-outline" size={80} color={COLORS.lightGrey} style={styles.emptyIcon} />

            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubText}>Explore great products and add to favorites!</Text>

            <TouchableOpacity onPress={goToHome} style={styles.exploreButton} activeOpacity={0.8}>
                <Text style={styles.exploreButtonText}>Explore Now</Text>
            </TouchableOpacity>
        </View>
    );

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

    // ⭐️ LOGIC GUEST ACCESS ⭐️
    if (!user) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <HeaderWithIcons />
                <View style={styles.noAuthContainer}>
                    <Ionicons name="heart-outline" size={80} color={COLORS.muted} />
                    <Text style={styles.noAuthTitle}>Login to save your Favorites</Text>
                    <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/login')}>
                        <Text style={styles.loginButtonText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
    // ----------------------

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

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
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
    headerIcon: { padding: 8 },
    listContainer: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.bg,
        borderRadius: 15,
        padding: 12,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: COLORS.lightGrey,
        alignItems: 'center',
    },
    image: {
        width: 90,
        height: 90,
        borderRadius: 8,
        backgroundColor: COLORS.surface,
        marginRight: 15,
        resizeMode: 'cover',
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
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
        padding: 8,
        backgroundColor: 'transparent',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 30,
    },
    emptyIcon: { marginBottom: 20 },
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
    // Guest/No-Auth Styles
    noAuthContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    noAuthTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 15, marginBottom: 25 },
    loginButton: { backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 30 },
    loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default FavoritesScreen;