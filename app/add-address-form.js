// [File] app/add-address-form.js

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import client from '../api/client';

// Định nghĩa màu sắc
const COLORS = {
    primary: '#000',      // Main color for interactive elements (Black)
    text: '#222',         // Dark text color
    muted: '#888',        // Light gray muted text color
    bg: '#ffffff',        // General background color
    cardBackground: '#fff', // Card/Header background color
    borderColor: '#E8E8E8', // Light border color
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

    const handleSaveAddress = async () => {
        // Basic validation check
        if (!addressInfo.recipientName || !addressInfo.fullAddress || !addressInfo.phoneNumber) {
            Alert.alert("Error", "Please fill in the Recipient Name, Full Address, and Phone Number.");
            return;
        }

        setLoading(true);

        try {
            // Call API POST /api/addresses
            const response = await client.post('/addresses', addressInfo);

            if (response.data.success) {
                // Success: Show alert and go back
                Alert.alert("Success", response.data.message || "New address has been saved.");
                router.back(); 
            } else {
                Alert.alert("Error", response.data.message || "Unknown error occurred while saving the address.");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Server connection error or Validation error.";
            console.error("Error saving address:", error);
            Alert.alert("Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} disabled={loading} style={styles.headerIcon}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add New Address</Text>
                {/* Empty View to center the title */}
                <View style={styles.headerIcon} /> 
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <TextInput
                    style={styles.input}
                    // TEXT in English
                    placeholder="Recipient Name" 
                    placeholderTextColor={COLORS.muted}
                    value={addressInfo.recipientName}
                    onChangeText={(text) => setAddressInfo({...addressInfo, recipientName: text})}
                    editable={!loading}
                />
                <TextInput
                    style={[styles.input, styles.textArea]}
                    // TEXT in English
                    placeholder="Full Address (House number, street, city...)" 
                    placeholderTextColor={COLORS.muted}
                    value={addressInfo.fullAddress}
                    onChangeText={(text) => setAddressInfo({...addressInfo, fullAddress: text})}
                    multiline
                    numberOfLines={4}
                    editable={!loading}
                />
                <TextInput
                    style={styles.input}
                    // TEXT in English
                    placeholder="Phone Number" 
                    placeholderTextColor={COLORS.muted}
                    value={addressInfo.phoneNumber}
                    onChangeText={(text) => setAddressInfo({...addressInfo, phoneNumber: text})}
                    keyboardType="phone-pad"
                    editable={!loading}
                />
                
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
                    {/* TEXT in English */}
                    <Text style={styles.checkboxText}>Set as default address</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.saveButton} 
                    onPress={handleSaveAddress}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                    // TEXT in English
                    <Text style={styles.saveButtonText}>SAVE ADDRESS</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// Styling remains the same as the minimalistic, flat design
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
        marginBottom: 15,
        color: COLORS.text,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
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
});