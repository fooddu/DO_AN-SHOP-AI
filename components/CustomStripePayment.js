import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
    primary: '#FF3366',
    white: '#ffffff',
    text: '#32325d',
    border: '#e6ebf1',
    error: '#fa755a',
};

// Tùy chỉnh style cho ô nhập thẻ của Stripe (CSS-in-JS object)
const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: COLORS.text,
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4',
            },
        },
        invalid: {
            color: COLORS.error,
            iconColor: COLORS.error,
        },
    },
    hidePostalCode: true, // Ẩn zip code nếu không cần
};

const CustomStripePayment = ({ amount, onSuccess, isProcessing }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async () => {
        if (!stripe || !elements) {
            // Stripe chưa load xong
            return;
        }

        // Lấy thông tin từ CardElement
        const cardElement = elements.getElement(CardElement);

        // Gọi API của Stripe để tạo Payment Method
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
                name: 'Customer Name', // Có thể lấy từ props nếu cần
            },
        });

        if (error) {
            console.log('[Stripe Error]', error);
            setErrorMessage(error.message);
        } else {
            setErrorMessage(null);
            // Gửi PaymentMethod ID về PaymentScreen để xử lý tiếp
            if (onSuccess) {
                onSuccess(paymentMethod.id);
            }
        }
    };

    return (
        <View style={styles.container}>
            {/* Vùng chứa input của Stripe */}
            <View style={styles.cardInputContainer}>
                {/* ⚠️ CardElement là component React Web, không phải React Native View */}
                <div style={styles.stripeInputWrapper}>
                    <CardElement options={CARD_ELEMENT_OPTIONS} onChange={() => setErrorMessage(null)} />
                </div>
            </View>

            {/* Hiển thị lỗi nếu có */}
            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

            {/* Nút thanh toán */}
            <TouchableOpacity 
                style={[styles.payButton, isProcessing && styles.payButtonDisabled]} 
                onPress={handleSubmit}
                disabled={isProcessing || !stripe}
            >
                {isProcessing ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.payButtonText}>PAY NOW ${amount}</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    cardInputContainer: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        backgroundColor: COLORS.white,
        padding: 15,
        marginBottom: 20,
    },
    // Style này dùng cho thẻ div bao quanh CardElement trên web
    stripeInputWrapper: {
        width: '100%',
    },
    errorText: {
        color: COLORS.error,
        fontSize: 13,
        marginBottom: 15,
        marginTop: -10,
    },
    payButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FF3366',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    payButtonDisabled: {
        opacity: 0.7,
        backgroundColor: '#ff8ca6',
    },
    payButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CustomStripePayment;