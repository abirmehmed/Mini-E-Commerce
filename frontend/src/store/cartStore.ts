import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  total: 0,
  
  addItem: (product: Product) => {
    const items = get().items;
    const existingItem = items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      set({
        items: items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({ items: [...items, { product, quantity: 1 }] });
    }
    
    set({ total: calculateTotal(get().items) });
  },
  
  removeItem: (productId: number) => {
    set(state => ({
      items: state.items.filter(item => item.product.id !== productId),
      total: calculateTotal(state.items.filter(item => item.product.id !== productId)),
    }));
  },
  
  updateQuantity: (productId: number, quantity: number) => {
    if (quantity < 1) return;
    
    set(state => ({
      items: state.items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
      total: calculateTotal(state.items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )),
    }));
  },
  
  clearCart: () => {
    set({ items: [], total: 0 });
  },
}));

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
};