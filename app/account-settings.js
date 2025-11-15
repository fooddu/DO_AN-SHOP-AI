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

// Giả định bạn có một hàm lấy Base URL động (từ axiosConfig.js hoặc tương tự)
const getBaseUrl = () => {
    // ⚠️ QUAN TRỌNG: SỬ DỤNG IP CỤC BỘ VÀ PORT
    const LOCAL_IP = '192.168.1.2'; 
    const LOCAL_PORT = 4000;
    
    if (Platform.OS === 'web') {
        return `http://localhost:${LOCAL_PORT}`;
    }
    // Dùng IP cục bộ cho Native
    return `http://${LOCAL_IP}:${LOCAL_PORT}`; 
};

// ⭐️ TOKEN: Cần lấy token từ AuthContext, không dùng biến cứng (DEBUG_TOKEN)
const DEBUG_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MGExYTg3M2ZkZDdkMWMwYjI0MTIxNiIsImlhdCI6MTc2MjQ0MDk4NCwiZXhwIjoxNzY1MDMyOTg0fQ.Bo_-KiT9mN83HhwO-YB2A0s9aE8SiDnXylKSrl3OA9M";

const COLORS = {
    primary: '#E91E63',
    text: '#222',
    muted: '#888',
    bg: '#ffffff',
    inputBg: '#f6f6f6',
};

// ⭐️ HÀM UPLOAD ẢNH (Đã fix logic URL kép)
const uploadImageToServer = async (uri, userId, mimeType, token) => {
    
    const ext = mimeType.split('/')[1] || 'jpg';
    const filename = `avatar-${userId}-${Date.now()}.${ext}`;
    const formData = new FormData();
    const serverBaseUrl = getBaseUrl(); 
    
    let fileToUpload; 

    // Logic Chuẩn hóa đa nền tảng
    if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        fileToUpload = new File([blob], filename, { type: mimeType });
    } else {
        fileToUpload = { 
            uri: uri, 
            name: filename, 
            type: mimeType, 
        };
    }

    formData.append('avatar', fileToUpload);

    try {
        const response = await fetch(`${serverBaseUrl}/api/upload/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, // Sử dụng token truyền vào
            },
            body: formData,
        });

        const data = await response.json();

        if (response.status !== 200 || !data.success) {
            throw new Error(data.message || `Lỗi tải ảnh lên. Status: ${response.status}`);
        }
        
        // ⭐️ FIX LỖI GHÉP URL KÉP: Kiểm tra nếu URL đã tuyệt đối (chứa http/https)
        const serverReturnedUrl = data.url;
        
        if (serverReturnedUrl.startsWith('http://') || serverReturnedUrl.startsWith('https://')) {
            // Server đã trả về URL tuyệt đối (Vd: Ngrok URL), DÙNG LUÔN
            return serverReturnedUrl; 
        }

        // Nếu Server chỉ trả về URL tương đối (Vd: /uploads/avatars/...)
        return `${serverBaseUrl}${serverReturnedUrl}`; 

    } catch (error) {
        console.error('Lỗi Upload ảnh (Frontend):', error.message);
        throw new Error(error.message || 'Lỗi kết nối hoặc xử lý response.');
    }
};

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, token: userToken, updateUser } = useAuth(); // Lấy token từ AuthContext 

    const defaultAvatarUrl = 'https://i.pravatar.cc/150';

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || ''); 
    const [address, setAddress] = useState(user?.address || ''); 
    const [avatar, setAvatar] = useState(user?.avatar || defaultAvatarUrl); 
    const [loading, setLoading] = useState(false);

    
    // ⭐️ HÀM CẬP NHẬT PROFILE (Sử dụng Fetch)
    const handleUpdateProfile = async (newAvatarUrl = avatar) => {
        if (!name || !email) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ Tên và Email.');
            return;
        }

        const currentToken = userToken || DEBUG_TOKEN; // Dùng token thực tế

        if (loading === false) { 
            setLoading(true);
        }

        try {
            const updatedData = { name, email, phone, address, avatar: newAvatarUrl }; 
            const serverBaseUrl = getBaseUrl();
            
            // ⭐️ CẬP NHẬT PROFILE
            const response = await fetch(`${serverBaseUrl}/api/users/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`, 
                },
                body: JSON.stringify(updatedData),
            });
            
            const data = await response.json();

            if (data.success) {
                // Cập nhật Context với dữ liệu người dùng mới nhất
                updateUser(data.data); 
                Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật.');
            } else {
                Alert.alert('Lỗi', data.message || 'Cập nhật thất bại.');
            }

        } catch (error) {
            console.error('Lỗi cập nhật profile:', error.message);
            Alert.alert('Lỗi', 'Không thể kết nối tới server hoặc lỗi response.');
        } finally {
            setLoading(false);
        }
    };
    
    // ⭐️ HÀM XỬ LÝ CHỌN VÀ UPLOAD ẢNH (Đã fix lỗi Type triệt để)
    const handleChoosePhoto = async () => {
        // ⭐️ LOG 1: Xác nhận nút click đã hoạt động
        console.log("DEBUG UPLOAD: Bắt đầu quá trình chọn ảnh..."); 
        
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh để chọn ảnh.');
            return;
        }

        // ⭐️ FIX LỖI TYPE ERROR: Đảm bảo mediaTypes là MẢNG chứa giá trị hợp lệ.
        const mediaTypeConfig = (ImagePicker.MediaType && ImagePicker.MediaType.Images !== undefined)
            ? [ImagePicker.MediaType.Images]
            : [1]; // 1 là giá trị nội bộ (enum value) cho Images
        
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: mediaTypeConfig, 
            allowsEditing: true, 
            aspect: [1, 1], 
            quality: 0.5, 
        });

        if (!result.canceled) {
            const asset = result.assets[0]; 
            // ⭐️ LOG 2: Xác nhận ảnh đã được chọn và có URI
            console.log("DEBUG UPLOAD: Ảnh được chọn, URI:", asset.uri);
            
            setLoading(true);
            const currentToken = userToken || DEBUG_TOKEN;

            try {
                // 3. Upload ảnh lên server
                const newAvatarUrl = await uploadImageToServer(asset.uri, user._id, asset.mimeType, currentToken);
                
                // 4. Cập nhật URL ảnh mới cục bộ và gọi hàm lưu Profile chính
                setAvatar(newAvatarUrl); // Cập nhật UI ngay lập lập tức
                
                // Lưu URL ảnh mới vào database cùng với thông tin profile
                await handleUpdateProfile(newAvatarUrl);
                
            } catch (error) {
                Alert.alert('Lỗi', error.message || 'Không thể tải ảnh lên server.');
            } finally {
                setLoading(false);
            }
        }
    };


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
                
                {/* Ảnh đại diện */}
                <View style={styles.avatarContainer}>
                    <Image 
                        source={{ uri: avatar }} 
                        style={styles.avatar} 
                        resizeMode="cover"
                    />
                    <TouchableOpacity onPress={handleChoosePhoto} disabled={loading}>
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