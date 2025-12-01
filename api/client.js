// // đây là client.js
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import { Platform } from 'react-native'; // 1. Import Platform

// // 2. Sửa lại IP
// // Khi chạy trên WEB, dùng 'localhost'. 
// // Khi chạy trên ĐIỆN THOẠI THẬT, dùng IP Wi-Fi
// const API_URL_WEB = 'http://localhost:4000/api';
// const API_URL_NATIVE = 'http://192.168.1.2:5000/api';

// // 3. Tự động chọn đúng IP
// const API_URL = Platform.OS === 'web' ? API_URL_WEB : API_URL_NATIVE;

// const api = axios.create({
//   baseURL: API_URL,
// });

// // Đoạn này sẽ tự động lấy token từ bộ nhớ
// // và đính kèm vào header "Authorization"
// api.interceptors.request.use(
//   async (config) => {
//     const token = await AsyncStorage.getItem('userToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default api;
