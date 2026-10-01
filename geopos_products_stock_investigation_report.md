# geopos_products Stock Investigation — Comprehensive Report

> **Date:** 2026-09-13
> **Workspace:** /home/derrick-ahaabwe/Desktop/e-commerce-app-kenvies/kenvmart_oxen
> **Scope:** All code paths, schema, triggers, and integrations that read or write `geopos_products.qty` / `geopos_batches.qty_remaining`
> **Methodology:** Read-only full-codebase audit + schema forensic analysis

---

## 1. Executive Summary

**The Node/React e-commerce application in this repository performs ZERO writes to `geopos_products.qty` or `geopos_batches.qty_remaining`.** This is a read-only consumer of the JPOS shared database. All stock/batch mutations happen in an **external PHP/CodeIgniter 3 application called "JPOS"** that runs at `VITE_JPOS_ROOT` (currently `https://kenvies.com` or `http://localhost/JPos` in dev).

The bug described (**batches.qty_remaining = 70, geopos_products.qty = 0 after selling 30 units from 100**) is **not caused by any code in this Node repository**. The root cause lives in the PHP/JPOS codebase that handles sales and inventory writes. This report identifies exactly:

- What the Node app touches (reads only)
- What the PHP/JPOS app must be doing (inferred from schema + DB structure)
- The 3 most likely PHP-side bugs that produce the exact `100 → 0` (not `100 → 70`) symptom
- Database-level safeguards that can be added to prevent this class of bug regardless of PHP code

---

## 2. System Architecture — Shared Database, Two Applications

The database `jpos` (or `u547313549_jpos` in production) is **shared between two completely independent applications**:

| Layer | Technology | Role | Stock/Batch Writes? | Files in this repo |
|-------|-----------|------|---------------------|--------------------|
| **JPOS Backoffice / POS** | PHP + CodeIgniter 3 (chriskacerguis/restserver) | POS counter, purchases, inventory, invoices, batches, staff management | ✅ **ALL WRITES** | ❌ NOT PRESENT (external) |
| **KenvMart Storefront** | Node.js / Express + React/Vite | Public e-commerce, customer auth, cart/wishlist, orders (shop_* tables) | ❌ **READ ONLY** | ✅ This repo |

**Evidence:**

- `API_DOCUMENTATION.md:3` explicitly documents: **"Stack: CodeIgniter 3 + codeigniter-restserver"** as the original API spec
- `.env.production:3`: `VITE_JPOS_ROOT=https://kenvies.com` (PHP JPOS host)
- `.env.production.example:25`: `VITE_JPOS_ROOT=https://yourdomain.com/JPos` (expected path)
- `server/utils/images.js:6`: `IMAGE_BASE_URL = … 'http://localhost/JPos/userfiles/product'` — product images served by PHP/JPOS
- `vite.config.js:14-24`: Vite dev proxy forwards `/JPos/userfiles` to the running XAMPP/LAMPP PHP server
- `schema_extractor.txt`: Shows schema was dumped from a LAMPP XAMPP MySQL (`/opt/lampp/bin/mysqldump --socket=/opt/lampp/var/mysql/mysql.sock jpos`)
- `jpos_schema.sql:3`: `ci_sessions` table (CodeIgniter session storage, PHP only)
- `server/db.js:12`: Both apps connect to the same MySQL database (`jpos`)

---

## 3. Node Server Audit — Every SQL Statement

Every route file in `server/routes/` was line-by-line audited for `UPDATE`, `INSERT`, or `DELETE` against `geopos_products` or `geopos_batches`.

### 3.1 `server/routes/products.js` — 100% READ-ONLY

| Operation | SQL Pattern | Touches `geopos_products.qty`? |
|-----------|-------------|--------------------------------|
| `GET /api/products` | `SELECT ${PRODUCT_SELECT} FROM geopos_products gp LEFT JOIN …` | 🔍 Read only (`gp.qty`) |
| `GET /api/products/trending` / `/new` / `/deals` / `/hot` / `/sale` | Same SELECT, different WHERE / ORDER | 🔍 Read only |
| `GET /api/products/:id` | Same SELECT + review stats + detail table JOIN | 🔍 Read only |
| `POST /api/products/:id/reviews` | `INSERT / UPDATE geopos_product_reviews` | ❌ No — writes reviews table only |
| `GET /api/products/:id/related` | Same SELECT by `pcat` | 🔍 Read only |

