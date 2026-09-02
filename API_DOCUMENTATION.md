# Kenvies Accessories — REST API Documentation

> **Stack:** CodeIgniter 3 + [chriskacerguis/codeigniter-restserver](https://github.com/chriskacerguis/codeigniter-restserver)  
> **Base URL:** `http://<your-ci3-domain>/api`  
> **Content-Type:** `application/json` (all requests and responses)  
> **Auth:** JWT token passed as `Authorization: Bearer <token>` header on protected routes.

---

## Table of Contents

1. [Auth](#1-auth)
2. [Products](#2-products)
3. [Categories](#3-categories)
4. [Cart](#4-cart)
5. [Wishlist](#5-wishlist)
6. [Orders](#6-orders)
7. [Contact](#7-contact)
8. [Newsletter](#8-newsletter)
9. [User Profile](#9-user-profile)
10. [Data Models Reference](#10-data-models-reference)
11. [Error Format](#11-error-format)
12. [Notes for CI3 Implementation](#12-notes-for-ci3-implementation)

---

## 1. Auth

All auth endpoints live under `/api/auth`.

### 1.1 Register

**POST** `/api/auth/register`  
Creates a new customer account.

**Request Body**

```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+256701234567",
  "password": "secret123",
  "password_confirmation": "secret123"
}
```

**Validation Rules**

| Field | Rule |
|-------|------|
| `full_name` | required, string, max 100 chars |
| `email` | required, valid email, unique in `users` table |
| `phone` | required, 7–15 digits, optionally prefixed with `+` |
| `password` | required, min 6 characters |
| `password_confirmation` | required, must match `password` |

**Success Response — 201 Created**

```json
{
  "status": true,
  "message": "Account created successfully.",
  "data": {
    "user": {
      "id": 1,
      "full_name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+256701234567",
      "created_at": "2026-07-27T10:00:00Z"
    },
    "token": "<jwt_token>"
  }
}
```

**Error Response — 422 Unprocessable Entity**

```json
{
  "status": false,
  "message": "Validation failed.",
  "errors": {
    "email": "The email address is already registered.",
    "password": "Password must be at least 6 characters."
  }
}
```

---

### 1.2 Login (Email or Phone)

**POST** `/api/auth/login`  
Accepts either email address or phone number as the identifier, plus a password.

**Request Body**

```json
{
  "identifier": "jane@example.com",
  "password": "secret123"
}
```

> `identifier` can be an email address **or** a phone number — the backend should detect which and query accordingly.

**Success Response — 200 OK**

```json
{
  "status": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": 1,
      "full_name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+256701234567"
    },
    "token": "<jwt_token>"
  }
}
```

**Error Response — 401 Unauthorized**

```json
{
  "status": false,
  "message": "Invalid credentials."
}
```

---

### 1.3 Google OAuth — Exchange Code for Token

**POST** `/api/auth/google`  
Called from the React app's Google OAuth callback. Receives the authorization code from Google and returns a Kenvies JWT.

**Request Body**

```json
{
  "code": "<google_auth_code>",
  "redirect_uri": "https://your-react-app.com/auth/google/callback"
}
```

**Success Response — 200 OK**

```json
{
  "status": true,
  "data": {
    "user": {
      "id": 5,
      "full_name": "John Smith",
      "email": "john@gmail.com",
      "avatar": "https://lh3.googleusercontent.com/..."
    },
    "token": "<jwt_token>",
    "is_new_user": false
  }
}
```

---

### 1.4 Logout

**POST** `/api/auth/logout`  
🔒 **Requires auth token.**  
Invalidates the user's current JWT (server-side token blacklist or deletion).

**Request Body** *(empty)*

**Success Response — 200 OK**

```json
{
  "status": true,
  "message": "Logged out successfully."
}
```

---

### 1.5 Get Authenticated User

**GET** `/api/auth/me`  
🔒 **Requires auth token.**  
Returns the currently authenticated user's profile.

**Success Response — 200 OK**

```json
{
  "status": true,
  "data": {
    "id": 1,
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+256701234567",
    "created_at": "2026-07-27T10:00:00Z"
  }
}
```

---

## 2. Products

All product endpoints live under `/api/products`.

### 2.1 List All Products

**GET** `/api/products`  
Returns a paginated list of products. Supports search and category filter via query params.

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search term — matched against name, category, brand |
| `category` | string | Exact category slug or name filter |
| `brand` | string | Filter by brand name |
| `tag` | string | Filter by tag: `sale`, `new`, `trending` |
| `min_price` | number | Minimum price (UGX) |
| `max_price` | number | Maximum price (UGX) |
| `sort` | string | `price_asc`, `price_desc`, `rating_desc`, `newest` |
| `page` | int | Page number (default: 1) |
| `per_page` | int | Items per page (default: 20, max: 100) |

**Success Response — 200 OK**

```json
{
  "status": true,
  "data": {
    "products": [
      {
        "id": "prod-001",
        "name": "Oraimo FreePods 4 TWS Earbuds",
        "category": "Earphones & Earbuds",
        "brand": "Oraimo",
        "price": 45000,
        "discount_price": 38000,
        "images": ["/assets/images/products/product-1.jpg"],
        "rating": 4.5,
        "rating_count": 24,
        "tag": "sale",
        "sale_percent": 15,
        "variants": ["Black", "White"],
        "colors": ["#1a1a1a", "#f5f5f5"],
        "in_stock": true
      }
    ],
    "pagination": {
      "total": 42,
      "per_page": 20,
      "current_page": 1,
      "last_page": 3
    }
  }
}
```

---

### 2.2 Get Single Product

**GET** `/api/products/{id}`  
Returns full details for one product, including specifications, features, and shipping options.

**Success Response — 200 OK**

```json
{
  "status": true,
  "data": {
    "id": "prod-001",
    "name": "Oraimo FreePods 4 TWS Earbuds",
    "category": "Earphones & Earbuds",
    "brand": "Oraimo",
    "price": 45000,
    "discount_price": 38000,
    "description": "True wireless earbuds with ANC...",
    "images": [
      "/assets/images/products/product-1.jpg",
      "/assets/images/product-details/01.jpg"
    ],
    "rating": 4.5,
    "rating_count": 24,
    "tag": "sale",
    "sale_percent": 15,
    "variants": ["Black", "White"],
    "colors": ["#1a1a1a", "#f5f5f5"],
    "features": [
      "Active Noise Cancellation (ANC)",
      "Bluetooth 5.3 — 10m range"
    ],
    "specifications": {
      "Driver Size": "10mm",
      "Bluetooth": "5.3",
      "Playtime (buds)": "7 hours",
      "Charging": "USB-C",
      "Water Resistance": "IPX5"
    },
    "shipping_options": [
      { "method": "Standard Delivery", "duration": "2–4 business days", "cost": "Free" },
      { "method": "Express Delivery", "duration": "Same day", "cost": "UGX 5,000" }
    ],
    "in_stock": true,
    "stock_qty": 50
  }
}
```

**Error Response — 404 Not Found**

```json
{
  "status": false,
  "message": "Product not found."
}
```

---

### 2.3 Get Trending / Featured Products

**GET** `/api/products/trending`  
Returns the homepage "Trending Products" list. Optional `limit` query param (default: 8).

**GET** `/api/products/deals`  
Returns today's deals (products with tag = `sale`). Optional `limit` (default: 8).

Both return the same lightweight product object shape as the product list (section 2.1).

---

### 2.4 Get Related Products

**GET** `/api/products/{id}/related`  
Returns up to 4 products in the same category, excluding the current product.

---

## 3. Categories

**GET** `/api/categories`  
Returns all available product categories with their product counts.

**Success Response — 200 OK**

```json
{
  "status": true,
  "data": [
    { "id": 1, "name": "Earphones & Earbuds", "slug": "earphones-earbuds", "product_count": 12 },
    { "id": 2, "name": "Chargers",            "slug": "chargers",           "product_count": 8 },
    { "id": 3, "name": "Cables & Adapters",   "slug": "cables-adapters",    "product_count": 5 },
    { "id": 4, "name": "Power Banks",         "slug": "power-banks",        "product_count": 6 },
    { "id": 5, "name": "Screen Protectors",   "slug": "screen-protectors",  "product_count": 9 },
    { "id": 6, "name": "Speakers",            "slug": "speakers",           "product_count": 4 },
    { "id": 7, "name": "Smart Watches",       "slug": "smart-watches",      "product_count": 3 }
  ]
}
```

---

## 4. Cart

> The React app currently manages cart state in `localStorage`. The backend cart API is needed for:
> - Syncing the cart when a user logs in across devices
> - Persisting cart server-side between sessions
>
> The frontend should sync the local cart to the server on login and always treat the server as the source of truth for logged-in users.

All cart endpoints are 🔒 **auth-protected**.  
Base path: `/api/cart`

---

### 4.1 Get Cart

**GET** `/api/cart`

**Success Response — 200 OK**

```json
{
  "status": true,
  "data": {
    "items": [
      {
        "product_id": "prod-001",
        "name": "Oraimo FreePods 4 TWS Earbuds",
        "price": 38000,
        "original_price": 45000,
        "quantity": 2,
        "variant": "Black",
        "image": "/assets/images/products/product-1.jpg"
      }
    ],
    "total": 76000,
    "item_count": 2
  }
}
```

---

### 4.2 Add Item to Cart

**POST** `/api/cart`

**Request Body**

```json
{
  "product_id": "prod-001",
  "quantity": 1,
  "variant": "Black"
}
```

> If the `product_id` + `variant` combination already exists in the cart, the quantity is **incremented** (not replaced). Max quantity per line is 99.

**Success Response — 200 OK** — returns the updated full cart (same shape as GET `/api/cart`).

---

### 4.3 Update Cart Item Quantity

**PUT** `/api/cart/{product_id}`

**Request Body**

```json
{
  "quantity": 3,
  "variant": "Black"
}
```

> Include `variant` to identify the correct line item when the same product has multiple variants in the cart.

**Success Response — 200 OK** — returns the updated full cart.

---

### 4.4 Remove Cart Item

**DELETE** `/api/cart/{product_id}`

**Query Params**

| Param | Required | Description |
|-------|----------|-------------|
| `variant` | no | Variant name to identify which line to remove |

**Success Response — 200 OK** — returns the updated full cart.

---

### 4.5 Clear Cart

**DELETE** `/api/cart`  
Removes all items from the user's cart.

**Success Response — 200 OK**

```json
{
  "status": true,
  "message": "Cart cleared."
}
```

---

### 4.6 Sync Cart (on Login)

**POST** `/api/cart/sync`  
Called once immediately after login to merge the anonymous local cart into the server cart.

**Request Body**

```json
{
  "items": [
    { "product_id": "prod-001", "quantity": 2, "variant": "Black" },
    { "product_id": "prod-004", "quantity": 1, "variant": "20,000mAh" }
  ]
}
```

**Success Response — 200 OK** — returns the merged cart (same shape as GET `/api/cart`).

---

## 5. Wishlist

> Same pattern as Cart — local `localStorage` state for guests, server-synced for logged-in users.

All wishlist endpoints are 🔒 **auth-protected**.  
Base path: `/api/wishlist`

---

### 5.1 Get Wishlist

**GET** `/api/wishlist`

**Success Response — 200 OK**

```json
{
  "status": true,
  "data": {
    "items": [
      {
        "product_id": "prod-001",
        "name": "Oraimo FreePods 4 TWS Earbuds",
        "price": 38000,
        "image": "/assets/images/products/product-1.jpg",
        "added_at": "2026-07-20T08:30:00Z"
      }
    ],
    "count": 1
  }
}
```

---

### 5.2 Add to Wishlist

**POST** `/api/wishlist`

**Request Body**

```json
{
  "product_id": "prod-001"
}
```

> No-op if the product is already in the wishlist — should return 200, not 409.

**Success Response — 200 OK** — returns the updated wishlist.

---

### 5.3 Remove from Wishlist

**DELETE** `/api/wishlist/{product_id}`

**Success Response — 200 OK** — returns the updated wishlist.

---

### 5.4 Clear Wishlist

**DELETE** `/api/wishlist`

**Success Response — 200 OK**

```json
{
  "status": true,
  "message": "Wishlist cleared."
}
```

---

### 5.5 Sync Wishlist (on Login)

**POST** `/api/wishlist/sync`  
Merges the anonymous local wishlist into the server wishlist.

**Request Body**

```json
{
  "product_ids": ["prod-001", "prod-006"]
}
```

**Success Response — 200 OK** — returns the merged wishlist.

---

## 6. Orders

> The current React app uses a "Send Order" flow — no payment is processed. The customer submits their cart as an order, and the store operator reviews it and contacts them about shipping and payment.
>
> Order statuses: `Pending` → `Processing` → `Shipped` → `Delivered` | `Cancelled`

All order endpoints are 🔒 **auth-protected**.  
Base path: `/api/orders`

---

### 6.1 Place Order (Send Cart as Order)

**POST** `/api/orders`  
Converts the current cart into a new order with status `Pending`. Clears the server-side cart.

**Request Body**

```json
{
  "items": [
    {
      "product_id": "prod-001",
      "name": "Oraimo FreePods 4 TWS Earbuds",
      "price": 38000,
      "original_price": 45000,
      "quantity": 2,
      "variant": "Black",
      "image": "/assets/images/products/product-1.jpg"
    }
  ],
  "note": "Please call before delivery."
}
```

> `items` is sent from the cart snapshot. `note` is optional.

**Success Response — 201 Created**

```json
{
  "status": true,
  "message": "Order placed successfully.",
  "data": {
    "order_id": "ORD-1722074400000",
    "status": "Pending",
    "placed_at": "2026-07-27T12:00:00Z",
    "total": 76000
  }
}
```

---

### 6.2 List User's Orders

**GET** `/api/orders`  
Returns all orders for the authenticated user, newest first.

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled` |
| `q` | string | Search by order ID or product name |
| `page` | int | Page number (default: 1) |
| `per_page` | int | Items per page (default: 10) |

**Success Response — 200 OK**

```json
{
  "status": true,
  "data": {
    "orders": [
      {
        "id": "ORD-1722074400000",
        "placed_at": "2026-07-27T12:00:00Z",
        "status": "Pending",
        "total": 76000,
        "item_count": 2,
        "items": [
          {
            "product_id": "prod-001",
            "name": "Oraimo FreePods 4 TWS Earbuds",
            "price": 38000,
            "quantity": 2,
            "variant": "Black",
            "image": "/assets/images/products/product-1.jpg"
          }
        ]
      }
    ],
    "pagination": {
      "total": 5,
      "per_page": 10,
      "current_page": 1,
      "last_page": 1
    }
  }
}
```

---

### 6.3 Get Single Order

**GET** `/api/orders/{order_id}`  
Returns full details of one order. The authenticated user must own the order.

**Success Response — 200 OK** — same item shape as the list, with all fields.

---

### 6.4 Cancel Order

**DELETE** `/api/orders/{order_id}`  
🔒 Only works when `status === 'Pending'`.

**Success Response — 200 OK**

```json
{
  "status": true,
  "message": "Order cancelled successfully."
}
```

**Error Response — 403 Forbidden** (if order is no longer Pending)

```json
{
  "status": false,
  "message": "Only pending orders can be cancelled."
}
```

---

### 6.5 Remove Item from Pending Order

**DELETE** `/api/orders/{order_id}/items/{product_id}`  
Removes a single line item from a `Pending` order and recalculates the total.  
If the last item is removed, the entire order is cancelled.

**Query Params**

| Param | Required | Description |
|-------|----------|-------------|
| `variant` | no | Variant name to identify the correct line |

**Success Response — 200 OK** — returns the updated order.

---

### 6.6 Update Item Quantity in Pending Order

**PUT** `/api/orders/{order_id}/items/{product_id}`  
Updates the quantity of one line item in a `Pending` order. Recalculates the total.

**Request Body**

```json
{
  "quantity": 3,
  "variant": "Black"
}
```

**Success Response — 200 OK** — returns the updated order.

---

## 7. Contact

**POST** `/api/contact`  
Public endpoint — no auth required. Submits the contact form.

**Request Body**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Order enquiry",
  "message": "I wanted to ask about the delivery time for my recent order."
}
```

**Validation Rules**

| Field | Rule |
|-------|------|
| `name` | required, string |
| `email` | required, valid email |
| `subject` | required, string |
| `message` | required, min 20 characters |

**Success Response — 200 OK**

```json
{
  "status": true,
  "message": "Message received. We will get back to you shortly."
}
```

**Error Response — 422**

```json
{
  "status": false,
  "message": "Validation failed.",
  "errors": {
    "message": "Message must be at least 20 characters."
  }
}
```

---

## 8. Newsletter

**POST** `/api/newsletter/subscribe`  
Public endpoint — no auth required. Adds an email to the newsletter mailing list.

**Request Body**

```json
{
  "email": "jane@example.com"
}
```

**Success Response — 200 OK**

```json
{
  "status": true,
  "message": "You have successfully subscribed to our newsletter."
}
```

> If the email is already subscribed, return `200` with the same message — do not expose whether it was already in the list.

---

## 9. User Profile

All profile endpoints are 🔒 **auth-protected**.  
Base path: `/api/profile`

---

### 9.1 Get Profile

**GET** `/api/profile`  
Same as `GET /api/auth/me` — can reuse the same controller method.

---

### 9.2 Update Profile

**PUT** `/api/profile`

**Request Body** *(all fields optional — only send what changed)*

```json
{
  "full_name": "Jane Doe Updated",
  "phone": "+256709999999"
}
```

> Email is not updatable here — email changes require a separate verification flow.

**Success Response — 200 OK**

```json
{
  "status": true,
  "message": "Profile updated.",
  "data": {
    "id": 1,
    "full_name": "Jane Doe Updated",
    "email": "jane@example.com",
    "phone": "+256709999999"
  }
}
```

---

### 9.3 Change Password

**PUT** `/api/profile/password`

**Request Body**

```json
{
  "current_password": "secret123",
  "new_password": "newsecret456",
  "new_password_confirmation": "newsecret456"
}
```

**Success Response — 200 OK**

```json
{
  "status": true,
  "message": "Password changed successfully."
}
```

**Error Response — 422**

```json
{
  "status": false,
  "message": "Validation failed.",
  "errors": {
    "current_password": "The current password is incorrect."
  }
}
```

---

## 10. Data Models Reference

### User

| Field | Type | Notes |
|-------|------|-------|
| `id` | int | Auto-increment PK |
| `full_name` | varchar(100) | |
| `email` | varchar(150) | Unique |
| `phone` | varchar(20) | Unique |
| `password_hash` | varchar(255) | Bcrypt |
| `google_id` | varchar(100) | Nullable — for Google OAuth users |
| `avatar` | varchar(255) | Nullable — Google profile pic URL |
| `created_at` | datetime | |
| `updated_at` | datetime | |

---

### Product

| Field | Type | Notes |
|-------|------|-------|
| `id` | varchar(20) | e.g. `prod-001` (matches frontend IDs) |
| `name` | varchar(255) | |
| `category` | varchar(100) | |
| `brand` | varchar(100) | |
| `price` | int | UGX, no decimals |
| `discount_price` | int | Nullable |
| `description` | text | |
| `images` | json | Array of relative image paths |
| `rating` | decimal(2,1) | 0.0–5.0 |
| `rating_count` | int | Number of ratings |
| `tag` | varchar(20) | Nullable: `sale`, `new`, `trending` |
| `sale_percent` | int | Nullable |
| `variants` | json | Array of variant strings |
| `colors` | json | Array of hex color strings |
| `features` | json | Array of feature strings |
| `specifications` | json | Key-value object |
| `shipping_options` | json | Array of `{method, duration, cost}` |
| `in_stock` | tinyint(1) | |
| `stock_qty` | int | |
| `created_at` | datetime | |

---

### Cart Item (server-side)

| Field | Type | Notes |
|-------|------|-------|
| `id` | int | PK |
| `user_id` | int | FK → users |
| `product_id` | varchar(20) | FK → products |
| `variant` | varchar(100) | Nullable |
| `quantity` | int | 1–99 |
| `price_at_add` | int | Price locked at time of adding (UGX) |
| `created_at` | datetime | |

---

### Order

| Field | Type | Notes |
|-------|------|-------|
| `id` | varchar(30) | e.g. `ORD-1722074400000` |
| `user_id` | int | FK → users |
| `status` | enum | `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled` |
| `total` | int | UGX |
| `note` | text | Nullable |
| `placed_at` | datetime | |
| `updated_at` | datetime | |

---

### Order Item

| Field | Type | Notes |
|-------|------|-------|
| `id` | int | PK |
| `order_id` | varchar(30) | FK → orders |
| `product_id` | varchar(20) | Snapshot — not FK (product can be deleted later) |
| `name` | varchar(255) | Snapshot |
| `price` | int | Snapshot (UGX) |
| `original_price` | int | Snapshot (UGX) |
| `quantity` | int | |
| `variant` | varchar(100) | Nullable |
| `image` | varchar(255) | Snapshot |

---

### Wishlist Item

| Field | Type | Notes |
|-------|------|-------|
| `id` | int | PK |
| `user_id` | int | FK → users |
| `product_id` | varchar(20) | FK → products |
| `added_at` | datetime | |

---

### Contact Message

| Field | Type | Notes |
|-------|------|-------|
| `id` | int | PK |
| `name` | varchar(100) | |
| `email` | varchar(150) | |
| `subject` | varchar(255) | |
| `message` | text | |
| `created_at` | datetime | |
| `is_read` | tinyint(1) | For admin dashboard use |

---

### Newsletter Subscriber

| Field | Type | Notes |
|-------|------|-------|
| `id` | int | PK |
| `email` | varchar(150) | Unique |
| `subscribed_at` | datetime | |

---

## 11. Error Format

All error responses follow the same consistent envelope. HTTP status codes are used correctly.

```json
{
  "status": false,
  "message": "Human-readable error summary.",
  "errors": {
    "field_name": "Specific field error message."
  }
}
```

> `errors` is only present on validation failures (HTTP 422). It is omitted for 401, 403, 404, and 500 responses.

### Standard HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request (malformed JSON, missing required params) |
| 401 | Unauthenticated — no token or invalid token |
| 403 | Forbidden — authenticated but not allowed (e.g. cancelling someone else's order) |
| 404 | Resource not found |
| 422 | Validation failed |
| 500 | Server error |

---

## 12. Notes for CI3 Implementation

### Controller Structure (suggested)

```
application/controllers/api/
├── Auth.php          → /api/auth/*
├── Products.php      → /api/products/*
├── Categories.php    → /api/categories
├── Cart.php          → /api/cart/*
├── Wishlist.php      → /api/wishlist/*
├── Orders.php        → /api/orders/*
├── Profile.php       → /api/profile/*
├── Contact.php       → /api/contact
└── Newsletter.php    → /api/newsletter/*
```

### Routes (application/config/routes.php)

```php
// Auth
$route['api/auth/register']['post']     = 'api/auth/register';
$route['api/auth/login']['post']        = 'api/auth/login';
$route['api/auth/google']['post']       = 'api/auth/google';
$route['api/auth/logout']['post']       = 'api/auth/logout';
$route['api/auth/me']['get']            = 'api/auth/me';

// Products
$route['api/products']['get']                     = 'api/products/index';
$route['api/products/trending']['get']            = 'api/products/trending';
$route['api/products/deals']['get']               = 'api/products/deals';
$route['api/products/(:any)']['get']              = 'api/products/show/$1';
$route['api/products/(:any)/related']['get']      = 'api/products/related/$1';

// Categories
$route['api/categories']['get']         = 'api/categories/index';

// Cart
$route['api/cart']['get']               = 'api/cart/index';
$route['api/cart']['post']              = 'api/cart/add';
$route['api/cart']['delete']            = 'api/cart/clear';
$route['api/cart/sync']['post']         = 'api/cart/sync';
$route['api/cart/(:any)']['put']        = 'api/cart/update/$1';
$route['api/cart/(:any)']['delete']     = 'api/cart/remove/$1';

// Wishlist
$route['api/wishlist']['get']           = 'api/wishlist/index';
$route['api/wishlist']['post']          = 'api/wishlist/add';
$route['api/wishlist']['delete']        = 'api/wishlist/clear';
$route['api/wishlist/sync']['post']     = 'api/wishlist/sync';
$route['api/wishlist/(:any)']['delete'] = 'api/wishlist/remove/$1';

// Orders
$route['api/orders']['get']                              = 'api/orders/index';
$route['api/orders']['post']                             = 'api/orders/place';
$route['api/orders/(:any)/items/(:any)']['put']          = 'api/orders/updateItem/$1/$2';
$route['api/orders/(:any)/items/(:any)']['delete']       = 'api/orders/removeItem/$1/$2';
$route['api/orders/(:any)']['get']                       = 'api/orders/show/$1';
$route['api/orders/(:any)']['delete']                    = 'api/orders/cancel/$1';

// Profile
$route['api/profile']['get']                = 'api/profile/index';
$route['api/profile']['put']                = 'api/profile/update';
$route['api/profile/password']['put']       = 'api/profile/changePassword';

// Contact & Newsletter
$route['api/contact']['post']               = 'api/contact/send';
$route['api/newsletter/subscribe']['post']  = 'api/newsletter/subscribe';
```

### CORS Headers

Add these headers in a `MY_Controller.php` base class or CI3 hooks so the React dev server can reach the API:

```php
header('Access-Control-Allow-Origin: http://localhost:5173'); // Vite dev server
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
```

For production, replace the origin with the actual domain.

### JWT Authentication

Use a library such as [firebase/php-jwt](https://github.com/firebase/php-jwt) (compatible with CI3).  
Store the secret in `application/config/config.php`:

```php
$config['jwt_secret'] = 'your-strong-random-secret';
$config['jwt_expire'] = 86400 * 7; // 7 days
```

Create a `JWT_Auth` trait or base controller that:
1. Reads the `Authorization: Bearer <token>` header.
2. Decodes and validates the JWT.
3. Sets `$this->auth_user` to the decoded user payload.
4. Returns `401` if the token is missing, expired, or invalid.

### Password Hashing

Use CI3's built-in `password_hash()` / `password_verify()` (PHP 5.5+):

```php
// Hash on register
$hash = password_hash($plain_password, PASSWORD_BCRYPT);

// Verify on login
if (!password_verify($plain_password, $stored_hash)) { ... }
```

### Response Helper

Add a helper method in the base API controller to keep responses consistent:

```php
protected function respond_json($status, $data = [], $message = '', $http_code = 200) {
    $this->response([
        'status'  => $status,
        'message' => $message,
        'data'    => $data,
    ], $http_code);
}
```

---

*Document last updated: 2026-07-27*  
*React app: shopgrids-react (Vite + React 19)*  
*Backend: CodeIgniter 3 + chriskacerguis/codeigniter-restserver*
