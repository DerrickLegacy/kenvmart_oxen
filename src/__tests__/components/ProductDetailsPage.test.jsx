import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import fc from 'fast-check';
import { CartProvider, CartContext } from '../../context/CartContext';
import { WishlistProvider } from '../../context/WishlistContext';
import { products } from '../../data/products';
import ProductDetailsPage from '../../pages/ProductDetailsPage';
import { useContext } from 'react';

// ---------------------------------------------------------------------------
// Router / render helper
// ---------------------------------------------------------------------------

const routes = [
  { path: '/product/:id', element: <ProductDetailsPage /> },
  { path: '/products', element: <div data-testid="products-page">Products</div> },
];

function renderAtId(id) {
  const router = createMemoryRouter(routes, { initialEntries: [`/product/${id}`] });
  return render(
    <CartProvider>
      <WishlistProvider>
        <RouterProvider router={router} />
      </WishlistProvider>
    </CartProvider>
  );
}

// For cart inspection
function CartInspector({ onState }) {
  const { state } = useContext(CartContext);
  onState(state);
  return null;
}

function renderAtIdWithCartInspector(id, onState) {
  const router = createMemoryRouter(routes, { initialEntries: [`/product/${id}`] });
  return render(
    <CartProvider>
      <WishlistProvider>
        <CartInspector onState={onState} />
        <RouterProvider router={router} />
      </WishlistProvider>
    </CartProvider>
  );
}

// ---------------------------------------------------------------------------
// Property 9: ProductDetailsPage gallery selection
// ---------------------------------------------------------------------------

// Feature: shopgrids-react-conversion, Property 9: ProductDetailsPage gallery selection
describe('Property 9: ProductDetailsPage gallery selection', () => {
  it('clicking thumbnail i updates the main image src to product.images[i]', () => {
    // Validates: Requirements 6.1, 6.2

    // Only products with multiple images to make thumbnail clicking meaningful
    const multiImageProducts = products.filter((p) => p.images.length > 1);
    expect(multiImageProducts.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.constantFrom(...multiImageProducts),
        fc.nat().filter((n) => n >= 0), // index offset — will mod with image count
        (product, indexOffset) => {
          const i = indexOffset % product.images.length;

          const { unmount } = renderAtId(product.id);

          // Verify main image is rendered
          const mainImage = screen.getByTestId('main-image');
          expect(mainImage).toBeTruthy();

          // Click thumbnail i
          const thumbnail = screen.getByTestId(`thumbnail-${i}`);
          fireEvent.click(thumbnail);

          // Main image src should now be product.images[i]
          const updatedMainImage = screen.getByTestId('main-image');
          expect(updatedMainImage.getAttribute('src')).toBe(product.images[i]);

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 10: ProductDetailsPage renders all required fields
// ---------------------------------------------------------------------------

// Feature: shopgrids-react-conversion, Property 10: ProductDetailsPage renders all required fields
describe('Property 10: ProductDetailsPage renders all required fields', () => {
  it('renders title, category, price, description, add-to-cart, add-to-wishlist, quantity input, features, specifications, and shipping for any product', () => {
    // Validates: Requirements 6.3, 6.6

    fc.assert(
      fc.property(
        fc.constantFrom(...products),
        (product) => {
          const { unmount } = renderAtId(product.id);

          // title
          expect(screen.getByTestId('product-title').textContent).toBe(product.name);

          // category
          expect(screen.getByTestId('product-category').textContent).toBe(product.category);

          // price — the price section should exist and contain the current price
          const priceEl = screen.getByTestId('product-price');
          expect(priceEl).toBeTruthy();
          const currentPrice = product.discountPrice ?? product.price;
          expect(priceEl.textContent).toContain(`$${currentPrice.toFixed(2)}`);

          // description
          expect(screen.getByTestId('product-description').textContent).toBe(product.description);

          // add-to-cart button
          expect(screen.getByTestId('add-to-cart-btn')).toBeTruthy();

          // add-to-wishlist button
          expect(screen.getByTestId('add-to-wishlist-btn')).toBeTruthy();

          // quantity input
          const qtyInput = screen.getByTestId('quantity-input');
          expect(qtyInput).toBeTruthy();
          expect(qtyInput.getAttribute('min')).toBe('1');
          expect(qtyInput.getAttribute('max')).toBe('99');

          // features list
          expect(screen.getByTestId('product-features')).toBeTruthy();

          // specifications table
          expect(screen.getByTestId('product-specifications')).toBeTruthy();

          // shipping options table
          expect(screen.getByTestId('product-shipping')).toBeTruthy();

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 11: Add to cart from ProductDetailsPage
// ---------------------------------------------------------------------------

// Feature: shopgrids-react-conversion, Property 11: Add to cart from ProductDetailsPage
describe('Property 11: Add to cart from ProductDetailsPage', () => {
  it('adds product to cart with the chosen quantity when Add to Cart is clicked', () => {
    // Validates: Requirements 6.4

    fc.assert(
      fc.property(
        fc.constantFrom(...products),
        fc.integer({ min: 1, max: 99 }),
        (product, qty) => {
          let latestCartState = [];

          const { unmount } = renderAtIdWithCartInspector(product.id, (state) => {
            latestCartState = state;
          });

          // Set the quantity input to qty
          const qtyInput = screen.getByTestId('quantity-input');
          fireEvent.change(qtyInput, { target: { value: String(qty) } });

          // Click add to cart
          const addBtn = screen.getByTestId('add-to-cart-btn');
          fireEvent.click(addBtn);

          // Cart should contain an entry for this product
          const entry = latestCartState.find(
            (item) => item.productId === product.id
          );
          expect(entry).toBeDefined();
          expect(entry.quantity).toBe(qty);
          expect(entry.productId).toBe(product.id);

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 22: Unknown product id renders not-found page
// ---------------------------------------------------------------------------

// Feature: shopgrids-react-conversion, Property 22: Unknown product id renders not-found page
describe('Property 22: Unknown product id renders not-found page', () => {
  it('shows "Product not found" and a link to /products for any unknown id', () => {
    // Validates: Requirements 11.3

    // Restrict to alphanumeric + hyphen/underscore to avoid URL encoding issues
    // (characters like ?, %, / would be treated as URL path segments and throw 404)
    const unknownIdArb = fc
      .stringMatching(/^[a-zA-Z0-9_-]{1,30}$/)
      .filter((s) => !products.some((p) => p.id === s));

    fc.assert(
      fc.property(unknownIdArb, (unknownId) => {
        const { unmount } = renderAtId(unknownId);

        // "Product not found" message
        const wrapper = screen.getByTestId('product-details-page');
        expect(wrapper.textContent).toContain('Product not found');

        // Link to /products
        const links = wrapper.querySelectorAll('a');
        const backLink = Array.from(links).find(
          (a) => a.getAttribute('href') === '/products'
        );
        expect(backLink).not.toBeUndefined();

        // No product-specific content
        expect(wrapper.querySelector('[data-testid="product-title"]')).toBeNull();
        expect(wrapper.querySelector('[data-testid="product-price"]')).toBeNull();
        expect(wrapper.querySelector('[data-testid="add-to-cart-btn"]')).toBeNull();

        unmount();
      }),
      { numRuns: 20 }
    );
  });
});
