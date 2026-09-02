import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import fc from 'fast-check';
import ScrollToTop from '../../components/layout/ScrollToTop';

// Feature: shopgrids-react-conversion, Property 5: ScrollToTop visibility threshold
describe('Property 5: ScrollToTop visibility threshold', () => {
  it('is hidden when scrollY <= 200 and visible when scrollY > 200', () => {
    // Validates: Requirements 3.7
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), (y) => {
        // Render the component
        const { unmount } = render(<ScrollToTop />);

        // Set window.scrollY
        Object.defineProperty(window, 'scrollY', {
          value: y,
          configurable: true,
          writable: true,
        });

        // Fire scroll event
        act(() => {
          window.dispatchEvent(new Event('scroll'));
        });

        const btn = screen.getByTestId('scroll-to-top');

        if (y > 200) {
          expect(btn.style.display).toBe('block');
        } else {
          expect(btn.style.display).toBe('none');
        }

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
