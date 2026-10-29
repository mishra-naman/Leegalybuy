import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import NotFound from '../shared/components/NotFound';

const Listing = lazy(() => import('../features/products/pages/ProductListingPage'));
const Detail = lazy(() => import('../features/products/pages/ProductDetailPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Listing /> },
      { path: 'product/:id', element: <Detail /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
