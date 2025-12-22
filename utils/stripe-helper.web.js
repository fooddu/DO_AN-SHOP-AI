// File: utils/stripe-helper.web.js


// Mock Provider: Trả về children để app không bị crash
export const StripeProvider = ({ children }) => <>{children}</>;

// Mock Hook: Trả về các hàm rỗng
export const useStripe = () => {
    return {
        initPaymentSheet: async () => ({ error: null }),
        presentPaymentSheet: async () => ({ error: null }),
        confirmPayment: async () => ({ error: null }),
        handleURLCallback: async () => ({ error: null }),
    };
};