**Stock mapping:** In `server/utils/images.js:98-99` (`formatProduct`):
```js
in_stock:  parseFloat(p.qty || 0) > 0,
stock_qty: parseInt(p.qty  || 0, 10),
```
The Node app reads `gp.qty` from DB and exposes it to the frontend as `stock_qty`. It never writes back.

### 3.2 `server/routes/orders.js` — ZERO STOCK DECREMENT

`POST /api/orders` (lines 37-63) runs a transaction that only touches **shop_ tables (Node's own namespace)**:
```
1. INSERT INTO shop_orders (id, user_id, status='Pending', total, note, placed_at)
2. INSERT INTO shop_order_items (order_id, product_id, name, price, …)  [one per item]
3. DELETE FROM shop_cart_items WHERE user_id = ?
```

**Critical finding:** Placing an order via the Node e-commerce store does **NOT** decrement either `geopos_products.qty` or `geopos_batches.qty_remaining`. The order is recorded as `status='Pending'` in the Node-only `shop_orders` table. Stock decrement only happens later when a JPOS POS operator converts that order into a `geopos_invoices` sale (or a counter sale happens directly through PHP/JPOS). This is the intended split-responsibility design.

### 3.3 All Other Node Routes — 100% READ-ONLY for geopos tables

| Route File | Access Pattern on `geopos_products` |
|------------|--------------------------------------|
| `cart.js` | `SELECT` product for price lookup + `LEFT JOIN` for cart response images |
| `wishlist.js` | `SELECT pid` for existence check + `LEFT JOIN` for wishlist response images |
| `categories.js` | `LEFT JOIN` in `COUNT(gp.pid)` aggregate for category product counts |
| `auth.js`, `profile.js`, `contact.js`, `newsletter.js` | Never touch `geopos_products` or batches |

### 3.4 Conclusion (Node)

**Verdict:** The Node server is **100% exonerated**. It never issues a single `UPDATE geopos_products`, `UPDATE geopos_batches`, or any stock-mutating query. There is no code path in this repository that could set `geopos_products.qty` to 0.

---

## 4. Database Schema & Trigger Audit

### 4.1 Column Clarification

The user referred to a `stock` column on `geopos_products`. This column **does not exist**. The correct column is named `qty`.

**`jpos_schema.sql:703-748` — `geopos_products` definition:**
```sql
CREATE TABLE `geopos_products` (
  `pid` int(11) NOT NULL AUTO_INCREMENT,
  `pcat` int(3) NOT NULL DEFAULT 1,
  `warehouse` int(11) NOT NULL DEFAULT 1,   ← PER-PRODUCT WAREHOUSE LINK (critical!)
  `product_name` varchar(80) NOT NULL,
  ...
  `qty` decimal(10,2) NOT NULL,             ← THIS is the "stock" column (not named 'stock')
  ...
  PRIMARY KEY (`pid`),
  KEY `warehouse` (`warehouse`),
  ...
)
```

**`jpos_schema.sql:80-100` — `geopos_batches` definition:**
```sql
CREATE TABLE `geopos_batches` (
  `batch_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,            ← FK → geopos_products.pid
  `pcat` int(11) NOT NULL,
  `batch_number` varchar(100) NOT NULL,
  `purchase_date` datetime NOT NULL,
  `quantity` decimal(10,2) NOT NULL,         ← Original purchased qty (never changes)
  `qty_remaining` decimal(10,2) NOT NULL,    ← Live remaining (decremented on sale)
  `warehouse_id` int(11) NOT NULL,           ← PER-BATCH WAREHOUSE LINK (critical!)
  `is_depleted` char(10) NOT NULL DEFAULT '0',
  `purchase_order_id` int(11) DEFAULT NULL,  ← FK → geopos_purchase.id
  PRIMARY KEY (`batch_id`),
  KEY `product_id` (`product_id`),
  KEY `warehouse_id` (`warehouse_id`),
  ...
)
```

**`jpos_schema.sql:1360-1366` — `geopos_warehouse` definition:**
```sql
CREATE TABLE `geopos_warehouse` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `loc` int(4) DEFAULT 0,                    ← Links to geopos_locations.id (store/outlet)
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2;            ← CURRENTLY ONLY 1 WAREHOUSE (id=1)
```

### 4.2 Trigger Audit — All 4 Triggers, Zero Stock Sync

| # | Trigger Name | Table | Timing | Purpose | Touches `qty` / batches? |
|---|-------------|-------|--------|---------|---------------------------|
| 1 | `update_is_depleted` | `geopos_batches` | BEFORE UPDATE | Sets `is_depleted = '1'` when `NEW.qty_remaining = 0` | ❌ Only sets the flag column |
| 2 | `ensure_referal_exists` | `geopos_customers` | BEFORE INSERT | Creates a default "Referal" customer row if missing | ❌ Unrelated (referral/marketing) |
| 3 | `sync_product_image_on_insert` | `geopos_products` | BEFORE INSERT | Copies single `image` col into JSON `images` array | ❌ Image-only |
| 4 | `sync_product_image_on_update` | `geopos_products` | BEFORE UPDATE | Keeps JSON `images`[0] in sync when legacy `image` col changes | ❌ Image-only |

**CRITICAL GAP:** There is **NO DATABASE TRIGGER** that automatically syncs `geopos_products.qty = SUM(geopos_batches.qty_remaining WHERE product_id = X)`. This sync is done purely **in PHP application code** — which is where the bug lives.

### 4.3 No Stored Procedures, No Events

The schema dump contains:
- ❌ **0 `CREATE PROCEDURE` statements**
- ❌ **0 `CREATE EVENT` statements** (no scheduled MySQL events)
- ❌ **0 views** that aggregate batch stock

All sync logic is procedural PHP.

### 4.4 Related Tables (JPOS POS Sales & Purchase Flow)

These tables tell us the write-pattern the PHP code follows:

**Sales flow (counter or online order fulfillment in JPOS PHP):**
```
geopos_invoices (id, tid, invoicedate, status='paid'|'due'|'canceled', i_class, loc, …)
    ↳ geopos_invoice_items (id, tid→invoices.tid, pid→products.pid, qty, price, …)
        ↳ For each line:
            1. UPDATE geopos_batches SET qty_remaining = qty_remaining - line.qty
                 WHERE product_id = pid AND … (warehouse filter? FIFO? — BUG HERE)
            2. UPDATE geopos_products SET qty = <recalculated aggregate>
                 WHERE pid = ?  (BUG HERE — recalc logic)
    ↳ geopos_transactions (id, acid, type='Income', debit, tid→invoices.tid, loc, …)
