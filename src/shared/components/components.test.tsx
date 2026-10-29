import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ProductCard from '../../features/products/components/ProductCard';
import FilterSidebar from '../../features/filters/FilterSidebar';
import ProductGallery from '../../features/gallery/ProductGallery';
import CartDrawer from '../../features/cart/CartDrawer';
import { cartSlice, toCartItem } from '../../features/cart/cartSlice';
import themeReducer from '../../features/theme/themeSlice';
import { makeProduct } from '../../test/fixtures';
import { emptyFilters } from '../../features/filters/filterState';
import Pagination from './Pagination';
import RatingStars from './RatingStars';
import Header from './Header';
import { EmptyState, ErrorState, LoadingState } from './Feedback';

function makeStore() {
  return configureStore({
    reducer: { cart: cartSlice.reducer, theme: themeReducer },
    preloadedState: { cart: [], theme: 'light' as const },
  });
}
describe('interactive shared and feature components', () => {
  it('adds from a card without navigation and preserves listing context on its link', async () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/?page=2']}>
          <ProductCard product={makeProduct()} />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/product/1?returnTo=%2F%3Fpage%3D2');
    await userEvent.click(screen.getByRole('button', { name: /add.*to cart/i }));
    expect(store.getState().cart[0].quantity).toBe(1);
    expect(screen.getByRole('status')).toHaveTextContent('added to cart');
  });
  it('checks multiple filters and validates price input without dropping other state', async () => {
    const update = vi.fn();
    render(
      <FilterSidebar
        search=""
        onSearchChange={vi.fn()}
        filters={emptyFilters}
        categories={[{ slug: 'phones', name: 'Phones' }]}
        brands={['Test Brand']}
        update={update}
        clear={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Phones' }));
    expect(update).toHaveBeenLastCalledWith({ categories: ['phones'] });
    await userEvent.click(screen.getByRole('checkbox', { name: 'Test Brand' }));
    expect(update).toHaveBeenLastCalledWith({ brands: ['Test Brand'] });
    await userEvent.type(screen.getByLabelText('Minimum price'), '200');
    await userEvent.type(screen.getByLabelText('Maximum price'), '100');
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByRole('alert')).toHaveTextContent('must not exceed');
    await userEvent.clear(screen.getByLabelText('Minimum price'));
    await userEvent.type(screen.getByLabelText('Minimum price'), '50{Enter}');
    expect(update).toHaveBeenLastCalledWith({ min: 50, max: 100 });
  });
  it('disables unavailable pages and announces the active page', async () => {
    const change = vi.fn();
    render(<Pagination page={1} pageCount={3} onChange={change} />);
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    expect(screen.getByLabelText('Page 1')).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByLabelText('Next page'));
    expect(change).toHaveBeenCalledWith(2);
  });
  it('announces rating, loading, empty state and recoverable errors', async () => {
    const retry = vi.fn();
    const clear = vi.fn();
    render(
      <>
        <RatingStars rating={4.25} />
        <LoadingState />
        <EmptyState clear={clear} />
        <ErrorState message="Connection lost" retry={retry} />
      </>,
    );
    expect(screen.getByLabelText('4.3 out of 5 stars')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAccessibleName('Loading products');
    await userEvent.click(screen.getByText('Try again'));
    expect(retry).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByText('Clear filters'));
    expect(clear).toHaveBeenCalledOnce();
  });
  it('updates cart quantity, totals and removal', async () => {
    const store = makeStore();
    store.dispatch(cartSlice.actions.addItem(toCartItem(makeProduct({ price: 19.99 }))));
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CartDrawer onClose={vi.fn()} />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByRole('dialog', { name: 'Your cart' })).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText(/increase.*quantity/i));
    expect(store.getState().cart[0].quantity).toBe(2);
    expect(screen.getAllByText('$39.98')).toHaveLength(2);
    await userEvent.click(screen.getByLabelText(/remove test/i));
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });
  it('toggles the shared theme through the header', async () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Header openCart={vi.fn()} />
        </MemoryRouter>
      </Provider>,
    );
    await userEvent.click(screen.getByLabelText('Switch to dark theme'));
    expect(store.getState().theme).toBe('dark');
    expect(screen.getByLabelText('Switch to light theme')).toBeInTheDocument();
  });
  it('changes gallery images with thumbnails and page controls', async () => {
    render(<ProductGallery product={makeProduct()} />);
    await userEvent.click(screen.getByLabelText('Show image 2'));
    expect(screen.getByLabelText('Show image 2')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByAltText('Test handset')[0]).toHaveAttribute(
      'src',
      'https://example.com/back.webp',
    );
    await userEvent.click(screen.getByLabelText('Previous page'));
    expect(screen.getByLabelText('Show image 1')).toHaveAttribute('aria-pressed', 'true');
  });
});
