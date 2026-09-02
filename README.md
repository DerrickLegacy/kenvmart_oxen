# Kenvies Accessories — React Storefront

A fully client-side React ecommerce storefront for **Kenvies Accessories**, a premium accessories brand selling watches, bags, jewellery, sunglasses, belts, and wallets. Customers browse products, build a cart, and submit orders for review — no payment processing is involved. The store owner reviews submitted orders and arranges shipping manually.

---

## UI Library

**This project does NOT use React-Bootstrap or Material UI.**

It uses **Bootstrap 5.3 CSS-only** — meaning only the CSS file is imported for grid layout (`col-*` classes) and utility helpers (`d-flex`, `d-none`, `ms-auto`, etc.). Bootstrap's JavaScript components (dropdowns, modals, toasts) are **not used**. All interactive UI — dropdowns, accordions, sliders, drawers, quantity steppers, toasts — are implemented directly in React using `useState`/`useEffect`.

| What it uses | What it does NOT use |
|---|---|
| Bootstrap 5.3 **CSS** (grid + utilities) | `react-bootstrap` package |
| Custom `main.css` (all component styles) | Material UI / MUI |
| LineIcons 3.0 icon font | Bootstrap JS / Popper |
| GLightbox 3.3 CSS | Any component library |
| React Router DOM v7 | Redux / Zustand |
| React Context API | Any state management library |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React | ^19.2.7 |
| Build tool | Vite | ^8.1.1 |
| Routing | React Router DOM | ^7.18.1 |
| CSS grid/utilities | Bootstrap (CSS only) | 5.3.3 |
| Icons | LineIcons 3.0 | bundled in `src/styles/` |
| Lightbox | GLightbox | 3.3.0 |
| Testing | Vitest + Testing Library | ^4.x |
| Linter | ESLint | ^10.x |

---

## Project Structure

