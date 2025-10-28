import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function OrderSuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Icon Success */}
      <View style={styles.successIcon}>
        <Text style={styles.checkmark}>✓</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>SUCCESS!</Text>

      {/* Message */}
      <Text style={styles.message}>
        Your order will be delivered soon.{'\n'}
        Thank you for choosing our app!
      </Text>

      {/* Buttons */}
      <TouchableOpacity 
        style={styles.trackButton}
        onPress={() => router.push('/orders')}
      >
        <Text style={styles.trackButtonText}>Track your orders</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.homeButton}
        onPress={() => router.push('/')}
      >
        <Text style={styles.homeButtonText}>BACK TO HOME</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  checkmark: {
    fontSize: 60,
    color: '#FFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  message: {
    fontSize: 14,
    color: '#808080',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  trackButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  trackButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    borderWidth: 2,
    borderColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

