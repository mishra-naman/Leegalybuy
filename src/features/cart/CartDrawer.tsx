import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import Modal from '../../shared/components/Modal';
import ProductImage from '../../shared/components/ProductImage';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { changeQuantity, clearCart, removeItem, selectSubtotalCents } from './cartSlice';
import { formatCurrency } from '../../shared/lib/formatCurrency';
import styles from './Cart.module.css';

export default function CartDrawer({ onClose }: { onClose: () => void }) {
  const items = useAppSelector((state) => state.cart);
  const subtotal = useAppSelector(selectSubtotalCents);
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState('');
  return (
    <Modal title="Your cart" drawer onClose={onClose}>
      <div className={styles.body}>
        {items.length ? (
          <>
            {items.map((item) => (
              <article className={styles.item} key={item.id}>
                <ProductImage src={item.image} alt={item.title} className={styles.image} />
                <div>
                  <Link className={styles.itemTitle} to={`/product/${item.id}`} onClick={onClose}>
                    {item.title}
                  </Link>
                  <p className={styles.unitPrice}>{formatCurrency(item.unitCents / 100)} each</p>
                  <div className={styles.itemBottom}>
                    <div
                      className={styles.quantity}
                      role="group"
                      aria-label={`Quantity of ${item.title}`}
                    >
                      <button
                        aria-label={`Decrease ${item.title} quantity`}
                        disabled={item.quantity <= 1}
                        onClick={() => {
                          dispatch(changeQuantity({ id: item.id, delta: -1 }));
                          setMessage(`${item.title} quantity decreased.`);
                        }}
                      >
                        <Minus size={14} />
                      </button>
                      <output aria-label={`${item.title} quantity`}>{item.quantity}</output>
                      <button
                        aria-label={`Increase ${item.title} quantity`}
                        disabled={item.quantity >= 999}
                        onClick={() => {
                          dispatch(changeQuantity({ id: item.id, delta: 1 }));
                          setMessage(`${item.title} quantity increased.`);
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      className={styles.remove}
                      aria-label={`Remove ${item.title}`}
                      onClick={() => {
                        dispatch(removeItem(item.id));
                        setMessage(`${item.title} removed from cart.`);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <strong className={styles.lineTotal}>
                      {formatCurrency((item.unitCents * item.quantity) / 100)}
                    </strong>
                  </div>
                </div>
              </article>
            ))}
            <p className={styles.subtotal}>
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal / 100)}</strong>
            </p>
            <p className={styles.note}>
              Your cart is saved on this device. This assessment demo does not process payments.
            </p>
            <button
              className={styles.clearCart}
              onClick={() => {
                dispatch(clearCart());
                setMessage('Cart cleared.');
              }}
            >
              Clear cart
            </button>
          </>
        ) : (
          <div className={styles.cartEmpty}>
            <ShoppingCart size={38} />
            <h3>Your cart is empty</h3>
            <p>Find something you like in the catalogue.</p>
            <button onClick={onClose}>Continue browsing</button>
          </div>
        )}
        <p className={styles.update} role="status">
          {message}
        </p>
      </div>
    </Modal>
  );
}
