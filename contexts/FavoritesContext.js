// [File] context/FavoritesContext.js

import { router } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axiosConfig'; // Import file config axios
import { useAuth } from './AuthContext'; // Import AuthContext

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    // SỬA 1: Lưu mảng các object sản phẩm, không chỉ lưu ID
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [loading, setLoading] = useState(false); // Thêm state loading
    const { user } = useAuth(); // Lấy thông tin user

    // Tác dụng 1: Khi user thay đổi (đăng nhập/đăng xuất)
    useEffect(() => {
        if (user) {
            // Nếu user đăng nhập, gọi API để lấy danh sách SP yêu thích đầy đủ
            loadFavorites(); 
        } else {
            // Nếu user đăng xuất, reset mảng
            setFavoriteProducts([]);
        }
    }, [user]); // Chạy lại mỗi khi "user" thay đổi

    // Hàm load danh sách sản phẩm yêu thích TỪ API
    const loadFavorites = async () => {
        setLoading(true);
        try {
            // SỬA 2: Gọi API 'GET /users/favorites' chúng ta đã tạo
            const response = await api.get('/users/favorites');
            if (response.data.success) {
                setFavoriteProducts(response.data.data); // Lưu mảng sản phẩm
            }
        } catch (error) {
            console.error('Lỗi tải danh sách yêu thích:', error);
            // Nếu lỗi (ví dụ token hết hạn), đăng xuất user
            // (Bạn có thể gọi hàm logout từ AuthContext ở đây nếu muốn)
        } finally {
            setLoading(false);
        }
    };

    // Hàm (public) để component khác kiểm tra
    const isFavorited = (productId) => {
        // SỬA 3: Kiểm tra trong mảng object
        return favoriteProducts.some(product => product._id === productId);
    };

    // Hàm (public) chính để Bật/Tắt yêu thích
    // SỬA 4: Cần nhận vào 'product' (full object), không chỉ 'productId'
    const toggleFavorite = async (product) => {
        if (!product || !product._id) return;
        
        // 1. Kiểm tra đăng nhập
        if (!user) {
            alert('Bạn cần đăng nhập để yêu thích sản phẩm');
            router.push('/(auth)/login'); // Chuyển đến trang login
            return;
        }

        // 2. Cập nhật UI ngay lập tức (Optimistic Update)
        const currentState = isFavorited(product._id);
        let optimisticState;

        if (currentState) {
            // Đã thích -> Xóa đi
            optimisticState = favoriteProducts.filter(p => p._id !== product._id);
        } else {
            // Chưa thích -> Thêm vào (Thêm data của sản phẩm đang thao tác)
            optimisticState = [product, ...favoriteProducts];
        }
        setFavoriteProducts(optimisticState); // Cập nhật UI

        // 3. Gọi API trong nền
        try {
            // SỬA 5: Gọi đúng API backend 'POST'
            await api.post('/users/favorite/toggle', { 
                productId: product._id 
            });
            // Thành công: Không cần làm gì, UI đã cập nhật.
            
            // (Nâng cao): Cập nhật lại AuthContext nếu cần
            // updateUserFavorites(optimisticState.map(p => p._id)); 

        } catch (error) {
            console.error('Lỗi khi cập nhật yêu thích:', error);
            // Lỗi API: Quay về trạng thái cũ bằng cách load lại từ server
            alert('Đã xảy ra lỗi, đang đồng bộ lại...');
            await loadFavorites(); // Tải lại dữ liệu chính xác từ server
        }
    };

    return (
        // Cung cấp các giá trị mới
        <FavoritesContext.Provider 
            value={{ 
                isFavorited, 
                toggleFavorite, 
                favoriteProducts, // <-- Cung cấp mảng sản phẩm
                loading,        // <-- Cung cấp trạng thái loading
                loadFavorites   // <-- Cung cấp hàm load (để pull-to-refresh)
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
};

// Hook (móc) để dễ dàng sử dụng context
export const useFavorites = () => useContext(FavoritesContext);