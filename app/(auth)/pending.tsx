import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export default function PendingScreen() {
  const { logout, user } = useAuthStore();

  return (
    <View style={styles.container}>
      <Ionicons name="time-outline" size={80} color="#f59e0b" style={styles.icon} />
      <Text style={styles.title}>Application Pending</Text>
      
      <Text style={styles.message}>
        Thank you for registering, {user?.name || 'Partner'}. Your wholesale account application is currently under review by our team.
      </Text>
      
      <Text style={styles.subMessage}>
        You will gain access to the catalog and pricing once an administrator approves your account. We will notify you via email.
      </Text>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  subMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  buttonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
});
