import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
  type ErrorInfo,
} from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../shared/components/Header';
import { SearchContext } from '../shared/components/searchContext';
import { useSearchController } from '../shared/components/useSearchController';
import { ErrorState, LoadingState } from '../shared/components/Feedback';
import styles from './App.module.css';

const Cart = lazy(() => import('../features/cart/CartDrawer'));

class ErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application error', error, info.componentStack);
  }
  render() {
    return this.state.error ? (
      <ErrorState
        message="Please reload the page to try again."
        retry={() => window.location.reload()}
      />
    ) : (
      this.props.children
    );
  }
}

export default function App() {
  const search = useSearchController();
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);
  return (
    <ErrorBoundary>
      <SearchContext.Provider value={search}>
        <a className={styles.skipLink} href="#main-content">
          Skip to content
        </a>
        <div className={styles.shell}>
          <Header openCart={() => setCartOpen(true)} />
          <Suspense
            fallback={
              <main id="main-content">
                <LoadingState />
              </main>
            }
          >
            <Outlet />
          </Suspense>
        </div>
        {cartOpen && (
          <Suspense
            fallback={
              <p className={styles.notice} role="status">
                Opening cart…
              </p>
            }
          >
            <Cart onClose={() => setCartOpen(false)} />
          </Suspense>
        )}
      </SearchContext.Provider>
    </ErrorBoundary>
  );
}
