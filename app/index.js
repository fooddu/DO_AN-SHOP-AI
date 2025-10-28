import { Link } from 'expo-router'; // 1. IMPORT LINK
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trang Chủ</Text>
      
      {/* 2. THÊM NÚT NÀY ĐỂ TEST */}
      <Link href="/favorites" style={styles.linkButton}>
        <Text style={styles.linkText}>Đi đến Trang Yêu thích</Text>
      </Link>

      {/* Bạn cũng có thể thêm link test trang Login */}
      <Link href="/login" style={styles.linkButton}>
        <Text style={styles.linkText}>Đi đến Trang Đăng nhập</Text>
      </Link>
    </View>
  );
}

// --- CSS/Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  linkButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 16,
  }
});