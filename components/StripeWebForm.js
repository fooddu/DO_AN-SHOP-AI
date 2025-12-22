import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StripeWebForm({ onSuccess, amount, isProcessing }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  const isLoading = localLoading || isProcessing;

  const handleSubmit = async (event) => {
    // Chặn sự kiện submit form mặc định của web
    if (event) event.preventDefault();

    if (!stripe || !elements || isLoading) return;

    setLocalLoading(true);
    setErrorMessage(null);

    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setErrorMessage(error.message);
        setLocalLoading(false);
      } else {
        onSuccess(paymentMethod.id);
      }
    } catch (err) {
      setErrorMessage("Lỗi hệ thống. Vui lòng thử lại.");
      setLocalLoading(false);
    }
  };

  // --- CẤU HÌNH GIAO DIỆN WEB ---
  // Style này sẽ được inject thẳng vào trong Iframe của Stripe
  const cardStyle = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4"
        },
        // Quan trọng: Line height giúp input có độ cao tự nhiên
        lineHeight: "40px" 
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a"
      }
    },
    hidePostalCode: true,
  };

  return (
    <View style={styles.container}>
      {/* THAY ĐỔI QUAN TRỌNG:
        Chúng ta bọc CardElement trong một View có style giống hệt thẻ div thông thường.
        Bỏ hết flexbox phức tạp.
      */}
      <View style={styles.cardWrapper}>
        <CardElement options={cardStyle} />
      </View>

      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading}
        style={[styles.button, isLoading && styles.buttonDisabled]}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>THANH TOÁN ${amount}</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.secureBadge}>
         <Text style={{color: '#888', fontSize: 12}}>🔒 Secured by Stripe</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    // Không dùng alignItems: 'center' ở đây vì nó sẽ bóp chiều ngang của con
  },
  cardWrapper: {
    // Giả lập một ô Input chuẩn của Web
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e6ebf1',
    borderRadius: 6,
    marginBottom: 20,
    
    // Đảm bảo chiều cao tối thiểu để iframe không bị che
    minHeight: 50, 
    justifyContent: 'center', // Căn giữa nội dung iframe theo chiều dọc
    
    // Shadow nhẹ cho giống input hiện đại
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  button: {
    backgroundColor: "#5469d4",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5469d4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
    backgroundColor: "#7a8be6",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#ffebeb',
    borderRadius: 4,
  },
  errorText: {
    color: '#cd3d64',
    fontSize: 14,
  },
  secureBadge: {
    marginTop: 15,
    alignItems: 'center'
  }
});