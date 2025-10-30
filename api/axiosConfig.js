import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- !!! QUAN TRỌNG !!! ---
// THAY IP NÀY BẰNG ĐỊA CHỈ IP CỦA MÁY TÍNH CHẠY BACKEND
// (Bạn tìm IP của mình bằng lệnh 'ipconfig' trong CMD)
// KHÔNG ĐƯỢC DÙNG 'localhost'
const API_URL = 'http://[2001:4860:7:412::3]:5000/api'; 

const api = axios.create({
  baseURL: API_URL,
});

// Đoạn này sẽ tự động lấy token từ bộ nhớ
// và đính kèm vào header "Authorization"
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;