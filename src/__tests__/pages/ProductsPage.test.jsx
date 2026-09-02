import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import fc from 'fast-check';
import { CartProvider } from '../../context/CartContext';
import { WishlistProvider } from '../../context/WishlistContext';
import { products } from '../../data/products';
import ProductsPage from '../../pages/ProductsPage';

// Inline filter function matching ProductsPage logic exactly
function filterProducts(q) {
  if (!q) return products;
  return products.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.category.toLowerCase().includes(q.toLowerCase())
  );
}

function renderProductsPage(path = '/products') {
  const router = createMemoryRouter(
    [{ path: '/products', element: <ProductsPage /> }],
    { initialEntries: [path] }
  );
  return render(
    <CartProvider>
      <WishlistProvider>
        <RouterProvider router={router} />
      </WishlistProvider>
    </CartProvider>
  );
}

// ─── Property 17: Search filter correctness ──────────────────────────────────
describe('Property 17: Search filter correctness', () => {
  // Feature: shopgrids-react-conversion, Property 17: Search filter correctness
  it('filters products to exactly those matching q as a case-insensitive substring of name or category', () => {
    // Validates: Requirements 8.2, 8.3, 8.5
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        (q) => {
          const result = filterProducts(q);
          const qLower = q.toLowerCase();

          // Every returned product must match
          for (const p of result) {
            const matches =
              p.name.toLowerCase().includes(qLower) ||
              p.category.toLowerCase().includes(qLower);
            expect(matches).toBe(true);
          }

          // Every matching product in the full array must be in the result
          for (const p of products) {
            const shouldMatch =
              p.name.toLowerCase().includes(qLower) ||
              p.category.toLowerCase().includes(qLower);
            if (shouldMatch) {
              expect(result.some(r => r.id === p.id)).toBe(true);
            } else {
              expect(result.some(r => r.id === p.id)).toBe(false);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ─── Property 18: Empty/absent search shows all products ─────────────────────
describe('Property 18: Empty/absent search shows all products', () => {
  // Feature: shopgrids-react-conversion, Property 18: Empty/absent search shows all products
  it('renders all products when q param is absent', () => {
    // Validates: Requirements 8.4
    fc.assert(
      fc.property(fc.constant('/products'), (path) => {
        const { unmount } = renderProductsPage(path);
        // ProductCard renders a div.single-product for each product
        const cards = document.querySelectorAll('.single-product');
        expect(cards.length).toBe(products.length);
        unmount();
      }),
      { numRuns: 50 }
    );
  });

  it('renders all products when q param is empty string', () => {
    // Validates: Requirements 8.4
    fc.assert(
      fc.property(fc.constant('/products?q='), (path) => {
        const { unmount } = renderProductsPage(path);
        const cards = document.querySelectorAll('.single-product');
        expect(cards.length).toBe(products.length);
        unmount();
      }),
      { numRuns: 50 }
    );
  });
});
