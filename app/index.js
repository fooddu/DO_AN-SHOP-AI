// File: app/index.js (Fixed for new Public Flow)

import { Redirect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function AppEntry() {
    const { user, loading } = useAuth();
    
    // ===== DEBUGGING LOG (Giữ nguyên) =====
    console.log("--- [app/index.js] RUNNING (New Flow) ---");
    console.log("Loading Status:", loading);
    console.log("User Object:", JSON.stringify(user));
    // =======================================

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#E91E63" />
                <Text>Checking Auth...</Text>
            </View>
        );
    }
    
    console.log("--- [app/index.js] ---");
    console.log("Redirecting to /tabs (Public Home)");
    
    return <Redirect href="/(tabs)" />; 
}