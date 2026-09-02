import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within, act } from '@testing-library/react';
import fc from 'fast-check';
import { MemoryRouter } from 'react-router-dom';
import NewsletterForm from '../../components/layout/Footer/NewsletterForm';

// Wrap in MemoryRouter because Footer/NewsletterForm uses react-router Link (parent may)
function renderForm() {
  return render(
    <MemoryRouter>
      <NewsletterForm />
    </MemoryRouter>
  );
}

// Feature: shopgrids-react-conversion, Property 19: Email validation rejects invalid formats
describe('Property 19: Email validation rejects invalid formats', () => {
  // Validates: Requirements 9.3
  afterEach(() => {
    cleanup();
  });

  it('shows error and no success for invalid email inputs', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // No @ symbol
          fc.string({ maxLength: 10 }).filter(s => !s.includes('@')),
          // Blank input
          fc.constant(''),
          // Over 254 chars (any string)
          fc.string({ minLength: 255, maxLength: 300 })
        ),
        (invalidEmail) => {
          const { container, unmount } = renderForm();

          // Scope queries to this specific render's container
          const input = within(container).getByPlaceholderText(/email address here/i);
          const form = container.querySelector('form.newsletter-form');

          // Set the input value directly
          fireEvent.change(input, { target: { value: invalidEmail } });

          // Submit the form directly (bypasses browser type="email" validation)
          fireEvent.submit(form);

          // Should show an error alert
          const errorEl = within(container).getByRole('alert');
          expect(errorEl).toBeInTheDocument();

          // Should NOT show the success message
          const successEl = within(container).queryByRole('status');
          expect(successEl).not.toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });
});

// Feature: shopgrids-react-conversion, Property 20: Valid email submission shows and clears success message
describe('Property 20: Valid email submission shows and clears success message', () => {
  // Validates: Requirements 9.4
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('shows success message immediately then clears it and the input after 3 seconds', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        (validEmail) => {
          const { container, unmount } = renderForm();

          const input = within(container).getByPlaceholderText(/email address here/i);
          const form = container.querySelector('form.newsletter-form');

          // Set a valid email value and submit the form
          fireEvent.change(input, { target: { value: validEmail } });
          fireEvent.submit(form);

          // Success message should be visible immediately
          const successEl = within(container).getByRole('status');
          expect(successEl).toBeInTheDocument();
          expect(successEl).toHaveTextContent(/thank you for subscribing/i);

          // No error should be shown
          expect(within(container).queryByRole('alert')).not.toBeInTheDocument();

          // Advance timers by 3 seconds — success message and input should clear
          act(() => {
            vi.advanceTimersByTime(3000);
          });

          // Success message should be gone
          expect(within(container).queryByRole('status')).not.toBeInTheDocument();

          // Input should be cleared
          expect(input.value).toBe('');

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });
});
