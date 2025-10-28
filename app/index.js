// File: app/index.tsx (hoặc HomeScreen.tsx)

import { Link } from 'expo-router'; // 1. Lấy import 'Link' từ nhánh HEAD
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* 2. Lấy nội dung component từ HEAD (vì có title + links) */}
      <Text style={styles.title}>Trang Chủ</Text>
      
      {/* Link đến trang Yêu thích */}
      <Link href="/favorites" style={styles.linkButton}>
        <Text style={styles.linkText}>Đi đến Trang Yêu thích</Text>
      </Link>

      {/* 3. CẬP NHẬT: 
        Sử dụng link '/(auth)/login' thay vì '/login' 
        để nhất quán với file _layout.tsx bạn vừa sửa
      */}
      <Link href="/(auth)/login" style={styles.linkButton}>
        <Text style={styles.linkText}>Đi đến Trang Đăng nhập</Text>
      </Link>
    </View>
  );
}

// --- 4. Gộp Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16, // Lấy từ HEAD
    backgroundColor: '#fff', // Lấy từ main
  },
  // Lấy các style còn lại từ HEAD (title, linkButton, linkText)
  // vì chúng hỗ trợ cho các <Link> ở trên
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  linkButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF', // Màu xanh dương cho nút
    borderRadius: 8,
  },
  linkText: {
    color: '#FFFFFF', // Chữ trắng
    fontSize: 16,
  }
});