import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// --- PHẦN QUAN TRỌNG NHẤT: ÉP CSS VÀO TRÌNH DUYỆT ---
if (Platform.OS === 'web') {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
        .stripe-container-web {
            min-height: 45px !important;
            width: 100% !important;
            display: block !important;
        }
        .StripeElement {
            padding: 12px !important;
            width: 100% !important;
            background-color: white !important;
        }
        /* Ép Iframe phải có chiều cao tối thiểu để không bị mất */
        .StripeElement iframe {
            min-height: 20px !important;
        }
    `;
    document.head.appendChild(style);
}

export default function NewStripePayment({ onSuccess, amount, isProcessing }) {
    const stripe = useStripe();
    const elements = useElements();
    const [localLoading, setLocalLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const isLoading = localLoading || isProcessing;

    const handleSubmit = async (event) => {
        if (Platform.OS === 'web' && event) event.preventDefault();
        if (!stripe || !elements || isLoading) return;

        setLocalLoading(true);
        setErrorMsg('');

        try {
            const cardElement = elements.getElement(CardElement);
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                setErrorMsg(error.message);
                setLocalLoading(false);
            } else {
                onSuccess(paymentMethod.id);
            }
        } catch (err) {
            setErrorMsg("Lỗi kết nối Stripe.");
            setLocalLoading(false);
        }
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#32325d',
                fontFamily: 'Arial, sans-serif',
                fontSmoothing: 'antialiased',
                '::placeholder': { color: '#aab7c4' },
                // Giảm lineHeight xuống một chút để không bị đẩy mất chữ
                lineHeight: '20px', 
            },
            invalid: { color: '#fa755a', iconColor: '#fa755a' },
        },
        hidePostalCode: true,
    };

    return (
        <View style={styles.container}>
            {/* Sử dụng thuộc tính className (chỉ có tác dụng trên Web) 
                để ép CSS từ thẻ style đã inject ở trên
            */}
            <View 
                style={styles.stripeWrapper}
                {...(Platform.OS === 'web' ? { className: 'stripe-container-web' } : {})}
            >
                <CardElement options={cardElementOptions} />
            </View>

            {errorMsg ? (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
                </View>
            ) : null}

            <TouchableOpacity 
                style={[styles.payBtn, isLoading && styles.disabledBtn]} 
                onPress={handleSubmit} 
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={styles.payText}>THANH TOÁN ${amount}</Text>
                )}
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>🔒 Secured by Stripe</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%' },
    stripeWrapper: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ced4da',
        marginBottom: 20,
        // Chiều cao cố định chuẩn để không bị biến mất
        minHeight: 48, 
        justifyContent: 'center',
    },
    errorBox: {
        backgroundColor: '#fff5f5',
        padding: 10,
        borderRadius: 6,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#feb2b2'
    },
    errorText: { color: '#c53030', fontSize: 13, textAlign: 'center' },
    payBtn: {
        backgroundColor: '#FF3366',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    disabledBtn: { opacity: 0.6 },
    payText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    footer: { marginTop: 15, alignItems: 'center' },
    footerText: { color: '#a0aec0', fontSize: 12 }
});