import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import Modal from '../../shared/components/Modal';
import ProductImage from '../../shared/components/ProductImage';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { changeQuantity, clearCart, removeItem, selectSubtotalCents } from './cartSlice';
import { formatCurrency } from '../../shared/lib/formatCurrency';
import { useToast } from '../../shared/components/toastContext';

export default function CartDrawer({
  onClose,
  returnFocusTo,
}: {
  onClose: () => void;
  returnFocusTo?: HTMLElement | null;
}) {
  const items = useAppSelector((state) => state.cart);
  const subtotal = useAppSelector(selectSubtotalCents);
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState('');
  const { notify } = useToast();
  return (
    <Modal title="Your cart" drawer onClose={onClose} returnFocusTo={returnFocusTo}>
      <div className="flex h-[calc(100%-73px)] flex-col overflow-hidden">
        {items.length ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-[22px]">
              {items.map((item) => (
                <article
                  className="grid grid-cols-[67px_minmax(0,1fr)] gap-[13px] border-b border-line py-[22px]"
                  key={item.id}
                >
                  <ProductImage
                    src={item.image}
                    alt={item.title}
                    className="h-[86px] w-[67px] object-contain"
                  />
                  <div>
                    <Link
                      className="mb-1.5 block text-[15px] leading-[1.4] font-semibold"
                      to={`/product/${item.id}`}
                      onClick={onClose}
                    >
                      {item.title}
                    </Link>
                    <p className="mb-[11px] text-xs text-muted">
                      {formatCurrency(item.unitCents / 100)} each
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <div
                        className="inline-flex items-center gap-2"
                        role="group"
                        aria-label={`Quantity of ${item.title}`}
                      >
                        <button
                          className="flex size-7 items-center justify-center p-0"
                          aria-label={`Decrease ${item.title} quantity`}
                          disabled={item.quantity <= 1}
                          onClick={() => {
                            dispatch(changeQuantity({ id: item.id, delta: -1 }));
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <output
                          className="min-w-3.5 text-center text-sm"
                          aria-label={`${item.title} quantity`}
                        >
                          {item.quantity}
                        </output>
                        <button
                          className="flex size-7 items-center justify-center p-0"
                          aria-label={`Increase ${item.title} quantity`}
                          disabled={item.quantity >= 999}
                          onClick={() => {
                            dispatch(changeQuantity({ id: item.id, delta: 1 }));
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        className="flex border-0 bg-transparent p-1 text-muted"
                        aria-label={`Remove ${item.title}`}
                        onClick={() => {
                          dispatch(removeItem(item.id));
                          setMessage(`${item.title} removed from cart.`);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                      <strong className="ml-auto text-sm">
                        {formatCurrency((item.unitCents * item.quantity) / 100)}
                      </strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <footer className="shrink-0 border-t border-line px-[22px] pt-[18px] pb-[22px]">
              <p className="flex items-center justify-between text-[19px]">
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotal / 100)}</strong>
              </p>
              <p className="mt-3.5 text-xs leading-normal text-muted">
                Your cart is saved on this device.
              </p>
              <button
                className="mt-[18px] w-full border-primary bg-primary px-[18px] py-3 font-semibold text-white"
                onClick={() => notify('Checkout will be implemented soon.')}
              >
                Checkout
              </button>
              <button
                className="mt-4 px-2.5 py-[7px] text-xs text-muted"
                onClick={() => {
                  dispatch(clearCart());
                  notify('Cart cleared.');
                }}
              >
                Clear cart
              </button>
            </footer>
          </>
        ) : (
          <div className="px-[15px] py-[90px] text-center text-muted [&>svg]:mx-auto [&>svg]:mb-5 [&>h3]:mb-4 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-ink [&>p]:mb-4 [&>button]:mt-2.5 [&>button]:px-4 [&>button]:py-2.5 [&>button]:text-accent">
            <ShoppingCart size={38} />
            <h3>Your cart is empty</h3>
            <p>Find something you like in the catalogue.</p>
            <button onClick={onClose}>Continue browsing</button>
          </div>
        )}
        <p className="sr-only" role="status">
          {message}
        </p>
      </div>
    </Modal>
  );
}
