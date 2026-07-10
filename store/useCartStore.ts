import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  moq: number;
  sku: string | null;
  weightKg?: number | null;
  metalType?: string | null;
  useMetalPrice?: boolean;
  inStock: boolean;
  imageUrl: string | null;
  categoryId?: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product, quantity) => set((state) => {
    // Check if item already exists
    const existingItemIndex = state.items.findIndex(item => item.product.id === product.id);
    
    // Ensure quantity meets MOQ
    const safeQuantity = Math.max(quantity, product.moq);

    if (existingItemIndex >= 0) {
      // Update existing
      const newItems = [...state.items];
      newItems[existingItemIndex].quantity += safeQuantity;
      return { items: newItems };
    } else {
      // Add new
      return { items: [...state.items, { product, quantity: safeQuantity }] };
    }
  }),
  updateQuantity: (productId, quantity) => set((state) => {
    const itemIndex = state.items.findIndex(item => item.product.id === productId);
    if (itemIndex < 0) return state;

    const item = state.items[itemIndex];
    // Strictly enforce MOQ when updating
    const safeQuantity = Math.max(quantity, item.product.moq);

    const newItems = [...state.items];
    newItems[itemIndex].quantity = safeQuantity;
    return { items: newItems };
  }),
  removeItem: (productId) => set((state) => ({
    items: state.items.filter(item => item.product.id !== productId)
  })),
  clearCart: () => set({ items: [] }),
  getCartTotal: () => {
    const items = get().items;
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }
}));
