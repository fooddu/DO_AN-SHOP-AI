import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthCard from '../../components/AuthCard';
import AuthOtpInput from '../../components/AuthOtpInput';
import useAuthStore from '../../store/authStore';

export default function VerifyOtpScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { verifyOtp, loading, error } = useAuthStore();
    const email = params.email || '';
    const [otp, setOtp] = useState('');

    const handleVerify = async () => {
        if (otp.length < 6) return alert('Enter the full 6-digit OTP');
        const res = await verifyOtp(email, otp);
        if (res.success) {
            alert('OTP verified!');
            router.push({ pathname: '/(auth)/newPassword', params: { email, otp } });
        } else {
            alert(res.error || error || 'Verification failed!');
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.logoContainer}>
                <View style={styles.divider} />
                <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
                <View style={styles.divider} />
            </View>
            <Text style={styles.welcomeText}>ENTER OTP</Text>
            <View style={styles.cardWrapper}>
                <AuthCard>
                    <AuthOtpInput value={otp} onChange={setOtp} />
                    <TouchableOpacity style={styles.signUpButton} onPress={handleVerify} disabled={loading}>
                        <Text style={styles.signUpText}>{loading ? 'Verifying...' : 'VERIFY OTP'}</Text>
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
