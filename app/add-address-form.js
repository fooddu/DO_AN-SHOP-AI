// [File] app/add-address-form.js

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import client from '../api/client';

const COLORS = {
    primary: '#000',       
    text: '#222',         
    muted: '#888',        
    bg: '#ffffff',        
    cardBackground: '#fff', 
    borderColor: '#E8E8E8', 
    success: '#4CAF50', 
    error: '#d32f2f',
};

const validatePhoneNumber = (phone) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length === 0) {
        return "Số điện thoại không được để trống.";
    }
    if (cleaned.length < 9 || cleaned.length > 11) {
        return "SĐT phải chứa từ 9 đến 11 chữ số.";
    }
    return '';
};

export default function AddAddressFormScreen() {
    const router = useRouter();
    const [addressInfo, setAddressInfo] = useState({
        recipientName: '',
        fullAddress: '',
        phoneNumber: '',
        isDefault: false,
    });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(''); 
    const [validationErrors, setValidationErrors] = useState({});

    const validateField = (fieldName, value) => {
        let error = '';

        switch (fieldName) {
            case 'recipientName':
                if (value.trim().length === 0) {
                    error = 'Tên người nhận không được để trống.';
                }
                break;
            case 'fullAddress':
                if (value.trim().length === 0) {
                    error = 'Địa chỉ không được để trống.';
                }
                break;
            case 'phoneNumber':
                error = validatePhoneNumber(value);
                break;
            default:
                break;
        }

        setValidationErrors(prev => ({
            ...prev,
            [fieldName]: error,
        }));
        return error === '';
    };
    
    const handleTextChange = (fieldName, text) => {
        setAddressInfo(prev => ({
            ...prev,
            [fieldName]: text
        }));
        validateField(fieldName, text); 
    };

    const handleSaveAddress = async () => {
        console.log("DEBUG: handleSaveAddress function called.");

        // Chạy Validation tổng thể lần cuối
        const isNameValid = validateField('recipientName', addressInfo.recipientName);
        const isAddressValid = validateField('fullAddress', addressInfo.fullAddress);
        const isPhoneValid = validateField('phoneNumber', addressInfo.phoneNumber);

        if (!isNameValid || !isAddressValid || !isPhoneValid) {
             Alert.alert("Lỗi", "Vui lòng kiểm tra lại các trường thông tin bị lỗi.");
             return;
        }

        const cleanedPhoneNumber = addressInfo.phoneNumber.replace(/[^0-9]/g, '');
        
        const payload = {
            ...addressInfo,
            phoneNumber: cleanedPhoneNumber, 
        };
        
        console.log("DEBUG: Final payload being sent:", payload);

        setLoading(true);

        try {
            const response = await client.post('/addresses', payload);

            if (response.data.success) {
                const message = response.data.message || "Địa chỉ mới đã được lưu thành công.";
                setSuccessMessage(message);
                
                setTimeout(() => {
                    setSuccessMessage('');
                    router.back(); 
                }, 3000); 
                
                return; 
            } else {
                Alert.alert("Lỗi", response.data.message || "Đã xảy ra lỗi không xác định khi lưu địa chỉ.");
            }
        } catch (error) {
            console.error("DEBUG: API call FAILED. Full error object:", error);
            
            const errorMessage = error.response?.data?.message || "Lỗi kết nối Server hoặc Lỗi Validation.";
            Alert.alert("Lỗi", errorMessage);
        } finally {
            if (!successMessage) { 
                 setLoading(false);
            }
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} disabled={loading} style={styles.headerIcon}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thêm Địa Chỉ Mới</Text>
                <View style={styles.headerIcon} />
            </View>
            
            {/* KHỐI SCROLLVIEW ĐÃ SỬA LỖI JSX */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Tên người nhận */}
                <TextInput
                    style={styles.input}
                    placeholder="Tên người nhận" 
                    placeholderTextColor={COLORS.muted}
                    value={addressInfo.recipientName}
                    onChangeText={(text) => handleTextChange('recipientName', text)}
                    editable={!loading}
                />
                {validationErrors.recipientName && <Text style={styles.errorText}>{validationErrors.recipientName}</Text>}
                
                {/* Địa chỉ đầy đủ */}
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Địa chỉ đầy đủ (Số nhà, đường, thành phố...)" 
                    placeholderTextColor={COLORS.muted}
                    value={addressInfo.fullAddress}
                    onChangeText={(text) => handleTextChange('fullAddress', text)}
                    multiline
                    numberOfLines={4}
                    editable={!loading}
                />
                {validationErrors.fullAddress && <Text style={styles.errorText}>{validationErrors.fullAddress}</Text>}
                
                {/* Số điện thoại */}
                <TextInput
                    style={styles.input}
                    placeholder="Số điện thoại" 
                    placeholderTextColor={COLORS.muted}
                    value={addressInfo.phoneNumber}
                    onChangeText={(text) => handleTextChange('phoneNumber', text.replace(/[^0-9]/g, ''))}
                    keyboardType="phone-pad"
                    editable={!loading}
                    maxLength={11}
                />
                {validationErrors.phoneNumber && <Text style={styles.errorText}>{validationErrors.phoneNumber}</Text>}
                
                {/* Default Checkbox */}
                <TouchableOpacity 
                    style={styles.defaultCheckbox} 
                    onPress={() => setAddressInfo({...addressInfo, isDefault: !addressInfo.isDefault})}
                    disabled={loading}
                >
                    <Ionicons 
                        name={addressInfo.isDefault ? "checkbox-outline" : "square-outline"} 
                        size={24} 
                        color={addressInfo.isDefault ? COLORS.primary : COLORS.muted}
                    />
                    <Text style={styles.checkboxText}>Đặt làm địa chỉ mặc định</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.saveButton} 
                    onPress={handleSaveAddress}
                    disabled={loading || successMessage}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                    <Text style={styles.saveButtonText}>LƯU ĐỊA CHỈ</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* THÔNG BÁO OVERLAY (Toast) */}
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
    safeArea: { 
        flex: 1, 
        backgroundColor: COLORS.bg
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: COLORS.cardBackground, 
        borderBottomWidth: 0, 
        elevation: 0, 
        shadowOpacity: 0,
        shadowRadius: 0,
    },
    headerIcon: {
        width: 30,
        alignItems: 'center',
    },
    headerTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: COLORS.text 
    },
    scrollContainer: { 
        padding: 20 
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        marginBottom: 5, 
        color: COLORS.text,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        color: COLORS.error,
        fontSize: 12,
        marginBottom: 15, 
        marginLeft: 5,
    },
    defaultCheckbox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    checkboxText: {
        marginLeft: 8,
        fontSize: 15,
        color: COLORS.text,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        elevation: 0, 
        shadowOpacity: 0,
        shadowRadius: 0,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
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
        color: '#fff',
        fontWeight: '600',
        marginLeft: 10,
    },
});