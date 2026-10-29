import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import type { Product } from '../products/api/productsApi';
import { addItem, changeQuantity, removeItem, toCartItem } from './cartSlice';
import { useToast } from '../../shared/components/toastContext';

const quantityButton =
  'flex h-full items-center justify-center border-0 p-0 text-accent hover:enabled:bg-hover';

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
        className={`inline-flex shrink-0 items-center justify-between rounded-[5px] border border-primary bg-surface ${compact ? 'absolute top-[7px] right-[7px] h-[29px] shadow-card' : 'h-[38px]'}`}
        role="group"
        aria-label={`Quantity of ${product.title}`}
      >
        <button
          className={`${quantityButton} ${compact ? 'w-[27px]' : 'w-9'}`}
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
        <output
          className={`text-center font-semibold ${compact ? 'min-w-[22px] text-xs' : 'min-w-7 text-sm'}`}
          aria-label={`${product.title} quantity`}
          aria-live="polite"
        >
          {quantity}
        </output>
        <button
          className={`${quantityButton} ${compact ? 'w-[27px]' : 'w-9'}`}
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
      className={
        compact
          ? 'absolute top-[7px] right-[7px] flex size-[27px] items-center justify-center rounded-full bg-surface text-muted opacity-80 hover:border-primary hover:text-accent hover:opacity-100'
          : 'inline-flex h-[38px] items-center justify-center gap-2 border-primary bg-primary px-[17px] text-sm text-white'
      }
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
