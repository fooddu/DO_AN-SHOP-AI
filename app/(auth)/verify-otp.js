// [File] app/(auth)/verify-otp.js

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

export default function VerifyOtpScreen() {
    const [otp, setOtp] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const router = useRouter();
    const { verifyOtp } = useAuth();
    
    // 1. Lấy email được gửi từ trang 'forgot-password'
    const { email } = useLocalSearchParams(); 

    const handleVerify = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Lỗi', 'Vui lòng nhập mã OTP 6 số.');
            return;
        }
        
        setIsSubmitting(true);
        // 2. Gửi cả email và otp
        const result = await verifyOtp(email, otp); 
        setIsSubmitting(false);

        if (result.success) {
            Alert.alert(
                'Xác thực thành công', 
                'Bây giờ bạn có thể đặt mật khẩu mới.',
                [{ 
                    text: 'OK', 
                    // 3. Chuyển sang trang đặt mật khẩu mới
                    onPress: () => router.push({ 
                        pathname: '/set-new-password', 
                        params: { email: email } // Gửi email đi tiếp
                    })
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

                <Text style={styles.title}>Xác thực OTP</Text>
                <Text style={styles.subtitle}>Một mã 6 số đã được gửi đến email {email}.</Text>
                
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Mã OTP</Text>
                        <TextInput
                            style={styles.input}
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
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