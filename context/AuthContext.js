// [File] context/AuthContext.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axiosConfig'; // Đảm bảo đường dẫn này đúng

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); 

    // 1. KIỂM TRA TOKEN KHI MỞ APP
    useEffect(() => {
        const loadStorageData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                const storedUser = await AsyncStorage.getItem('userData');
                
                if (storedToken && storedUser) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadStorageData();
    }, []);

    // 2. HÀM ĐĂNG NHẬP
    const login = async (email, password) => {
        try {
            const response = await api.post('/users/login', { email, password });
            const { data, token: newToken } = response.data; 
            setUser(data);
            setToken(newToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            await AsyncStorage.setItem('userData', JSON.stringify(data));
            await AsyncStorage.setItem('userToken', newToken);
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định";
            return { success: false, error: errorMessage };
        }
    };
    
    // 3. HÀM ĐĂNG KÝ
    const signUp = async (name, email, password) => {
        try {
            const response = await api.post('/users/register', { name, email, password });
            const { data, token: newToken } = response.data;
            setUser(data);
            setToken(newToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            await AsyncStorage.setItem('userData', JSON.stringify(data));
            await AsyncStorage.setItem('userToken', newToken);
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định";
            return { success: false, error: errorMessage };
        }
    };

    // 4. HÀM ĐĂNG XUẤT
    const logout = async () => {
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setToken(null);
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('userToken');
    };

    // ==============================================
    // ⬇️ 5. CÁC HÀM QUÊN MẬT KHẨU (MỚI) ⬇️
    // ==============================================
    
    // Bước 1: Gửi email chứa OTP
    const forgotPassword = async (email) => {
        try {
            await api.post('/users/forgot-password', { email });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định";
            return { success: false, error: errorMessage };
        }
    };

    // Bước 2: Xác thực OTP
    const verifyOtp = async (email, otp) => {
        try {
            await api.post('/users/verify-otp', { email, otp });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định";
            return { success: false, error: errorMessage };
        }
    };

    // Bước 3: Đặt mật khẩu mới
    const setNewPassword = async (email, newPassword) => {
         try {
            await api.post('/users/set-new-password', { email, newPassword });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định";
            return { success: false, error: errorMessage };
        }
    };


    const isLoggedIn = !!user;

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            login, 
            logout, 
            signUp, 
            forgotPassword, // ⬅️ Thêm hàm
            verifyOtp,      // ⬅️ Thêm hàm
            setNewPassword, // ⬅️ Thêm hàm
            loading, 
            isLoggedIn 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook để sử dụng context
export const useAuth = () => useContext(AuthContext);