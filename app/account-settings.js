// [File] app/account-settings.js (Màn hình chỉnh sửa thông tin)

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { useAuth } from '../../DO_AN-SHOP-AI/context/AuthContext'; // Thay thế đường dẫn nếu cần

// ---------------------------
// HÀM HỖ TRỢ VÀ CONFIG
// ---------------------------

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Hàm getBaseUrl (Xác định Base URL của Server)
const getBaseUrl = (useLocal = true) => {
    const LOCAL_IP = '192.168.1.2'; // ⭐️ THAY THẾ BẰNG IP CỦA SERVER NODE.JS CỦA BẠN ⭐️
    const LOCAL_PORT = 4000;
    
    if (Platform.OS === 'web' && useLocal) {
        return `http://localhost:${LOCAL_PORT}`;
    }
    return `http://${LOCAL_IP}:${LOCAL_PORT}`;
};

const COLORS = {
    primary: '#E91E63',    text: '#222',     muted: '#666',     bg: '#ffffff',     
    inputBg: '#f6f6f6', error: '#d32f2f', success: '#4CAF50', border: '#e0e0e0',
};

// Hàm uploadImageToServer (Giữ nguyên debug logs)
const uploadImageToServer = async (uri, userId, mimeType, token) => {
    console.log(`[DEBUG UPLOAD] Bắt đầu tải ảnh cho User ID: ${userId}`);
    const ext = mimeType.split('/')[1] || 'jpg';
    const filename = `avatar-${userId}-${Date.now()}.${ext}`;
    const formData = new FormData();
    const serverBaseUrl = getBaseUrl();
    
    let fileToUpload;
    if (Platform.OS === 'web') {
        console.log("[DEBUG UPLOAD] Platform: Web - Tạo Blob file.");
        const response = await fetch(uri);
        const blob = await response.blob();
        fileToUpload = new File([blob], filename, { type: mimeType });
    } else {
        console.log(`[DEBUG UPLOAD] Platform: Native - File URI: ${uri}`);
        fileToUpload = { uri: uri, name: filename, type: mimeType };
    }

    formData.append('avatar', fileToUpload); 
    console.log(`[DEBUG UPLOAD] Gửi POST đến: ${serverBaseUrl}/api/upload/avatar`);

    try {
        const response = await fetch(`${serverBaseUrl}/api/upload/avatar`, {
            method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData,
        });

        const data = await response.json();
        console.log(`[DEBUG UPLOAD] Status API Upload: ${response.status}`);

        if (response.status !== 200 || !data.success) {
            console.error('[DEBUG UPLOAD] LỖI SERVER KHI UPLOAD:', data.message);
            throw new Error(data.message || `Lỗi tải ảnh lên. Status: ${response.status}`);
        }

        const serverReturnedUrl = data.url;
        console.log(`[DEBUG UPLOAD] URL Server trả về: ${serverReturnedUrl}`);
        
        if (serverReturnedUrl.startsWith('http://') || serverReturnedUrl.startsWith('https://')) {
            return serverReturnedUrl;
        }
        const finalUrl = `${serverBaseUrl}${serverReturnedUrl}`;
        console.log(`[DEBUG UPLOAD] URL Hiển thị cuối: ${finalUrl}`);
        return finalUrl;

    } catch (error) {
        console.error('[DEBUG UPLOAD] LỖI MẠNG/KẾT NỐI UPLOAD:', error.message);
        throw new Error(error.message || 'Lỗi kết nối hoặc xử lý response.');
    }
};

