# KenvMart Feature Verification Plan

This document outlines the steps to verify the implementation of tasks from `tasks.md`.

## 1. Cart Modal Quantity Controls
**Goal**: Verify that `+` and `-` buttons correctly update the cart and handle item removal.
- [ ] Open a product modal.
- [ ] Click `+` multiple times. Verify quantity increases in the UI.
- [ ] Click `-` multiple times. Verify quantity decreases.
- [ ] Click `-` when quantity is `1`. Verify the item is removed from the cart (or modal shows `0` and syncs removal).
- [ ] Verify that changes persist in `localStorage` and sync to backend (if logged in).

## 2. Verified Purchase Reviews
**Goal**: Verify that reviews are tagged as "Verified Purchase" only for users who bought the product.
- [ ] **Test Case A (Non-purchased)**: Log in as a user who hasn't bought "Product X". Submit a review. Verify no "Verified Purchase" badge appears.
- [ ] **Test Case B (Purchased)**: Manually insert a completed order for "Product X" for a test user in the DB (or use a real order). Submit a review. Verify the "Verified Purchase" badge appears.
- [ ] **API Verification**: Call `GET /api/products/:id/can-review` for both users and verify the `can_review` boolean.

## 3. Unique Visit Tracking
**Goal**: Verify that visits are tracked once per day per user/IP without storing PII.
- [ ] Visit the homepage.
- [ ] Check the `shop_visits` table. Verify a new row is created with a `visitor_hash`.
- [ ] Refresh the page multiple times. Verify no new rows are created in `shop_visits` for the same day/visitor.
- [ ] Verify `ip_address` is stored (if intended) or check if it matches the privacy requirements.
- [ ] Verify `device_type` and `is_bot` fields are correctly populated.

## 4. Rate Limiting
**Goal**: Verify that excessive requests are blocked.
- [ ] **Login/Register**: Attempt to register 11 times within 15 minutes. Verify the 11th attempt returns `429 Too Many Requests`.
- [ ] **Reviews**: Submit more than 50 review-related requests (including votes) in 1 minute. Verify rate limiting kicks in.
- [ ] **Check DB**: Verify `shop_rate_limits` table is populated with `bucket_key` and `action`.

## 5. Review Votes (Helpful/Not Helpful)
**Goal**: Verify users can vote on reviews.
- [ ] Submit a review.
- [ ] As a different user, call `POST /api/products/reviews/:reviewId/vote` with `vote: 1`.
- [ ] Verify `helpful_count` increases in the `geopos_product_reviews` table.
- [ ] Click the same vote again. Verify the vote is removed and `helpful_count` decreases.
- [ ] Change vote to `-1`. Verify `helpful_count` updates accordingly.

## 6. Database Indexes
**Goal**: Ensure performance optimization.
- [ ] Run `SHOW INDEX FROM shop_reviews;` and verify `idx_product_approved_created` and `idx_user_created` exist.
- [ ] Run `SHOW INDEX FROM shop_order_items;` and verify `idx_order_product` exists.

---
*Note: Use `curl` or Postman to test API endpoints directly if the frontend UI for certain features (like voting) is not yet implemented.*
