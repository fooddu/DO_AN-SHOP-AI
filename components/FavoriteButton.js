import React from 'react';
import { TouchableOpacity } from 'react-native';
// Chúng ta sẽ dùng icon trái tim của thư viện 'expo-vector-icons'
import { Ionicons } from '@expo/vector-icons';
// Import hook (móc) của FavoritesContext bạn vừa tạo
import { useFavorites } from '../contexts/FavoritesContext';

// Component này chỉ cần nhận vào 2 props:
// 1. productId: Để biết đang thao tác với sản phẩm nào
// 2. size: (Không bắt buộc) Kích cỡ icon
export default function FavoriteButton({ productId, size = 30 }) {
    // Lấy 2 hàm quan trọng từ context
    const { isFavorited, toggleFavorite } = useFavorites();
    
    // Kiểm tra xem sản phẩm này đã được yêu thích chưa
    const favorited = isFavorited(productId);

    // Khi người dùng nhấn nút, gọi hàm toggle
    const handlePress = () => {
        toggleFavorite(productId);
    };

    return (
        <TouchableOpacity onPress={handlePress}>
            <Ionicons 
                // Nếu đã 'favorited' -> hiện icon "heart" (đầy)
                // Nếu chưa -> hiện icon "heart-outline" (viền)
                name={favorited ? "heart" : "heart-outline"} 
                size={size} 
                // Nếu đã 'favorited' -> màu đỏ
                // Nếu chưa -> màu đen
                color={favorited ? "#FF0000" : "#000000"} 
            />
        </TouchableOpacity>
    );
}