import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Keyboard, // Import Keyboard
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

// --- CONFIG ---
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getBaseUrl = () => {
    // ⚠️ LƯU Ý: Kiểm tra lại IP của bạn nếu chạy điện thoại thật
    const LOCAL_IP = '192.168.1.5'; 
    const PORT = 4000; 
    return Platform.OS === 'web' ? `http://localhost:${PORT}` : `http://${LOCAL_IP}:${PORT}`;
};

const COLORS = {
    primary: '#E91E63', text: '#222', muted: '#666', bg: '#ffffff',
    inputBg: '#f6f6f6', error: '#d32f2f', success: '#4CAF50', border: '#e0e0e0',
};

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, token: userToken, updateUser } = useAuth();
    const serverBaseUrl = getBaseUrl();
    const defaultAvatarIcon = 'https://i.pravatar.cc/150?u=guest';

    // --- STATE ---
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [defaultAddressDisplay, setDefaultAddressDisplay] = useState(''); 
    const [avatar, setAvatar] = useState(defaultAvatarIcon);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const getDisplayAvatarUrl = (userObj) => {
        const avatarUrl = userObj?.avatar;
        if (!avatarUrl || avatarUrl.includes('guest') || avatarUrl.includes('default.png')) return defaultAvatarIcon;
        if (avatarUrl.startsWith('http')) return `${avatarUrl}?t=${Date.now()}`;
        const cleanPath = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
        return `${serverBaseUrl}${cleanPath}?t=${Date.now()}`;
    };

    // --- API: LẤY ĐỊA CHỈ MẶC ĐỊNH ---
    const fetchDefaultAddress = async () => {
        if (!userToken) return;
        try {
            const response = await fetch(`${serverBaseUrl}/api/addresses`, {
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            const data = await response.json();
            
            if (data.success && data.data.length > 0) {
                // Tìm địa chỉ default, nếu không có lấy cái đầu tiên
                const defaultAddr = data.data.find(addr => addr.isDefault === true) || data.data[0];
                setDefaultAddressDisplay(defaultAddr.fullAddress);
            } else {
                setDefaultAddressDisplay(''); 
            }
        } catch (error) {
            console.error("Lỗi lấy địa chỉ:", error);
        }
    };

    // --- USE FOCUS EFFECT: Cập nhật lại dữ liệu khi màn hình được focus ---
    useFocusEffect(
        useCallback(() => {
            if (user) {
                setName(user.name || '');
                setEmail(user.email || '');
                setPhone(user.phone || '');
                
                fetchDefaultAddress(); // Load lại địa chỉ mới nhất

                setAvatar((prev) => {
                    if (prev === defaultAvatarIcon) return getDisplayAvatarUrl(user);
                    return prev;
                });
            }
        }, [user, serverBaseUrl, userToken])
    );

    // --- ⭐️ FIX TRIỆT ĐỂ LỖI ĐIỀU HƯỚNG TRÊN WEB ⭐️ ---
    const handleNavigateToShipping = () => {
        console.log("👉 [1] Bắt đầu xử lý điều hướng...");

        // 1. Xử lý riêng cho Web: Bỏ Focus (Blur) khỏi element đang chọn
        if (Platform.OS === 'web') {
            try {
                // Lấy phần tử đang active (nút vừa bấm) và ép nó mất focus
                const activeElement = document.activeElement;
                if (activeElement && typeof activeElement.blur === 'function') {
                    console.log("👉 [2] Blur element trên Web");
                    activeElement.blur();
                }
            } catch (e) {
                console.log("⚠️ Lỗi blur web (không nghiêm trọng):", e);
            }
        }

        // 2. Đóng bàn phím (quan trọng cho Mobile và cả Web input)
        Keyboard.dismiss();

        // 3. Dùng setTimeout dài hơn chút (150ms) để trình duyệt chắc chắn đã cập nhật DOM
        // trước khi Router thực hiện thay đổi màn hình (gây ra aria-hidden)
        setTimeout(() => {
            console.log("🚀 [3] Thực hiện push router sau delay");
            try {
                router.push('/(main)/shipping-addresses');
            } catch (err) {
                console.error("❌ Lỗi router:", err);
                Alert.alert("Lỗi", "Không tìm thấy đường dẫn.");
            }
        }, 150);
    };

    // --- VALIDATION ---
    const validateFields = () => {
        let tempErrors = {};
        if (!name.trim()) tempErrors.name = 'Full name is required.';
        if (!email.trim()) tempErrors.email = 'Email is required.';
        else if (!isValidEmail(email)) tempErrors.email = 'Invalid email format.';
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    // --- UPLOAD IMAGE ---
    const uploadImageToServer = async (uri, mimeType) => {
        const formData = new FormData();
        let filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : (mimeType || 'image/jpeg');
        
        if (!filename.includes('.')) {
            const ext = type.split('/')[1] || 'jpg';
            filename = `upload-${Date.now()}.${ext}`;
        }

        if (Platform.OS === 'web') {
            const res = await fetch(uri);
            const blob = await res.blob();
            formData.append('avatar', blob, filename);
        } else {
            formData.append('avatar', {
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                name: filename,
                type: type,
            });
        }

        try {
            const response = await fetch(`${serverBaseUrl}/api/users/upload-avatar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${userToken}` },
                body: formData,
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'Upload failed');
            
            if (data.data && data.data.avatar) return data.data.avatar;
            if (data.url) return data.url;
            throw new Error("No avatar URL returned");
        } catch (error) {
            console.error("Upload Error:", error);
            throw error;
        }
    };

    // --- UPDATE PROFILE ---
    const handleUpdateProfile = async (newAvatarPath = null) => {
        if (!validateFields()) return;
        setLoading(true);
        try {
            const updatedData = { 
                name, email, phone, 
                avatar: newAvatarPath || user.avatar 
            };

            const response = await fetch(`${serverBaseUrl}/api/users/${user._id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${userToken}` 
                },
                body: JSON.stringify(updatedData),
            });

            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message);

            updateUser(data.data);
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            Alert.alert('Update Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChoosePhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Permission Denied', 'Gallery access is needed.');

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5,
        });

        if (!result.canceled) {
            setLoading(true);
            try {
                const asset = result.assets[0];
                const relativeUrl = await uploadImageToServer(asset.uri, asset.mimeType);
                await handleUpdateProfile(relativeUrl);

                const cleanPath = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
                setAvatar(`${serverBaseUrl}${cleanPath}?t=${Date.now()}`);
            } catch (error) {
                Alert.alert('Upload Error', error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} disabled={loading}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: avatar }} style={styles.avatar} resizeMode="cover" onError={() => setAvatar(defaultAvatarIcon)} />
                    <TouchableOpacity onPress={handleChoosePhoto} disabled={loading}>
                        <Text style={styles.changeAvatarText}>Change Photo</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput style={[styles.input, errors.name && styles.inputError]} value={name} onChangeText={setName} editable={!loading} />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput style={[styles.input, errors.email && styles.inputError]} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!loading} />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" editable={!loading} />
                    </View>

                    {/* ⭐⭐⭐ NÚT CHỌN ĐỊA CHỈ ⭐⭐⭐ */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Default Address</Text>
                        <TouchableOpacity 
                            style={[styles.input, styles.addressButton]} 
                            onPress={handleNavigateToShipping} // 👈 Gọi hàm đã fix lỗi
                            activeOpacity={0.7}
                            disabled={loading}
                        >
                            <Text 
                                style={[
                                    styles.addressText, 
                                    !defaultAddressDisplay && { color: '#aaa' } 
                                ]} 
                                numberOfLines={1}
                            >
                                {defaultAddressDisplay || "Set default shipping address"}
                            </Text>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={[styles.saveButton, loading && { opacity: 0.7 }]} onPress={() => handleUpdateProfile()} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>SAVE CHANGES</Text>}
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Preferences</Text>
                
                <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/change-password')} disabled={loading}>
                    <Text style={styles.optionText}>Security Settings</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
                </TouchableOpacity>

                <View style={{ height: 50 }} />
            </ScrollView>

            {successMessage ? (
                <View style={styles.toastContainer}>
                    <View style={styles.toast}>
                        <Ionicons name="checkmark-circle" size={22} color="#fff" />
                        <Text style={styles.toastText}>{successMessage}</Text>
                    </View>
                </View>
            ) : null}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff' },
    headerBtn: { width: 40, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
    container: { padding: 20 },
    avatarContainer: { alignItems: 'center', marginBottom: 25 },
    avatar: { width: 110, height: 110, borderRadius: 55, marginBottom: 12, borderWidth: 2, borderColor: COLORS.primary, backgroundColor: '#f0f0f0' },
    changeAvatarText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
    formContainer: { marginBottom: 20 },
    inputGroup: { marginBottom: 18 },
    label: { fontSize: 14, color: '#444', marginBottom: 6, fontWeight: '600' },
    input: { backgroundColor: COLORS.inputBg, height: 50, borderRadius: 10, paddingHorizontal: 15, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: 'transparent' },
    addressButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    addressText: { flex: 1, marginRight: 10 },
    inputError: { borderColor: COLORS.error, backgroundColor: '#fff0f0' },
    errorText: { color: COLORS.error, fontSize: 12, marginTop: 4, marginLeft: 4 },
    saveButton: { backgroundColor: COLORS.primary, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: '#888', marginTop: 10, marginBottom: 10, letterSpacing: 1 },
    optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e0e0e0' },
    optionText: { fontSize: 15, fontWeight: '500', color: COLORS.text },
    toastContainer: { position: 'absolute', bottom: 40, left: 20, right: 20, alignItems: 'center', zIndex: 999 },
    toast: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.success, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30 },
    toastText: { marginLeft: 10, color: '#fff', fontWeight: '600' }
});