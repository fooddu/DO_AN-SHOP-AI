import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// Cấu hình API URL
const API_URL_WEB = 'http://localhost:4000/api';
const API_URL_NATIVE = 'http://192.168.1.2:5000/api';


const API_URL = Platform.OS === 'web' ? API_URL_WEB : API_URL_NATIVE;

// Log để debug
console.log('🔧 API Configuration:');
console.log('Platform:', Platform.OS);
console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, 
});

// Request interceptor: Tự động thêm token vào header (Logic này HOÀN TOÀN CHÍNH XÁC)
api.interceptors.request.use(
  async (config) => {
    // Lấy token từ bộ nhớ bất đồng bộ
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
    console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ API Error Response (GET /users/favorites) [Status:', error.response.status, ']: Object');
    } else if (error.request) {
      console.error('❌ API Network Error:', error.message);
    } else {
      console.error('❌ API Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;