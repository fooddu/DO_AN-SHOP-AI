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
import { useAuth } from '../context/AuthContext';

// --- CONFIG ---
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getBaseUrl = (useLocal = true) => {
    const LOCAL_IP = '192.168.1.5'; 
    const LOCAL_PORT = 4000;

    if (Platform.OS === 'web' && useLocal) return `http://localhost:${LOCAL_PORT}`;
    if (Platform.OS === 'android') return `http://10.0.2.2:${LOCAL_PORT}`;
    return `http://${LOCAL_IP}:${LOCAL_PORT}`;
};

const COLORS = {
    primary: '#E91E63', text: '#222', muted: '#666', bg: '#ffffff',
    inputBg: '#f6f6f6', error: '#d32f2f', success: '#4CAF50', border: '#e0e0e0',
};

// --- API UPLOAD ---
const uploadImageToServer = async (uri, userId, mimeType, token) => {
    console.log('[DEBUG] Start Upload...');
    const type = mimeType || 'image/jpeg';
    const ext = type.split('/')[1] || 'jpg';
    const filename = `avatar-${userId}-${Date.now()}.${ext}`;
    
    const formData = new FormData();
    const serverBaseUrl = getBaseUrl();

    let fileToUpload;
    if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        fileToUpload = new File([blob], filename, { type: type });
    } else {
        fileToUpload = {
            uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
            name: filename,
            type: type,
        };
    }

    formData.append('avatar', fileToUpload);

    try {
        const response = await fetch(`${serverBaseUrl}/api/users/upload-avatar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Upload failed');

        // Xử lý URL trả về
        let finalUrl = data.url;
        if (!finalUrl.startsWith('http')) {
             finalUrl = `${serverBaseUrl}${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`;
        }
        console.log('[DEBUG] Upload Success URL:', finalUrl);
        return finalUrl;
    } catch (error) {
        console.error('[DEBUG] Upload Error:', error);
        throw new Error(error.message || 'Connection error.');
    }
};

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, token: userToken, updateUser } = useAuth();
    const defaultAvatarIcon = 'https://i.pravatar.cc/150';

    const getDisplayAvatarUrl = (userObj) => {
        const avatarUrl = userObj?.avatar;
        if (!avatarUrl || avatarUrl === defaultAvatarIcon) return defaultAvatarIcon;

        const baseUrl = getBaseUrl();
        // Nếu là link tuyệt đối
        if (avatarUrl.startsWith('http')) {
            if (Platform.OS === 'android' && avatarUrl.includes('localhost')) {
                return avatarUrl.replace('localhost', '10.0.2.2');
            }
            return avatarUrl;
        }
        // Nếu là link tương đối -> Nối BaseURL
        const fullUrl = `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${avatarUrl.startsWith('/') ? avatarUrl : '/' + avatarUrl}`;
        // Thêm timestamp để ép reload ảnh mới
        return `${fullUrl}?t=${Date.now()}`;
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
        if (user && !loading) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setAddress(user.address || '');
            // Chỉ update avatar từ context nếu không phải là người dùng vừa upload
            setAvatar(getDisplayAvatarUrl(user));
        }
    }, [user]);

    const validateField = (fieldName, value) => {
        let error = '';
        switch (fieldName) {
            case 'name':
                if (!value || value.trim() === '') error = 'Full name is required.';
                break;
            case 'email':
                if (!value || value.trim() === '') error = 'Email is required.';
                else if (!isValidEmail(value)) error = 'Invalid email address.';
                break;
            case 'phone':
                if (value && isNaN(Number(value))) error = 'Phone number must be digits.';
                break;
        }
        setErrors(prev => ({ ...prev, [fieldName]: error }));
        return error === '';
    };

    const handleUpdateProfile = async (newAvatarUrl = null) => {
        const isNameValid = validateField('name', name);
        const isEmailValid = validateField('email', email);
        const isPhoneValid = validateField('phone', phone);

        if (!isNameValid || !isEmailValid || !isPhoneValid) return false;

        if (!userToken) {
            Alert.alert('Session Expired', 'Please login again.');
            return false;
        }
        
        setLoading(true);
        try {
            const baseUrl = getBaseUrl();
            const updatedData = { name, email, phone, address };
            
            // Nếu có ảnh mới upload, gửi đường dẫn tương đối lên DB
            if (newAvatarUrl) {
                let relativeUrl = newAvatarUrl;
                // Cắt bỏ domain để chỉ lấy phần /public/...
                if (newAvatarUrl.startsWith(baseUrl)) {
                    relativeUrl = newAvatarUrl.replace(baseUrl, '');
                    relativeUrl = relativeUrl.split('?')[0]; // Bỏ timestamp
                }
                updatedData.avatar = relativeUrl;
            }

            const response = await fetch(`${baseUrl}/api/users/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
                body: JSON.stringify(updatedData),
            });

            const data = await response.json();
            
            if (response.status !== 200 || !data.success) {
                throw new Error(data.message || 'Update failed');
            }

            // Cập nhật Context
            updateUser(data.data);
            
            // Ưu tiên hiển thị ảnh vừa upload (nếu có) để mượt mà
            if (newAvatarUrl) {
                setAvatar(newAvatarUrl);
            } else {
                setAvatar(getDisplayAvatarUrl(data.data));
            }

            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (error) {
            Alert.alert('Update Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChoosePhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Need camera permission.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setLoading(true);
            try {
                const asset = result.assets[0];
                // 1. Upload ảnh
                const uploadedUrl = await uploadImageToServer(asset.uri, user._id, asset.mimeType, userToken);
                // 2. Hiện ảnh ngay lập tức
                setAvatar(uploadedUrl); 
                // 3. Lưu thông tin vào DB
                await handleUpdateProfile(uploadedUrl);
            } catch (error) {
                Alert.alert('Upload Error', error.message);
                setLoading(false);
            }
        }
    };

    const navigateToShippingAddresses = () => {
        router.push('/shipping-addresses');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} disabled={loading}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: avatar }}
                        style={styles.avatar}
                        resizeMode="cover"
                        onError={(e) => {
                            console.log('Image Load Error:', e.nativeEvent.error);
                            setAvatar(defaultAvatarIcon);
                        }}
                    />
                    <TouchableOpacity onPress={handleChoosePhoto} disabled={loading}>
                        <Text style={styles.changeAvatarText}>Change Photo</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput 
                        style={[styles.input, errors.name && styles.inputError]} 
                        value={name} 
                        onChangeText={(text) => { setName(text); validateField('name', text); }} 
                        editable={!loading} 
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput 
                        style={[styles.input, errors.email && styles.inputError]}
                        value={email} 
                        onChangeText={(text) => { setEmail(text); validateField('email', text); }}
                        editable={!loading} 
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone</Text>
                    <TextInput 
                        style={[styles.input, errors.phone && styles.inputError]}
                        value={phone} 
                        onChangeText={(text) => { setPhone(text); validateField('phone', text); }}
                        keyboardType="phone-pad" 
                        editable={!loading} 
                    />
                    {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                </View>

                <Text style={styles.sectionTitle}>Address</Text>
                <TouchableOpacity style={styles.optionRow} onPress={navigateToShippingAddresses} disabled={loading}>
                    <View style={{ flexShrink: 1 }}>
                        <Text style={[styles.label, { marginBottom: 2 }]}>Default Address</Text>
                        <Text style={styles.optionText} numberOfLines={2}>
                            {user?.address ? user.address : 'Tap here to add/manage addresses.'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.saveButton, loading && { backgroundColor: '#f59aab' }]} 
                    onPress={() => handleUpdateProfile()} 
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>SAVE CHANGES</Text>}
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Security</Text>
                <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/change-password')} disabled={loading}>
                    <Text style={styles.optionText}>Change Password</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
                </TouchableOpacity>
            </ScrollView>

            {successMessage ? (
                <View style={styles.overlayContainer}>
                    <View style={styles.successContainerOverlay}>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                        <Text style={styles.successTextOverlay}>{successMessage}</Text>
                    </View>
                </View>
            ) : null}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: COLORS.border },
    headerBtn: { width: 30, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
    container: { padding: 20 },
    avatarContainer: { alignItems: 'center', marginBottom: 30 },
    avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
    changeAvatarText: { color: COLORS.primary, fontSize: 14, fontWeight: '500' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, color: COLORS.text, marginBottom: 5, fontWeight: '500' },
    input: { backgroundColor: COLORS.inputBg, height: 50, borderRadius: 10, paddingHorizontal: 15, fontSize: 16, color: COLORS.text },
    inputError: { borderColor: COLORS.error, borderWidth: 1 },
    errorText: { color: COLORS.error, fontSize: 12, marginTop: 5 },
    saveButton: { backgroundColor: COLORS.primary, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 20 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginTop: 10, marginBottom: 10 },
    optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.inputBg, padding: 15, borderRadius: 10, marginBottom: 10 },
    optionText: { fontSize: 15, color: COLORS.text },
    overlayContainer: { position: 'absolute', top: 50, left: 0, right: 0, alignItems: 'center' },
    successContainerOverlay: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.success, padding: 12, borderRadius: 8 },
    successTextOverlay: { marginLeft: 8, color: '#fff', fontWeight: '600' }
});