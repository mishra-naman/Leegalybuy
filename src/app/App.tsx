import { Component, lazy, Suspense, useState, type ReactNode, type ErrorInfo } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../shared/components/Header';
import { SearchContext } from '../shared/components/searchContext';
import { useSearchController } from '../shared/components/useSearchController';
import { ErrorState, LoadingState } from '../shared/components/Feedback';
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
  return (
    <ErrorBoundary>
      <ToastProvider>
        <SearchContext.Provider value={search}>
          <a
            className="fixed -top-20 left-4 z-[100] rounded bg-surface px-4 py-2.5 focus:top-2"
            href="#main-content"
          >
            Skip to content
          </a>
          <div className="flex h-dvh w-full flex-col overflow-hidden bg-surface [&>main]:min-h-0 [&>main]:flex-1 [&>main]:overflow-x-hidden">
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
                <p
                  className="fixed right-5 bottom-5 z-10 rounded-[5px] bg-header px-5 py-3 text-white"
                  role="status"
                >
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
