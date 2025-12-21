// File: api/axiosConfig.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

// ----------------------------------------------------------------------
// ⚠️ CẤU HÌNH IP & PORT (QUAN TRỌNG NHẤT)
// ----------------------------------------------------------------------

// Tự động lấy địa chỉ IP của máy host (nơi chạy npm start/expo start)
// Giúp các thành viên trong nhóm không cần sửa IP thủ công
const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost || Constants.manifest?.debuggerHost;
const localhost = debuggerHost?.split(":")[0] || "localhost";

// Mặc định backend chạy port 5000. Các thành viên cần đảm bảo backend chạy đúng port này.
// Web Admin dùng port 4000, nhưng API Backend dùng port 5000
const API_URL = `http://${localhost}:5000/api`;

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