import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthCard from '../../components/AuthCard';
import AuthTextInput from '../../components/AuthTextInput';
import useAuthStore from '../../store/authStore';

export default function NewPasswordScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { setNewPassword, loading, error } = useAuthStore();
    const email = params.email || '';
    const otp = params.otp || '';
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSetPassword = async () => {
        if (!password || !confirmPassword) return alert('Please fill all fields');
        if (password !== confirmPassword) return alert('Passwords do not match');
        const res = await setNewPassword(email, otp, password);
        if (res.success) {
            alert('Password changed successfully!');
            router.replace('/(auth)/login');
        } else {
            alert(res.error || error || 'Failed to reset password');
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.logoContainer}>
                <View style={styles.divider} />
                <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
                <View style={styles.divider} />
            </View>
            <Text style={styles.welcomeText}>NEW PASSWORD</Text>
            <View style={styles.cardWrapper}>
                <AuthCard>
                    <AuthTextInput
                        label="New Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <AuthTextInput
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />
                    <TouchableOpacity style={styles.signUpButton} onPress={handleSetPassword} disabled={loading}>
                        <Text style={styles.signUpText}>{loading ? 'Changing...' : 'CHANGE PASSWORD'}</Text>
                    </TouchableOpacity>
                </AuthCard>
            </View>
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', },
    content: { paddingTop: 40, paddingBottom: 40, },
    logoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 40, marginBottom: 20, },
    logo: { width: 90, height: 90, },
    divider: { flex: 1, height: 1, backgroundColor: '#e0e0e0', marginHorizontal: 20, },
    welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#333', paddingHorizontal: 30, marginBottom: 30, textAlign: 'center', },
    cardWrapper: { alignSelf: 'flex-start', },
    signUpButton: { backgroundColor: '#333', borderRadius: 8, paddingVertical: 15, marginTop: 10, shadowColor: '#000', marginHorizontal: 30, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, },
    signUpText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', },
});
