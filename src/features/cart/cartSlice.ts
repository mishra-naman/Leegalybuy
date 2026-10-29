import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import { z } from 'zod';
import { readStorage } from '../../shared/lib/storage';
import type { Product } from '../products/api/productsApi';

export const cartItemSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  image: z.union([z.url(), z.literal('')]),
  unitCents: z.number().int().nonnegative().max(100_000_000),
  quantity: z.number().int().min(1).max(999),
});
export type CartItem = z.infer<typeof cartItemSchema>;
export const cartSchema = z
  .array(cartItemSchema)
  .max(1000)
  .refine((items) => new Set(items.map((item) => item.id)).size === items.length);
export const CART_KEY = 'leegalybuy-cart';
export const loadCart = () => readStorage(CART_KEY, cartSchema, []);
export const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCart,
  reducers: {
    addItem(state, { payload }: PayloadAction<Omit<CartItem, 'quantity'>>) {
      const existing = state.find((item) => item.id === payload.id);
      if (existing) existing.quantity = Math.min(999, existing.quantity + 1);
      else state.push({ ...payload, quantity: 1 });
    },
    changeQuantity(state, { payload }: PayloadAction<{ id: number; delta: number }>) {
      const item = state.find((entry) => entry.id === payload.id);
      if (item) item.quantity = Math.max(1, Math.min(999, item.quantity + payload.delta));
    },
    removeItem: (state, { payload }: PayloadAction<number>) =>
      state.filter((item) => item.id !== payload),
    clearCart: () => [],
  },
});
export const { addItem, changeQuantity, removeItem, clearCart } = cartSlice.actions;
export const toCartItem = (product: Product): Omit<CartItem, 'quantity'> => ({
  id: product.id,
  title: product.title,
  image: product.thumbnail || product.images?.[0] || '',
  unitCents: Math.round(product.price * 100),
});
const selectItems = (state: { cart: CartItem[] }) => state.cart;
export const selectCartCount = createSelector(selectItems, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0),
);
export const selectSubtotalCents = createSelector(selectItems, (items) =>
  items.reduce((sum, item) => sum + item.quantity * item.unitCents, 0),
);
