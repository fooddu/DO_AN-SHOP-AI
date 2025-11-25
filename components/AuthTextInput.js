import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- CONFIG ---
const INPUT_PADDING = 15; // Padding ngang (giữ nguyên để căn chỉnh)
const FONT_SIZE = 24;     // ✅ Tăng cỡ chữ lên 18
const VERTICAL_PADDING = 8; // ✅ Giảm padding dọc (mặc định là 10) để kéo chữ sát dòng kẻ hơn
// --- CONFIG ---


const AuthTextInput = ({ 
    label,
    placeholder, 
    value, 
    onChangeText, 
    secureTextEntry,
    wrapperStyle, 
    textInputStyle, 
    ...otherProps 
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPassword = secureTextEntry;

    const borderColor = '#e0e0e0'; 

    const noOutlineStyle = Platform.OS === 'web' ? { 
        outline: 'none', 
        boxShadow: 'none',
        WebkitBoxShadow: '0 0 0 1000px white inset',
        WebkitTextFillColor: '#333',
    } : {};

    return (
        <View style={[styles.wrapper, wrapperStyle]}> 
            {label && <Text style={styles.label}>{label}</Text>}
            
            <View 
                style={[
                    styles.container, 
                    { borderBottomColor: borderColor }
                ]}
            >
                <TextInput
                    style={[styles.input, textInputStyle, noOutlineStyle]} 
                    placeholder={placeholder}
                    placeholderTextColor="#999"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={isPassword && !isPasswordVisible}
                    autoComplete={otherProps.keyboardType === 'email-address' ? 'email' : 'off'} 
                    {...otherProps}
                />
                {isPassword && (
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off' : 'eye'}
                            size={20}
                            color="#333"
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 20,
        paddingHorizontal: INPUT_PADDING,
    },
    label: {
        fontSize: 18,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    input: {
        flex: 1,
        // ✅ Cập nhật: Tăng cỡ chữ
        fontSize: FONT_SIZE, 
        // ✅ Cập nhật: Giảm padding dọc để kéo sát dòng kẻ
        paddingVertical: VERTICAL_PADDING, 
        paddingHorizontal: 0, 
        color: '#333',
    },
    eyeIcon: {
        padding: 5,
        marginRight: 0, 
    },
});

export default AuthTextInput;