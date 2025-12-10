// [File] app/index.js

import { Redirect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native'; // Thêm Text
import { useAuth } from '../context/AuthContext';

export default function AppEntry() {
  const { user, loading } = useAuth();

  // ===== DEBUGGING LOG =====
  console.log("--- [app/index.js] RUNNING ---");
  console.log("Loading Status:", loading);
  console.log("User Object:", JSON.stringify(user)); // Print user
  // ==========================

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text>Checking Auth...</Text>
      </View>
    );
  }

  if (!user) {
    console.log("--- [app/index.js] ---");
    console.log("User = NULL -> Redirect to /login");
    return <Redirect href="/login" />;
  }

  console.log("--- [app/index.js] ---");
  console.log("User = EXIST -> Redirect to /tabs");
  return <Redirect href="/tabs" />;
}
