import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Đổi IP khi chạy trên Simulator/Điện thoại thật
const API_URL = 'http://192.168.0.101:5000/api'; 

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