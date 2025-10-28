import { StyleSheet, Text, View } from 'react-native';

export default function Notifications() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông báo</Text>
      <Text style={{ marginTop: 10, color: '#666' }}>Chưa có thông báo nào</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '700' },
});
