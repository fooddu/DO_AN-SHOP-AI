// app/(auth)/verify-otp.js

import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const COLORS = { primary: '#222', grey: '#888', lightGrey: '#ddd', text: '#222', bg: '#fff' };

export default function VerifyOtpScreen() {
    const [otp, setOtp] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false); // State cho nút gửi lại
    
    const router = useRouter();
    // Import cả hai hàm API cần thiết
    const { verifyOtp, forgotPassword } = useAuth(); 
    
    // Lấy email từ URL parameters (từ trang forgot-password)
    const { email } = useLocalSearchParams(); 

    const handleVerify = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Lỗi', 'Vui lòng nhập mã OTP 6 số.');
            return;
        }
        
        setIsSubmitting(true);
        // Gửi email và otp lên backend
        const result = await verifyOtp(email, otp); 
        setIsSubmitting(false);

        if (result.success) {
            // Điều hướng sang trang đặt mật khẩu mới và truyền email đi
            router.push({ 
                pathname: '/set-new-password', 
                params: { email: email } 
            });
            Alert.alert('Thành công', result.message || 'Xác thực thành công.');
        } else {
            // Xử lý lỗi (OTP không hợp lệ/hết hạn)
            Alert.alert('Thất bại', result.message || 'OTP không hợp lệ hoặc đã hết hạn.');
        }
    };
    
    const handleResend = async () => {
        setIsResending(true);
        // Gọi lại API forgot-password để tạo và gửi OTP mới
        const result = await forgotPassword(email);
        setIsResending(false);

        if (result.success) {
            Alert.alert('Gửi lại thành công', result.message || 'Mã OTP mới đã được gửi đến email của bạn.');
        } else {
            // Xử lý lỗi nếu việc gửi lại thất bại
            Alert.alert('Lỗi gửi lại', result.message || 'Không thể gửi lại OTP. Vui lòng kiểm tra email.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color={COLORS.text} />
                </TouchableOpacity>

                <Text style={styles.title}>Xác thực OTP</Text>
                <Text style={styles.subtitle}>Một mã 6 số đã được gửi đến email: **{email}**.</Text>
                
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Mã OTP</Text>
                        <TextInput
                            style={styles.input}
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
                            placeholder="Nhập 6 số"
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={handleVerify} 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Xác nhận</Text>
                        )}
                    </TouchableOpacity>
                    
                    {/* Nút Gửi lại OTP */}
                    <TouchableOpacity 
                        style={styles.buttonLink}
                        onPress={handleResend}
                        disabled={isResending}
                    >
                        {isResending ? (
                            <ActivityIndicator color={COLORS.primary} />
                        ) : (
                            <Text style={styles.buttonLinkText}>Gửi lại mã OTP</Text>
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
    backButton: { marginBottom: 20, width: 40 },
    title: { fontSize: 32, color: COLORS.text, fontWeight: 'bold', marginBottom: 15 },
    subtitle: { fontSize: 16, color: COLORS.grey, marginBottom: 40, lineHeight: 24 },
    form: { width: '100%' },
    inputContainer: { marginBottom: 25 },
    label: { color: COLORS.grey, fontSize: 16, marginBottom: 10 },
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
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    buttonLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    buttonLinkText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
});