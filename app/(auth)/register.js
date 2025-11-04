// [File] app/(auth)/register.js

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
// Đảm bảo đường dẫn này đúng
import { useAuth } from '../../context/AuthContext';

const COLORS = {
    primary: '#222', 
    grey: '#888',
    lightGrey: '#ddd',
    text: '#222',
    bg: '#fff', // Màu nền của Thẻ (Card)
    surface: '#F6F6F6', // Màu nền xám của màn hình
};

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const router = useRouter();
    const { signUp } = useAuth(); 

    const handleRegister = async () => {
        // ... (Logic handleRegister giữ nguyên)
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
            return;
        }
        setIsSubmitting(true);
        const result = await signUp(name, email, password); 
        setIsSubmitting(false);
        if (result.success) {
            router.replace('/tabs'); 
        } else {
            Alert.alert('Đăng ký thất bại', result.error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            
            <ScrollView 
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                
                {/* 1. KHU VỰC LOGO (CĂN GIỮA - CÓ LỀ NGANG 30) */}
                <View style={styles.logoArea}>
                    <View style={styles.line} />
                    <Image 
                        source={require('../../assets/logo.png')} 
                        style={styles.logo} 
                        resizeMode="contain" 
                    />
                    <View style={styles.line} />
                </View>
                
                {/* 2. CHỮ WELCOME (CĂN TRÁI - CÓ LỀ NGANG 30) */}
                <Text style={styles.titleWelcomeOutside}>WELCOME</Text>

                {/* 3. THẺ (CARD) TRẮNG (SÁT LỀ TRÁI = 0) */}
                <View style={styles.card}>
                    
                    <View style={styles.form}>
                        {/* (Các input fields) */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>
                        
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

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.passwordWrapper}>
                                <TextInput
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color={COLORS.grey} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <View style={[styles.inputContainer, { marginBottom: 0 }]}> 
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.passwordWrapper}>
                                <TextInput
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={22} color={COLORS.grey} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    
                    {/* Nút SIGN UP (bên trong thẻ) */}
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={handleRegister} 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>SIGN UP</Text>
                        )}
                    </TouchableOpacity>

                    {/* Link SIGN IN (bên trong thẻ) */}
                    <TouchableOpacity onPress={() => router.push('/login')}>
                        <Text style={styles.signInText}>
                            Already have account? <Text style={styles.signInLink}>SIGN IN</Text>
                        </Text>
                    </TouchableOpacity>
                    
                </View> 
                {/* (Kết thúc thẻ) */}
                
            </ScrollView>
        </SafeAreaView>
    );
}

// Styles (Đã sửa lại container)
const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        backgroundColor: COLORS.surface, // Nền xám
    },
    // Container chính (không có lề ngang)
    container: {
        paddingVertical: 40,
        backgroundColor: COLORS.surface,
    },
    
    // 1. STYLE CHO KHU VỰC LOGO (CĂN GIỮA, CÓ LỀ)
    logoArea: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        paddingHorizontal: 30, // ⬅️ LỀ CỦA GẠCH NGANG
    },
    line: {
        flex: 1, 
        height: 1,
        backgroundColor: COLORS.lightGrey,
    },
    logo: {
        width: 70,
        height: 70,
        marginHorizontal: 15,
    },
    
    // 2. STYLE CHO CHỮ WELCOME (CĂN TRÁI, CÓ LỀ)
    titleWelcomeOutside: {
        fontSize: 32,
        color: COLORS.text,
        fontWeight: 'bold',
        fontFamily: 'serif',
        marginBottom: 20, 
        textAlign: 'left',
        paddingHorizontal: 30, // ⬅️ LỀ CỦA CHỮ
    },
    
    // 3. STYLE CHO THẺ (SÁT LỀ TRÁI = 0)
    card: {
        backgroundColor: COLORS.bg, // Nền trắng
        // (Xóa borderRadius và shadow)
        paddingHorizontal: 30, // ⬅️ Lề BÊN TRONG thẻ
        paddingTop: 25,     
        paddingBottom: 25,
        width: '100%',
    },
    
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 18, 
    },
    label: {
        color: COLORS.grey,
        fontSize: 16,
        marginBottom: 5, 
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGrey,
        paddingVertical: 6, 
        fontSize: 16,
        color: COLORS.text,
        flex: 1,
    },
    passwordWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGrey,
    },
    
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16, 
        // (Xóa borderRadius)
        alignItems: 'center',
        marginTop: 25, 
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    signInText: {
        textAlign: 'center',
        color: COLORS.grey,
        fontSize: 14,
        marginTop: 20, 
    },
    signInLink: {
        color: COLORS.text,
        fontWeight: 'bold',
    },

  });