import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);

    const updateCartCount = async () => {
        try {
            const raw = await AsyncStorage.getItem('cart');
            const cart = raw ? JSON.parse(raw) : [];
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(totalItems);
        } catch (error) {
            console.error('Error reading cart:', error);
            setCartCount(0);
        }
    };

    useEffect(() => {
        updateCartCount();
        // Poll cart every 2 seconds to catch updates
        const interval = setInterval(updateCartCount, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <CartContext.Provider value={{ cartCount, updateCartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};
