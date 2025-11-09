// [File] app/index.js

import { Redirect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native'; // Thêm Text
import { useAuth } from '../context/AuthContext';

export default function AppEntry() {
  const { user, loading } = useAuth(); 

  // ===== DEBUGGING LOG =====
  console.log("--- [app/index.js] ĐANG CHẠY ---");
  console.log("Trạng thái Loading:", loading);
  console.log("Đối tượng User:", JSON.stringify(user)); // In ra user
  // ==========================

  if (loading) { 
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text>Đang kiểm tra Auth...</Text>
      </View>
    );
  }

  if (!user) {
    console.log("--- [app/index.js] ---");
    console.log("User = NULL -> Chuyển đến /login");
    return <Redirect href="/login" />;
  }

  console.log("--- [app/index.js] ---");
  console.log("User = TỒN TẠI -> Chuyển đến /tabs");
  return <Redirect href="/tabs" />;
}