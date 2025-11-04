// [File] app/tabs/notifications.js

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Định nghĩa màu sắc
const COLORS = {
  text: '#222',
  muted: '#888',
  bg: '#ffffff',
  surface: '#f6f6f6', // Nền xám nhạt cho item "unread"
  green: '#27ae60', // Màu chữ "New"
  borderColor: '#E8E8E8',
};

// ======================================================
// Dữ liệu mẫu (Mock Data)
// ======================================================
const sampleNotifications = [
  {
    id: '1',
    title: 'Your order #123456789 has been confirmed',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Turpis pretium et in arcu adipiscing nec.',
    // (Đây là ảnh mẫu, bạn sẽ thay bằng ảnh sản phẩm thật)
    image: 'https://images.unsplash.com/photo-1596706268132-bk04235e197c?w=100', 
    isNew: true,
    read: false, // read: false sẽ có nền xám
  },
  {
    id: '2',
    title: 'Your order #123456789 has been canceled',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Turpis pretium et in arcu adipiscing nec.',
    // (Đây là ảnh mẫu, bạn sẽ thay bằng ảnh sản phẩm thật)
    image: 'https://images.unsplash.com/photo-1571455269707-38f3aff4447a?w=100', 
    isNew: false,
    read: true, // read: true sẽ có nền trắng
  },
];

// ======================================================
// Component cho từng hàng thông báo
// ======================================================
const NotificationItem = ({ item }) => (
  // Áp dụng style 'unreadItem' nếu item.read là false
  <View style={[styles.itemContainer, !item.read && styles.unreadItem]}>
    
    {/* Hình ảnh sản phẩm */}
    <Image source={{ uri: item.image }} style={styles.itemImage} />
    
    {/* Cụm text (title, description, tag) */}
    <View style={styles.itemTextContainer}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemDescription} numberOfLines={3}>{item.description}</Text>
      
      {/* Chỉ hiển thị tag "New" nếu item.isNew là true */}
      {item.isNew && (
        <Text style={styles.newTagText}>New</Text>
      )}
    </View>
  </View>
);

// ======================================================
// Component màn hình chính
// ======================================================
export default function NotificationScreen() {
  const [notifications, setNotifications] = useState(sampleNotifications);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="search-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <View style={styles.headerIcon} /> {/* View trống để căn giữa Title */}
      </View>

      {/* Danh sách thông báo */}
      <FlatList
        data={notifications}
        renderItem={({ item }) => <NotificationItem item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

// ======================================================
// Styles
// ======================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerIcon: {
    width: 24, // Dùng để căn giữa title
  },
  listContainer: {
    paddingTop: 0, // Danh sách bắt đầu ngay dưới header
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
    backgroundColor: COLORS.bg, // Nền trắng (mặc định)
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  unreadItem: {
    backgroundColor: COLORS.surface, // Nền xám nhạt cho "chưa đọc"
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#eee', // Nền cho ảnh
    resizeMode: 'contain', // Hiển thị vừa vặn sản phẩm
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
  },
  newTagText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.green,
    alignSelf: 'flex-end', // Đẩy chữ "New" sang phải
  },
});