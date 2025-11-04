// [File] app/(auth)/set-new-password.js

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView, StatusBar,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
    primary: '#222', 
    grey: '#888',
    lightGrey: '#ddd',
    text: '#222',
    bg: '#fff',
};

export default function SetNewPasswordScreen() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const router = useRouter();
    const { setNewPassword } = useAuth();
    
    // 1. Lấy email được gửi từ trang 'verify-otp'
    const { email } = useLocalSearchParams(); 

    const handleSetPassword = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mật khẩu.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
            return;
        }
        
        setIsSubmitting(true);
        // 2. Gửi email và mật khẩu MỚI
        const result = await setNewPassword(email, password); 
        setIsSubmitting(false);

        if (result.success) {
            Alert.alert(
                'Thành công', 
                'Mật khẩu của bạn đã được thay đổi. Vui lòng đăng nhập lại.',
                [{ 
                    text: 'OK', 
                    // 3. Quay về trang Login
                    onPress: () => router.replace('/login') 
                }] 
            );
        } else {
            Alert.alert('Thất bại', result.error);
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
                <Text style={styles.subtitle}>Vui lòng nhập mật khẩu mới cho tài khoản {email}.</Text>
                
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Mật khẩu mới</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
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
        paddingHorizontal: 30,
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
        fontFamily: 'serif', 
        marginBottom: 15,
        textAlign: 'left', 
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.grey,
        textAlign: 'left', 
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
        flex: 1,
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
