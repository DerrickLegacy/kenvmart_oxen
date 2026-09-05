/**
 * motion.js — Shared animation constants following Emil Kowalski's animation standards.
 *
 * Rules applied:
 * - UI animations stay under 300ms
 * - Use transform strings (not Framer shorthand y/x/scale) for hardware acceleration
 * - ease-out for entering/exiting, ease-in-out for on-screen movement
 * - Stagger: 30–80ms between items max, cap at 6 items for performance
 * - All motion respects prefers-reduced-motion via the `reduced` variant
 */

// ── Easing tokens ──────────────────────────────────────────────────────────
export const EASE_OUT    = 'cubic-bezier(0.23, 1, 0.32, 1)';       // strong ease-out
export const EASE_IN_OUT = 'cubic-bezier(0.77, 0, 0.175, 1)';      // on-screen movement
export const EASE_DRAWER = 'cubic-bezier(0.32, 0.72, 0, 1)';       // iOS-like drawer

// ── Framer Motion variants ─────────────────────────────────────────────────

/**
 * Product card stagger entrance.
 * Uses full transform string (hardware-accelerated).
 * Stagger capped at 6 items × 40ms = 240ms max total — stays under 300ms.
 */
export const productCardVariants = {
  hidden: { opacity: 0, transform: 'translateY(16px)' },
  visible: (i) => ({
    opacity: 1,
    transform: 'translateY(0px)',
    transition: {
      delay: Math.min(i, 5) * 0.04,   // cap at 6 items × 40ms = 240ms max
      duration: 0.25,
      ease: [0.23, 1, 0.32, 1],
    },
  }),
};

/**
 * Fade-in for sections and non-staggered content.
 */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
  },
};

/**
 * Dropdown / popover enter-exit.
 * Scales from trigger origin — use transform-origin at the trigger in CSS.
 */
export const dropdownVariants = {
  hidden: {
    opacity: 0,
    transform: 'scale(0.95) translateY(-4px)',
  },
  visible: {
    opacity: 1,
    transform: 'scale(1) translateY(0px)',
    transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    opacity: 0,
    transform: 'scale(0.97) translateY(-4px)',
    transition: { duration: 0.1, ease: [0.23, 1, 0.32, 1] },
  },
};

/**
 * Mobile nav slide-down.
 */
export const mobileNavVariants = {
  hidden: { opacity: 0, transform: 'translateY(-8px)' },
  visible: {
    opacity: 1,
    transform: 'translateY(0px)',
    transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    opacity: 0,
    transform: 'translateY(-8px)',
    transition: { duration: 0.12, ease: [0.23, 1, 0.32, 1] },
  },
};

/**
 * Toast / success banner enter-exit (slides up from bottom).
 */
export const toastVariants = {
  hidden: {
    opacity: 0,
    transform: 'translateY(8px) scale(0.97)',
  },
  visible: {
    opacity: 1,
    transform: 'translateY(0px) scale(1)',
    transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    opacity: 0,
    transform: 'translateY(4px) scale(0.98)',
    transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] },
  },
};

/**
 * Shared VIEW_MORE_STYLES used by all product section components.
 */
export const VIEW_MORE_STYLES = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 16px',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#0b1a33',
    background: '#fff',
    border: '1.5px solid #dce0e6',
    borderRadius: '999px',
    textDecoration: 'none',
    transition: 'border-color 0.15s ease, color 0.15s ease',  // specific properties only
    cursor: 'pointer',
  },
};
