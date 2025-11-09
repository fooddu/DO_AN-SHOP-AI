// app/(auth)/forgot-password.js

import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    SafeAreaView, StatusBar,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { Ionicons } from 'react-native-vector-icons';
import { useAuth } from '../../context/AuthContext'; // Thay đổi đường dẫn nếu cần

const { width } = Dimensions.get('window');

// Đã loại bỏ định nghĩa COLORS ra khỏi Component để tái sử dụng
const COLORS = {
    primary: '#222', 
    grey: '#888',
    lightGrey: '#ddd',
    text: '#222',
    bg: '#fff',
};

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const router = useRouter();
    const { forgotPassword } = useAuth(); // Hàm gọi API

    const handleSend = async () => {
        if (!email.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập email hợp lệ.');
            return;
        }
        
        setIsSubmitting(true);
        // Backend trả về: { success: true, message: '...' }
        const result = await forgotPassword(email); 
        setIsSubmitting(false);

        if (result.success) {
            // Điều hướng sang trang Verify OTP và truyền email đi
            router.push({ 
                pathname: '/verify-otp', 
                params: { email: email.trim() } // Truyền email đã xử lý
            });
            // Hiển thị thông báo thành công (dùng message từ Backend)
            Alert.alert('Thành công', result.message || 'Mã OTP đã được gửi đến email của bạn.');
        } else {
            // Xử lý lỗi (ví dụ: Email không tồn tại, lỗi SendGrid,...)
            Alert.alert('Thất bại', result.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color={COLORS.text} />
                </TouchableOpacity>

                <Text style={styles.title}>Quên Mật Khẩu?</Text>
                <Text style={styles.subtitle}>Nhập email của bạn và chúng tôi sẽ gửi cho bạn một mã OTP để xác thực.</Text>
                
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="example@email.com"
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={handleSend} 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Gửi Mã OTP</Text>
                        )}
                    </TouchableOpacity>
                </View>
                
            </View>
        </SafeAreaView>
    );
}

// Styles
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    container: {
        flex: 1,
        paddingHorizontal: width * 0.07,
        paddingTop: 40,
        backgroundColor: COLORS.bg,
    },
    backButton: {
        marginBottom: 20, 
        width: 40, 
    },
    title: {
        fontSize: 32,
        color: COLORS.text,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.grey,
        marginBottom: 40,
        lineHeight: 24,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 25,
    },
    label: {
        color: COLORS.grey,
        fontSize: 16,
        marginBottom: 10,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGrey,
        paddingVertical: 10,
        fontSize: 16,
        color: COLORS.text,
    },
    button: {
        backgroundColor: COLORS.primary, 
        paddingVertical: 18,
        borderRadius: 8, 
        alignItems: 'center',
        marginTop: 30,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});