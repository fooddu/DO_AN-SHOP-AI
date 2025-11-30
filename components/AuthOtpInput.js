import { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

const AuthOtpInput = ({ value, onChange, length = 6 }) => {
    // Tạo mảng code từ value hiện tại
    const code = value.split('').concat(Array(length).fill('')).slice(0, length);
    const inputs = Array(length).fill(0);
    const refs = useRef([]);

    const handleChange = (text, idx) => {
        // Chỉ lấy số
        let ch = text.replace(/[^0-9]/g, '').slice(0, 1);
        let newValue = code.slice();
        newValue[idx] = ch;
        
        // Cập nhật giá trị
        const joined = newValue.join('').slice(0, length);
        onChange && onChange(joined);

        // Tự động chuyển focus
        if (ch && idx < length - 1) {
            refs.current[idx + 1]?.focus();
        }
        // Xóa thì lùi lại
        if (!ch && idx > 0) {
            refs.current[idx - 1]?.focus();
        }
    };

    // Xử lý khi bấm nút Backspace trên bàn phím (để xóa mượt hơn)
    const handleKeyPress = (e, idx) => {
        if (e.nativeEvent.key === 'Backspace' && !code[idx] && idx > 0) {
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
                        onKeyPress={(e) => handleKeyPress(e, idx)}
                        ref={ref => refs.current[idx] = ref}
                        autoCorrect={false}
                        autoCapitalize="none"
                        // Tắt phóng to chữ hệ thống để tránh vỡ layout
                        allowFontScaling={false} 
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    otpOuterContainer: {
        width: '100%', 
        alignSelf: 'center',
        marginVertical: 20,
    },
    otpContainer: {
        flexDirection: 'row',
        // Space-between giúp tự chia đều khoảng cách dựa trên chiều rộng màn hình
        justifyContent: 'space-between', 
        width: '100%', 
    },
    otpInput: {
        // Kích thước ô linh hoạt: ~14% chiều rộng container cho mỗi ô (6 ô * 14% = 84%, còn lại là khoảng trống)
        width: '14%', 
        aspectRatio: 1, // Giữ ô luôn hình vuông hoặc gần vuông
        height: 50,     // Chiều cao tối thiểu
        
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#dee2e6',
        textAlign: 'center',
        fontSize: 22, 
        fontWeight: 'bold',
        color: '#212529',
        backgroundColor: '#fff',
        
        // Shadow nhẹ
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
});

export default AuthOtpInput;