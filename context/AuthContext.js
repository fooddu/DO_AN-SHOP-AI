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

    // Hàm Đăng ký 
    const signUp = async (name, email, password) => {
        try {
            const response = await api.post('/users/register', { name, email, password });

            if (response.data.success) {
                return { success: true, data: response.data.data };
            }

            return { success: false, error: response.data.message || 'Đăng ký thất bại' };

        } catch (error) {
            console.error('Registration failed:', error.response?.data?.message || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Lỗi server khi đăng ký'
            };
        }
    };

    // Hàm Quên mật khẩu
    const forgotPassword = async (email) => {
        try {
            // Gọi API gửi mã OTP/link reset đến email
            const response = await api.post('/users/forgot-password', { email });

            return {
                success: true,
                message: response.data.message || 'Mã OTP đã được gửi đến email của bạn.'
            };
        } catch (error) {
            console.error('Forgot password failed:', error.response?.data?.message || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Không tìm thấy người dùng hoặc lỗi server.'
            };
        }
    };

    // ⭐️ THÊM: Hàm Xác thực OTP (verifyOtp) ⭐️
    const verifyOtp = async (email, otp) => {
        try {
            // Gọi API để xác thực OTP
            const response = await api.post('/users/verify-otp', { email, otp });

            return {
                success: true,
                message: response.data.message || 'Xác thực OTP thành công.'
            };
        } catch (error) {
            console.error('Verify OTP failed:', error.response?.data?.message || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Mã OTP không hợp lệ hoặc lỗi server.'
            };
        }
    };

    // Hàm Đặt lại mật khẩu
    const setNewPassword = async (email, newPassword) => {
        try {
            // Gọi API để đặt mật khẩu mới
            const response = await api.post('/users/set-new-password', { email, newPassword });

            return {
                success: true,
                message: response.data.message || 'Mật khẩu đã được đặt lại thành công.'
            };
        } catch (error) {
            console.error('Reset password failed:', error.response?.data?.message || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Phiên đặt lại mật khẩu không hợp lệ.'
            };
        }
    };

    // 3. Hàm Đăng xuất
    const logout = async () => {

        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('cart'); // 🧹 Clear cart on logout
        setToken(null);
        setUser(null);
        router.replace('/(auth)/login');
    };

    // Hàm Cập nhật User
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
        <AuthContext.Provider value={{
            user,
            token,
            isLoading,
            login,
            logout,
            updateUser,
            signUp,
            forgotPassword,
            verifyOtp, // ⬅️ ĐÃ THÊM HÀM THIẾU VÀO CONTEXT VALUE
            setNewPassword,
        }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);