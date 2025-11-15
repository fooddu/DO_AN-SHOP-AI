// contexts/FavoritesContext.js (Không cần sửa)

import { router } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [loading, setLoading] = useState(false); 
    // Lấy user, token, và logout từ AuthContext đã sửa
    const { user, logout, token } = useAuth(); 

    // Trigger loadFavorites khi user hoặc token thay đổi
    useEffect(() => {
        if (user && token) {
            loadFavorites(); 
        } else {
            setFavoriteProducts([]);
        }
    }, [user, token]); 

    const loadFavorites = async () => {
        console.log(`DEBUG FAV: [loadFavorites] Token state: ${token ? 'EXISTS' : 'MISSING'}. User: ${user ? user.name : 'N/A'}`);
        
        if (!user || !token) {
            setLoading(false);
            return; 
        }
        
        setLoading(true);
        try {
            // Gọi API. Interceptor sẽ lấy Token đã được lưu kịp thời.
            const response = await api.get('/users/favorites');
            if (response.data.success) {
                setFavoriteProducts(response.data.data); 
            }
        } catch (error) {
            console.error('Lỗi tải danh sách yêu thích:', error);
            
            if (error.response && error.response.status === 401) {
                console.log("DEBUG FAV: 401 detected in loadFavorites. Triggering logout.");
                await logout(); 
                router.replace('/(auth)/login'); 
            }
        } finally {
            setLoading(false);
        }
    };

    const isFavorited = (productId) => {
        return favoriteProducts.some(product => product._id === productId);
    };

    // Hàm toggleFavorite đã có logic xử lý 401 và rollback tốt.
    const toggleFavorite = async (product) => {
        // ... (Giữ nguyên các đoạn logic của bạn) ...
        
        if (!user || !token) {
            alert('Bạn cần đăng nhập để yêu thích sản phẩm');
            router.push('/(auth)/login'); 
            return;
        }
        
        // Cập nhật UI ngay lập tức (Optimistic Update)
        const currentState = isFavorited(product._id);
        let optimisticState;

        if (currentState) {
            optimisticState = favoriteProducts.filter(p => p._id !== product._id);
        } else {
            optimisticState = [product, ...favoriteProducts];
        }
        setFavoriteProducts(optimisticState); 

        // Gọi API trong nền
        try {
            await api.post('/users/favorite/toggle', { 
                productId: product._id 
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật yêu thích:', error);
            
            // BẮT LỖI 401
            if (error.response && error.response.status === 401) {
                console.log("DEBUG FAV: 401 detected in toggleFavorite. Triggering logout.");
                await logout();
                router.replace('/(auth)/login');
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                return;
            }
            
            // Lỗi khác: Khôi phục trạng thái UI (Rollback)
            alert('Đã xảy ra lỗi, đang khôi phục trạng thái...'); 
            setFavoriteProducts(currentState ? [product, ...favoriteProducts] : favoriteProducts.filter(p => p._id !== product._id));
        }
    };

    return (
        <FavoritesContext.Provider 
            value={{ 
                isFavorited, 
                toggleFavorite, 
                favoriteProducts,
                loading,
                loadFavorites
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);