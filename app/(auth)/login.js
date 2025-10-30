import { router } from 'expo-router'; // Import router để điều hướng
import { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext'; // Import hook Auth (fixed for route)

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); // Lấy hàm login từ context

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }
    // Gọi hàm login từ AuthContext
    const success = await login(email, password);
    if (success) {
      Alert.alert('Thành công', 'Đăng nhập thành công!');
      // Điều hướng người dùng về Trang Chủ (thay thế màn hình login)
      router.replace('/'); 
    } else {
      Alert.alert('Thất bại', 'Email hoặc mật khẩu không đúng.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry // Ẩn mật khẩu
      />
      <Button title="Đăng Nhập" onPress={handleLogin} />
      <View style={{ height: 16 }} />
      <Button title="Đăng Ký" onPress={() => router.push('/(auth)/register')} />
      <View style={{ height: 8 }} />
      <Button title="Quên mật khẩu?" onPress={() => router.push('/(auth)/forgot')} />
    </View>
  );
}

// --- CSS/Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 44,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
});

