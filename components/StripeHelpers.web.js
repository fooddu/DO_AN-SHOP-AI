
// Dummy Provider for Web
export const StripeProvider = ({ children }) => <>{children}</>;

// Dummy Hook for Web
export const useStripe = () => ({
    initPaymentSheet: async () => ({ error: null }),
    presentPaymentSheet: async () => ({ error: null }),
    confirmPayment: async () => ({ error: null }),
});
