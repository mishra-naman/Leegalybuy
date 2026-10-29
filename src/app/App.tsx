import { Component, lazy, Suspense, useEffect, useState, type ReactNode, type ErrorInfo } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Header from '../shared/components/Header';
import { SearchContext } from '../shared/components/searchContext';
import { useSearchController } from '../shared/components/useSearchController';
import { ErrorState, LoadingState } from '../shared/components/Feedback';
import styles from './App.module.css';

const Listing = lazy(() => import('../features/products/pages/ProductListingPage'));
const Detail = lazy(() => import('../features/products/pages/ProductDetailPage'));
const Cart = lazy(() => import('../features/cart/CartDrawer'));

class ErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Application error', error, info.componentStack); }
  render() { return this.state.error ? <ErrorState message="Please reload the page to try again." retry={() => window.location.reload()} /> : this.props.children; }
}

export default function App() {
  const search = useSearchController();
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [location.pathname]);
  return <ErrorBoundary><SearchContext.Provider value={search}>
    <a className={styles.skipLink} href="#main-content">Skip to content</a>
    <div className={styles.shell}>
      <Header openCart={() => setCartOpen(true)} />
      <Suspense fallback={<main id="main-content"><LoadingState /></main>}>
        <Routes>
          <Route path="/" element={<Listing />} />
          <Route path="/product/:id" element={<Detail />} />
          <Route path="*" element={<main id="main-content" className={styles.notFound}><h1>Page not found</h1><Link to="/">Browse products</Link></main>} />
        </Routes>
      </Suspense>
    </div>
    {cartOpen && <Suspense fallback={<p className={styles.notice} role="status">Opening cart…</p>}><Cart onClose={() => setCartOpen(false)} /></Suspense>}
  </SearchContext.Provider></ErrorBoundary>;
}
