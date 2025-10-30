import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import FavoriteButton from '../../components/FavoriteButton'; // 1. IMPORT NÚT TIM
import api from '../../api/axiosConfig'; // 2. IMPORT API CONFIG

export default function ProductDetailScreen() {
    // Lấy 'id' của sản phẩm từ URL (ví dụ: /product/123)
    const { id } = useLocalSearchParams(); 
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Dùng useEffect để gọi API khi 'id' thay đổi
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                // Gọi API backend (GET /api/products/:id)
                const response = await api.get(`/products/${id}`);
                setProduct(response.data.data); // Lưu data sản phẩm vào state
            } catch (error) {
                console.error("Lỗi tải chi tiết sản phẩm:", error);
            } finally {
                setLoading(false); // Dừng loading
            }
        };
        
        // Chỉ gọi API nếu có 'id'
        if(id) {
            fetchProduct();
        }
    }, [id]); // Phụ thuộc vào 'id'

    // Hiển thị màn hình chờ khi đang load
    if (loading) {
        return <ActivityIndicator size="large" style={styles.center} />;
    }

    // Hiển thị lỗi nếu không tìm thấy sản phẩm
    if (!product) {
        return (
            <View style={styles.center}>
                <Text>Không tìm thấy sản phẩm</Text>
            </View>
        );
    }

    // Hiển thị chi tiết sản phẩm
    return (
        <View style={styles.container}>
            {/* 3. ĐẶT NÚT TIM Ở ĐÂY */}
            <View style={styles.heartButton}>
                <FavoriteButton productId={product._id} />
            </View>
            
            {/* Bạn có thể hiển thị hình ảnh sản phẩm */}
            {/* <Image source={{ uri: product.image }} style={styles.image} /> */}
            
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.price}>{product.price} VNĐ</Text>
            <Text style={styles.description}>{product.description}</Text>
        </View>
    );
}

// --- CSS/Styles ---
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 16 
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    heartButton: { 
        position: 'absolute', // Cho phép nút tim "nổi" lên
        top: 20,
        right: 20,
        zIndex: 1, // Đảm bảo nó nằm trên các nội dung khác
    },
    image: {
        width: '100%',
        height: 300,
        resizeMode: 'contain',
        marginBottom: 16,
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold',
        marginBottom: 8,
    },
    price: { 
        fontSize: 20, 
        color: 'green', 
        marginVertical: 10 
    },
    description: {
        fontSize: 16,
    }
});