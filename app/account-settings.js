import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { useAuth } from '../../DO_AN-SHOP-AI/context/AuthContext';

const COLORS = {
    primary: '#E91E63',
    text: '#222',
    muted: '#888',
    bg: '#ffffff',
    inputBg: '#f6f6f6',
};

// -----------------------
// Upload Ảnh
// -----------------------
const uploadImageToServer = async (uri, userId, mimeType, token) => {
    const ext = (mimeType?.split('/')[1]) || 'jpg';
    const filename = `avatar-${userId}-${Date.now()}.${ext}`;
    const formData = new FormData();

    let fileToUpload;

    if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        fileToUpload = new File([blob], filename, { type: mimeType || 'image/jpeg' });
    } else {
        const fileUri = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
        fileToUpload = { uri: fileUri, name: filename, type: mimeType || 'image/jpeg' };
    }

    formData.append('avatar', fileToUpload);

    try {
        const response = await fetch('http://192.168.1.100:5000/api/upload/avatar', { // <-- Thay IP máy tính của bạn
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Upload thất bại. Status: ${response.status}`);
        }

        return data.url;
    } catch (error) {
        console.log('Upload error:', error);
        throw error;
    }
};

// -----------------------
// EditProfileScreen
// -----------------------
export default function EditProfileScreen() {
    const router = useRouter();
    const { user, token, updateUser } = useAuth();

    const defaultAvatarUrl = 'https://i.pravatar.cc/150';

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.address || '');
    const [avatar, setAvatar] = useState(user?.avatar || defaultAvatarUrl);
    const [loading, setLoading] = useState(false);

    if (!user) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    // -----------------------
    // Cập nhật profile
    // -----------------------
    const handleUpdateProfile = async (newAvatarUrl = avatar) => {
        if (!token) {
            Alert.alert('Lỗi', 'Token chưa có.');
            return;
        }

        if (!name || !email) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ Tên và Email.');
            return;
        }

        setLoading(true);

        const updatedData = { name, email, phone, address, avatar: newAvatarUrl };
        console.log('Sending update to server:', updatedData);

        try {
            const response = await fetch(`http://192.168.1.100:5000/api/users/${user.id}`, { // <-- dùng user.id
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updatedData),
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (response.ok) {
                updateUser(data.data); // cập nhật context
                Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật.');
            } else {
                Alert.alert('Lỗi', data.message || 'Cập nhật thất bại.');
            }
        } catch (error) {
            console.log('Update profile error:', error);
            Alert.alert('Lỗi', 'Không thể kết nối tới server.');
        } finally {
            setLoading(false);
        }
    };

    // -----------------------
    // Chọn ảnh
    // -----------------------
    const handleChoosePhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh để chọn ảnh.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            setLoading(true);
            try {
                const newAvatarUrl = await uploadImageToServer(asset.uri, user.id, asset.mimeType, token);
                setAvatar(newAvatarUrl);
                await handleUpdateProfile(newAvatarUrl);
            } catch (error) {
                Alert.alert('Lỗi', error.message || 'Không thể tải ảnh lên server.');
            } finally {
                setLoading(false);
            }
        }
    };

    // -----------------------
    // Render
    // -----------------------
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chỉnh sửa Thông tin</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: avatar }} style={styles.avatar} resizeMode="cover" />
                    <TouchableOpacity onPress={handleChoosePhoto}>
                        <Text style={styles.changeAvatarText}>Đổi ảnh</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Họ và Tên</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Nhập họ và tên"
                    autoCapitalize="words"
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Nhập địa chỉ email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Nhập số điện thoại"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Địa chỉ</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Nhập địa chỉ giao hàng chi tiết"
                    autoCapitalize="sentences"
                    multiline
                    numberOfLines={2}
                />

                <TouchableOpacity style={styles.saveButton} onPress={() => handleUpdateProfile()} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>LƯU THAY ĐỔI</Text>}
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Bảo mật</Text>
                <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/change-password')}>
                    <Text style={styles.optionText}>Đổi mật khẩu</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// ---------------------------
// Styles
// ---------------------------
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    headerBtn: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
    container: { padding: 20 },
    avatarContainer: { alignItems: 'center', marginBottom: 30 },
    avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10, borderWidth: 2, borderColor: COLORS.inputBg },
    changeAvatarText: { color: COLORS.primary, fontSize: 14, fontWeight: '500' },
    label: { fontSize: 14, color: COLORS.muted, marginBottom: 8, marginTop: 15, fontWeight: '500' },
    input: { backgroundColor: COLORS.inputBg, height: 50, borderRadius: 8, paddingHorizontal: 15, fontSize: 16, color: COLORS.text, marginBottom: 10 },
    multilineInput: { height: 80, paddingTop: 15, paddingBottom: 15, textAlignVertical: 'top' },
    saveButton: { backgroundColor: COLORS.primary, height: 50, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 40, marginBottom: 10 },
    optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.inputBg, padding: 15, borderRadius: 8, marginTop: 5 },
    optionText: { fontSize: 16, color: COLORS.text }
});
