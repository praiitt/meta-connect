import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import apiClient from '../../api/client';
import { useCartStore, Product } from '../../store/useCartStore';
import { Ionicons } from '@expo/vector-icons';

export default function CatalogScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
      Alert.alert('Error', 'Could not load product catalog.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, product.moq);
    Alert.alert('Added to Cart', `${product.name} (Qty: ${product.moq}) added to your wholesale cart.`);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="cube-outline" size={40} color="#ccc" />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        {item.sku && <Text style={styles.sku}>SKU: {item.sku}</Text>}
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        <Text style={styles.moq}>Minimum Order: {item.moq}</Text>
        
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => handleAddToCart(item)}
          disabled={!item.inStock}
        >
          <Text style={styles.addButtonText}>{item.inStock ? 'Add to Cart' : 'Out of Stock'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products available at the moment.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 120,
    height: '100%',
    backgroundColor: '#eee',
  },
  imagePlaceholder: {
    width: 120,
    height: 140, // fixed height placeholder
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    padding: 12,
  },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  sku: { fontSize: 12, color: '#666', marginBottom: 4 },
  price: { fontSize: 18, color: '#0066cc', fontWeight: 'bold', marginBottom: 4 },
  moq: { fontSize: 12, color: '#d9534f', fontWeight: 'bold', marginBottom: 8 },
  addButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
  }
});
