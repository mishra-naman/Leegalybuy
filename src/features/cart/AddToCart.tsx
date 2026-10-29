import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import type { Product } from '../products/api/productsApi';
import { addItem, changeQuantity, removeItem, toCartItem } from './cartSlice';
import { useToast } from '../../shared/components/toastContext';
import styles from './Cart.module.css';

export default function AddToCart({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const dispatch = useAppDispatch();
  const quantity = useAppSelector(
    (state) => state.cart.find((item) => item.id === product.id)?.quantity ?? 0,
  );
  const { notify } = useToast();
  if (quantity > 0)
    return (
      <div
        className={`${styles.productQuantity} ${compact ? styles.compactQuantity : ''}`}
        role="group"
        aria-label={`Quantity of ${product.title}`}
      >
        <button
          aria-label={`Decrease ${product.title} quantity`}
          onClick={() =>
            dispatch(
              quantity === 1
                ? removeItem(product.id)
                : changeQuantity({ id: product.id, delta: -1 }),
            )
          }
        >
          <Minus size={compact ? 14 : 17} />
        </button>
        <output aria-label={`${product.title} quantity`} aria-live="polite">
          {quantity}
        </output>
        <button
          aria-label={`Increase ${product.title} quantity`}
          disabled={quantity >= 999}
          onClick={() => dispatch(changeQuantity({ id: product.id, delta: 1 }))}
        >
          <Plus size={compact ? 14 : 17} />
        </button>
      </div>
    );
  return (
    <button
      className={compact ? styles.compactAdd : styles.add}
      aria-label={`Add ${product.title} to cart`}
      title="Add to cart"
      onClick={() => {
        dispatch(addItem(toCartItem(product)));
        notify(`${product.title} added to cart.`);
      }}
    >
      {compact ? <ShoppingCart size={15} /> : <Plus size={18} />}
      {!compact && 'Add to cart'}
    </button>
  );
}