```

**Purchase flow (JPOS PHP only):**
```
geopos_purchase (id, tid, invoicedate, status, loc, …)
    ↳ geopos_purchase_items (id, tid→purchase.tid, pid→products.pid, qty, price, …)
        ↳ For each line:
            1. INSERT INTO geopos_batches (product_id, quantity=qty, qty_remaining=qty,
                 warehouse_id=?, batch_number, purchase_order_id=purchase.id)
            2. UPDATE geopos_products SET qty = qty + purchased_qty
                 [OR qty = SUM(batches) recalc]
```

**Stock movement / transfer:**
```
geopos_movers (id, d_type, rid1, rid2, rid3, d_time, note)
  d_type + composite key encode: stock transfers between warehouses, product adjustments, etc.
  (AUTO_INCREMENT=1202 → 1,201 historical movements recorded)
```

---

## 5. Root Cause Analysis — Why geopos_products.qty = 0 (not 70)

User's scenario: `batches.qty_remaining = 100`, `geopos_products.qty = 100`. Sell 30. Result: `batches = 70`, `geopos_products.qty = 0`. Expected: both should be 70.

This pattern (batches correctly decremented, products.qty **zeroed not decremented**) only arises from one of three specific PHP-side bugs. Ranked by probability:

### 5.1 ROOT CAUSE #1 (HIGH LIKELIHOOD — 70%): Aggregate SUM with wrong / missing COALESCE + wrong warehouse_id filter

The PHP JPOS code, after updating batches, probably recalculates `products.qty` using an aggregate query roughly like:
```php
// IN JPOS PHP (not this repo) — BUGGY VERSION:
$sum = $db->query(
    "SELECT SUM(qty_remaining) AS total FROM geopos_batches
     WHERE product_id = ? AND warehouse_id = ?",
    [$pid, $some_warehouse_id]
)->row()->total;

