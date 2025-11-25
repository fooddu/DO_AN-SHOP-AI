import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
// Giả định các components này đã tồn tại
import AuthCard from '../../components/AuthCard';
import AuthTextInput from '../../components/AuthTextInput';
import { useAuth } from '../../context/AuthContext';

// MÀU SẮC CHỦ ĐẠO (Giữ nguyên)
const PRIMARY_COLOR = '#333'; 
const TEXT_COLOR = '#333';
const MUTED_COLOR = '#888';
const BACKGROUND_COLOR = '#F9F9F9'; 
const BORDER_COLOR = '#E0E0E0'; 
const MAX_WIDTH = 380; 

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const router = useRouter();
    const { forgotPassword } = useAuth();

    const handleSend = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter a valid email.');
            return;
        }
        
        setIsSubmitting(true);
        const result = await forgotPassword(email); 
        setIsSubmitting(false);

        if (result.success) {
            router.push({ 
                pathname: '/(auth)/verify-otp', 
                params: { email: email.trim() }
            });
            Alert.alert('Success', result.message || 'OTP code has been sent to your email.');
        } else {
            Alert.alert('Failed', result.message || 'An error occurred, please try again.');
        }
    };

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.content} 
            keyboardShouldPersistTaps="handled"
        >
            {/* Header / Logo */}
            <View style={styles.logoContainer}>
                <View style={styles.divider} /> 
                <Image 
                    source={require('../../assets/logo.png')} 
                    style={styles.logo} 
                    resizeMode="contain" 
                />
                <View style={styles.divider} /> 
            </View>

            <Text style={styles.welcomeText}>RESET PASSWORD</Text>
            
            {/* Card / Input Wrapper */}
            <View style={styles.cardWrapper}>
                <AuthCard style={styles.authCardStyle}>
                    <AuthTextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.authInputFullWidth}
                        // Style này là cần thiết để đảm bảo loại bỏ viền focus trên Web
                        textInputStyle={styles.noOutlineInput} 
                    />
                    
                    {/* Send Button */}
                    <TouchableOpacity 
                        style={[styles.actionButton, isSubmitting && styles.actionButtonDisabled]} 
                        onPress={handleSend} 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>SEND OTP</Text>
                        )}
                    </TouchableOpacity>

                    {/* Back to Login Link */}
                    <View style={styles.linkContainer}> 
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text style={styles.loginLink}>BACK TO LOGIN</Text>
                        </TouchableOpacity>
                    </View>
                </AuthCard>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    // Style để loại bỏ viền focus của trình duyệt (Web)
    noOutlineInput: {
        ...Platform.select({
            web: {
                outline: 'none',
                boxShadow: 'none', // Đảm bảo không còn box shadow khi focus
            },
        }),
    },
    
    container: { 
        flex: 1, 
        backgroundColor: BACKGROUND_COLOR,
    },
    content: { 
        paddingTop: '10%', 
        paddingBottom: '5%',
        alignItems: 'center', 
    },
    logoContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '60%', 
        maxWidth: 300,
        marginBottom: '8%',
    },
    logo: { 
        width: 60, 
        height: 60, 
        marginHorizontal: 10,
    },
    divider: { 
        flex: 1, 
        height: 1, 
        backgroundColor: BORDER_COLOR, 
    },
    welcomeText: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: TEXT_COLOR, 
        marginBottom: '5%', 
        textAlign: 'center', 
    },
    
    cardWrapper: { 
        width: '90%',
        maxWidth: MAX_WIDTH, 
        marginBottom: '5%',
    },
    authCardStyle: {
        paddingVertical: '5%', 
        paddingHorizontal: 0, 
        borderRadius: 10,
        alignItems: 'center',
    },
    // Style này sẽ được áp dụng cho Input Wrapper
    authInputFullWidth: {
        width: '90%', 
        marginBottom: '7%', 
        alignSelf: 'center',
    },

    // BUTTON STYLES
    actionButton: { 
        backgroundColor: PRIMARY_COLOR, 
        borderRadius: 8, 
        paddingVertical: '3.5%', 
        marginTop: '7%', 
        width: '80%', 
        alignSelf: 'center',
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 2, 
        elevation: 2, 
    },
    actionButtonDisabled: {
        backgroundColor: MUTED_COLOR,
        elevation: 0,
        shadowOpacity: 0,
    },
    buttonText: { 
        color: '#fff', 
        fontSize: 13, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        textTransform: 'uppercase', 
    },
    
    linkContainer: {
        marginTop: '5%', 
        marginBottom: '2%',
        width: '100%', 
        alignItems: 'center', 
    },
    loginLink: { 
        color: TEXT_COLOR, 
        fontSize: 13, 
        fontWeight: '600', 
        textTransform: 'uppercase', 
    },
});