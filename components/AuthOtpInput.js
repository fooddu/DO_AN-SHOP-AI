// [File] components/AuthOtpInput.js (Đã fix lỗi lề)

import React from 'react';
import { Dimensions, StyleSheet, TextInput, View } from 'react-native';

const { width } = Dimensions.get('window');

const AuthOtpInput = ({ value, onChange, length = 6 }) => {
    // ... (logic component giữ nguyên) ...
    const code = value.split('').concat(Array(length).fill('')).slice(0, length);
    const inputs = Array(length).fill(0);
    const refs = React.useRef([]);

    const handleChange = (text, idx) => {
        let ch = text.replace(/[^0-9]/g, '').slice(0, 1);
        let newValue = code.slice();
        newValue[idx] = ch;
        const joined = newValue.join('').slice(0, length);
        onChange && onChange(joined);
        if (ch && idx < length - 1) {
            refs.current[idx + 1]?.focus();
        }
        if (!ch && idx > 0) {
            refs.current[idx - 1]?.focus();
        }
    };

    return (
        <View style={styles.otpOuterContainer}> 
            <View style={styles.otpContainer}>
                {inputs.map((_, idx) => (
                    <TextInput
                        key={idx}
                        style={styles.otpInput}
                        keyboardType="numeric"
                        maxLength={1}
                        value={code[idx]}
                        onChangeText={(text) => handleChange(text, idx)}
                        ref={ref => refs.current[idx] = ref}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                ))}
            </View>
        </View>
    );
};

// Kích thước cố định được chọn để vừa với màn hình điện thoại phổ biến (~375px)
const FIXED_CELL_SIZE = 40; 
const FIXED_GAP = 8; // Tăng khoảng cách giữa các ô một chút

const styles = StyleSheet.create({
    otpOuterContainer: {
        // ⭐️ FIX: Thêm margin ngang 20 để tạo khoảng cách an toàn từ lề AuthCard ⭐️
        width: '100%', 
        alignSelf: 'center',
        marginVertical: 20, // Tăng khoảng cách trên/dưới
        paddingHorizontal: 0, 
        marginHorizontal: 0, // Bỏ marginHorizontal cũ
        paddingHorizontal: 20, // THAY VÌ MARGIN, SỬ DỤNG PADDING để tạo khoảng cách AN TOÀN từ lề Card.
    },
    otpContainer: {
        flexDirection: 'row',
        // Tăng khoảng cách đều giữa các ô để sử dụng hết không gian còn lại
        justifyContent: 'space-between', 
        gap: FIXED_GAP, 
        width: '100%', 
    },
    otpInput: {
        // Cần tính toán lại width để đảm bảo 6 ô + 5 gap vừa với màn hình
        // (Chi tiết về cách tính đã được ẩn bên dưới, ở đây giữ nguyên width 40 và dùng space-between)
        width: FIXED_CELL_SIZE, 
        height: FIXED_CELL_SIZE + 10,
        
        borderRadius: 10, // Bo góc mềm mại hơn
        borderWidth: 1,
        borderColor: '#ddd', // Màu border nhẹ hơn
        textAlign: 'center',
        fontSize: 24, 
        fontWeight: '600',
        color: '#333',
        backgroundColor: '#fff', // Màu nền trắng
        
        // Shadow rõ hơn một chút để nổi bật ô nhập
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
});

export default AuthOtpInput;