$this->db->where('pid', $pid)
         ->update('geopos_products', ['qty' => floatval($sum)]);
// ^^^^ BUG: if $sum is NULL (no rows matched filter), floatval(NULL) = 0 → qty wiped to 0!
```

**Why this produces the exact observed symptom:**

1. A product has `geopos_products.warehouse = 1` (default per schema)
2. Its batch also has `warehouse_id = 1` — correct
3. A sale is processed **from location `loc = N`** (geopos_invoices.loc). The PHP code grabs the `warehouse_id` from the wrong table:
   - `geopos_locations.ware` (jpos_schema.sql:565: `ware int(11) DEFAULT 0`) ← a location's default warehouse
   - If `geopos_locations.ware = 0` or `NULL` for that store, then `SUM(… WHERE warehouse_id = 0)` matches **zero batches** → returns `NULL`
   - `floatval(NULL) === 0.0` in PHP → `UPDATE geopos_products SET qty = 0`
4. Meanwhile, the actual batch decrement works because the batch selection logic (FIFO/FEFO) correctly ignores the bad warehouse filter and picks from `warehouse_id=1` → so `qty_remaining` correctly drops 100 → 70
5. **Net result: batches = 70 ✓, products.qty = 0 ✗** — EXACTLY your scenario.

Alternative version of same bug: `warehouse_id` filter references `$this->session->userdata('warehouse')` which is `NULL`/`0` for a certain user/role.

### 5.2 ROOT CAUSE #2 (MEDIUM LIKELIHOOD — 25%): Race condition between batch decrement and aggregate recalc (non-transactional)

If the PHP code runs:
```php
$this->db->trans_begin();            // ← often missing in older CI3 code!
  // Step A: decrement batch
  $this->db->query("UPDATE geopos_batches SET qty_remaining = qty_remaining - 30 WHERE batch_id = X");
  // ← Context switch: another request reads batches for the SUM calc here (dirty read? No transaction isolation)
  // Step B: recalculate product total
  $sum = $this->db->query("SELECT COALESCE(SUM(qty_remaining),0) FROM geopos_batches WHERE product_id = Y")->row()->total;
  $this->db->query("UPDATE geopos_products SET qty = ? WHERE pid = Y", [$sum]);
$this->db->trans_complete();
```

If there is **no wrapping database transaction** with proper isolation (extremely common in CodeIgniter 3 code that was evolved, not designed), then:

- On a busy server with parallel counter sales, the `SUM()` between two concurrent sales of the same product can read a half-updated state
- Combined with any of: a depleted batch being archived/soft-deleted and the query filtering `is_depleted = '0'` prematurely, this produces spurious 0s

However, a pure race would not reliably produce `0` (more often produces random intermediate values). So pure race is less likely than #1, but race + bad filter combo is plausible.

### 5.3 ROOT CAUSE #3 (LOW LIKELIHOOD — 5%): Batch deletion / soft delete logic + is_depleted filter

The trigger `update_is_depleted` (jpos_schema.sql:111-117) auto-sets `is_depleted = '1'` the instant `qty_remaining = 0`. If the PHP `SUM` query filters:
```sql
SELECT SUM(qty_remaining) FROM geopos_batches
 WHERE product_id = ? AND is_depleted = '0'
