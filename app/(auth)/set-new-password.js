// app/(auth)/set-new-password.js (Đã fix lỗi căn giữa nút 80%)

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import AuthCard from '../../components/AuthCard';
import AuthTextInput from '../../components/AuthTextInput';
import { useAuth } from '../../context/AuthContext';
// import { AntDesign } from '@expo/vector-icons'; 

// Lấy chiều rộng màn hình để tính toán responsive
const { width } = Dimensions.get('window');

const MIN_PASSWORD_LENGTH = 6;

// =========================================================
// ⭐️ COMPONENT MODAL THÔNG BÁO THÀNH CÔNG/THẤT BẠI
// =========================================================

const SuccessModal = ({ isVisible, title, message, onOKPress }) => {
    // Nếu không visible, không render gì cả
    if (!isVisible) return null; 

    // Thay đổi Icon dựa trên title (ví dụ: title chứa 'Lỗi' thì dùng ❌)
    const icon = title?.toLowerCase().includes('lỗi') || title?.toLowerCase().includes('thất bại') ? '❌' : '✅';

    return (
        <Modal 
            transparent={true} 
            visible={isVisible}
            animationType="fade" 
        >
            <View style={modalStyles.overlay}>
                <View style={modalStyles.container}>
                    {/* Icon hoặc biểu tượng */}
                    <Text style={modalStyles.icon}>{icon}</Text> 
                    
                    {/* Nội dung */}
                    <Text style={modalStyles.title}>{title}</Text>
                    <Text style={modalStyles.message}>{message}</Text>

                    {/* Nút OK */}
                    <TouchableOpacity 
                        style={[
                            modalStyles.button, 
                            // Thay đổi màu nút nếu là thông báo lỗi
                            !title?.toLowerCase().includes('thành công') && { backgroundColor: '#dc3545' } 
                        ]} 
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
             // Dùng Alert.alert() cho lỗi trên web chỉ khi Modal không hiển thị tốt
             console.warn("WEB FALLBACK: Sử dụng Alert.alert cho lỗi nếu Modal không hoạt động.");
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
        backgroundColor: '#f8f9fa' // Nền xám nhạt
    },
    content: { 
        paddingTop: width * 0.1, 
        paddingBottom: width * 0.1, 
        alignItems: 'center' // Căn giữa tất cả các thành phần con theo chiều ngang
    },
    // --- Logo & Divider ---
    logoContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '85%', // Vẫn giữ 85% để divider dài ra
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
        paddingHorizontal: 25, // Thêm padding để cách lề màn hình
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
        backgroundColor: '#333', 
        borderRadius: 10, 
        paddingVertical: 16, 
        marginTop: 30, 
        width: '80%', // Chiều rộng 80%
        alignSelf: 'center', // ⭐️ FIX CĂN GIỮA NÚT TRONG CARD ⭐️
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.2, 
        shadowRadius: 5, 
        elevation: 4, 
    },
    signUpText: { color: '#fff', fontSize: 17, fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' },
    loader: { marginVertical: 0 },
});

// --- Styles cho Modal ---
const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
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
        width: '80%', // Nút OK trong Modal cũng căn giữa 80%
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});