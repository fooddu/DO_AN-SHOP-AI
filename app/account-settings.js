// app/account-settings.js (hoặc EditProfileScreen.js)

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
// ✨ FIX: Đã sửa lỗi đường dẫn Context
import { useAuth } from '../context/AuthContext';

// --- HELPER FUNCTIONS & CONFIG ---

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getBaseUrl = (useLocal = true) => {
    // THAY THẾ LOCAL_IP BẰNG IP CỦA MÁY CHẠY SERVER BACKEND CỦA BẠN
    const LOCAL_IP = '192.168.1.2';
    const LOCAL_PORT = 4000;

    if (Platform.OS === 'web' && useLocal) {
        return `http://localhost:${LOCAL_PORT}`;
    }
    return `http://${LOCAL_IP}:${LOCAL_PORT}`;
};

const COLORS = {
    primary: '#E91E63', text: '#222', muted: '#666', bg: '#ffffff',
    inputBg: '#f6f6f6', error: '#d32f2f', success: '#4CAF50', border: '#e0e0e0',
};

const uploadImageToServer = async (uri, userId, mimeType, token) => {
    console.log(`[DEBUG UPLOAD] Starting upload for User ID: ${userId}`);
    const ext = mimeType.split('/')[1] || 'jpg';
    const filename = `avatar-${userId}-${Date.now()}.${ext}`;
    const formData = new FormData();
    const serverBaseUrl = getBaseUrl();

    let fileToUpload;
    if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        fileToUpload = new File([blob], filename, { type: mimeType });
    } else {
        fileToUpload = { uri: uri, name: filename, type: mimeType };
    }

    formData.append('avatar', fileToUpload);

    try {
        const response = await fetch(`${serverBaseUrl}/api/users/upload-avatar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });

        const data = await response.json();

        if (response.status !== 200 || !data.success) {
            throw new Error(data.message || `Upload failed. Status: ${response.status}`);
        }

        const serverReturnedUrl = data.url;

        if (serverReturnedUrl.startsWith('http://') || serverReturnedUrl.startsWith('https://')) {
            return serverReturnedUrl;
        }
        const finalUrl = `${serverBaseUrl}${serverReturnedUrl}`;
        return finalUrl;

    } catch (error) {
        console.error('[DEBUG UPLOAD] Network Error:', error.message);
        throw new Error(error.message || 'Connection error.');
    }
};

// ---------------------------
// MAIN COMPONENT
// ---------------------------

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, token: userToken, updateUser } = useAuth();

    const defaultAvatarIcon = 'https://i.pravatar.cc/150';

    const getDisplayAvatarUrl = (userObj) => {
        const avatarUrl = userObj?.avatar;
        if (!avatarUrl || avatarUrl === defaultAvatarIcon) {
            return defaultAvatarIcon;
        }

        const baseUrl = getBaseUrl();

        if (avatarUrl.startsWith('http')) {
            if (Platform.OS === 'web' && avatarUrl.includes('localhost') && avatarUrl.includes(':8081')) {
                return avatarUrl.replace(':8081', ':4000');
            }
            return avatarUrl;
        }

        return `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${avatarUrl.startsWith('/') ? avatarUrl : '/' + avatarUrl}`;
    };

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.address || '');
    const [avatar, setAvatar] = useState(getDisplayAvatarUrl(user));
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (user) {
            if (user.name) setName(user.name);
            if (user.email) setEmail(user.email);
            if (user.phone) setPhone(user.phone);
            if (user.address) setAddress(user.address);

            const newAvatarUrl = getDisplayAvatarUrl(user);
            if (avatar !== newAvatarUrl) setAvatar(newAvatarUrl);
        }
    }, [user]);


    const mapServerErrors = (serverMessage) => {
        const newErrors = {};
        const lowerCaseMessage = serverMessage.toLowerCase();
        setErrors({});

        if (lowerCaseMessage.includes('email') && (lowerCaseMessage.includes('duplicate') || lowerCaseMessage.includes('taken'))) {
            newErrors.email = serverMessage;
        } else if (lowerCaseMessage.includes('phone')) {
            newErrors.phone = serverMessage;
        } else {
            Alert.alert('Update Error', serverMessage);
            return;
        }
        setErrors(newErrors);
    };


    const validateField = (fieldName, value) => {
        let error = '';

        switch (fieldName) {
            case 'name':
                if (!value || value.trim() === '') {
                    error = 'Họ tên là bắt buộc.';
                }
                break;
            case 'email':
                if (!value || value.trim() === '') {
                    error = 'Email là bắt buộc.';
                } else if (!isValidEmail(value)) {
                    error = 'Địa chỉ email không hợp lệ.';
                }
                break;
            case 'phone':
                if (value && value.length > 0) {
                    if (isNaN(Number(value))) {
                        error = 'Số điện thoại chỉ được chứa chữ số.';
                    } else if (value.length < 9) {
                        error = 'Số điện thoại phải có ít nhất 9 chữ số.';
                    }
                }
                break;
        }

        setErrors(prev => ({ ...prev, [fieldName]: error }));
        return error === '';
    };

    const handleUpdateProfile = async (newAvatarUrl = avatar) => {
        const isNameValid = validateField('name', name);
        const isEmailValid = validateField('email', email);
        const isPhoneValid = validateField('phone', phone);

        if (!isNameValid || !isEmailValid || !isPhoneValid) {
            return false;
        }

        const currentToken = userToken;
        if (!currentToken || !user || !user._id) {
            Alert.alert('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại để cập nhật hồ sơ.');
            router.replace('/(auth)/login');
            return false;
        }

        try {
            let avatarToSend = newAvatarUrl;
            const baseUrl = getBaseUrl();

            if (newAvatarUrl.startsWith(baseUrl)) {
                avatarToSend = newAvatarUrl.substring(baseUrl.length);
            } else if (!newAvatarUrl.startsWith('http') && !newAvatarUrl.startsWith('/')) {
                avatarToSend = `/${avatarToSend}`;
            }

            const updatedData = { name, email, phone, address, avatar: avatarToSend };

            const response = await fetch(`${baseUrl}/api/users/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
                body: JSON.stringify(updatedData),
            });

            const data = await response.json();

            if (response.status !== 200) {
                if (data.message) mapServerErrors(data.message);
                else Alert.alert('Lỗi cập nhật', `Cập nhật thất bại. Mã lỗi: ${response.status}`);
                return false;
            }

            if (data.success) {
                updateUser(data.data);
                setAvatar(getDisplayAvatarUrl(data.data));
                setSuccessMessage('Cập nhật hồ sơ thành công!');
                setTimeout(() => { setSuccessMessage(''); }, 3000);
                return true;
            } else {
                Alert.alert('Lỗi cập nhật', data.message || 'Lỗi không xác định.');
                return false;
            }

        } catch (error) {
            Alert.alert('Lỗi mạng', `Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối.`);
            return false;
        }
    };

    const handleChoosePhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Quyền bị từ chối', 'Cần cấp quyền truy cập thư viện ảnh để thay đổi ảnh đại diện.');
            return;
        }

        // ✨ FIX: Khắc phục lỗi runtime 'reading Images' bằng cách kiểm tra sự tồn tại.
        const mediaType = ImagePicker.MediaType && ImagePicker.MediaType.Images
            ? ImagePicker.MediaType.Images
            : 'Images';

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: mediaType,
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

                const newAvatarUrl = await uploadImageToServer(asset.uri, user._id, asset.mimeType, currentToken);

                await handleUpdateProfile(newAvatarUrl);
            } catch (error) {
                Alert.alert('Lỗi', error.message || 'Tải ảnh lên thất bại.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleGoBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/tabs/account');
        }
    };

    const navigateToShippingAddresses = () => {
        router.push('/shipping-addresses');
    };


    // ======================================================
    // RENDER (JSX)
    // ======================================================

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.headerBtn} disabled={loading}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: avatar }}
                        style={styles.avatar}
                        resizeMode="cover"
                        onError={() => {
                            if (avatar !== defaultAvatarIcon) {
                                setAvatar(defaultAvatarIcon);
                            }
                        }}
                    />
                    <View style={styles.avatarButtonRow}>
                        <TouchableOpacity onPress={handleChoosePhoto} disabled={loading}>
                            <Text style={styles.changeAvatarText}>Thay đổi ảnh</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Name Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Họ và tên</Text>
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

                {/* Email Input */}
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

                {/* Phone Input */}
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

                {/* ⭐️ Nút điều hướng đến Địa chỉ (Tối ưu UX) ⭐️ */}
                <Text style={styles.sectionTitle}>Địa chỉ</Text>
                <TouchableOpacity
                    style={styles.optionRow}
                    onPress={navigateToShippingAddresses}
                    disabled={loading}>
                    <View style={{ flexShrink: 1 }}>
                        <Text style={[styles.label, { marginBottom: 2 }]}>Địa chỉ mặc định</Text>
                        <Text style={styles.optionText} numberOfLines={2}>
                            {user?.address ? user.address : 'Nhấn vào đây để thêm/quản lý địa chỉ giao hàng.'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
                </TouchableOpacity>
                {/* ⭐️ END: Nút Address ⭐️ */}

                {/* Update Button */}
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

                {/* Security Section */}
                <Text style={styles.sectionTitle}>Bảo mật</Text>
                <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => router.push('/change-password')}
                    disabled={loading}>
                    <Text style={styles.optionText}>Đổi mật khẩu</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
                </TouchableOpacity>


            </ScrollView>

            {/* Success Overlay */}
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
        minHeight: 80,
    },
    optionText: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '400',
        flexShrink: 1,
    },
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
