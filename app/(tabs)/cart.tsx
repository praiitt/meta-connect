import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useCartStore } from '../../store/useCartStore';
import apiClient from '../../api/client';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const { items, updateQuantity, removeItem, clearCart, getCartTotal } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const getTotalWeight = () => {
    return items.reduce((total, item) => {
      const w = item.product.weightKg || 0;
      return total + (w * item.quantity);
    }, 0);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      const orderPayload = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      };

      await apiClient.post('/orders', orderPayload);
      Alert.alert('Success', 'Your wholesale order has been submitted successfully!', [
        { text: 'OK', onPress: () => {
          clearCart();
          router.push('/(tabs)/orders');
        }}
      ]);
    } catch (error: any) {
      console.error('Checkout error', error);
      Alert.alert('Checkout Failed', error.response?.data?.message || 'Something went wrong while placing your order.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.itemInfo}>
        <Text style={styles.name}>{item.product.name}</Text>
        <Text style={styles.price}>${item.product.price.toFixed(2)} each</Text>
        <Text style={styles.moq}>MOQ: {item.product.moq}{item.product.weightKg ? ` • Weight: ${item.product.weightKg} kg` : ''}</Text>
      </View>
      
      <View style={styles.actions}>
        <View style={styles.quantityControl}>
          <TouchableOpacity 
            style={styles.qtyButton}
            onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
            disabled={item.quantity <= item.product.moq}
          >
            <Ionicons name="remove" size={20} color={item.quantity <= item.product.moq ? '#ccc' : '#333'} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity 
            style={styles.qtyButton}
            onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
          >
            <Ionicons name="add" size={20} color="#333" />
          </TouchableOpacity>
        </View>
        <Text style={styles.itemTotal}>${(item.product.price * item.quantity).toFixed(2)}</Text>
        <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.product.id)}>
          <Ionicons name="trash-outline" size={24} color="#d9534f" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Your cart is empty.</Text>
          </View>
        }
      />
      
      {items.length > 0 && (
        <View style={styles.footer}>
          {getTotalWeight() > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Weight:</Text>
              <Text style={styles.totalValue}>{getTotalWeight().toFixed(2)} kg</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>${getCartTotal().toFixed(2)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.checkoutButton} 
            onPress={handleCheckout}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.checkoutText}>Submit Order</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  itemInfo: {
    marginBottom: 12,
  },
  name: { fontSize: 16, fontWeight: 'bold' },
  price: { fontSize: 14, color: '#0066cc', marginTop: 4 },
  moq: { fontSize: 12, color: '#666', marginTop: 2 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  qtyButton: {
    padding: 8,
  },
  quantity: {
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeBtn: {
    padding: 4,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  checkoutButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  }
});
