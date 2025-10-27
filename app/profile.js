import { View, Text } from 'react-native';
import LoginSceen from '../screens/LoginScreen';

export default function Profile() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Trang cá nhân</Text>
      <LoginSceen />
    </View>
  );
}
