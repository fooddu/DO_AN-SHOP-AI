// [File] app/(auth)/login.js

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView, StatusBar,
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
    bg: '#fff',
};

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const router = useRouter();
    const { login } = useAuth(); 

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu.');
            return;
        }
        
        setIsSubmitting(true);
        const result = await login(email, password);
        setIsSubmitting(false);

        if (result.success) {
            router.replace('/tabs'); 
        } else {
            Alert.alert('Đăng nhập thất bại', result.error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                
                {/* Khu vực Logo */}
                <View style={styles.logoArea}>
                    <View style={styles.line} />
                    <Image 
                        source={require('../../assets/logo.png')} 
                        style={styles.logo} 
                        resizeMode="contain" 
                    />
                    <View style={styles.line} />
                </View>
                
                {/* Tiêu đề */}
                <Text style={styles.titleHello}>Hello!</Text>
                <Text style={styles.titleWelcome}>WELCOME BACK</Text>
                
                {/* Form */}
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

                    {/* ⬇️ ĐÃ CẬP NHẬT ONPRESS CHO NÚT NÀY ⬇️ */}
                    <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                        <Text style={styles.forgotPasswordText}>Forgot Password</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={handleLogin} 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Log in</Text>
                        )}
                    </TouchableOpacity>
                </View>
                
                {/* Nút Sign Up */}
                <TouchableOpacity onPress={() => router.push('/register')}>
                    <Text style={styles.signUpText}>SIGN UP</Text>
                </TouchableOpacity>
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
    logoArea: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
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
    titleHello: {
        fontSize: 32,
        color: COLORS.grey,
        fontWeight: '300',
        fontFamily: 'serif', 
    },
    titleWelcome: {
        fontSize: 32,
        color: COLORS.text,
        fontWeight: 'bold',
        fontFamily: 'serif',
        marginBottom: 30,
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
    passwordWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGrey,
    },
    forgotPasswordText: {
        textAlign: 'center',
        color: COLORS.text,
        fontWeight: '600',
        fontSize: 14,
        marginTop: 10,
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
    signUpText: {
        textAlign: 'center',
        color: COLORS.text,
        fontWeight: '600',
        fontSize: 14,
        marginTop: 30,
    },
});