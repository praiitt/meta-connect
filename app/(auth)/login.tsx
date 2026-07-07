import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!phone || !loginCode) {
      Alert.alert('Error', 'Please enter your mobile number and login code');
      return;
    }
    
    try {
      const success = await login(phone, loginCode);
      if (success) {
        // Router will automatically redirect based on _layout.tsx logic
        console.log('Login successful');
      }
    } catch (err) {
      console.log('Login failed', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Metal Connect</Text>
      <Text style={styles.subtitle}>Partner Portal Login</Text>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Mobile Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your registered mobile number"
        value={phone}
        onChangeText={(text) => {
          setPhone(text);
          if (error) clearError();
        }}
        keyboardType="phone-pad"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Wholesaler Code</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter the 6-digit code"
        value={loginCode}
        onChangeText={(text) => {
          setLoginCode(text);
          if (error) clearError();
        }}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Not a partner yet? Contact your wholesaler for an invitation code.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});