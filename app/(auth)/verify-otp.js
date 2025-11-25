// app/(auth)/verify-otp.js (Đã chỉnh màu nút Resend sang đen)

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
import { useAuth } from '../../context/AuthContext';

// Lấy chiều rộng màn hình để tính toán responsive
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
            Alert.alert('Error', 'Please enter a 6-digit OTP code.');
            return;
        }
        
        setIsSubmitting(true);
        const result = await verifyOtp(email, otp); 
        setIsSubmitting(false);

        if (result.success) {
            router.push({ 
                pathname: '/(auth)/set-new-password', 
                params: { email: email } 
            });
            Alert.alert('Success', result.message || 'Verification successful.');
        } else {
            Alert.alert('Failed', result.message || 'Invalid or expired OTP.');
        }
    };
    
    const handleResend = async () => {
        setIsResending(true);
        const result = await forgotPassword(email);
        setIsResending(false);

        if (result.success) {
            Alert.alert('Resend Successful', result.message || 'A new OTP code has been sent to your email.');
        } else {
            Alert.alert('Resend Error', result.message || 'Unable to resend OTP. Please check your email.');
        }
    };

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false} 
        >
            
            <View style={styles.logoContainer}>
                <View style={styles.divider} />
                <Image 
                    source={require('../../assets/logo.png')} 
                    style={styles.logo} 
                    resizeMode="contain" 
                />
                <View style={styles.divider} />
            </View>
            
            <Text style={styles.welcomeText}>ENTER OTP</Text>
            
            <View style={styles.cardWrapper}> 
                <AuthCard style={styles.authCardCustom}> 
                    
                    <Text style={styles.instructionText}>
                        We have sent an OTP code to your email: {'\n'}
                        <Text style={styles.emailText}>{email}</Text>
                    </Text>
                    
                    <AuthOtpInput 
                        value={otp} 
                        onChange={setOtp} 
                    />
                    
                    <TouchableOpacity 
                        style={styles.verifyButtonCustom} 
                        onPress={handleVerify} 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" style={styles.loader} />
                        ) : (
                            <Text style={styles.verifyText}>VERIFY OTP</Text>
                        )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.resendButton} 
                        onPress={handleResend} 
                        disabled={isResending || isSubmitting}
                    >
                        {isResending ? (
                            // Giữ màu ActivityIndicator tối để phù hợp với nền trắng
                            <ActivityIndicator color="#212529" /> 
                        ) : (
                            <Text style={styles.resendText}>Resend OTP code</Text>
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
        paddingTop: width * 0.12, 
        paddingBottom: width * 0.12, 
        alignItems: 'center',
    },
    // --- Logo & Divider ---
    logoContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '85%', 
        marginTop: width * 0.08, 
        marginBottom: width * 0.04, 
    },
    logo: { 
        width: width * 0.2,
        height: width * 0.2, 
        marginHorizontal: 15,
    },
    divider: { 
        flex: 1, 
        height: 1, 
        backgroundColor: '#ced4da', 
    },
    // --- Text Styles ---
    welcomeText: { 
        fontSize: width * 0.07, 
        fontWeight: 'bold', 
        color: '#212529', 
        marginBottom: width * 0.08, 
        textAlign: 'center', 
    },
    instructionText: {
        fontSize: width * 0.04,
        color: '#6c757d', 
        textAlign: 'center',
        lineHeight: width * 0.055, 
        marginBottom: 10, 
    },
    emailText: {
        fontWeight: 'bold',
        color: '#343a40', 
    },
    // --- Card FIX ---
    cardWrapper: { 
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 25, 
        alignSelf: 'stretch',
    },
    authCardCustom: {
        width: '100%', 
        alignSelf: 'stretch',
        paddingHorizontal: 30, 
        paddingVertical: 35, 
        backgroundColor: '#fff',
        borderRadius: 12, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 5 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 10, 
        elevation: 8, 
    },
    // --- Buttons ---
    verifyButtonCustom: { 
        backgroundColor: '#495057', // Đen nhạt/xám đậm
        borderRadius: 10, 
        paddingVertical: 16, 
        marginTop: 30, 
        width: '80%', // Chiều rộng 80%
        alignSelf: 'center', 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.2, 
        shadowRadius: 5, 
        elevation: 6, 
    },
    verifyText: { 
        color: '#fff', 
        fontSize: 17, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        textTransform: 'uppercase', 
    },
    loader: { 
        marginVertical: 5, 
    },
    resendButton: { 
        marginTop: 20, 
        alignItems: 'center', 
    },
    resendText: { 
        // ⭐️ CHỈNH SỬA: Màu đen và bỏ gạch chân ⭐️
        color: '#212529', 
        fontSize: 15, 
        fontWeight: '600', 
        textDecorationLine: 'none', 
    },
});