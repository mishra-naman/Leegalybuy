import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { cartSlice, CART_KEY } from '../features/cart/cartSlice';
import themeReducer from '../features/theme/themeSlice';
import { writeStorage } from '../shared/lib/storage';

export const store = configureStore({ reducer: { cart: cartSlice.reducer, theme: themeReducer } });
let previous = store.getState();
store.subscribe(() => {
  const next = store.getState();
  if (next.cart !== previous.cart) writeStorage(CART_KEY, JSON.stringify(next.cart));
  if (next.theme !== previous.theme) {
    document.documentElement.dataset.theme = next.theme;
    writeStorage('leegalybuy-theme', next.theme);
  }
  previous = next;
});
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = useDispatch.withTypes<typeof store.dispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
