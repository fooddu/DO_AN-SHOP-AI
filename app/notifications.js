import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function Notifications() {
  const API_URL = 'http://localhost:5000/api'; // 🔁 Thay bằng API thật của bạn

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Hàm gọi API
  const fetchNotifications = async () => {
    try {
      setError(null);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Lỗi khi tải dữ liệu');
      const data = await response.json();
      setNotifications(data); // 👈 dữ liệu từ API
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Chạy khi mở trang
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Kéo để refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // Đang tải
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={{ marginTop: 10 }}>Đang tải thông báo...</Text>
      </View>
    );
  }

  // Lỗi
  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={60} color="red" />
        <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>
      </View>
    );
  }

  // Không có dữ liệu
  if (notifications.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
      </View>
    );
  }

  // Hiển thị danh sách
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Thông báo</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Ionicons name={item.icon || 'notifications'} size={28} color="#E91E63" style={styles.icon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title || 'Không có tiêu đề'}</Text>
              <Text style={styles.time}>{item.time || 'Vừa xong'}</Text>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#222',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  time: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  emptyText: {
    marginTop: 10,
    color: '#888',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
