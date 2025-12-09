import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import client from '../api/axiosConfig';

const COLORS = {
    primary: '#000', // Màu đen như trong ảnh
    text: '#222',
    muted: '#888',
    bg: '#ffffff',
    cardBackground: '#fff',
    borderColor: '#E8E8E8',
    success: '#4CAF50',
    error: '#d32f2f',
    modalBg: 'rgba(0,0,0,0.5)',
    inputBorder: '#DDD', // Viền nhạt cho input
};

// --- API HÀNH CHÍNH VIỆT NAM ---
const PROVINCE_API = 'https://provinces.open-api.vn/api';

const validatePhoneNumber = (phone) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length === 0) return "Số điện thoại là bắt buộc.";
    if (cleaned.length < 10 || cleaned.length > 11) return "Số điện thoại phải có 10-11 chữ số.";
    return '';
};

// --- COMPONENT MODAL CHỌN ĐỊA CHÍNH ---
const SelectionModal = ({ visible, title, data, onClose, onSelect, loading }) => {
    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={data}
                            keyExtractor={(item) => item.code.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => onSelect(item)}
                                >
                                    <Text style={styles.modalItemText}>{item.name}</Text>
                                    <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default function AddAddressFormScreen() {
    const router = useRouter();

    // --- STATE ĐỊA CHỈ ---
    const [recipientName, setRecipientName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [streetDetail, setStreetDetail] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    // --- STATE HÀNH CHÍNH ---
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);

    // --- STATE MODAL & LOADING ---
    const [modalType, setModalType] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState({});

    // 1. Load Tỉnh/Thành phố
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await fetch(`${PROVINCE_API}/?depth=1`);
                const data = await res.json();
                setCities(data);
            } catch (e) {
                Alert.alert("Lỗi", "Không thể tải dữ liệu tỉnh/thành phố.");
            }
        };
        fetchCities();
    }, []);

    // 2. Load Quận/Huyện
    const handleSelectCity = async (city) => {
        setSelectedCity(city);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setModalType(null);

        setLoadingData(true);
        try {
            const res = await fetch(`${PROVINCE_API}/p/${city.code}?depth=2`);
            const data = await res.json();
            setDistricts(data.districts);
        } catch (e) {
            Alert.alert("Lỗi", "Không thể tải dữ liệu quận/huyện.");
        } finally {
            setLoadingData(false);
        }
    };

    // 3. Load Phường/Xã
    const handleSelectDistrict = async (district) => {
        setSelectedDistrict(district);
        setSelectedWard(null);
        setModalType(null);

        setLoadingData(true);
        try {
            const res = await fetch(`${PROVINCE_API}/d/${district.code}?depth=2`);
            const data = await res.json();
            setWards(data.wards);
        } catch (e) {
            Alert.alert("Lỗi", "Không thể tải dữ liệu phường/xã.");
        } finally {
            setLoadingData(false);
        }
    };

    const handleSelectWard = (ward) => {
        setSelectedWard(ward);
        setModalType(null);
    };

    // --- XỬ LÝ LƯU ---
    const handleSave = async () => {
        const errs = {};
        if (!recipientName.trim()) errs.name = "Tên người nhận là bắt buộc.";
        if (!selectedCity) errs.city = "Vui lòng chọn Tỉnh/Thành phố.";
        if (!selectedDistrict) errs.district = "Vui lòng chọn Quận/Huyện.";
        if (!selectedWard) errs.ward = "Vui lòng chọn Phường/Xã.";
        if (!streetDetail.trim()) errs.street = "Địa chỉ đường là bắt buộc.";
        const phoneErr = validatePhoneNumber(phoneNumber);
        if (phoneErr) errs.phone = phoneErr;

        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        // Ghép chuỗi địa chỉ
        const fullAddressStr = `${streetDetail}, ${selectedWard.name}, ${selectedDistrict.name}, ${selectedCity.name}`;

        const payload = {
            recipientName,
            fullAddress: fullAddressStr,
            phoneNumber: phoneNumber.replace(/[^0-9]/g, ''),
            isDefault
        };

        console.log("DEBUG Payload:", payload);
        setSubmitting(true);

        try {
            const response = await client.post('/addresses', payload);
            if (response.data.success) {
                setSuccessMessage("Thêm địa chỉ thành công!");
                setTimeout(() => {
                    setSuccessMessage('');
                    router.back();
                }, 2000);
            } else {
                Alert.alert("Lỗi", response.data.message || "Lỗi máy chủ.");
            }
        } catch (error) {
            Alert.alert("Thất bại", error.response?.data?.message || "Lỗi kết nối.");
        } finally {
            if (!successMessage) setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thêm địa chỉ mới</Text>
                <View style={styles.headerIcon} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                {/* 1. Contact Info Section */}
                <Text style={styles.sectionLabel}>Thông tin liên hệ</Text>

                <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="Tên người nhận"
                    placeholderTextColor={COLORS.muted}
                    value={recipientName}
                    onChangeText={setRecipientName}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                <TextInput
                    style={[styles.input, errors.phone && styles.inputError]}
                    placeholder="Số điện thoại"
                    placeholderTextColor={COLORS.muted}
                    value={phoneNumber}
                    onChangeText={(t) => setPhoneNumber(t.replace(/[^0-9]/g, ''))}
                    keyboardType="phone-pad"
                    maxLength={11}
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

                {/* 2. Address Section */}
                <Text style={styles.sectionLabel}>Chi tiết địa chỉ</Text>

                {/* Select City */}
                <TouchableOpacity
                    style={[styles.selectBox, errors.city && styles.inputError]}
                    onPress={() => setModalType('CITY')}
                >
                    <Text style={selectedCity ? styles.selectText : styles.placeholderText}>
                        {selectedCity ? selectedCity.name : "Chọn Tỉnh/Thành phố"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={COLORS.muted} />
                </TouchableOpacity>
                {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

                {/* Select District */}
                <TouchableOpacity
                    style={[
                        styles.selectBox,
                        !selectedCity && styles.disabledBox,
                        errors.district && styles.inputError
                    ]}
                    onPress={() => selectedCity && setModalType('DISTRICT')}
                    disabled={!selectedCity}
                >
                    <Text style={selectedDistrict ? styles.selectText : styles.placeholderText}>
                        {selectedDistrict ? selectedDistrict.name : "Chọn Quận/Huyện"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={COLORS.muted} />
                </TouchableOpacity>
                {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}

                {/* Select Ward */}
                <TouchableOpacity
                    style={[
                        styles.selectBox,
                        !selectedDistrict && styles.disabledBox,
                        errors.ward && styles.inputError
                    ]}
                    onPress={() => selectedDistrict && setModalType('WARD')}
                    disabled={!selectedDistrict}
                >
                    <Text style={selectedWard ? styles.selectText : styles.placeholderText}>
                        {selectedWard ? selectedWard.name : "Chọn Phường/Xã"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={COLORS.muted} />
                </TouchableOpacity>
                {errors.ward && <Text style={styles.errorText}>{errors.ward}</Text>}

                {/* Street Detail Input */}
                <View style={[styles.inputContainer, errors.street && styles.inputError]}>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Số nhà, tên đường..."
                        placeholderTextColor={COLORS.muted}
                        value={streetDetail}
                        onChangeText={setStreetDetail}
                        multiline
                    />
                </View>
                {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}

                {/* Default Checkbox */}
                <TouchableOpacity
                    style={styles.defaultCheckbox}
                    onPress={() => setIsDefault(!isDefault)}
                >
                    <Ionicons
                        name={isDefault ? "checkbox" : "square-outline"}
                        size={24}
                        color={isDefault ? COLORS.primary : COLORS.muted}
                    />
                    <Text style={styles.checkboxText}>Đặt làm địa chỉ mặc định</Text>
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>HOÀN TẤT</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* --- MODALS --- */}
            <SelectionModal
                visible={modalType === 'CITY'}
                title="Chọn Tỉnh/Thành phố"
                data={cities}
                onClose={() => setModalType(null)}
                onSelect={handleSelectCity}
                loading={false}
            />
            <SelectionModal
                visible={modalType === 'DISTRICT'}
                title="Chọn Quận/Huyện"
                data={districts}
                onClose={() => setModalType(null)}
                onSelect={handleSelectDistrict}
                loading={loadingData}
            />
            <SelectionModal
                visible={modalType === 'WARD'}
                title="Chọn Phường/Xã"
                data={wards}
                onClose={() => setModalType(null)}
                onSelect={handleSelectWard}
                loading={loadingData}
            />

            {/* Success Notification */}
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, paddingTop: 20 },
    headerIcon: { width: 30, alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },

    scrollContainer: { padding: 20 },

    sectionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 10,
        color: COLORS.text
    },

    // Inputs & Selects
    input: {
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 15,
        marginBottom: 12,
        color: COLORS.text,
        backgroundColor: '#fff'
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: '#fff',
        padding: 5
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
        paddingHorizontal: 10,
        fontSize: 15,
        color: COLORS.text
    },
    inputError: { borderColor: COLORS.error },

    selectBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 12,
        backgroundColor: '#fff'
    },
    disabledBox: { backgroundColor: '#f9f9f9', borderColor: '#eee' },
    selectText: { fontSize: 15, color: COLORS.text },
    placeholderText: { fontSize: 15, color: COLORS.muted },

    errorText: { color: COLORS.error, fontSize: 12, marginBottom: 10, marginLeft: 5, marginTop: -8 },

    // Checkbox & Button
    defaultCheckbox: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
    checkboxText: { marginLeft: 10, fontSize: 15, color: COLORS.text },

    saveButton: {
        backgroundColor: COLORS.primary, // Màu đen theo ảnh
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40
    },
    saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: COLORS.modalBg, justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '60%', padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', flexDirection: 'row', justifyContent: 'space-between' },
    modalItemText: { fontSize: 16 },

    // Notification
    overlayContainer: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', paddingTop: 60, zIndex: 100 },
    successContainerOverlay: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.success, padding: 12, borderRadius: 8, alignSelf: 'center', minWidth: 250, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
    successTextOverlay: { color: '#fff', fontWeight: '600', marginLeft: 10 },
});
