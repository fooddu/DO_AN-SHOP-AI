// app/(auth)/set-new-password.js

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react'; // Đã thêm React vào import
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
const MIN_PASSWORD_LENGTH = 6; 

export default function SetNewPasswordScreen() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const router = useRouter();
    const { setNewPassword } = useAuth();
    
    const { email } = useLocalSearchParams(); 
    
    // ⭐️ DEBUG 1: Kiểm tra email nhận được ngay khi load màn hình
    console.log("DEBUG FRONTEND: Email received in SetNewPasswordScreen:", email); 

    const handleSetPassword = async () => {
        // 1. Kiểm tra dữ liệu email (Frontend)
        if (!email) {
            console.error("DEBUG FRONTEND: Lỗi! Không tìm thấy email trong params.");
            Alert.alert('Lỗi Dữ liệu', 'Không nhận được địa chỉ email. Vui lòng bắt đầu lại quy trình.');
            router.replace('/forgot-password');
            return;
        }

        // 2. Kiểm tra validate mật khẩu
        if (!password || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mật khẩu.');
            return;
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
            console.warn(`DEBUG FRONTEND: Mật khẩu quá ngắn (${password.length}).`);
            Alert.alert('Lỗi', `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`);
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
            return;
        }
        
        setIsSubmitting(true);
        
        const payload = { email: email, newPassword: password };
        // ⭐️ DEBUG 2: Kiểm tra Payload gửi đi
        console.log("DEBUG FRONTEND: Sending Payload:", payload);
        
        // 3. Gọi API
        const result = await setNewPassword(email, password); 
        
        setIsSubmitting(false);
        // ⭐️ DEBUG 3: Ghi log chi tiết phản hồi từ Backend
        console.log("DEBUG FRONTEND: API Response received:", result);

        if (result.success) {
            Alert.alert(
                'Thành công', 
                result.message || 'Mật khẩu của bạn đã được thay đổi. Vui lòng đăng nhập lại.',
                [{ 
                    text: 'OK', 
                    onPress: () => router.replace('/login') 
                }] 
            );
        } else {
            // Lỗi 400 từ Backend sẽ rơi vào đây
            console.error("DEBUG FRONTEND: API Error Message:", result.message);
            Alert.alert('Thất bại', result.message || 'Đặt mật khẩu thất bại. Vui lòng thử lại.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color={COLORS.text} />
                </TouchableOpacity>

                <Text style={styles.title}>Đặt Mật Khẩu Mới</Text>
                <Text style={styles.subtitle}>Nhập mật khẩu mới cho tài khoản: <Text style={{fontWeight: 'bold'}}>{email}</Text>.</Text>
                
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Mật khẩu mới</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholder={`Ít nhất ${MIN_PASSWORD_LENGTH} ký tự`}
                            maxLength={50}
                        />
                    </View>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            placeholder="Nhập lại mật khẩu"
                            maxLength={50}
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={handleSetPassword} 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Lưu Mật Khẩu</Text>
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

}
);