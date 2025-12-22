// File: context/AuthContext.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true); 
    
    // Tải dữ liệu đã lưu khi ứng dụng khởi động
    useEffect(() => {
        const loadStoredData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                const storedUser = await AsyncStorage.getItem('user');

                if (storedToken && storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setToken(storedToken);
                    setUser(parsedUser);
                    api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                }
            } catch (e) {
                console.error("Lỗi khi tải dữ liệu từ AsyncStorage:", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadStoredData();
    }, []);

    // Hàm Đăng nhập
    const login = async (email, password) => {
        try {
            const response = await api.post('/users/login', { email, password });
            if (response.data.success) {
                const newToken = response.data.token;
                const userData = response.data.data;
                await AsyncStorage.setItem('userToken', newToken);
                await AsyncStorage.setItem('user', JSON.stringify(userData));
                api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                setToken(newToken);
                setUser(userData);
                return { success: true, user: userData };
            }
            return { success: false, message: response.data.message || 'Đăng nhập thất bại' };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Lỗi server' };
        }
    };
    
    // ⭐️ FIX: BỔ SUNG CÁC HÀM THIẾU ĐỂ TRÁNH LỖI TYPEERROR ⭐️
    const forgotPassword = async (email) => {
        try {
            // Giả định API /forgot-password tồn tại
            const response = await api.post('/users/forgot-password', { email });
            return { success: response.data.success, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to send OTP.' };
        }
    };

    const verifyOtp = async (email, otp) => {
        try {
            // Giả định API /verify-otp tồn tại
            const response = await api.post('/users/verify-otp', { email, otp });
            return { success: response.data.success, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Invalid OTP.' };
        }
    };

    const setNewPassword = async (email, password) => {
        try {
            // Giả định API /reset-password tồn tại
            const response = await api.post('/users/reset-password', { email, password });
            return { success: response.data.success, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to set new password.' };
        }
    };
    
    // Hàm Đăng xuất
    const logout = async () => {
        api.defaults.headers.common['Authorization'] = ''; 
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('user');
        setToken(null);
        setUser(null);
        router.replace('/(tabs)'); 
    };

    const updateUser = async (newUserData) => {
        if (!newUserData) return;
        try {
            setUser(newUserData); 
            await AsyncStorage.setItem('user', JSON.stringify(newUserData));
        } catch (error) {
            console.error("Lỗi khi cập nhật User trong Context:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            isLoading, 
            login, 
            logout,
            updateUser,
            forgotPassword,
            verifyOtp,
            setNewPassword,
        }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);