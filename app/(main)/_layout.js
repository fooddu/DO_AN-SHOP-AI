import { Stack } from 'expo-router';

export default function MainScreensLayout() {
    return (
        <Stack>
            {/* Các màn hình chính đã có file */}
            <Stack.Screen name="account-settings" options={{ title: 'Edit Profile', headerShown: false }} />
            <Stack.Screen name="add-address-form" options={{ title: 'Add New Address', headerShown: false }} />
            <Stack.Screen name="cart" options={{ title: 'Your Cart', headerShown: false }} />
            <Stack.Screen name="checkout" options={{ presentation: 'modal', headerShown: false }} /> 
            <Stack.Screen name="order-success" options={{ headerShown: false }} /> 
            <Stack.Screen name="orders" options={{ title: 'My Orders', headerShown: false }} />
            <Stack.Screen name="shipping-addresses" options={{ title: 'Shipping Addresses', headerShown: false }} />
            <Stack.Screen name="payment" options={{ title: 'Payment', headerShown: false }} />

            {/* ⚠️ TẠM THỜI COMMENT CÁC DÒNG DƯỚI NẾU CHƯA TẠO FILE [id].js 
               Để tránh lỗi: No route named "orders/[id]" exists
            */}
             <Stack.Screen name="orders/[id]" options={{ title: 'Order Details', headerShown: false }} />
            <Stack.Screen name="products/[id]" options={{ title: 'Product Details', headerShown: false }} />
            
        </Stack>
    );
}