import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import AuthCard from '../../components/AuthCard';
import AuthOtpInput from '../../components/AuthOtpInput';
// Giả sử đường dẫn AuthContext của bạn ở đây, hãy sửa nếu khác
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function VerifyOtpScreen() {
    const [otp, setOtp] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const router = useRouter();
    const { verifyOtp, forgotPassword } = useAuth();
    const { email } = useLocalSearchParams();

    const handleVerify = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Lỗi', 'Vui lòng nhập mã OTP 6 chữ số.');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await verifyOtp(email, otp);
            if (result.success) {
                Alert.alert('Thành công', result.message || 'Xác minh thành công.');
                router.push({
                    pathname: '/(auth)/set-new-password',
                    params: { email: email }
                });
            } else {
                Alert.alert('Thất bại', result.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Đã xảy ra lỗi không mong muốn.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            const result = await forgotPassword(email);
            if (result.success) {
                Alert.alert('Gửi lại thành công', result.message || 'Mã OTP mới đã được gửi đến email của bạn.');
            } else {
                Alert.alert('Lỗi gửi lại', result.message || 'Không thể gửi lại OTP.');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Lỗi mạng.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* --- Logo Section --- */}
            <View style={styles.logoContainer}>
                <View style={styles.divider} />
                {/* Đảm bảo đường dẫn ảnh logo đúng */}
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <View style={styles.divider} />
            </View>

            <Text style={styles.welcomeText} allowFontScaling={false}>NHẬP MÃ OTP</Text>

            {/* --- Card Section --- */}
            <View style={styles.cardWrapper}>
                <AuthCard style={styles.authCardCustom}>

                    {/* Hướng dẫn + Email */}
                    <Text style={styles.instructionText} allowFontScaling={false}>
                        Chúng tôi đã gửi mã OTP đến email của bạn:{'\n'}
                        <Text style={styles.emailText}>{email || 'email của bạn'}</Text>
                    </Text>

                    {/* Input OTP */}
                    <AuthOtpInput
                        value={otp}
                        onChange={setOtp}
                    />

                    {/* Nút Verify */}
                    <TouchableOpacity
                        style={styles.verifyButtonCustom}
                        onPress={handleVerify}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" style={styles.loader} />
                        ) : (
                            <Text style={styles.verifyText} allowFontScaling={false}>XÁC MINH OTP</Text>
                        )}
                    </TouchableOpacity>

                    {/* Nút Resend */}
                    <TouchableOpacity
                        style={styles.resendButton}
                        onPress={handleResend}
                        disabled={isResending || isSubmitting}
                    >
                        {isResending ? (
                            <ActivityIndicator color="#212529" size="small" />
                        ) : (
                            <Text style={styles.resendText} allowFontScaling={false}>Gửi lại mã OTP</Text>
                        )}
                    </TouchableOpacity>
                </AuthCard>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        paddingTop: width * 0.1,
        paddingBottom: width * 0.1,
        alignItems: 'center',
        flexGrow: 1, // Giúp scrollview hoạt động tốt trên màn hình nhỏ
    },
    // --- Logo & Divider ---
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '85%',
        marginBottom: 30,
    },
    logo: {
        width: 80, // Fix cứng size logo để không bị nhảy
        height: 80,
        marginHorizontal: 15,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#ced4da',
    },
    // --- Text Styles ---
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 20,
        textAlign: 'center',
    },
    instructionText: {
        fontSize: 14,
        color: '#6c757d',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 10,
        width: '100%',
        flexWrap: 'wrap', // QUAN TRỌNG: Cho phép xuống dòng nếu email dài
    },
    emailText: {
        fontWeight: 'bold',
        color: '#343a40',
    },
    // --- Card Styles ---
    cardWrapper: {
        width: '100%',
        paddingHorizontal: 20, // Padding ngoài để card không dính sát lề màn hình
        alignItems: 'center',
    },
    authCardCustom: {
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 30,
        backgroundColor: '#fff',
        borderRadius: 16,
        // Shadow mềm mại
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
    },
    // --- Buttons ---
    verifyButtonCustom: {
        backgroundColor: '#343a40',
        borderRadius: 8,
        paddingVertical: 14,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    verifyText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    loader: {
        paddingVertical: 2,
    },
    resendButton: {
        marginTop: 20,
        padding: 10,
        alignItems: 'center',
    },
    resendText: {
        color: '#212529',
        fontSize: 14,
        fontWeight: '600',
    },
});
