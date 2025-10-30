import { router } from 'expo-router'; // Dùng để điều hướng
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axiosConfig'; // Import file config axios
import { useAuth } from '../contexts/AuthContext'; // Import AuthContext (fixed import)

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    // Dùng "Set" để lưu trữ ID (giúp kiểm tra và xóa nhanh hơn mảng)
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const { user } = useAuth(); // Lấy thông tin user (đã đăng nhập hay chưa)

    // Tác dụng 1: Khi user thay đổi (đăng nhập/đăng xuất), cập nhật danh sách
    useEffect(() => {
        if (user && user.favorites) {
            // Nếu user đăng nhập và có mảng favorites, load nó vào Set
            setFavoriteIds(new Set(user.favorites));
        } else {
            // Nếu user đăng xuất, reset Set về rỗng
            setFavoriteIds(new Set()); 
        }
    }, [user]); // Chạy lại mỗi khi "user" thay đổi

    // Hàm (public) để component khác kiểm tra
    const isFavorited = (productId) => {
        return favoriteIds.has(productId);
    };

    // Hàm (public) chính để Bật/Tắt yêu thích
    const toggleFavorite = async (productId) => {
        // 1. Kiểm tra xem user đã đăng nhập chưa
        if (!user) {
            alert('Bạn cần đăng nhập để yêu thích sản phẩm');
            router.push('/(auth)/login'); // Điều hướng đến trang login
            return;
        }

        // 2. Cập nhật UI ngay lập tức (Optimistic Update)
        // Tạo một bản sao của Set
        const newFavoriteIds = new Set(favoriteIds);
        if (newFavoriteIds.has(productId)) {
            newFavoriteIds.delete(productId); // Xóa nếu đã có
        } else {
            newFavoriteIds.add(productId); // Thêm nếu chưa có
        }
        setFavoriteIds(newFavoriteIds); // Cập nhật state để UI thay đổi

        // 3. Gọi API trong nền
        try {
            // Gọi API backend (PUT /users/favorites/:productId)
            await api.put(`/users/favorites/${productId}`);
            // Thành công: Không cần làm gì, vì UI đã cập nhật rồi.
        } catch (error) {
            console.error('Lỗi khi cập nhật yêu thích:', error);
            // Lỗi API: Trả lại state cũ (Revert)
            setFavoriteIds(new Set(user.favorites)); // Quay về state gốc từ "user"
            alert('Đã xảy ra lỗi, vui lòng thử lại.');
        }
    };

    return (
        // Cung cấp các hàm này cho toàn bộ ứng dụng
        <FavoritesContext.Provider value={{ isFavorited, toggleFavorite, favoriteIds }}>
            {children}
        </FavoritesContext.Provider>
    );
};

// Hook (móc) để dễ dàng sử dụng context
export const useFavorites = () => useContext(FavoritesContext);