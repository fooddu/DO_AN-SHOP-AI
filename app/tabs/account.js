// [File] app/tabs/account.js

import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router'; // Import Redirect
import {
    ActivityIndicator // Import
    ,

    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// 1. Import useAuth
import { useAuth } from '../../context/AuthContext';

// Định nghĩa màu sắc
const COLORS = {
  text: '#222',
  muted: '#888',
  bg: '#ffffff', 
  cardBackground: '#fff', 
  borderColor: '#E8E8E8',
  shadow: '#000',
};

// Component CARD (THẺ)
const ProfileMenuItemCard = ({ title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.cardTextContainer}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
  </TouchableOpacity>
);


export default function AccountScreen() {
  const router = useRouter(); 
  
  // 2. Lấy user thật và hàm logout từ Context
  // (Chúng ta cũng lấy 'loading' để đề phòng)
  const { user, logout, loading } = useAuth();

  // (Các hàm điều hướng)
  const goToOrders = () => router.push('/orders');
  const goToShippingAddresses = () => console.log('Go to Shipping');
  const goToPaymentMethod = () => console.log('Go to Payment');
  const goToEditInformation = () => router.push('/edit-profile');
  
  // 3. Xử lý khi user chưa kịp load
  if (loading) {
      return (
        <SafeAreaView style={[styles.safeArea, {justifyContent: 'center', alignItems: 'center'}]}>
          <ActivityIndicator size="large" />
        </SafeAreaView>
      );
  }
  
  // 4. Nếu (vì lý do nào đó) không có user, quay về login
  // (Đây là lớp bảo vệ thứ 2, sau file _layout)
  if (!user) {
      return <Redirect href="/login" />;
  }
  
  // (Ảnh avatar mẫu, vì user của bạn chưa có avatar)
  const userAvatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto.format&fit.crop';

  return (
    <SafeAreaView style={styles.safeArea}>
        
      {/* 5. NÚT DEBUG MÀU ĐỎ ĐÃ BỊ XÓA */}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconLeft}>
          <Ionicons name="search-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        
        {/* 6. NÚT LOGOUT ĐÃ KẾT NỐI VỚI HÀM LOGOUT */}
        <TouchableOpacity style={styles.headerIconRight} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Dùng ScrollView */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Profile Info - HIỂN THỊ USER THẬT */}
        <View style={styles.profileInfoContainer}>
          <Image source={{ uri: user.avatar || userAvatar }} style={styles.avatar} />
          <View style={styles.userInfo}>
            {/* 7. Hiển thị tên và email thật từ Context */}
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text> 
          </View>
        </View>

        {/* 4 Card Menu */}
        <ProfileMenuItemCard
          title="My orders"
          subtitle="Already have 10 orders"
          onPress={goToOrders}
        />
        <ProfileMenuItemCard
          title="Shipping Addresses"
          subtitle="03 Addresses"
          onPress={goToShippingAddresses}
        />
        <ProfileMenuItemCard
          title="Payment Method"
          subtitle="You have 2 cards"
          onPress={goToPaymentMethod}
        />
        <ProfileMenuItemCard
          title="Edit Infomation"
          subtitle="Notification, Password, FAQ, Contact"
          onPress={goToEditInformation}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

// Styles (Giữ nguyên)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContainer: {
    paddingHorizontal: 16, 
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.cardBackground, 
  },
  headerIconLeft: { width: 24 },
  headerIconRight: { padding: 2 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.bg, 
    marginBottom: 10, 
    paddingHorizontal: 4, 
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    backgroundColor: COLORS.borderColor,
  },
  userInfo: { flex: 1 },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.muted,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    padding: 20,
    marginBottom: 15, 
    elevation: 3, 
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
  },
});