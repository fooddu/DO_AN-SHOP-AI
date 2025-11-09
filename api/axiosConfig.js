import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// Cấu hình API URL
// Khi chạy trên WEB, dùng 'localhost'
// Khi chạy trên MOBILE, dùng IP Wi-Fi của máy tính
// ⚠️ QUAN TRỌNG: Thay đổi IP này thành IP IPv4 của máy tính bạn
// Để tìm IP: Windows (ipconfig) hoặc Mac/Linux (ifconfig)
const API_URL_WEB = 'http://localhost:5000/api';
const API_URL_NATIVE = 'http://192.168.1.2:5000/api';

// Tự động chọn đúng URL dựa trên platform
const API_URL = Platform.OS === 'web' ? API_URL_WEB : API_URL_NATIVE;

// Log để debug
console.log('🔧 API Configuration:');
console.log('Platform:', Platform.OS);
console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 giây timeout
});

// Request interceptor: Tự động thêm token vào header
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log request để debug
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Xử lý lỗi và log
api.interceptors.response.use(
  (response) => {
    // Log response thành công
    console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    // Log lỗi chi tiết
    if (error.response) {
      // Server trả về response nhưng có lỗi
      console.error('❌ API Error Response:', {
        status: error.response.status,
        url: error.config?.url,
        message: error.response.data?.message || error.message,
      });
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error('❌ API Network Error:', {
        url: error.config?.url,
        message: 'No response from server. Check your IP address and server status.',
        hint: Platform.OS !== 'web' ? `Make sure your computer IP is correct: ${API_URL_NATIVE}` : '',
      });
    } else {
      // Lỗi khi setup request
      console.error('❌ API Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
