import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthCard from '../../components/AuthCard';
import AuthTextInput from '../../components/AuthTextInput';
import useAuthStore from '../../store/authStore';

export default function ForgotScreen() {
    const router = useRouter();
    const { forgotPassword, loading, error } = useAuthStore();
    const [email, setEmail] = useState("");

    const handleForgot = async () => {
        if (!email) return alert("Enter your email");
        const res = await forgotPassword(email);
        if (res.success) {
            alert("An OTP has been sent to your email");
            router.push({ pathname: '/(auth)/verifyOtp', params: { email } });
        } else {
            alert(res.error || error || "Something went wrong");
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.logoContainer}>
                <View style={styles.divider} />
                <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
                <View style={styles.divider} />
            </View>
            <Text style={styles.welcomeText}>RESET PASSWORD</Text>
            <View style={styles.cardWrapper}>
                <AuthCard>
                    <AuthTextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TouchableOpacity style={styles.signUpButton} onPress={handleForgot} disabled={loading}>
                        <Text style={styles.signUpText}>{loading ? 'Sending...' : 'SEND OTP'}</Text>
                    </TouchableOpacity>
                    <View style={styles.signInContainer}>
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text style={styles.signInLink}>Back to Login</Text>
                        </TouchableOpacity>
                    </View>
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
    signInContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    signInLink: { color: '#333', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', },
});
