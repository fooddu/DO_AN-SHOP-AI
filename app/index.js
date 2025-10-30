// File: app/index.js (Đã gộp - làm "Người gác cổng")
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext'; // Sửa lại đường dẫn nếu cần

export default function StartPage() {
  // Lấy 'user' và 'loading' từ AuthContext
  const { user, loading } = useAuth(); 

  // 1. Hiển thị màn hình chờ trong khi Context đang kiểm tra
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 2. Nếu không có user -> Tự động chuyển đến Login
  if (!user) {
    return <Redirect href="/(auth)/login" />; 
  }

  // 3. Nếu có user -> Tự động chuyển đến Trang chủ thật
  return <Redirect href="/home" />;
}