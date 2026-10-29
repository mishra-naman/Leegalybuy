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
import ToastProvider from '../shared/components/ToastProvider';

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
  const [cartTrigger, setCartTrigger] = useState<HTMLButtonElement | null>(null);
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);
  return (
    <ErrorBoundary>
      <ToastProvider>
        <SearchContext.Provider value={search}>
          <a className={styles.skipLink} href="#main-content">
            Skip to content
          </a>
          <div className={styles.shell}>
            <Header openCart={setCartTrigger} />
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
          {cartTrigger && (
            <Suspense
              fallback={
                <p className={styles.notice} role="status">
                  Opening cart…
                </p>
              }
            >
              <Cart onClose={() => setCartTrigger(null)} returnFocusTo={cartTrigger} />
            </Suspense>
          )}
        </SearchContext.Provider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
