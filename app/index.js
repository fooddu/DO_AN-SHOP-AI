import { StyleSheet, View } from 'react-native';
import HomeScreen from '../screens/HomeScreen';

export default function Index() {
  return (
    <View style={styles.container}>
      <HomeScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
    