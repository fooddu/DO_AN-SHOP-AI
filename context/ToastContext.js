import { Ionicons } from '@expo/vector-icons';
import { createContext, useContext, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';

// Tạo Context
const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState('success'); // success, error, info
    
    // Animation value
    const fadeAnim = useRef(new Animated.Value(0)).current; 
    const translateY = useRef(new Animated.Value(-50)).current;

    let timeoutRef = useRef(null);

    const showToast = (msg, type = 'success') => {
        // Nếu đang có toast, clear timeout cũ
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setMessage(msg);
        setType(type);
        setVisible(true);

        // Hiệu ứng hiện ra
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0, // Vị trí chuẩn
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();

        // Tự động ẩn sau 3 giây
        timeoutRef.current = setTimeout(() => {
            hideToast();
        }, 3000);
    };

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -50, // Bay lên trên
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => setVisible(false));
    };

    // Màu sắc & Icon dựa trên Type
    const getToastConfig = () => {
        switch (type) {
            case 'success':
                return { color: '#4CAF50', icon: 'checkmark-circle' }; // Xanh lá
            case 'error':
                return { color: '#F44336', icon: 'alert-circle' }; // Đỏ
            case 'info':
            default:
                return { color: '#2196F3', icon: 'information-circle' }; // Xanh dương
        }
    };

    const config = getToastConfig();

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            
            {/* UI CỦA TOAST NẰM Ở ĐÂY */}
            {visible && (
                <Animated.View 
                    style={[
                        styles.toastContainer, 
                        { 
                            opacity: fadeAnim, 
                            transform: [{ translateY: translateY }],
                            backgroundColor: config.color 
                        }
                    ]}
                >
                    <Ionicons name={config.icon} size={24} color="#fff" style={{ marginRight: 10 }} />
                    <Text style={styles.toastText}>{message}</Text>
                    
                    <TouchableOpacity onPress={hideToast} style={{ marginLeft: 10 }}>
                        <Ionicons name="close" size={20} color="#fff" />
                    </TouchableOpacity>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        top: Platform.OS === 'web' ? 20 : 50, // Cách top màn hình
        left: 20,
        right: 20,
        padding: 15,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 9999, // Đảm bảo luôn nổi lên trên cùng
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    toastText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        flex: 1, // Để text tự xuống dòng nếu dài
    }
});