import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Lấy kích thước màn hình hiện tại
const { width } = Dimensions.get('window');

// Kiểm tra xem màn hình có phải là màn hình nhỏ (mobile) không
const isSmallScreen = width < 768;

export default function StripeWebPayment({ onSuccess, amount, onCancel }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async () => {
        if (!stripe || !elements) return;
        setLoading(true);
        setErrorMsg('');

        try {
            const cardElement = elements.getElement(CardElement);
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                setErrorMsg(error.message);
                setLoading(false);
            } else {
                onSuccess(paymentMethod.id);
                setLoading(false);
            }
        } catch (err) {
            console.log(err);
            setErrorMsg("Có lỗi xảy ra. Vui lòng thử lại.");
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Enter Card Details</Text>
            
            {/* Thay vì fix cứng width, dùng View bao ngoài để handle layout 
            */}
            <View style={styles.cardWrapper}>
                <View style={styles.cardContainer}>
                    <CardElement 
                        options={{
                            style: {
                                base: {
                                    // Font size responsive nhẹ: Mobile 16px, Web to hơn xíu nếu muốn
                                    fontSize: '16px', 
                                    color: '#333',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    '::placeholder': { color: '#aab7c4' },
                                    lineHeight: '24px',
                                    padding: '0px', 
                                },
                                invalid: { color: '#FF3366' },
                            },
                            hidePostalCode: true,
                        }} 
                    />
                </View>
            </View>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <TouchableOpacity style={styles.payBtn} onPress={handleSubmit} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.payText}>PAY ${amount}</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel Payment</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        backgroundColor: '#fff',
        // Responsive Padding: 
        // Thay vì fix 20px, dùng tỷ lệ phần trăm hoặc giá trị linh hoạt
        paddingVertical: 20,
        paddingHorizontal: '5%', 
        
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        
        // --- CHÌA KHÓA RESPONSIVE ---
        width: '100%', // Luôn chiếm 100% chiều ngang của thẻ cha
        maxWidth: 500, // NHƯNG không bao giờ vượt quá 500px (để đẹp trên PC)
        alignSelf: 'center', // Tự căn giữa chính nó trong màn hình to
        // -----------------------------

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center'
    },
    cardWrapper: {
        // Wrapper này giúp đảm bảo thẻ input không bị méo
        width: '100%',
        marginBottom: 20,
    },
    cardContainer: {
        // Thay height cố định bằng minHeight để nội dung tự đẩy nếu cần
        minHeight: 50,
        justifyContent: 'center',
        
        // Padding bên trong input nên để nhỏ vừa phải
        paddingHorizontal: 12,
        paddingVertical: 10,
        
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#FAFAFA',
    },
    payBtn: {
        backgroundColor: '#5433FF',
        paddingVertical: 16,
        width: '100%', // Nút bấm full chiều ngang container
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: "#5433FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    payText: { 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: 16 
    },
    errorText: { 
        color: '#FF3366', 
        marginBottom: 15, 
        fontSize: 14, 
        textAlign: 'center',
        fontWeight: '500'
    },
    cancelBtn: { 
        marginTop: 15, 
        alignItems: 'center', 
        padding: 5 
    },
    cancelText: { 
        color: '#666', 
        textDecorationLine: 'underline',
        fontSize: 14
    }
});