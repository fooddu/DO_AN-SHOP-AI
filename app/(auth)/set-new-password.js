// app/(auth)/set-new-password.js

import { Ionicons } from '@expo/vector-icons'; // Thêm thư viện Icon
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import AuthCard from '../../components/AuthCard';
import AuthTextInput from '../../components/AuthTextInput';
import { useAuth } from '../../context/AuthContext';

// Lấy chiều rộng màn hình để tính toán responsive
const { width } = Dimensions.get('window');

const MIN_PASSWORD_LENGTH = 6;
// 🎨 MÀU HỒNG CHỦ ĐẠO
const APP_PINK = '#FF3366'; 

// =========================================================
// ⭐️ COMPONENT MODAL THÔNG BÁO (ENGLISH + PINK BUTTON)
// =========================================================

const SuccessModal = ({ isVisible, title, message, onOKPress }) => {
    if (!isVisible) return null; 

    // Kiểm tra xem đây là thông báo Thành công hay Lỗi
    const isSuccess = title?.toLowerCase().includes('success');
    
    // Config màu sắc và icon dựa trên trạng thái
    const iconName = isSuccess ? 'checkmark-sharp' : 'close-sharp';
    const iconColor = isSuccess ? '#2ECC71' : '#dc3545'; // Xanh lá hoặc Đỏ
    const buttonText = isSuccess ? 'OK' : 'TRY AGAIN';

    return (
        <Modal 
            transparent={true} 
            visible={isVisible}
            animationType="fade"
            onRequestClose={onOKPress}
        >
            <View style={modalStyles.overlay}>
                <View style={modalStyles.container}>
                    
                    {/* --- ICON CONTAINER --- */}
                    <View style={[modalStyles.iconContainer, { backgroundColor: iconColor }]}>
                        <Ionicons name={iconName} size={40} color="#fff" />
                    </View>
                    
                    {/* --- NỘI DUNG --- */}
                    <Text style={modalStyles.title}>{title}</Text>
                    <Text style={modalStyles.message}>{message}</Text>

                    {/* --- NÚT BẤM MÀU HỒNG --- */}
                    <TouchableOpacity 
                        style={modalStyles.button} 
                        onPress={onOKPress}
                    >
                        <Text style={modalStyles.buttonText}>{buttonText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

// =========================================================
// ⭐️ MAIN COMPONENT: SetNewPasswordScreen
// =========================================================

export default function SetNewPasswordScreen() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // ⭐️ State cho Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState({});
    
    const router = useRouter();
    const { setNewPassword } = useAuth();
    const { email = '' } = useLocalSearchParams(); 

    // Hàm xử lý khi người dùng nhấn OK trên Modal
    const handleModalOK = () => {
        setModalVisible(false);
        if (modalContent.isSuccess) {
             router.replace('/(auth)/login'); // Chuyển về trang login khi thành công
        }
    };
    
    // Hàm hiển thị thông báo
    const showNotification = (title, message, isSuccess = true) => {
        setModalContent({ title, message, isSuccess });
        setModalVisible(true);
    };
    
    // Hàm xử lý logic chính
    const handleSetPassword = async () => {
        // 1. Kiểm tra xác thực (Validation - English)
        if (!email) {
            showNotification('Error', 'Email address is missing.', false);
            return;
        }
        if (!password || !confirmPassword) {
            showNotification('Error', 'Please fill in all password fields.', false);
            return;
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
            showNotification('Error', `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, false);
            return;
        }
        if (password !== confirmPassword) {
            showNotification('Error', 'Confirm password does not match.', false);
            return;
        }
        
        // 2. Gọi API
        setIsSubmitting(true);
        try {
            const result = await setNewPassword(email, password); 
            
            // 3. Xử lý kết quả API
            if (result?.success) {
                showNotification(
                    'Success', 
                    'Password changed successfully.\nPlease login again.',
                    true
                );
            } else {
                showNotification(
                    'Failed', 
                    result?.message || 'Unable to change password. Please try again.',
                    false
                );
            }
        } catch (error) {
            showNotification('Error', 'An unexpected error occurred.', false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <SuccessModal 
                isVisible={modalVisible}
                title={modalContent.title}
                message={modalContent.message}
                onOKPress={handleModalOK}
            />

            {/* Logo và Divider */}
            <View style={styles.logoContainer}>
                <View style={styles.divider} />
                <Image 
                    source={require('../../assets/logo.png')} 
                    style={styles.logo} 
                    resizeMode="contain" 
                />
                <View style={styles.divider} />
            </View>
            
            {/* Title */}
            <Text style={styles.welcomeText}>NEW PASSWORD</Text>
            
            {/* Card chứa Form */}
            <View style={styles.cardWrapper}>
                <AuthCard style={styles.authCardCustom}>
                    <AuthTextInput
                        label="New Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <AuthTextInput
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />
                    <TouchableOpacity 
                        style={styles.signUpButton} 
                        onPress={handleSetPassword} 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" style={styles.loader} />
                        ) : (
                            <Text style={styles.signUpText}>CHANGE PASSWORD</Text>
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
        backgroundColor: '#f8f9fa' 
    },
    content: { 
        paddingTop: width * 0.1, 
        paddingBottom: width * 0.1, 
        alignItems: 'center' 
    },
    // --- Logo & Divider ---
    logoContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '85%', 
        marginTop: 40, 
        marginBottom: 20,
    },
    logo: { width: 90, height: 90 },
    divider: { flex: 1, height: 1, backgroundColor: '#ced4da', marginHorizontal: 20 },
    
    // --- Text ---
    welcomeText: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#333', 
        paddingHorizontal: 30, 
        marginBottom: 30, 
        textAlign: 'center' 
    },
    
    // --- Card Wrapper ---
    cardWrapper: { 
        width: '100%', 
        paddingHorizontal: 25, 
        alignSelf: 'stretch',
    },
    authCardCustom: {
        paddingHorizontal: 30,
        paddingVertical: 30,
        borderRadius: 12,
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 5 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 10, 
        elevation: 8, 
    },
    // --- Buttons ---
    signUpButton: { 
        backgroundColor: '#333', // Nút Change Password giữ màu đen/xám đậm
        borderRadius: 10, 
        paddingVertical: 16, 
        marginTop: 30, 
        width: '80%', 
        alignSelf: 'center', 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.2, 
        shadowRadius: 5, 
        elevation: 4, 
    },
    signUpText: { color: '#fff', fontSize: 17, fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' },
    loader: { marginVertical: 0 },
});

// --- Styles cho Modal (Đã chỉnh sửa theo yêu cầu) ---
const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20, // Bo góc tròn hơn giống ảnh
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 10,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 12, // Bo góc icon vuông nhẹ
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#333',
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 25,
        color: '#666',
        lineHeight: 22,
    },
    button: {
        backgroundColor: APP_PINK, // <--- MÀU HỒNG
        borderRadius: 10,
        paddingVertical: 12,
        width: '100%', 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFC107', // Viền vàng nhẹ giống ảnh (có thể bỏ nếu không thích)
        shadowColor: APP_PINK,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
});