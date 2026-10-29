import { describe, expect, it, vi } from 'vitest';
import { addItem, cartSchema, cartSlice, changeQuantity, clearCart, loadCart, removeItem, selectCartCount, selectSubtotalCents, toCartItem, CART_KEY } from './cartSlice';
import { makeProduct } from '../../test/fixtures';
import themeReducer, { toggleTheme } from '../theme/themeSlice';

describe('cart and theme state', () => {
  const item = toCartItem(makeProduct({ price: 19.99 }));
  it('adds products, merges duplicates, changes quantities, removes and clears', () => {
    let state = cartSlice.reducer([], addItem(item));
    state = cartSlice.reducer(state, addItem(item));
    expect(state).toHaveLength(1);
    expect(state[0].quantity).toBe(2);
    state = cartSlice.reducer(state, changeQuantity({ id: 1, delta: 1 }));
    expect(selectCartCount({ cart: state })).toBe(3);
    expect(selectSubtotalCents({ cart: state })).toBe(5997);
    state = cartSlice.reducer(state, changeQuantity({ id: 1, delta: -1 }));
    expect(state[0].quantity).toBe(2);
    expect(cartSlice.reducer(state, removeItem(1))).toEqual([]);
    expect(cartSlice.reducer(state, clearCart())).toEqual([]);
  });
  it('bounds quantities', () => {
    const initial = [{ ...item, quantity: 1 }];
    expect(cartSlice.reducer(initial, changeQuantity({ id: 1, delta: -1 }))[0].quantity).toBe(1);
    expect(cartSlice.reducer([{ ...item, quantity: 999 }], addItem(item))[0].quantity).toBe(999);
  });
  it('validates saved cart and rejects corrupt or duplicate items', () => {
    expect(cartSchema.safeParse([{ ...item, quantity: 1 }]).success).toBe(true);
    expect(cartSchema.safeParse([{ ...item, quantity: -1 }]).success).toBe(false);
    expect(cartSchema.safeParse([{ ...item, quantity: 1 }, { ...item, quantity: 1 }]).success).toBe(false);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(CART_KEY, '{broken');
    expect(loadCart()).toEqual([]);
    localStorage.setItem(CART_KEY, JSON.stringify([{ ...item, quantity: 2 }]));
    expect(loadCart()[0].quantity).toBe(2);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked'); });
    expect(loadCart()).toEqual([]);
  });
  it('toggles theme in both directions', () => {
    expect(themeReducer('light', toggleTheme())).toBe('dark');
    expect(themeReducer('dark', toggleTheme())).toBe('light');
  });
});
