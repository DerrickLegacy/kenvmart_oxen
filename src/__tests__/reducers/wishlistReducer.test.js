import { describe, it } from 'vitest';
import fc from 'fast-check';
import { wishlistReducer } from '../../context/WishlistContext';

// Feature: shopgrids-react-conversion, Property 12: Wishlist deduplication

describe('wishlistReducer — Property 12: Wishlist deduplication', () => {
  /**
   * Validates: Requirements 6.5
   *
   * For any valid product, calling ADD_TO_WISHLIST twice with the same product id
   * should produce a wishlist state containing exactly one entry for that product id —
   * the second dispatch must be a no-op.
   */
  it('adding the same product twice results in exactly one wishlist entry', () => {
    const productArbitrary = fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      price: fc.float({ min: Math.fround(0.01), max: Math.fround(9999), noNaN: true }),
      images: fc.array(fc.webUrl(), { minLength: 1 }),
    });

    fc.assert(
      fc.property(productArbitrary, (product) => {
        const addAction = { type: 'ADD_TO_WISHLIST', payload: { product } };

        // First dispatch: product is added
        const state1 = wishlistReducer([], addAction);

        // Second dispatch: should be a no-op — product already present
        const state2 = wishlistReducer(state1, addAction);

        // Exactly one entry for this product id
        return state2.filter((item) => item.productId === product.id).length === 1;
      }),
      { numRuns: 100 }
    );
  });
});
