// [File] app/account-settings.js (Màn hình chỉnh sửa thông tin)

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

// ⭐️ CẦN THAY THẾ BẰNG TOKEN JWT HỢP LỆ CỦA BẠN (Dùng cho Fetch)
const DEBUG_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MGExYTg3M2ZkZDdkMWMwYjI0MTIxNiIsImlhdCI6MTc2MjQ0MDk4NCwiZXhwIjoxNzY1MDMyOTg0fQ.Bo_-KiT9mN83HhwO-YB2A0s9aE8SiDnXylKSrl3OA9M";

const COLORS = {
    primary: '#E91E63',
    text: '#222',
    muted: '#888',
    bg: '#ffffff',
    inputBg: '#f6f6f6',
};

// ⭐️ HÀM UPLOAD ẢNH (Dùng Fetch API và Port 5001)
const uploadImageToServer = async (uri, userId, mimeType) => {
    
    const ext = mimeType.split('/')[1] || 'jpg';
    const filename = `avatar-${userId}-${Date.now()}.${ext}`;
    const formData = new FormData();
    
    let fileToUpload; 

    // Logic Chuẩn hóa đa nền tảng
    if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        fileToUpload = new File([blob], filename, { type: mimeType });
    } else {
        const fileUri = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
        fileToUpload = { 
            uri: fileUri, 
            name: filename, 
            type: mimeType, 
        };
    }

    formData.append('avatar', fileToUpload);

    try {
        // ⭐️ SỬ DỤNG PORT 5001
        const response = await fetch('http://localhost:5001/api/upload/avatar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DEBUG_TOKEN}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (response.status !== 200) {
            throw new Error(data.message || `Lỗi tải ảnh lên. Status: ${response.status}`);
        }
        
        return data.url; 

    } catch (error) {
        console.error('Lỗi Upload ảnh (Frontend):', error.message);
        throw new Error(error.message || 'Lỗi kết nối hoặc xử lý response.');
    }
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

    
    // ⭐️ HÀM CẬP NHẬT PROFILE (SỬ DỤNG Fetch/Axios và Port 5001)
    const handleUpdateProfile = async (newAvatarUrl = avatar) => {
        if (!name || !email) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ Tên và Email.');
            return;
        }

        if (loading === false) { 
            setLoading(true);
        }

        try {
            const updatedData = { name, email, phone, address, avatar: newAvatarUrl }; 
            
            // ⭐️ SỬ DỤNG PORT 5001 CHO CẬP NHẬT PROFILE
            const response = await fetch(`http://localhost:5001/api/users/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEBUG_TOKEN}`, 
                },
                body: JSON.stringify(updatedData),
            });
            
            const data = await response.json();

            if (data.success) {
                updateUser(data.data); 
                
                if (loading === false || newAvatarUrl === avatar) { 
                     Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật.');
                }
                
            } else {
                Alert.alert('Lỗi', data.message || 'Cập nhật thất bại.');
            }

        } catch (error) {
            console.error('Lỗi cập nhật profile:', error.message);
            Alert.alert('Lỗi', 'Không thể kết nối tới server hoặc lỗi response.');
        } finally {
            if (newAvatarUrl === avatar) {
                 setLoading(false);
            }
        }
    };
    
    // ⭐️ HÀM XỬ LÝ CHỌN ẢNH
    const handleChoosePhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh để chọn ảnh.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, 
            aspect: [1, 1],       
            quality: 0.5,         
        });

        if (!result.canceled) {
            const asset = result.assets[0]; 
            setLoading(true);
            try {
                // 3. Upload ảnh lên server (dùng hàm đã sửa)
                const newAvatarUrl = await uploadImageToServer(asset.uri, user._id, asset.mimeType);

                // 4. Cập nhật URL ảnh mới cục bộ và gọi hàm lưu Profile chính
                setAvatar(newAvatarUrl); 
                
                await handleUpdateProfile(newAvatarUrl);
                
                Alert.alert('Thành công', 'Ảnh đại diện đã được cập nhật.');

            } catch (error) {
                Alert.alert('Lỗi', error.message || 'Không thể tải ảnh lên server.');
            } finally {
                setLoading(false);
            }
        }
    };


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
                    {/* SỬA: BẤM VÀO SẼ CHỌN ẢNH */}
                    <TouchableOpacity onPress={handleChoosePhoto}>
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
                    onPress={() => handleUpdateProfile()} 
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