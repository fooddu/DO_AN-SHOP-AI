// File: api/axiosConfig.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// ----------------------------------------------------------------------
// ⚠️ CẤU HÌNH IP & PORT (QUAN TRỌNG NHẤT)
// ----------------------------------------------------------------------

// 1. Cấu hình cho Web (Luôn là localhost)
const API_URL_WEB = 'http://localhost:4000/api';

// 2. Cấu hình cho Android/iOS (Máy thật hoặc Giả lập)
// ⚠️ LƯU Ý: Thay '192.168.1.2' bằng IPv4 của máy tính bạn.
// Cách xem IP: Mở CMD gõ 'ipconfig' (Win) hoặc Terminal gõ 'ifconfig' (Mac)
const API_URL_NATIVE = 'http://192.168.1.2:4000/api'; // <-- Đã sửa port thành 4000 cho khớp với Web


// Tự động chọn URL dựa trên nền tảng
const API_URL = Platform.OS === 'web' ? API_URL_WEB : API_URL_NATIVE;

console.log('🚀 API Configured:', API_URL);

// Tạo instance Axios
const client = axios.create({
    baseURL: API_URL,
    timeout: 10000, // Timeout sau 10 giây nếu mạng lag
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- INTERCEPTOR: Tự động gắn Token vào mỗi Request ---
client.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('userToken'); // Hoặc 'token' tùy cách bạn lưu
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            // Log để debug xem đang gọi API nào
            console.log(`📤 [${config.method?.toUpperCase()}] Sending to: ${config.url}`);
        } catch (error) {
            console.error('Lỗi lấy token:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- INTERCEPTOR: Xử lý Response & Lỗi ---
client.interceptors.response.use(
    (response) => {
        // Nếu API trả về thành công
        return response;
    },
    (error) => {
        // Log lỗi chi tiết để dễ debug
        if (error.response) {
            // Server trả về mã lỗi (4xx, 5xx)
            console.error(`❌ API Error [${error.response.status}]:`, error.response.data);
        } else if (error.request) {
            // Không nhận được phản hồi (Lỗi mạng/IP sai)
            console.error('❌ Network Error (Kiểm tra lại IP/Wifi):', error.message);
        } else {
            console.error('❌ Request Setup Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default client;