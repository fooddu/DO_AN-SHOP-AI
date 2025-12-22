// File: app/(auth)/login.js

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react'; // Thêm useRef, useEffect
import {
    ActivityIndicator,
    Animated, // Import Animated
    Dimensions // Để lấy chiều rộng màn hình
    ,
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
    primary: '#222',
    grey: '#888',
    lightGrey: '#ddd',
    text: '#222',
    bg: '#fff',
    error: '#ff4444', // Màu đỏ cho lỗi
    errorBg: '#ffe5e5', // Màu nền nhạt cho lỗi
};

const { width } = Dimensions.get('window');

// ⭐️ COMPONENT THÔNG BÁO LỖI (TOAST) ⭐️
// Component này nhận vào message và hàm onHide để đóng
const ErrorToast = ({ message, visible, onHide }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current; // Opacity
    const translateY = useRef(new Animated.Value(-20)).current; // Vị trí Y

    useEffect(() => {
        if (visible) {
            // Hiện lên
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Tự động ẩn sau 3 giây
            const timer = setTimeout(() => {
                handleHide();
            }, 3000);
            return () => clearTimeout(timer);
        } else {
           handleHide();
        }
    }, [visible]);

    const handleHide = () => {
         Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -20,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if(visible && onHide) onHide(); // Gọi callback khi animation xong
        });
    }

    if (!visible && fadeAnim._value === 0) return null; // Không render khi ẩn hẳn

    return (
        <Animated.View
            style={[
                styles.toastContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: translateY }],
                },
            ]}
        >
            <Ionicons name="alert-circle" size={24} color={COLORS.error} />
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    );
};

// Component Header tùy chỉnh
const HeaderBack = ({ router }) => (
    <View style={headerStyles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={headerStyles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={headerStyles.spacer} />
    </View>
);

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // ⭐️ STATE CHO THÔNG BÁO LỖI ⭐️
    const [errorMsg, setErrorMsg] = useState('');
    const [isErrorVisible, setIsErrorVisible] = useState(false);

    const router = useRouter();
    const { login } = useAuth();

    // Hàm hiển thị lỗi
    const showError = (message) => {
        setErrorMsg(message);
        setIsErrorVisible(true);
        // Reset state sau khi ẩn (được xử lý trong component nhưng reset ở đây để chắc chắn logic)
        setTimeout(() => setIsErrorVisible(false), 3000);
    };

    const handleLogin = async () => {
        // Reset lỗi cũ
        setIsErrorVisible(false);

        if (!email || !password) {
            showError('Vui lòng nhập đầy đủ email và mật khẩu.');
            console.log("DEBUG FE: Validation failed - Missing email/password.");
            return;
        }

        console.log(`DEBUG FE: Attempting login for email: ${email}`);

        setIsSubmitting(true);

        const result = await login(email, password);

        setIsSubmitting(false);

        if (result.success) {
            console.log("DEBUG FE: Login successful! Redirecting...");
            router.replace('/(tabs)');
        } else {
            console.log("DEBUG FE: Login failed. Server response:", result.message);
            // ⭐️ THAY ALERT BẰNG HÀM SHOW ERROR ⭐️
            showError(result.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
        }
    };

    const goToForgotPassword = () => {
        router.push('/(auth)/forgot-password');
    }

    const goToRegister = () => {
        router.push('/(auth)/register');
    }

    const inputStyleWeb = Platform.select({
        web: {
            outlineStyle: 'none',
            outlineWidth: 0,
            outlineColor: 'transparent',
        },
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />

            {/* ⭐️ CHÈN COMPONENT TOAST VÀO ĐÂY (Ở trên cùng hoặc dưới Header) ⭐️ */}
            <View style={styles.toastWrapper}>
                 <ErrorToast 
                    message={errorMsg} 
                    visible={isErrorVisible} 
                    onHide={() => setIsErrorVisible(false)}
                />
            </View>

            <HeaderBack router={router} />

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

                {/* Title */}
                <Text style={styles.titleHello}>Hello!</Text>
                <Text style={styles.titleWelcome}>WELCOME BACK</Text>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[styles.input, inputStyleWeb]}
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
                                style={[styles.input, inputStyleWeb]}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color={COLORS.grey} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity onPress={goToForgotPassword}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Log In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity onPress={goToRegister}>
                    <Text style={styles.signUpText}>SIGN UP</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// Styles for HeaderBack component
const headerStyles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingTop: 10,
        backgroundColor: COLORS.bg,
    },
    backButton: {
        padding: 5,
        zIndex: 1,
    },
    spacer: { flex: 1 },
});

// Main Styles
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    container: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 20,
        backgroundColor: COLORS.bg,
    },
    // ⭐️ STYLES MỚI CHO TOAST ⭐️
    toastWrapper: {
        position: 'absolute',
        top: 50, // Cách top an toàn (tránh tai thỏ)
        left: 0,
        right: 0,
        zIndex: 999, // Đảm bảo nổi lên trên cùng
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    toastContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.errorBg,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.error,
        width: '100%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    toastText: {
        color: COLORS.error,
        marginLeft: 10,
        fontSize: 14,
        fontWeight: '500',
        flex: 1, // Để text tự xuống dòng nếu dài
    },
    // ----------------------------
    logoArea: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        marginTop: 10,
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
        fontFamily: Platform.OS === 'ios' ? 'serif' : 'Roboto', // Fix font on Android
    },
    titleWelcome: {
        fontSize: 32,
        color: COLORS.text,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'serif' : 'Roboto',
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
        paddingVertical: 10,
        fontSize: 16,
        color: COLORS.text,
        flex: 1,
        borderBottomWidth: 1, // Thêm border bottom cho input (như design cũ có vẻ thiếu)
        borderBottomColor: COLORS.lightGrey
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