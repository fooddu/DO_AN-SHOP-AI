
// Try to import Stripe, but don't crash if it's not available (Expo Go)
let StripeProviderNative;
let useStripeNative;

try {
    const StripeModule = require('@stripe/stripe-react-native');
    StripeProviderNative = StripeModule.StripeProvider;
    useStripeNative = StripeModule.useStripe;
} catch (error) {
    // Stripe not available - running in Expo Go
    console.warn('Stripe native module not available. Running in Expo Go or Web.');
}

// Mock StripeProvider for Expo Go
const MockStripeProvider = ({ children }) => <>{children}</>;

// Mock useStripe hook for Expo Go  
const mockUseStripe = () => ({
    initPaymentSheet: async () => ({ error: null }),
    presentPaymentSheet: async () => ({ error: null })
});

// Export the appropriate version
export const StripeProvider = StripeProviderNative || MockStripeProvider;
export const useStripe = useStripeNative || mockUseStripe;