```
shopgrids-react/
├── public/
│   └── assets/
│       └── images/          # Product images, logos, banners
├── src/
│   ├── components/
│   │   ├── home/            # Hero slider, banners, trending products, CTA
│   │   ├── layout/
│   │   │   ├── Header/      # Topbar, HeaderMiddle (search + cart), HeaderBottom (nav)
│   │   │   ├── Footer/      # Footer + newsletter form
│   │   │   ├── AppLayout.jsx
│   │   │   ├── Breadcrumb.jsx
│   │   │   ├── Preloader.jsx
│   │   │   └── ScrollToTop.jsx
│   │   ├── product/         # ProductCard, ProductGallery, StarRating
│   │   ├── reusables/       # Dropdown
│   │   └── shop/            # PriceFilter
│   ├── context/
│   │   ├── CartContext.jsx      # Cart state — persisted to localStorage
│   │   ├── WishlistContext.jsx  # Wishlist state — persisted to localStorage
│   │   └── OrdersContext.jsx    # Submitted orders — persisted to localStorage
│   ├── data/
│   │   ├── products.js      # Static product catalogue (8 products)
│   │   └── categories.js    # Category definitions
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── ProductsPage.jsx       # Search + category filter + sidebar
│   │   ├── ProductDetailsPage.jsx # Gallery, variant picker, qty stepper, add to cart
│   │   ├── CartPage.jsx           # Cart summary + Send Order button
│   │   ├── OrdersPage.jsx         # Order history
│   │   ├── WishlistPage.jsx
│   │   ├── LoginPage.jsx          # Standalone (no header/footer)
│   │   ├── RegisterPage.jsx       # Standalone
│   │   ├── AboutPage.jsx
│   │   ├── ContactPage.jsx
│   │   ├── FaqPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── styles/
│   │   ├── main.css         # All custom component CSS + mobile breakpoints
│   │   └── LineIcons.3.0.css
│   ├── App.jsx              # Router + provider tree
│   └── main.jsx             # Entry point — mounts providers
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

## State Management

All state is managed with React's built-in **Context API + useReducer/useState**. No external state library is used.

### CartContext
- **Key:** `kenvies_cart` in `localStorage`
- **Actions:** `ADD_TO_CART`, `REMOVE_FROM_CART`, `UPDATE_QUANTITY`, `CLEAR_CART`
- Cart items include: `productId`, `name`, `price`, `quantity`, `image`, `variant`

### WishlistContext
- **Key:** `kenvies_wishlist` in `localStorage`
- **Actions:** `ADD_TO_WISHLIST`, `REMOVE_FROM_WISHLIST`
- Deduplication: a product can only appear once regardless of variant

### OrdersContext
- **Key:** `kenvies_orders` in `localStorage`
- **Action:** `placeOrder(cartItems)` — snapshots the cart, assigns an `ORD-{timestamp}` ID, sets status `Pending`
- Orders are **never deleted** from localStorage — full history is preserved

---

## Routing

| Path | Page | Layout |
|---|---|---|
| `/` | Home | Header + Footer |
| `/products` | Products grid + sidebar | Header + Footer |
| `/products?q=watch` | Search results | Header + Footer |
| `/products?category=Watches` | Category filter | Header + Footer |
| `/product/:id` | Product details | Header + Footer |
| `/cart` | Cart / Send Order | Header + Footer |
| `/orders` | Order history | Header + Footer |
| `/wishlist` | Wishlist | Header + Footer |
| `/about` | About Us | Header + Footer |
| `/faq` | FAQ accordion | Header + Footer |
| `/contact` | Contact form | Header + Footer |
| `/login` | Login | **Standalone** (no header/footer) |
| `/register` | Register | **Standalone** |
| `*` | 404 Not Found | Header + Footer |

Login and Register are rendered outside `AppLayout` so they display as full-screen isolated pages.

---

## Order Flow

This store has **no payment processing**. The flow is:

1. Customer browses → adds items to cart (navigates to product detail page first)
2. Customer adjusts quantities in the cart
3. Customer clicks **Send Order** — order is saved to localStorage with status `Pending`
4. Cart is cleared, customer is redirected to `/orders`
5. Store owner reviews orders in the Orders page and contacts the customer for shipping

---

## Custom CSS Architecture

All styling lives in `src/styles/main.css` (~7000 lines). It is structured as:

1. **Base / normalize** — typography, spacing utilities
2. **Layout** — header, footer, breadcrumb banner
3. **Page sections** — hero, products, item details, cart, orders, login
4. **Component styles** — sidebar, product card, gallery, star rating, FAQ accordion
5. **Mobile responsive overrides** — all `@media (max-width: 767px)` and `@media (max-width: 575px)` rules at the end of the file

Breakpoints used:
- `< 576px` — small phones (iPhone SE, older Androids)
- `576–767px` — large phones
- `768–991px` — tablets
- `992–1199px` — small desktops
- `1200px+` — large desktops (base styles)

**No CSS Modules, no Tailwind, no Sass** — plain CSS with BEM-adjacent class naming.

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Install and run

```bash
# Navigate to the React app
cd shopgrids-react

# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Build for production

```bash
npm run build
```

Output goes to `dist/`. The built files are static HTML/JS/CSS — deploy to any static host (Netlify, Vercel, GitHub Pages, etc.).

### Preview production build locally

```bash
npm run preview
```

### Run tests

```bash
npm test
# or single-run (no watch mode)
npx vitest run
```

---

## Environment Variables

Currently no environment variables are required to run the app locally. If you add Google OAuth or a backend API later, create a `.env.local` file in the `shopgrids-react/` folder:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_BASE_URL=https://your-api.example.com
```

Vite exposes variables prefixed with `VITE_` to the client. The `.env*.local` files are already in `.gitignore` — never commit secrets.

---

## Contact

- **Phone:** 20080401
- **Email:** kenviesaccessories@gmail.com
