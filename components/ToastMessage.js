import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

const COLORS = {
    success: '#2ECC71', successBg: '#E8F8F5',
    error: '#FF4444', errorBg: '#FFE5E5',
    info: '#3498DB', infoBg: '#EBF5FB',
};

const ToastMessage = ({ message, type = 'error', visible, onHide }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start();
            const timer = setTimeout(() => hide(), 3000);
            return () => clearTimeout(timer);
        } else hide();
    }, [visible]);

    const hide = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: -20, duration: 300, useNativeDriver: true }),
        ]).start(() => { if (visible && onHide) onHide(); });
    };

    if (!visible) return null;

    let iconName = 'alert-circle';
    let bgColor = COLORS.errorBg;
    let textColor = COLORS.error;

    if (type === 'success') { iconName = 'checkmark-circle'; bgColor = COLORS.successBg; textColor = COLORS.success; }
    else if (type === 'info') { iconName = 'information-circle'; bgColor = COLORS.infoBg; textColor = COLORS.info; }

    return (
        <Animated.View style={[styles.container, { backgroundColor: bgColor, borderColor: textColor, opacity: fadeAnim, transform: [{ translateY }] }]}>
            <Ionicons name={iconName} size={24} color={textColor} />
            <Text style={[styles.text, { color: textColor }]}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute', top: 50, left: 20, right: 20, zIndex: 9999,
        flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5,
    },
    text: { marginLeft: 10, fontWeight: '500', fontSize: 14, flex: 1, }
});

export default ToastMessage;