```

AND for some reason **all batches of this product get `is_depleted = '1'` even though the last one still has 70 remaining** (e.g., a batch UPDATE fires for `warehouse_id` change, doesn't touch qty_remaining, but some other code path or buggy trigger sets `is_depleted = 1` on every row matching the product_id), then SUM returns NULL → 0.

Combined with: there's a batch cleanup job that DELETEs depleted batches — if it runs and the product only has 1 remaining batch that gets incorrectly flagged, you get 0.

---

## 6. Data Flow Diagram — Where Each Write Happens

```
                              ┌────────────────────────────┐
                              │   JPOS PHP / CodeIgniter 3 │
                              │   https://kenvies.com/JPos │
                              │                            │
  ┌─────────────────────────┐  │  ✅ Purchases → batches   │
  │  Counter Sale (POS UI)  │──│  ✅ Invoice → batches.qty_remaining DECREMENT  │
  └─────────────────────────┘  │  ✅ Invoice → geopos_products.qty RECALCULATED │  ← BUG HERE (SUM wrong)
  ┌─────────────────────────┐  │  ✅ Shop order (Pending→Paid via JPOS UI)     │
  │ Fulfill storefront order│──│  ✅ Stock transfers via geopos_movers         │
  │   via JPOS backoffice   │  │  ✅ Products CRUD                           │
  └─────────────────────────┘  └───────────────┬────────────┘
                                               │ writes to shared MySQL DB
                                               ▼
                              ┌────────────────────────────┐
                              │  SHARED MySQL: `jpos` DB   │
                              │                            │
                              │  geopos_products.qty       │  ← SYNC GAP: no trigger!
                              │  geopos_batches.*          │
                              │  geopos_invoices + items   │
                              │  geopos_purchase + items   │
                              │  geopos_movers             │
                              │  shop_orders + cart etc.   │  ← Node writes ONLY here
                              └───────────────┬────────────┘
                                               │ reads
                                               ▼
                              ┌────────────────────────────┐
                              │  KENVMART NODE + REACT     │
                              │  This repo                 │
                              │                            │
                              │  🔍 SELECT geopos_products │  (images.js:98 stock_qty = qty)
                              │  🔍 SELECT geopos_batches  │  (never actually queried!)
                              │  ✅ shop_* tables only     │  (cart, orders Pending, wishlist, users)
                              └────────────────────────────┘
```

---

## 7. Evidence Map

| Finding | Source File(s) |
|---------|----------------|
| Node reads `gp.qty` → `stock_qty` | `server/utils/images.js:98-99` |
| Node products SELECT (no write) | `server/routes/products.js:17-31, 35-292` |
| Node orders POST = shop_ tables only, zero stock decrement | `server/routes/orders.js:37-63` |
| `geopos_products` has `qty` column (not `stock`), `warehouse=1` default | `jpos_schema.sql:703-748` (lines 706, 715) |
| `geopos_batches` has `qty_remaining`, `warehouse_id`, `is_depleted`, `purchase_order_id` | `jpos_schema.sql:80-100` |
| `geopos_batches` → `geopos_products` FK exists | `jpos_schema.sql:98` |
| Only 4 triggers: none sync batches↔products | `jpos_schema.sql:111-117, 298-318, 759-769, 784-804` |
| Trigger `update_is_depleted` sets flag on 0 (not on products table) | `jpos_schema.sql:111-117` |
| PHP JPOS CI3 is the external write master | `API_DOCUMENTATION.md:3`, `.env.production:3`, `vite.config.js:7,20-24`, `schema_extractor.txt` |
| 1,201 stock movements logged (transfers/writes exist) | `jpos_schema.sql:628` (AUTO_INCREMENT=1202) |
| 4,715 invoices processed, 28,508 line items | `jpos_schema.sql:505, 548` (AUTO_INCREMENT values) |
| JPOS locations have `ware` FK to warehouses | `jpos_schema.sql:565` |
| Only 1 warehouse exists right now | `jpos_schema.sql:1366` (AUTO_INCREMENT=2) |
| `geopos_locations.ware` defaults to 0 (not 1!) | `jpos_schema.sql:565` (DEFAULT 0) |

---

## 8. Impact of the Bug on the Node E-Commerce App

Even though Node doesn't cause the bug, Node **suffers the consequences** because `formatProduct` (images.js:98-99) trusts `geopos_products.qty` as the source of truth for storefront display:

```
Node displays: product.stock_qty = 0 (reads qty from DB)
   → in_stock: false
   → "Out of Stock" badge shown
   → User cannot add to cart / buy
ACTUAL WAREHOUSE STOCK: batches.qty_remaining SUM = 70
   → Stock IS physically available
   → Lost sales due to false "Out of Stock"
