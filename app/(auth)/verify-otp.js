// app/(auth)/verify-otp.js

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthCard from '../../components/AuthCard';
import AuthOtpInput from '../../components/AuthOtpInput';
import { useAuth } from '../../context/AuthContext';

export default function VerifyOtpScreen() {
    const [otp, setOtp] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    
    const router = useRouter();
    const { verifyOtp, forgotPassword } = useAuth();
    const { email } = useLocalSearchParams();

    const handleVerify = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Error', 'Please enter a 6-digit OTP code.');
            return;
        }
        
        setIsSubmitting(true);
        const result = await verifyOtp(email, otp); 
        setIsSubmitting(false);

        if (result.success) {
            router.push({ 
                pathname: '/(auth)/set-new-password', 
                params: { email: email } 
            });
            Alert.alert('Success', result.message || 'Verification successful.');
        } else {
            Alert.alert('Failed', result.message || 'Invalid or expired OTP.');
        }
    };
    
    const handleResend = async () => {
        setIsResending(true);
        const result = await forgotPassword(email);
        setIsResending(false);

        if (result.success) {
            Alert.alert('Resend Successful', result.message || 'A new OTP code has been sent to your email.');
        } else {
            Alert.alert('Resend Error', result.message || 'Unable to resend OTP. Please check your email.');
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
                    <TouchableOpacity style={styles.signUpButton} onPress={handleVerify} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" style={styles.loader} />
                        ) : (
                            <Text style={styles.signUpText}>VERIFY OTP</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.resendButton} 
                        onPress={handleResend} 
                        disabled={isResending}
                    >
                        {isResending ? (
                            <ActivityIndicator color="#333" />
                        ) : (
                            <Text style={styles.resendText}>Resend OTP code</Text>
                        )}
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
    loader: { marginVertical: 5, },
    resendButton: { marginTop: 15, alignItems: 'center', marginHorizontal: 30, },
    resendText: { color: '#333', fontSize: 14, fontWeight: 'bold', },
});