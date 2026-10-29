import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShoppingCart, SunMoon, UserRound, Moon, Sun, House } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectCartCount } from '../../features/cart/cartSlice';
import { toggleTheme } from '../../features/theme/themeSlice';
import SearchField from './SearchField';
import styles from './Shared.module.css';

export default function Header({ openCart }: { openCart: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const count = useAppSelector(selectCartCount);
  const theme = useAppSelector((state) => state.theme);
  useEffect(() => {
    function close(event: PointerEvent) {
      if (event.target instanceof Node && !menu.current?.contains(event.target)) setMenuOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', escape);
    };
  }, []);
  return (
    <header className={styles.header}>
      <div className={styles.menuAnchor} ref={menu}>
        <button
          className={styles.headerButton}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="navigation-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu size={31} />
        </button>
        {menuOpen && (
          <nav id="navigation-menu" className={styles.menu} aria-label="Main navigation">
            <span className={styles.menuTitle}>Leegalybuy</span>
            <Link to="/" onClick={() => setMenuOpen(false)}>
              <House size={17} /> All products
            </Link>
            <button onClick={() => dispatch(toggleTheme())}>
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}{' '}
              {theme === 'light' ? 'Dark' : 'Light'} appearance
            </button>
          </nav>
        )}
      </div>
      <SearchField />
      <div className={styles.headerActions}>
        <button
          className={styles.headerButton}
          aria-label={`Open cart, ${count} ${count === 1 ? 'item' : 'items'}`}
          onClick={openCart}
        >
          <ShoppingCart size={27} />
          {count > 0 && <span className={styles.badge}>{count > 99 ? '99+' : count}</span>}
        </button>
        <button
          className={styles.headerButton}
          onClick={() => dispatch(toggleTheme())}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          <SunMoon size={25} />
        </button>
        <span className={styles.profile} aria-hidden="true">
          <UserRound size={25} fill="currentColor" />
        </span>
      </div>
    </header>
  );
}
