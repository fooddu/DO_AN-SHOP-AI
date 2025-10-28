import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import AuthCard from '../../components/AuthCard';
import AuthTextInput from '../../components/AuthTextInput';
import useAuthStore from '../../store/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill in all information');
      return;
    }

    if (password !== confirmPassword) {
      alert('Confirm password does not match');
      return;
    }

    const result = await register(name, email, password);
    
    if (result.success) {
      alert('Registration successful!');
      router.replace('/(auth)/login');
    } else {
      alert(result.error || 'Registration failed');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.logoContainer}>
        <View style={styles.divider} />
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.divider} />
      </View>

      <Text style={styles.welcomeText}>WELCOME</Text>

      <View style={styles.cardWrapper}>
        <AuthCard>
          <AuthTextInput
            label="Name"
            value={name}
            onChangeText={setName}
          />
          <AuthTextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AuthTextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <AuthTextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <TouchableOpacity 
            style={styles.signUpButton} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.signUpText}>
              {loading ? 'Signing up...' : 'SIGN UP'}
            </Text>
          </TouchableOpacity>
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.signInLink}>SIGN IN</Text>
            </TouchableOpacity>
          </View>
        </AuthCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingTop: 40,
    paddingBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    width: 90,
    height: 90,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#333',
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  cardWrapper: {
    alignSelf: 'flex-start',
  },
  signUpButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 15,
    marginTop: 10,
    shadowColor: '#000',
    marginHorizontal: 30,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInText: {
    color: '#999',
    fontSize: 14,
  },
  signInLink: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
