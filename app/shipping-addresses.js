import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const COLORS = {
    primary: '#000',
    text: '#222',
    muted: '#888',
    bg: '#f7f7f7', 
    cardBackground: '#fff', 
    borderColor: '#DDD', 
    greenCheck: '#4CAF50',
};

// Component hiển thị từng địa chỉ (Giữ nguyên từ bản sửa đổi trước)
const AddressCard = ({ address, isSelected, onPress, onEdit }) => (
    <View 
        style={styles.addressWrapper} 
        key={address._id}
    >
        <View style={styles.cardContainer}>
            {/* Hàng 1: Checkbox + 'Use as the shipping address' */}
            <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => onPress(address)}
            >
                <Ionicons 
                    name={isSelected ? "checkbox" : "square-outline"} 
                    size={24} 
                    color={isSelected ? COLORS.primary : COLORS.muted} 
                    style={styles.checkboxIcon}
                />
                <Text style={styles.checkboxText}>
                    Use as the shipping address
                </Text>
            </TouchableOpacity>

            {/* Hàng 2: Tên người nhận, Địa chỉ, Nút Edit */}
            <View 
                style={[
                    styles.addressDetailsCard, 
                    isSelected && styles.selectedAddressDetailsCard
                ]} 
            >
                <View style={styles.addressInfo}>
                    <Text style={styles.addressName}>
                        {address.recipientName}
                    </Text>
                    <Text style={styles.addressDetail}>
                        {address.fullAddress}
                    </Text>
                </View>

                <TouchableOpacity onPress={() => onEdit(address)} style={styles.editButton}>
                    <Ionicons name="create-outline" size={20} color={COLORS.muted} />
                </TouchableOpacity>
            </View>
        </View>
    </View>
);


export default function ShippingAddressesScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null); 
    const [loading, setLoading] = useState(true);

    const createFallbackAddress = (user) => { 
        if (user && user.address && user.phone) {
            return [{
                _id: 'user-profile-default', 
                recipientName: user.name || 'Người nhận', 
                fullAddress: user.address, 
                phoneNumber: user.phone,
                isDefault: true,
                isFallback: true 
            }];
        }
        return [];
    };

    const loadAddresses = async () => { 
        if (!user) { setLoading(false); return; };
        setLoading(true);
        try {
            const response = await client.get('/addresses');
            
            if (response.data.success) {
                let fetchedAddresses = response.data.data;
                
                if (fetchedAddresses.length === 0) {
                    fetchedAddresses = createFallbackAddress(user);
                }

                setAddresses(fetchedAddresses);
                
                const defaultAddr = fetchedAddresses.find(addr => addr.isDefault) || fetchedAddresses[0];
                if (defaultAddr) {
                    setSelectedAddress(defaultAddr._id);
                }
            }
        } catch (error) {
            setAddresses(createFallbackAddress(user)); 
            Alert.alert("Lỗi", "Không thể tải danh sách địa chỉ giao hàng từ server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAddresses();
    }, [user]); 

    const handleAddressSelection = (address) => {
        setSelectedAddress(address._id);
        if (address.isFallback) {
             return;
        } 
    };

    const navigateToAddAddress = () => {
        router.push('/add-address-form'); 
    };

    const handleEdit = (address) => { 
        if (address.isFallback) {
             Alert.alert(
                 "Lưu chính thức", 
                 "Địa chỉ này chưa được lưu. Bạn muốn lưu địa chỉ này không?",
                 [{ text: "LƯU", onPress: () => router.push({ pathname: '/add-address-form', params: { 
                     recipientName: address.recipientName,
                     fullAddress: address.fullAddress,
                     phoneNumber: address.phoneNumber,
                 } }) }, 
                 { text: "HỦY" }]
             );
        } else {
            router.push(`/add-address-form?addressId=${address._id}`); 
        }
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }
    
    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIconContainer}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                
                <Text style={styles.headerTitle}>Shipping address</Text>
                
                <View style={styles.headerIconContainer} /> 
            </View>

            {/* Danh sách địa chỉ (ScrollView) */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {addresses.length === 0 ? (
                    <Text style={styles.emptyMessage}>
                        Bạn chưa có địa chỉ giao hàng nào.
                        <Text style={{color: COLORS.primary}} onPress={navigateToAddAddress}> Thêm ngay!</Text>
                    </Text>
                ) : (
                    addresses.map(address => (
                        <AddressCard
                            key={address._id} 
                            address={address}
                            isSelected={selectedAddress === address._id} 
                            onPress={handleAddressSelection}
                            onEdit={handleEdit}
                        />
                    ))
                )}
            </ScrollView>

            {/* ⭐️ NÚT FAB ĐÃ ĐƯỢC CHUYỂN RA NGOÀI SCROLLVIEW ⭐️ */}
            <TouchableOpacity style={styles.fab} onPress={navigateToAddAddress}>
                <Ionicons name="add" size={30} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bg,
    },
    
    // Header Styles (Giữ nguyên)
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
        backgroundColor: COLORS.cardBackground,
    },
    headerIconContainer: {
        width: 30, 
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        flex: 1, 
    },
    
    // Scroll Container
    scrollContainer: {
        paddingHorizontal: 0, 
        paddingTop: 16,
        paddingBottom: 80, // Thêm padding dưới để FAB không che mất nội dung cuối
    },
    
    // Address Card Styles (Giữ nguyên)
    addressWrapper: {
        marginBottom: 10, 
        paddingHorizontal: 16, 
    },
    cardContainer: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 8,
        paddingTop: 15, 
        paddingBottom: 15, 
        paddingHorizontal: 16, 
        marginBottom: 10,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10, 
        paddingLeft: 0, 
    },
    checkboxIcon: {
        color: COLORS.primary, 
    },
    checkboxText: {
        fontSize: 14,
        color: COLORS.text,
        marginLeft: 8,
        fontWeight: '500', 
    },
    addressDetailsCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: COLORS.cardBackground, 
        borderRadius: 8,
        padding: 0, 
        borderWidth: 0, 
        marginTop: 5,
        marginBottom: 5,
    },
    selectedAddressDetailsCard: {
        // Giữ nguyên
    },
    addressInfo: {
        flex: 1,
        paddingRight: 15,
        marginLeft: 32, 
    },
    addressName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    addressDetail: {
        fontSize: 13,
        color: COLORS.muted, 
        lineHeight: 18,
    },
    editButton: {
        padding: 5,
        alignSelf: 'flex-start', 
        position: 'absolute', 
        right: 0,
        top: 0,
    },
    
    // ⭐️ NÚT FAB ĐÃ ĐƯỢC CỐ ĐỊNH Ở CUỐI MÀN HÌNH ⭐️
    fab: {
        position: 'absolute',
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        right: 16, // Khoảng cách từ lề phải
        bottom: 30, // Khoảng cách từ lề dưới
        backgroundColor: COLORS.primary,
        borderRadius: 25,
        elevation: 6, // Tăng nhẹ elevation để nổi bật hơn
        zIndex: 10, // Đảm bảo nó luôn nằm trên ScrollView
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    
    emptyMessage: {
        textAlign: 'center',
        marginTop: 50,
        color: COLORS.muted,
    }
});