// ---------------------------
// COMPONENT CHÍNH
// ---------------------------

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, token: userToken, updateUser } = useAuth();

    const defaultAvatarIcon = 'https://i.pravatar.cc/150'; 
    
    // Logic hiển thị avatar: Nối Base URL nếu avatar là đường dẫn tương đối
    const getDisplayAvatarUrl = (userObj) => {
        const avatarUrl = userObj?.avatar;
        if (!avatarUrl || avatarUrl === defaultAvatarIcon) {
            return defaultAvatarIcon; 
        }
        
        const baseUrl = getBaseUrl();
        
        if (avatarUrl.startsWith('http')) {
            // Fix lỗi 404: Loại bỏ cổng Metro/Bundler nếu đang chạy Web và cổng bị chèn sai
            if (Platform.OS === 'web' && avatarUrl.includes('localhost') && avatarUrl.includes(':8081')) {
                console.warn('[DEBUG RENDER] Phát hiện URL có cổng 8081. Đang cố gắng sửa.');
                return avatarUrl.replace(':8081', ':4000'); 
            }
            return avatarUrl;
        }
        
        // Nếu là đường dẫn tương đối, ghép với Base URL
        return `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${avatarUrl.startsWith('/') ? avatarUrl : '/' + avatarUrl}`;
    };

    // Khởi tạo state với giá trị ban đầu từ Context
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.address || '');
    const [avatar, setAvatar] = useState(getDisplayAvatarUrl(user));
    const [loading, setLoading] = useState(false);
    
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    // ⭐️ KHẮC PHỤC LỖI ĐỒNG BỘ STATE: Cập nhật state local khi user từ Context thay đổi ⭐️
    useEffect(() => {
        if (user) {
            console.log('[DEBUG EFFECT] Đối tượng User đã tải vào Effect:', user);
            
            // Cập nhật state nếu dữ liệu user mới tồn tại
            if (user.name) setName(user.name);
            if (user.email) setEmail(user.email);
            if (user.phone) setPhone(user.phone);
            if (user.address) setAddress(user.address);

            const newAvatarUrl = getDisplayAvatarUrl(user);
            if (avatar !== newAvatarUrl) setAvatar(newAvatarUrl);
        }
    }, [user]); // Dependency on user object


    // Hàm phân tích lỗi server
    const mapServerErrors = (serverMessage) => {
        const newErrors = {};
        const lowerCaseMessage = serverMessage.toLowerCase();
        setErrors({});

        if (lowerCaseMessage.includes('email') && (lowerCaseMessage.includes('trùng') || lowerCaseMessage.includes('sử dụng'))) {
            newErrors.email = serverMessage;
        } else if (lowerCaseMessage.includes('điện thoại') || lowerCaseMessage.includes('phone') || lowerCaseMessage.includes('sđt')) {
            newErrors.phone = serverMessage;
        } else {
            Alert.alert('Lỗi Cập nhật', serverMessage);
            return;
        }
        setErrors(newErrors);
    };


    // Hàm validation cho từng trường (Đã có Debug Logs)
    const validateField = (fieldName, value) => {
        let error = '';
        
        console.log(`[DEBUG VALIDATE] Checking: ${fieldName} | Value: "${value}"`);

        switch (fieldName) {
            case 'name':
                if (!value || value.trim() === '') {
                    error = 'Vui lòng điền Họ và Tên.';
                }
                break;
            case 'email':
                if (!value || value.trim() === '') {
                    error = 'Vui lòng điền địa chỉ Email.';
                } else if (!isValidEmail(value)) {
                    error = 'Email không hợp lệ.';
                }
                break;
            case 'phone':
                if (value && value.length > 0) {
                    if (isNaN(Number(value))) {
                        error = 'SĐT chỉ được chứa ký tự số.';
                    } else if (value.length < 9) {
                        error = 'SĐT phải có tối thiểu 9 chữ số.';
                    } 
                }
                break;
        }
        
        if (error) {
            console.error(`[DEBUG VALIDATE] ❌ LỖI: ${fieldName} -> ${error}`);
        } else {
            console.log(`[DEBUG VALIDATE] ✅ OK: ${fieldName}`);
        }

        setErrors(prev => ({ ...prev, [fieldName]: error }));
        return error === ''; 
    };

    // Hàm cập nhật Profile
    const handleUpdateProfile = async (newAvatarUrl = avatar) => {
        
        console.log('[DEBUG PROFILE] Bắt đầu cập nhật profile...');
        
        const isNameValid = validateField('name', name);
        const isEmailValid = validateField('email', email);
        const isPhoneValid = validateField('phone', phone);
        
        if (!isNameValid || !isEmailValid || !isPhoneValid) {
            console.log('[DEBUG PROFILE] Validation Client-side thất bại.');
            return false;
        }

        const currentToken = userToken;
        if (!currentToken || !user || !user._id) {
            Alert.alert('Phiên hết hạn', 'Vui lòng đăng nhập lại để cập nhật thông tin.');
            router.replace('/login');
            return false;
        }

        try {
            let avatarToSend = newAvatarUrl;
            const baseUrl = getBaseUrl();
            
            // Xử lý để gửi URL tương đối (ví dụ: /uploads/avatars/...)
            // ⚠️ LƯU Ý: Nút XÓA ảnh đã bị loại bỏ, nên logic này chỉ xử lý cho URL mới từ Upload 
            // hoặc URL hiện tại (nếu nó là URL tuyệt đối)
            if (newAvatarUrl.startsWith(baseUrl)) {
                avatarToSend = newAvatarUrl.substring(baseUrl.length);
            } else if (!newAvatarUrl.startsWith('http') && !newAvatarUrl.startsWith('/')) {
                avatarToSend = `/${avatarToSend}`; 
            }
            
            const updatedData = { name, email, phone, address, avatar: avatarToSend };
            
            console.log(`[DEBUG PROFILE] Gửi PUT đến: ${baseUrl}/api/users/${user._id}. Dữ liệu gửi:`, updatedData);

            const response = await fetch(`${baseUrl}/api/users/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
                body: JSON.stringify(updatedData),
            });

            const data = await response.json();
            console.log(`[DEBUG PROFILE] Status API Profile: ${response.status}. Thành công: ${data.success}`);
            
            if (response.status !== 200) {
                if (data.message) mapServerErrors(data.message);
                else Alert.alert('Lỗi Cập nhật', `Cập nhật thất bại. Status: ${response.status}`);
                return false;
            }
            
            if (data.success) {
                updateUser(data.data);
                setAvatar(getDisplayAvatarUrl(data.data));
                setSuccessMessage('Thông tin cá nhân đã được cập nhật thành công!');
                setTimeout(() => { setSuccessMessage(''); }, 3000); 
                return true;
            } else {
                Alert.alert('Lỗi Cập nhật', data.message || 'Cập nhật thất bại không rõ nguyên nhân.');
                return false;
            }

        } catch (error) {
            console.error('[DEBUG PROFILE] LỖI MẠNG/KẾT NỐI PROFILE:', error.message);
            Alert.alert('Lỗi Mạng', `Không thể kết nối tới server (${getBaseUrl()}). Vui lòng kiểm tra kết nối mạng và IP.`);
            return false;
        } finally {
            console.log('[DEBUG PROFILE] Kết thúc cập nhật profile.');
        }
    };
    
    // Hàm xử lý chọn và Upload ảnh
    const handleChoosePhoto = async () => {
        console.log('[DEBUG CHOOSE] Bắt đầu chọn ảnh.');
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            console.error('[DEBUG CHOOSE] Quyền truy cập thư viện bị từ chối.');
            Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh để chọn ảnh.');
            return;
        }
        
        // Khắc phục lỗi crash: mediaTypes phải luôn là MẢNG
        let mediaTypeConfig;
        if (ImagePicker.MediaType && ImagePicker.MediaType.Images) {
            mediaTypeConfig = [ImagePicker.MediaType.Images]; 
            console.log('[DEBUG CHOOSE] Sử dụng [ImagePicker.MediaType.Images] (Mảng Enum)');
        } else {
            mediaTypeConfig = [1]; 
            console.log('[DEBUG CHOOSE] Fallback sử dụng giá trị số [1] (Mảng số).');
        }
        
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: mediaTypeConfig, 
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setLoading(true);
            const currentToken = userToken;
            
            if (!currentToken || !user || !user._id) {
                Alert.alert('Lỗi', 'Phiên đăng nhập không hợp lệ.');
                setLoading(false);
                return;
            }
            try {
                const asset = result.assets[0];
                console.log(`[DEBUG CHOOSE] Ảnh đã chọn. MIME type: ${asset.mimeType}. URI: ${asset.uri}`);
                
                // Bước 1: Upload ảnh lên server
                const newAvatarUrl = await uploadImageToServer(asset.uri, user._id, asset.mimeType, currentToken);
                
                // Bước 2: Cập nhật URL avatar mới vào profile người dùng
                await handleUpdateProfile(newAvatarUrl);
            } catch (error) {
                Alert.alert('Lỗi', error.message || 'Không thể tải ảnh lên server.');
            } finally {
                setLoading(false); 
            }
        } else {
            console.log('[DEBUG CHOOSE] Người dùng hủy chọn ảnh.');
        }
    };
    
    // ⭐️ KHẮC PHỤC LỖI GO_BACK: Hàm kiểm tra an toàn ⭐️
    const handleGoBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            // Quay về màn hình account chính nếu không có màn hình trong stack
            router.replace('/tabs/account'); 
        }
    };


    // ======================================================
    // PHẦN RENDER (JSX)
    // ======================================================

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Thanh Header */}
            <View style={styles.header}>
                {/* SỬ DỤNG HÀM QUAY LẠI AN TOÀN */}
                <TouchableOpacity onPress={handleGoBack} style={styles.headerBtn} disabled={loading}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chỉnh sửa Thông tin</Text>
                <View style={styles.headerBtn} />
            </View>
            
            <ScrollView 
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Ảnh đại diện */}
                <View style={styles.avatarContainer}>
                    <Image 
                        source={{ uri: avatar }} 
                        style={styles.avatar} 
                        resizeMode="cover"
                        onError={() => {
                            if (avatar !== defaultAvatarIcon) {
                                console.log("[DEBUG RENDER] Lỗi tải ảnh avatar. Chuyển về mặc định.");
                                setAvatar(defaultAvatarIcon);
                            }
                        }}
                    />
                    <View style={styles.avatarButtonRow}>
                        {/* CHỈ GIỮ LẠI NÚT ĐỔI ẢNH */}
                        <TouchableOpacity onPress={handleChoosePhoto} disabled={loading}>
                            <Text style={styles.changeAvatarText}>Đổi ảnh</Text>
                        </TouchableOpacity>
                        {/* ❌ ĐÃ BỎ NÚT XÓA ẢNH ĐẠI DIỆN ❌ */}
                    </View>
                </View>
                
                {/* Trường Tên */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Họ và Tên</Text>
                    <TextInput
                        style={[styles.input, errors.name && styles.inputError]}
                        value={name}
                        onChangeText={(text) => {
                            setName(text);
                            validateField('name', text);
                        }}
                        placeholder="Nhập họ và tên"
                        autoCapitalize="words"
                        editable={!loading}
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>
                {/* Trường Email */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={[styles.input, errors.email && styles.inputError]}
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            validateField('email', text);
                        }}
                        placeholder="Nhập địa chỉ email"
                        keyboardType="email-address"
                        editable={!loading}
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>
                {/* Trường Số điện thoại */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Số điện thoại</Text>
                    <TextInput
                        style={[styles.input, errors.phone && styles.inputError]}
                        value={phone}
                        onChangeText={(text) => {
                            setPhone(text);
                            validateField('phone', text);
                        }}
                        placeholder="Nhập số điện thoại"
                        keyboardType="phone-pad"
                        editable={!loading}
                    />
                    {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                </View>
                {/* Trường Địa chỉ */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Địa chỉ</Text>
                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Nhập địa chỉ giao hàng chi tiết"
                        autoCapitalize="sentences"
                        multiline={true}
                        numberOfLines={3}
                        editable={!loading}
                    />
                </View>
                {/* Nút Cập nhật */}
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={() => handleUpdateProfile()}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>LƯU THAY ĐỔI</Text>
                    )}
                </TouchableOpacity>
                {/* Tiêu đề Bảo mật */}
                <Text style={styles.sectionTitle}>Bảo mật</Text>
                {/* Tùy chọn: Thay đổi Mật khẩu */}
                <TouchableOpacity 
                    style={styles.optionRow}
                    onPress={() => router.push('/change-password')}
                    disabled={loading}>
                    <Text style={styles.optionText}>Đổi mật khẩu</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
                </TouchableOpacity>
            </ScrollView>

            {/* THÔNG BÁO OVERLAY */}
            {successMessage ? (
                <View style={styles.overlayContainer} key="overlay-alert">
                    <View style={styles.successContainerOverlay}>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                        <Text style={styles.successTextOverlay}>{successMessage}</Text>
                    </View>
                </View>
            ) : null}
        </SafeAreaView>
    );
}

// ---------------------------
// STYLES 
// ---------------------------
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        zIndex: 10,
        backgroundColor: COLORS.bg,
    },
    headerBtn: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
    container: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingBottom: 50, 
        flexGrow: 1,
    },
    // --- AVATAR STYLES ---
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 30, 
        marginTop: 10,
    },
    avatar: {
        width: 100, 
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
        borderWidth: 1, 
        borderColor: COLORS.inputBg,
    },
    avatarButtonRow: {
        flexDirection: 'column', 
        alignItems: 'center',
    },
    changeAvatarText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 5, 
    },
    // ❌ ĐÃ BỎ removeAvatarButton/Text
    
    // --- INPUT STYLES ---
    inputGroup: {
        marginBottom: 20, 
    },
    label: {
        fontSize: 14,
        color: COLORS.text, 
        marginTop: 0,
        marginBottom: 5, 
        fontWeight: '500',
    },
    input: {
        backgroundColor: COLORS.inputBg,
        height: 50, 
        borderRadius: 10, 
        paddingHorizontal: 15,
        fontSize: 16,
        color: COLORS.text,
        borderWidth: 1, 
        borderColor: COLORS.inputBg, 
    },
    inputError: { 
        borderColor: COLORS.error,
        borderWidth: 1,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 12,
        marginTop: 5,
        marginBottom: 0,
        marginLeft: 5,
    },
    multilineInput: {
        height: 100,
        paddingTop: 15,
        paddingBottom: 15,
        textAlignVertical: 'top',
    },
    
    // --- BUTTON STYLES ---
    saveButton: {
        backgroundColor: COLORS.primary,
        height: 50,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10, 
        marginBottom: 20, 
    },
    saveButtonDisabled: {
        backgroundColor: '#f59aab',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    // --- SECURITY SECTION STYLES ---
    sectionTitle: {
        fontSize: 16, 
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 20,
        marginBottom: 10,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.inputBg,
        padding: 15,
        borderRadius: 10, 
        marginTop: 5,
        borderLeftWidth: 0, 
    },
    optionText: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '400',
    },
    // --- OVERLAY STYLES ---
    overlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? 50 : 20,
        zIndex: 100,
        pointerEvents: 'box-none', 
    },
    successContainerOverlay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.success,
        padding: 12,
        borderRadius: 8,
        alignSelf: 'center',
        minWidth: 250,
        pointerEvents: 'none', 
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    successTextOverlay: {
        marginLeft: 8,
        color: '#fff',
        fontWeight: '600',
    }
});