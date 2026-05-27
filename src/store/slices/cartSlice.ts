import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: JSON.parse(localStorage.getItem('cart_items') || '[]'),
};

const persistCart = (items: CartItem[]) => {
  localStorage.setItem('cart_items', JSON.stringify(items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(
      state,
      action: PayloadAction<{ product: Product; quantity?: number; userId?: string }>
    ) {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((item) => item.product.id === product.id);
      const currentQty = existing?.quantity ?? 0;
      const targetQty = currentQty + quantity;
      const available = product.availableQuantity ?? product.quantity;

      if (targetQty > available) {
        return;
      }

      if (existing) {
        existing.quantity = targetQty;
      } else {
        state.items.push({ product, quantity });
      }

      persistCart(state.items);
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.product.id !== action.payload);
      persistCart(state.items);
    },
    updateQuantity(
      state,
      action: PayloadAction<{ productId: string; quantity: number; userId?: string }>
    ) {
      const item = state.items.find((entry) => entry.product.id === action.payload.productId);
      if (!item) {
        return;
      }

      const available = item.product.availableQuantity ?? item.product.quantity;
      item.quantity = Math.max(1, Math.min(action.payload.quantity, available));
      persistCart(state.items);
    },
    replaceItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      persistCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      localStorage.removeItem('cart_items');
    },
  },
});

export const { addItem, removeItem, updateQuantity, replaceItems, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
