// File: contexts/FavoritesContext.js

import { router } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

// SỬA: createContext(null) để giá trị mặc định có thể kiểm tra được
const FavoritesContext = createContext(null); 

export const FavoritesProvider = ({ children }) => {
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [loading, setLoading] = useState(false); 
    const { user, logout, token } = useAuth();

    useEffect(() => {
        if (user && token) {
            loadFavorites(); 
        } else {
            setFavoriteProducts([]); 
        }
    }, [user, token]); 

    const loadFavorites = async () => {
        if (!user || !token) {
            setLoading(false);
            return; 
        }
        
        setLoading(true);
        try {
            const response = await api.get('/users/favorites');
            if (response.data.success) {
                setFavoriteProducts(response.data.data); 
            }
        } catch (error) {
            console.error('Lỗi tải danh sách yêu thích:', error);
            if (error.response && error.response.status === 401) {
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

    const toggleFavorite = async (product) => {
        if (!user || !token) {
            alert('Bạn cần đăng nhập để yêu thích sản phẩm');
            router.push('/(auth)/login'); 
            return;
        }
        
        const currentState = isFavorited(product._id);
        let optimisticState;

        if (currentState) {
            optimisticState = favoriteProducts.filter(p => p._id !== product._id);
        } else {
            optimisticState = [product, ...favoriteProducts];
        }
        setFavoriteProducts(optimisticState); 

        try {
            await api.post('/users/favorite/toggle', { 
                productId: product._id 
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật yêu thích:', error);
            if (error.response && error.response.status === 401) {
                await logout();
                router.replace('/(auth)/login');
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                return;
            }
            
            // Rollback
            alert('Đã xảy ra lỗi, đang khôi phục trạng thái...'); 
            loadFavorites(); 
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

// SỬA: Thêm kiểm tra an toàn để ngăn lỗi TypeError
export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === null) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};