import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import fc from 'fast-check';
import ProductCard from '../../components/product/ProductCard';
import { CartProvider, CartContext } from '../../context/CartContext';
import { useContext } from 'react';

// ---------------------------------------------------------------------------
// Arbitrary
// ---------------------------------------------------------------------------

const productArb = fc
  .record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    category: fc.string({ minLength: 1, maxLength: 30 }),
    price: fc.double({ min: 1, max: 9999, noNaN: true }),
    images: fc.array(fc.constant('/assets/images/products/product-1.jpg'), {
      minLength: 1,
      maxLength: 3,
    }),
    rating: fc.double({ min: 0, max: 5, noNaN: true }),
    tag: fc.option(fc.constantFrom('sale', 'new'), { nil: undefined }),
    salePercent: fc.option(fc.integer({ min: 5, max: 70 }), { nil: undefined }),
    discountPrice: fc.option(fc.double({ min: 0.5, max: 500, noNaN: true }), {
      nil: undefined,
    }),
  })
  .map((p) => ({
    ...p,
    // Ensure discountPrice < price when present
    discountPrice:
      p.discountPrice != null
        ? Math.min(p.discountPrice, p.price * 0.9)
        : undefined,
    // Ensure salePercent is set when tag is 'sale'
    salePercent:
      p.tag === 'sale' ? (p.salePercent ?? 25) : p.salePercent,
  }));

// ---------------------------------------------------------------------------
// Render helper
// ---------------------------------------------------------------------------

function renderCard(product) {
  return render(
    <CartProvider>
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>
    </CartProvider>
  );
}

// Helper component to expose cart state for Property 7 assertions
function CartInspector({ children, onState }) {
  const { state } = useContext(CartContext);
  onState(state);
  return children;
}

function renderCardWithCartInspector(product, onState) {
  return render(
    <CartProvider>
      <MemoryRouter>
        <CartInspector onState={onState}>
          <ProductCard product={product} />
        </CartInspector>
      </MemoryRouter>
    </CartProvider>
  );
}

// ---------------------------------------------------------------------------
// Property 6: ProductCard renders all required fields
// ---------------------------------------------------------------------------

// Feature: shopgrids-react-conversion, Property 6: ProductCard renders all required fields
describe('Property 6: ProductCard renders all required fields', () => {
  it('renders image, category, name, star rating, and price for any valid product', () => {
    // Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
    fc.assert(
      fc.property(productArb, (product) => {
        const { unmount } = renderCard(product);

        // 5.1 – image with the first image src
        const img = document.querySelector('img');
        expect(img).not.toBeNull();
        expect(img.getAttribute('src')).toBe(product.images[0]);

        // 5.2 – category label (use DOM query to handle whitespace-only strings)
        const categoryEl = document.querySelector('.category');
        expect(categoryEl).not.toBeNull();
        expect(categoryEl.textContent).toBe(product.category);

        // 5.2 – product name appears in a link (use DOM query for whitespace-safe match)
        const titleLink = document.querySelector('h4.title a');
        expect(titleLink).not.toBeNull();
        expect(titleLink.textContent).toBe(product.name);

        // 5.2 – star-rating element (ul.review rendered by StarRating)
        const reviewList = document.querySelector('ul.review');
        expect(reviewList).not.toBeNull();

        // 5.2 – price visible somewhere in the card
        const priceContainer = document.querySelector('.price');
        expect(priceContainer).not.toBeNull();

        // 5.3 – discountPrice behaviour
        if (product.discountPrice != null) {
          // discountPrice displayed
          expect(
            screen.getByText(`$${product.discountPrice.toFixed(2)}`)
          ).toBeTruthy();
          // original price carries .discount-price class
          const originalPriceEl = document.querySelector('.discount-price');
          expect(originalPriceEl).not.toBeNull();
          expect(originalPriceEl.textContent).toBe(
            `$${product.price.toFixed(2)}`
          );
        } else {
          // only the regular price is shown
          expect(
            screen.getByText(`$${product.price.toFixed(2)}`)
          ).toBeTruthy();
          expect(document.querySelector('.discount-price')).toBeNull();
        }

        // 5.4 – sale tag
        if (product.tag === 'sale') {
          expect(document.querySelector('.sale-tag')).not.toBeNull();
        }

        // 5.5 – new tag
        if (product.tag === 'new') {
          expect(document.querySelector('.new-tag')).not.toBeNull();
        }

        unmount();
      }),
      { numRuns: 50 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7: Add to cart from ProductCard
// ---------------------------------------------------------------------------

// Feature: shopgrids-react-conversion, Property 7: Add to cart from ProductCard
describe('Property 7: Add to cart from ProductCard', () => {
  it('dispatches ADD_TO_CART and adds the product to the cart when button is clicked', () => {
    // Validates: Requirements 5.6, 7.2
    fc.assert(
      fc.property(productArb, (product) => {
        let latestCartState = [];

        const { unmount } = renderCardWithCartInspector(product, (state) => {
          latestCartState = state;
        });

        // Click "Add to Cart"
        const btn = screen.getByRole('button', { name: /add to cart/i });
        fireEvent.click(btn);

        // After click, cart should contain one entry for this product
        expect(latestCartState.length).toBeGreaterThanOrEqual(1);

        const entry = latestCartState.find(
          (item) => item.productId === product.id
        );
        expect(entry).toBeDefined();
        expect(entry.name).toBe(product.name);
        expect(entry.quantity).toBe(1);
        expect(entry.image).toBe(product.images[0]);
        // variant defaults to null when added from ProductCard
        expect(entry.variant).toBeNull();
        // price should be discountPrice if present, otherwise price
        const expectedPrice =
          product.discountPrice != null
            ? product.discountPrice
            : product.price;
        expect(entry.price).toBe(expectedPrice);

        unmount();
      }),
      { numRuns: 50 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 8: Product navigation link
// ---------------------------------------------------------------------------

// Feature: shopgrids-react-conversion, Property 8: Product navigation link
describe('Property 8: Product navigation link', () => {
  it('renders a link with href /product/<product.id> for any valid product', () => {
    // Validates: Requirements 5.7
    fc.assert(
      fc.property(productArb, (product) => {
        const { unmount } = renderCard(product);

        // Find any anchor whose href ends with /product/<id>
        const links = document.querySelectorAll('a');
        const productLink = Array.from(links).find((a) =>
          a.getAttribute('href') === `/product/${product.id}`
        );
        expect(productLink).not.toBeUndefined();

        unmount();
      }),
      { numRuns: 50 }
    );
  });
});
