import { useEffect, useRef, useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { useAppDispatch } from '../../app/store';
import type { Product } from '../products/api/productsApi';
import { addItem, toCartItem } from './cartSlice';
import styles from './Cart.module.css';

export default function AddToCart({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const dispatch = useAppDispatch();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <>
      <button
        className={compact ? styles.compactAdd : styles.add}
        aria-label={`Add ${product.title} to cart`}
        title="Add to cart"
        onClick={() => {
          dispatch(addItem(toCartItem(product)));
          setAdded(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setAdded(false), 1800);
        }}
      >
        {added ? <Check size={compact ? 15 : 18} /> : <ShoppingCart size={compact ? 15 : 18} />}
        {!compact && (added ? 'Added to cart' : 'Add to cart')}
      </button>
      <span className="sr-only" role="status">
        {added ? `${product.title} added to cart.` : ''}
      </span>
    </>
  );
}
