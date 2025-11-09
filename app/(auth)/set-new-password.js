// app/(auth)/set-new-password.js

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthCard from '../../components/AuthCard';
import AuthTextInput from '../../components/AuthTextInput';
import { useAuth } from '../../context/AuthContext';

const MIN_PASSWORD_LENGTH = 6;

export default function SetNewPasswordScreen() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const router = useRouter();
    const { setNewPassword } = useAuth();
    const { email } = useLocalSearchParams();

    const handleSetPassword = async () => {
        if (!email) {
            Alert.alert('Data Error', 'Email address not received. Please start the process again.');
            router.replace('/(auth)/forgot-password');
            return;
        }

        if (!password || !confirmPassword) {
            Alert.alert('Error', 'Please enter all password fields.');
            return;
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
            Alert.alert('Error', `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }
        
        setIsSubmitting(true);
        const result = await setNewPassword(email, password); 
        setIsSubmitting(false);

        if (result.success) {
            Alert.alert(
                'Success', 
                result.message || 'Your password has been changed. Please log in again.',
                [{ 
                    text: 'OK', 
                    onPress: () => router.replace('/(auth)/login') 
                }] 
            );
        } else {
            Alert.alert('Failed', result.message || 'Failed to set password. Please try again.');
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
                    <TouchableOpacity style={styles.signUpButton} onPress={handleSetPassword} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" style={styles.loader} />
                        ) : (
                            <Text style={styles.signUpText}>CHANGE PASSWORD</Text>
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
});