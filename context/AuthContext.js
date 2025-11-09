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
                // Đọc đúng key: userToken và userData
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

    // 2. HÀM ĐĂNG NHẬP (Lưu vào userData và userToken)
    const login = async (email, password) => {
        try {
            const response = await api.post('/users/login', { email, password });
            const { data, token: newToken } = response.data; 
            setUser(data);
            setToken(newToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            
            // ⭐️ LƯU TRỮ CHUẨN HÓA
            await AsyncStorage.setItem('userData', JSON.stringify(data));
            await AsyncStorage.setItem('userToken', newToken);
            
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định";
            return { success: false, error: errorMessage };
        }
    };
    
    // 3. HÀM ĐĂNG KÝ (Lưu vào userData và userToken)
    const signUp = async (name, email, password) => {
        try {
            const response = await api.post('/users/register', { name, email, password });
            const { data, token: newToken } = response.data;
            setUser(data);
            setToken(newToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            
            // ⭐️ LƯU TRỮ CHUẨN HÓA
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
        // Không cần xóa 'authData' vì không dùng nữa
    };

    // ⭐️ 5. HÀM CẬP NHẬT THÔNG TIN USER (Đã Sửa Logic Lưu trữ)
    const updateUser = async (newUserData) => {
        // 1. Cập nhật state (React)
        setUser(newUserData); 
        
        // ⭐️ LOG DEBUG: Kiểm tra dữ liệu được truyền vào Context
        console.log("DEBUG CONTEXT: Dữ liệu User MỚI được truyền vào Context:", newUserData);

        // 2. Cập nhật Local Storage (AsyncStorage)
        // Chúng ta chỉ cần lưu user object mới vào key 'userData'
        try {
             await AsyncStorage.setItem('userData', JSON.stringify(newUserData));
             console.log("DEBUG CONTEXT: Đã lưu thông tin user mới vào AsyncStorage thành công.");
        } catch (e) {
            console.error("Lỗi khi lưu userData mới:", e);
        }
       
    };
    
    // 6. CÁC HÀM QUÊN MẬT KHẨU (Giữ nguyên)
    const forgotPassword = async (email) => {
        try {
            const response = await api.post('/users/forgot-password', { email });
            return { 
                success: true, 
                message: response.data?.message || 'OTP code has been sent to your email.' 
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "An error occurred";
            return { success: false, message: errorMessage, error: errorMessage };
        }
    };

    const verifyOtp = async (email, otp) => {
        try {
            const response = await api.post('/users/verify-otp', { email, otp });
            return { 
                success: true, 
                message: response.data?.message || 'Verification successful.' 
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "An error occurred";
            return { success: false, message: errorMessage, error: errorMessage };
        }
    };

    const setNewPassword = async (email, newPassword) => {
        try {
            const response = await api.post('/users/set-new-password', { email, newPassword });
            return { 
                success: true, 
                message: response.data?.message || 'Your password has been changed. Please log in again.' 
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "An error occurred";
            return { success: false, message: errorMessage, error: errorMessage };
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
            forgotPassword, 
            verifyOtp, 
            setNewPassword,
            updateUser, // ⭐️ ĐÃ THÊM update USER VÀO CONTEXT
            loading, 
            isLoggedIn 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook để sử dụng context
export const useAuth = () => useContext(AuthContext);