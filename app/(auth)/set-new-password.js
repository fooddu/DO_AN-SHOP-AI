// app/(auth)/set-new-password.js
// SỬ DỤNG CUSTOM MODAL/OVERLAY THAY THẾ CHO ALERT.ALERT VÀ window.alert()

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AuthCard from '../../components/AuthCard';
import AuthTextInput from '../../components/AuthTextInput';
import { useAuth } from '../../context/AuthContext';
// Có thể import Icon nếu bạn dùng (ví dụ: Feather, AntDesign)
// import { AntDesign } from '@expo/vector-icons'; 

const MIN_PASSWORD_LENGTH = 6;

// =========================================================
// ⭐️ COMPONENT MODAL THÔNG BÁO THÀNH CÔNG/THẤT BẠI
// =========================================================

const SuccessModal = ({ isVisible, title, message, onOKPress }) => {
    // Nếu không visible, không render gì cả
    if (!isVisible) return null; 

    return (
        <Modal 
            transparent={true} 
            visible={isVisible}
            animationType="fade" // Hiệu ứng mờ dần
        >
            <View style={modalStyles.overlay}>
                <View style={modalStyles.container}>
                    {/* Icon hoặc biểu tượng thành công */}
                    <Text style={modalStyles.icon}>✅</Text> 
                    
                    {/* Nội dung */}
                    <Text style={modalStyles.title}>{title}</Text>
                    <Text style={modalStyles.message}>{message}</Text>

                    {/* Nút OK */}
                    <TouchableOpacity 
                        style={modalStyles.button} 
                        onPress={onOKPress}
                    >
                        <Text style={modalStyles.buttonText}>OK</Text>
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
    
    // Hàm hiển thị thông báo (sử dụng Modal cho cả Web/Mobile)
    const showNotification = (title, message, isSuccess = true) => {
        setModalContent({ title, message, isSuccess });
        setModalVisible(true);

        // 💡 DEBUG: Nếu đang ở Web, alert() tạm thời để đảm bảo hiển thị
        if (Platform.OS === 'web' && !isSuccess) {
            console.warn("WEB FALLBACK: Sử dụng Alert.alert cho lỗi.");
            Alert.alert(title, message); 
        }
    };
    
    // Hàm xử lý logic chính
    const handleSetPassword = async () => {
        // 1. Kiểm tra xác thực
        if (!email) {
            showNotification('Lỗi Dữ Liệu', 'Không nhận được địa chỉ email.', false);
            router.replace('/(auth)/forgot-password');
            return;
        }
        if (!password || !confirmPassword) {
            showNotification('Lỗi', 'Vui lòng điền đầy đủ các trường mật khẩu.', false);
            return;
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
            showNotification('Lỗi', `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`, false);
            return;
        }
        if (password !== confirmPassword) {
            showNotification('Lỗi', 'Mật khẩu xác nhận không khớp.', false);
            return;
        }
        
        // 2. Gọi API
        setIsSubmitting(true);
        const result = await setNewPassword(email, password); 
        setIsSubmitting(false);

        // 3. Xử lý kết quả API và hiển thị Modal
        if (result?.success) {
            showNotification(
                'Thành Công', 
                result.message || 'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.',
                true // isSuccess = true
            );
        } else {
            // Xử lý lỗi
            showNotification(
                'Thất Bại', 
                result?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.',
                false // isSuccess = false
            );
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <SuccessModal 
                isVisible={modalVisible}
                title={modalContent.title}
                message={modalContent.message}
                onOKPress={handleModalOK}
            />
            
            <View style={styles.logoContainer}>
                <View style={styles.divider} />
                <Image 
                    source={require('../../assets/logo.png')} 
                    style={styles.logo} 
                    resizeMode="contain" 
                />
                <View style={styles.divider} />
            </View>
            <Text style={styles.welcomeText}>NEW PASSWORD</Text>
            <View style={styles.cardWrapper}>
                <AuthCard>
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

// =========================================================
// ⭐️ STYLES cho MAIN COMPONENT
// =========================================================
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { paddingTop: 40, paddingBottom: 40 },
    logoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 40, marginBottom: 20 },
    logo: { width: 90, height: 90 },
    divider: { flex: 1, height: 1, backgroundColor: '#e0e0e0', marginHorizontal: 20 },
    welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#333', paddingHorizontal: 30, marginBottom: 30, textAlign: 'center' },
    cardWrapper: { alignSelf: 'flex-start' },
    signUpButton: { 
        backgroundColor: '#333', 
        borderRadius: 8, 
        paddingVertical: 15, 
        marginTop: 10, 
        marginHorizontal: 30,
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 4, 
        elevation: 3, 
    },
    signUpText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' },
    loader: { marginVertical: 0 },
});

// =========================================================
// ⭐️ STYLES cho CUSTOM MODAL
// =========================================================
const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Nền tối mờ
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '85%',
        maxWidth: 350,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 25,
        alignItems: 'center',
        // Shadow/Elevation cho Modal
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    icon: {
        fontSize: 48,
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#333',
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 25,
        color: '#555',
    },
    button: {
        backgroundColor: '#007AFF', // Màu xanh dương tiêu chuẩn
        borderRadius: 8,
        paddingVertical: 12,
        width: '100%',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});