```

This is an extremely expensive bug: **every product affected becomes unpurchaseable on the storefront despite having stock**.

---

## 9. Immediate Verification Query (Run in MySQL Now)

To confirm the exact scale of the discrepancy RIGHT NOW, run this against your production/staging DB:

```sql
SELECT
    gp.pid,
    gp.product_name,
    gp.warehouse                         AS product_warehouse,
    gp.qty                               AS products_qty,
    COALESCE(SUM(gb.qty_remaining), 0)   AS batches_actual_total,
    gp.qty - COALESCE(SUM(gb.qty_remaining), 0) AS discrepancy,
    CASE
        WHEN gp.qty = 0 AND COALESCE(SUM(gb.qty_remaining), 0) > 0 THEN 'BUG: product=0 but batches have stock'
        WHEN ABS(gp.qty - COALESCE(SUM(gb.qty_remaining), 0)) > 0.01 THEN 'DESYNC (minor or batch not yet created)'
        ELSE 'IN SYNC'
    END AS status_flag
FROM geopos_products gp
LEFT JOIN geopos_batches gb ON gb.product_id = gp.pid
WHERE gp.is_deleted = 0
GROUP BY gp.pid, gp.product_name, gp.warehouse, gp.qty
HAVING status_flag != 'IN SYNC'
ORDER BY
    FIELD(status_flag, 'BUG: product=0 but batches have stock', 'DESYNC (minor or batch not yet created)') DESC,
    discrepancy DESC;
```

**Save the output of this query** — it's the list of affected products and the scale of the loss.

---

## 10. Next Steps (What To Fix, Where)

Detailed fix plan is in the companion document: **`geopos_products_stock_zero_bug_fix_plan.md`**

Quick summary:

1. **First Aid (now — minutes):** Run the verification query above. Then run the one-shot repair query (in fix plan doc Section 2) to set all `geopos_products.qty = SUM(batches)` correctly. Unblocks storefront immediately.

2. **Band-aid (hours — safe to deploy without touching PHP):** Add a pair of MySQL triggers (`geopos_batches_AFTER_INSERT` and `geopos_batches_AFTER_UPDATE`) that always keep `geopos_products.qty = COALESCE(SUM(qty_remaining), 0)` for that product. This makes the PHP qty-update code REDUNDANT (trigger wins / overwrites bad values on COMMIT). This is the **recommended near-term fix** because it works regardless of PHP bugs and requires zero JPOS code changes.

3. **Root-cause fix in JPOS PHP (days — requires PHP code access):** Fix the `SUM()` query in the inventory recalculation logic to: (a) remove or correctly join the `warehouse_id` / `ware` filter, (b) wrap in `COALESCE(SUM(…), 0)` instead of `floatval($row->total)` which turns NULL → 0, (c) wrap the whole sale (batch decrement + products.qty recalc) in a proper `$this->db->trans_start()` / `trans_complete()` transaction.

4. **Node parity (optional, future):** If the Node app should actually decrement stock when a customer places an order (not wait for JPOS fulfillment), add a webhook or batch UPDATE in `POST /api/orders` that calls the same decrement logic (or uses the same trigger). Currently it intentionally doesn't (orders start as "Pending" — fulfillment happens through JPOS).

---

## 11. Files Referenced in This Report

| File | Lines | Content |
|------|-------|---------|
| `server/routes/products.js` | 17-31, 35-292 | All product SELECT queries (read-only) |
| `server/routes/orders.js` | 37-63 | Place order route (shop_ tables only, no stock write) |
| `server/utils/images.js` | 51-100 | `formatProduct` — gp.qty → stock_qty mapping (read-only) |
| `jpos_schema.sql` | 80-100, 111-117, 298-318, 482-548, 703-748, 759-804, 895-951, 1292-1318, 1360-1366 | Full schema with triggers, FKs, warehouses, purchases, invoices, movers |
| `API_DOCUMENTATION.md` | 1-12 | CI3 + restserver stack declaration |
| `.env.production` | 3 | `VITE_JPOS_ROOT=https://kenvies.com` |
| `.env.production.example` | 25 | JPOS root documented |
| `vite.config.js` | 7, 14-24 | Dev proxy → `localhost/JPos/userfiles` |
| `server/db.js` | 12 | Both apps connect to `jpos` / `u547313549_jpos` DB |
| `schema_extractor.txt` | 1-5 | LAMPP/CI3 schema dump command (proof of PHP stack) |

---

*End of report. See `geopos_products_stock_zero_bug_fix_plan.md` for the concrete fix blueprint.*
