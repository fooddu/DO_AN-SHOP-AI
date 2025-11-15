import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true); 
    
    // 1. Tải dữ liệu đã lưu khi ứng dụng khởi động
    useEffect(() => {
        const loadStoredData = async () => {
            console.log('--- [AuthContext] ĐANG TẢI DỮ LIỆU ---');
            try {

                const storedToken = await AsyncStorage.getItem('userToken');
                const storedUser = await AsyncStorage.getItem('user');

                if (storedToken && storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    
                    setToken(storedToken);
                    setUser(parsedUser);
                    console.log(`Đối tượng User đã tải: ${parsedUser.name}`);
                } else {
                    console.log('Không tìm thấy User/Token đã lưu.');
                }
            } catch (e) {
                console.error("Lỗi khi tải dữ liệu từ AsyncStorage:", e);
            } finally {
                // Tắt loading để ứng dụng biết đã sẵn sàng
                setIsLoading(false);
                console.log(`Trạng thái Loading: false`);
            }
        };
        loadStoredData();
    }, []);

    // 2. Hàm Đăng nhập 
    const login = async (email, password) => {
        try {
            const response = await api.post('/users/login', { email, password });
            
            if (response.data.success) {
                const newToken = response.data.token;
                const userData = response.data.data;

                // LƯU VÀO ASYNC STORAGE TRƯỚC KHI CẬP NHẬT STATE
                await AsyncStorage.setItem('userToken', newToken);
                await AsyncStorage.setItem('user', JSON.stringify(userData));

                // Cập nhật State
                setToken(newToken);
                setUser(userData);
                
                return { success: true, user: userData };
            }
            return { success: false, message: response.data.message || 'Đăng nhập thất bại' };

        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            return { success: false, message: error.response?.data?.message || 'Lỗi server' };
        }
    };
    
    // 3. Hàm Đăng xuất
    const logout = async () => {

        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('user');
        setToken(null);
        setUser(null);
        router.replace('/(auth)/login');
    };

    // ⭐️ FIX: BƯỚC 1: THÊM HÀM UPDATEUSER ⭐️
    /**
     * Cập nhật thông tin User trong Context State và AsyncStorage.
     * @param {object} newUserData - Dữ liệu người dùng mới nhận từ API.
     */
    const updateUser = async (newUserData) => {
        if (!newUserData) return;

        try {
            // 1. Cập nhật state cục bộ
            setUser(newUserData); 
            
            // 2. Cập nhật AsyncStorage
            await AsyncStorage.setItem('user', JSON.stringify(newUserData));
            console.log("Context: User State và Storage đã được cập nhật.");
            
        } catch (error) {
            console.error("Lỗi khi cập nhật User trong Context:", error);
        }
    };

    return (
        // ⭐️ FIX: BƯỚC 2: TRUYỀN HÀM UPDATEUSER VÀO VALUE ⭐️
        <AuthContext.Provider value={{ 
            user, 
            token, 
            isLoading, 
            login, 
            logout,
            updateUser // <-- ĐÃ THÊM!
        }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);