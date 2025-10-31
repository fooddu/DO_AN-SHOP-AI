import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axiosConfig'; // Import file bạn vừa tạo

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Khi app mở, kiểm tra xem có token/user đã lưu không
    useEffect(() => {
        const loadStorageData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                const storedUser = await AsyncStorage.getItem('userData');
                
                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false); // Dừng loading
            }
        };
        loadStorageData();
    }, []);

    // Hàm đăng nhập
    const login = async (email, password) => {
        try {
            // Gọi API /login
            const response = await api.post('/users/login', { email, password });
            const { data, token } = response.data; // Lấy data (user) và token từ response
            
            setUser(data);
            setToken(token);
            
            // Lưu token và user vào bộ nhớ
            await AsyncStorage.setItem('userData', JSON.stringify(data));
            await AsyncStorage.setItem('userToken', token);
            return true;
        } catch (error) {
            console.error("Lỗi đăng nhập:", error.response?.data?.message || error.message);
            return false;
        }
    };

    // Hàm đăng xuất
    const logout = async () => {
        setUser(null);
        setToken(null);
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('userToken');
    };

    const isLoggedIn = !!user;

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook (móc) để dễ dàng sử dụng context
export const useAuth = () => useContext(AuthContext);