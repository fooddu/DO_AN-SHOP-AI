// [File] app/account-settings.js (Màn hình chỉnh sửa thông tin)

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';


import client from '../api/client';

import { useAuth } from '../context/AuthContext';

// Bảng màu cơ bản
const COLORS = {
    primary: '#E91E63', // pink
    text: '#222',
    muted: '#888',
    bg: '#ffffff',
    inputBg: '#f6f6f6',
};

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, updateUser } = useAuth(); 

    const defaultAvatarUrl = 'https://i.pravatar.cc/150';

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || ''); 
    const [address, setAddress] = useState(user?.address || ''); 
    const [avatar, setAvatar] = useState(user?.avatar || defaultAvatarUrl); 
    const [loading, setLoading] = useState(false);

    // Hàm xử lý cập nhật thông tin người dùng
    const handleUpdateProfile = async () => {
        if (!name || !email) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ Tên và Email.');
            return;
        }

        setLoading(true);
        try {
            const updatedData = { name, email, phone, address, avatar }; 
            
            const response = await client.put(`/users/${user._id}`, updatedData);
            
            if (response.data.success) {
                updateUser(response.data.data); 
                Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật.');
            } else {
                Alert.alert('Lỗi', response.data.message || 'Cập nhật thất bại.');
            }

        } catch (error) {
            console.error('Lỗi cập nhật profile:', error.response?.data || error.message);
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể kết nối tới server.');
        } finally {
            setLoading(false);
        }
    };

    // Hàm giả định xử lý chọn ảnh (Bạn cần thay thế bằng ImagePicker thực tế)
    const handleChangeAvatar = () => {
        Alert.alert(
            "Đổi ảnh đại diện",
            "Tính năng chọn/upload ảnh chưa được tích hợp.",
            [
                { text: "Hủy" },
                { 
                    text: "Đặt ảnh mẫu mới", 
                    onPress: () => setAvatar('https://i.pravatar.cc/150?img=42') 
                }
            ]
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header tùy chỉnh */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chỉnh sửa Thông tin</Text>
                <View style={styles.headerBtn} /> 
            </View>
            
            <ScrollView contentContainerStyle={styles.container}>
                
                {/* Ảnh đại diện */}
                <View style={styles.avatarContainer}>
                    <Image 
                        source={{ uri: avatar }} 
                        style={styles.avatar} 
                        resizeMode="cover"
                    />
                    <TouchableOpacity onPress={handleChangeAvatar}>
                        <Text style={styles.changeAvatarText}>Đổi ảnh</Text>
                    </TouchableOpacity>
                </View>

                {/* Trường Tên */}
                <Text style={styles.label}>Họ và Tên</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Nhập họ và tên"
                    autoCapitalize="words"
                />

                {/* Trường Email */}
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Nhập địa chỉ email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                
                {/* Trường Số điện thoại */}
                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Nhập số điện thoại"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                />
                
                {/* Trường Địa chỉ */}
                <Text style={styles.label}>Địa chỉ</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]} 
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Nhập địa chỉ giao hàng chi tiết"
                    autoCapitalize="sentences"
                    multiline={true} 
                    numberOfLines={2}
                />

                {/* Nút Cập nhật */}
                <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleUpdateProfile}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>LƯU THAY ĐỔI</Text>
                    )}
                </TouchableOpacity>

                {/* Tùy chọn: Thay đổi Mật khẩu */}
                <Text style={styles.sectionTitle}>Bảo mật</Text>
                
                <TouchableOpacity 
                    style={styles.optionRow}
                    onPress={() => router.push('/change-password')} 
                >
                    <Text style={styles.optionText}>Đổi mật khẩu</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
                </TouchableOpacity>
                
            </ScrollView>
        </SafeAreaView>
    );
}

// ---------------------------
// STYLES (Giữ nguyên)
// ---------------------------
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerBtn: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
    
    container: {
        padding: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: COLORS.inputBg,
    },
    changeAvatarText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    label: {
        fontSize: 14,
        color: COLORS.muted,
        marginBottom: 8,
        marginTop: 15,
        fontWeight: '500',
    },
    input: {
        backgroundColor: COLORS.inputBg,
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        color: COLORS.text,
        marginBottom: 10,
    },
    multilineInput: {
        height: 80, 
        paddingTop: 15,
        paddingBottom: 15,
        textAlignVertical: 'top', 
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        height: 50,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 40,
        marginBottom: 10,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.inputBg,
        padding: 15,
        borderRadius: 8,
        marginTop: 5,
    },
    optionText: {
        fontSize: 16,
        color: COLORS.text,
    }
});