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
    const { signUp } = useAuth(); // Bây giờ signUp đã là một function hợp lệ

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
            return;
        }
        setIsSubmitting(true);
        // ⭐ ĐÃ SỬ DỤNG HÀM signUp TỪ CONTEXT ⭐
        const result = await signUp(name, email, password);
        setIsSubmitting(false);
        if (result.success) {
            // Bạn có thể cần xử lý logic chuyển hướng khác nếu API của bạn yêu cầu xác thực email
            Alert.alert('Thành công', 'Đăng ký thành công! Vui lòng đăng nhập.');
            router.replace('/login');
        } else {
            Alert.alert('Đăng ký thất bại', result.error);
        }
    };
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <ScrollView
                // 1. Container CÓ LỀ NGANG 30 (CĂN GIỮA)
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* 2. KHU VỰC LOGO (CĂN GIỮA) */}
                <View style={styles.logoArea}>
                    <View style={styles.line} />
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <View style={styles.line} />
                </View>
                {/* 3. Chữ WELCOME (căn trái, bên ngoài thẻ) */}
                <Text style={styles.titleWelcomeOutside}>CHÀO MỪNG</Text>
                {/* 4. Thẻ (Card) trắng chứa form */}
                <View style={styles.card}>
                    <View style={styles.form}>
                        {/* (Các input fields, đã thu hẹp) */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Tên</Text>
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
                            <Text style={styles.label}>Mật khẩu</Text>
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
                            <Text style={styles.label}>Xác nhận mật khẩu</Text>
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
                            <Text style={styles.buttonText}>ĐĂNG KÝ</Text>
                        )}
                    </TouchableOpacity>

                    {/* Link SIGN IN (bên trong thẻ) */}
                    <TouchableOpacity onPress={() => router.push('/login')}>
                        <Text style={styles.signInText}>
                            Đã có tài khoản? <Text style={styles.signInLink}>ĐĂNG NHẬP</Text>
                        </Text>
                    </TouchableOpacity>

                </View>
                {/* (Kết thúc thẻ) */}

            </ScrollView>
        </SafeAreaView>
    );
}
// Styles
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.surface, // Nền xám
    },
    // 1. CONTAINER CĂN GIỮA
    container: {
        paddingHorizontal: 30, // ⬅️ LỀ TRÁI 30 VÀ LỀ PHẢI 30
        paddingVertical: 40,
        backgroundColor: COLORS.surface,
    },
    // 2. LOGO CĂN GIỮA
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

    // 3. CHỮ WELCOME CĂN TRÁI (theo lề 30)
    titleWelcomeOutside: {
        fontSize: 32,
        color: COLORS.text,
        fontWeight: 'bold',
        fontFamily: 'serif',
        marginBottom: 20,
        textAlign: 'left',
    },
    // 4. THẺ (CARD) CĂN TRÁI (theo lề 30)
    card: {
        backgroundColor: COLORS.bg, // Nền trắng
        borderRadius: 10,
        paddingHorizontal: 25,
        paddingTop: 25,
        paddingBottom: 25,
        width: '100%',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
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
        borderRadius: 8,
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
