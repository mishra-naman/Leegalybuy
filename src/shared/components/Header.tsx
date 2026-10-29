import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShoppingCart, UserRound, Moon, Sun, House } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectCartCount } from '../../features/cart/cartSlice';
import { toggleTheme } from '../../features/theme/themeSlice';
import SearchField from './SearchField';

const headerButton =
  'relative inline-flex h-10 w-[38px] items-center justify-center border-0 bg-transparent text-inherit hover:bg-white/7 max-md:w-8 max-md:[&_svg]:w-6';
const menuItem =
  'flex w-full items-center gap-2.5 border-0 px-2.5 py-[11px] text-left text-[14px] hover:bg-hover';

export default function Header({ openCart }: { openCart: (trigger: HTMLButtonElement) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const cartButton = useRef<HTMLButtonElement>(null);
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
    <header className="relative z-5 grid h-[58px] shrink-0 grid-cols-[1fr_minmax(160px,500px)_1fr] items-center gap-1 bg-header px-[39px] text-[#cbd2dc] max-desktop:grid-cols-[minmax(50px,1fr)_minmax(200px,500px)_auto] max-desktop:gap-5 max-desktop:px-6 max-md:h-[62px] max-md:grid-cols-[32px_minmax(0,1fr)_auto] max-md:gap-2.5 max-md:px-[13px]">
      <div className="relative w-fit" ref={menu}>
        <button
          className={headerButton}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="navigation-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu size={31} />
        </button>
        {menuOpen && (
          <nav
            id="navigation-menu"
            className="absolute top-12 left-0 min-w-[205px] rounded-[7px] border border-line bg-surface p-[9px] text-ink shadow-[0_8px_24px_#0002]"
            aria-label="Main navigation"
          >
            <span className="mb-[5px] block border-b border-line px-2.5 pt-[9px] pb-3 font-bold">
              Leegalybuy
            </span>
            <Link className={menuItem} to="/" onClick={() => setMenuOpen(false)}>
              <House size={17} /> All products
            </Link>
            <button
              className={menuItem}
              onClick={(event) => {
                openCart(cartButton.current ?? event.currentTarget);
                setMenuOpen(false);
              }}
            >
              <ShoppingCart size={17} /> Cart ({count})
            </button>
            <button className={menuItem} onClick={() => dispatch(toggleTheme())}>
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}{' '}
              {theme === 'light' ? 'Dark' : 'Light'} appearance
            </button>
          </nav>
        )}
      </div>
      <SearchField />
      <div className="flex items-center justify-end gap-[11px] pl-[18px] max-desktop:gap-1.5 max-desktop:pl-0 max-md:gap-px">
        <button
          className={headerButton}
          aria-label={`Open cart, ${count} ${count === 1 ? 'item' : 'items'}`}
          ref={cartButton}
          onClick={(event) => openCart(event.currentTarget)}
        >
          <ShoppingCart size={27} />
          {count > 0 && (
            <span className="absolute -top-px -right-[3px] min-w-[17px] rounded-xl bg-primary px-[3px] text-[10px] leading-[17px] text-white">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </button>
        <button
          className={headerButton}
          onClick={() => dispatch(toggleTheme())}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          aria-pressed={theme === 'dark'}
        >
          {theme === 'light' ? <Moon size={25} /> : <Sun size={25} />}
        </button>
        <span className="flex w-[35px] justify-center max-md:hidden" aria-hidden="true">
          <UserRound size={25} fill="currentColor" />
        </span>
      </div>
    </header>
  );
}
