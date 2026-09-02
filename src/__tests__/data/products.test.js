// Feature: shopgrids-react-conversion, Property 21: Product_Data schema invariant
// Validates: Requirements 11.1

import { describe, it } from 'vitest';
import fc from 'fast-check';
import { products } from '../../data/products';

describe('Product_Data schema invariant', () => {
  it('every product satisfies all schema constraints simultaneously', () => {
    fc.assert(
      fc.property(fc.constant(products), (allProducts) => {
        // Collect all ids for uniqueness check
        const ids = allProducts.map((p) => p.id);
        const uniqueIds = new Set(ids);

        // Constraint 2: all id values are unique
        if (uniqueIds.size !== ids.length) {
          return false;
        }

        for (const product of allProducts) {
          // Constraint 1: id is a non-empty string
          if (typeof product.id !== 'string' || product.id.length === 0) {
            return false;
          }

          // Constraint 10: name is a non-empty string
          if (typeof product.name !== 'string' || product.name.length === 0) {
            return false;
          }

          // Constraint 11: category is a non-empty string
          if (typeof product.category !== 'string' || product.category.length === 0) {
            return false;
          }

          // Constraint 3: price is a positive finite number (> 0)
          if (
            typeof product.price !== 'number' ||
            !isFinite(product.price) ||
            product.price <= 0
          ) {
            return false;
          }

          // Constraint 4: when discountPrice is present, it is a positive number strictly less than price
          if (product.discountPrice !== undefined && product.discountPrice !== null) {
            if (
              typeof product.discountPrice !== 'number' ||
              product.discountPrice <= 0 ||
              product.discountPrice >= product.price
            ) {
              return false;
            }
          }

          // Constraint 5: images is a non-empty array of strings
          if (
            !Array.isArray(product.images) ||
            product.images.length === 0 ||
            !product.images.every((img) => typeof img === 'string')
          ) {
            return false;
          }

          // Constraint 6: rating is a number between 0.0 and 5.0 inclusive
          if (
            typeof product.rating !== 'number' ||
            product.rating < 0.0 ||
            product.rating > 5.0
          ) {
            return false;
          }

          // Constraint 7: when tag is present, it is exactly "sale" or "new"
          if (product.tag !== undefined && product.tag !== null) {
            if (product.tag !== 'sale' && product.tag !== 'new') {
              return false;
            }
          }

          // Constraint 8: features is an array of strings
          if (
            !Array.isArray(product.features) ||
            !product.features.every((f) => typeof f === 'string')
          ) {
            return false;
          }

          // Constraint 9: specifications is a plain object (not null, not array)
          if (
            typeof product.specifications !== 'object' ||
            product.specifications === null ||
            Array.isArray(product.specifications)
          ) {
            return false;
          }
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });
});
