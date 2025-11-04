// File: screens/LoginScreen.js (NỘI DUNG ĐÚNG)

import { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, View } from 'react-native';
// ĐÃ SỬA: Import đúng context
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() { // <--- Chỉ có 1 export default ở đây
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); 

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    const success = await login(email, password);

    if (!success) {
      Alert.alert('Thất bại', 'Email hoặc mật khẩu không đúng.');
    }
    // Không cần router.replace ở đây, _layout.js sẽ tự xử lý
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
        secureTextEntry 
      />
      <Button title="Đăng Nhập" onPress={handleLogin} />
    </View>
  );
}

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