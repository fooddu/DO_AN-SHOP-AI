// [File] app/(auth)/forgot-password.js

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const router = useRouter();
    const { forgotPassword } = useAuth(); 

    const handleSend = async () => {
        if (!email) {
            Alert.alert('Lỗi', 'Vui lòng nhập email của bạn.');
            return;
        }
        
        setIsSubmitting(true);
        const result = await forgotPassword(email); 
        setIsSubmitting(false);

        if (result.success) {
            Alert.alert(
                'Đã gửi OTP', 
                'Một mã OTP 6 số đã được gửi đến email của bạn.',
                [{ 
                    text: 'OK', 
                    // Chuyển sang trang Verify OTP và mang theo email
                    onPress: () => router.push({ 
                        pathname: '/verify-otp', 
                        params: { email: email } 
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