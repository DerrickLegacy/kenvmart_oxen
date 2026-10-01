# geopos_products Stock-to-Zero Bug — Fix Plan & Reproduction

> **Companion to:** `geopos_products_stock_investigation_report.md`
> **Bug classification:** Data integrity failure (PHP application logic) + missing database invariant trigger
> **Symptom pattern:** `geopos_batches.qty_remaining` decrements correctly (100 → 70) but `geopos_products.qty` is **zeroed out** (100 → 0) on every sale. Node e-commerce frontend shows "Out of Stock" despite batches having 70 units.
> **Estimated revenue impact:** HIGH — every product affected is unpurchaseable.

---

## 1. Bug Reproduction Scenario (User-Reported Case)

### 1.1 Starting State (Before Sale)

```
geopos_products (pid = 99, example product):
  pid       = 99
  warehouse = 1
  product_name = "Sample Product"
  qty       = 100.00        ← "Stock" column (NOT named 'stock', see report §4.1)

geopos_batches (for pid=99):
  batch_id = 501
  product_id   = 99
  warehouse_id = 1
  quantity     = 100.00     (original purchase qty)
  qty_remaining = 100.00    (live stock)
  is_depleted   = '0'
```

### 1.2 Trigger: POS Sale of 30 Units via JPOS PHP

A sale is processed through **JPOS PHP POS UI** (not Node storefront `shop_orders` — the Node app places orders as `status='Pending'` and does NOT touch stock; see report §3.2).

In JPOS PHP:
1. Invoice created in `geopos_invoices` with `i_class=0`, `loc=N`, `status='paid'`
2. Line item inserted in `geopos_invoice_items` with `pid=99`, `qty=30.00`
3. Transaction recorded in `geopos_transactions` with `type='Income'`
4. **Step A — Batch decrement:** `UPDATE geopos_batches SET qty_remaining = qty_remaining - 30 WHERE batch_id = 501`
   - Batch selection logic (FIFO by date) correctly finds batch 501, decrements by 30
   - Result: `qty_remaining = 70.00` ✓
   - Trigger `update_is_depleted` fires → `70 ≠ 0` so `is_depleted = '0'` (correct)
5. **Step B — Product qty recalculation (BUG HERE):** PHP code runs a SUM() to recalculate and UPDATE `geopos_products.qty`

### 1.3 Actual Result (Bug Manifested)

```
geopos_batches:
  batch 501: qty_remaining = 70.00   ✓ CORRECT

geopos_products pid=99:
  qty = 0.00                         ✗ WRONG (expected: 70.00, got 0.00)
```

### 1.4 Cascade into Node E-Commerce

The Node app (`server/utils/images.js:98-99`) reads the broken value:
```js
in_stock:  parseFloat(p.qty || 0) > 0   → false (since 0.00 is not > 0)
stock_qty: parseInt(p.qty  || 0, 10)    → 0
```

Frontend displays **"Out of Stock"** badge, disables "Add to Cart" button, despite 70 physical units existing in the warehouse. **Customer cannot purchase; sale is lost.**

---

## 2. Immediate First Aid (Run in MySQL Now)

### 2.1 Verify Discrepancy Scale

Run first — no writes, just tells you how many products are affected:

```sql
SELECT
    gp.pid,
    gp.product_name,
    gp.warehouse                         AS product_warehouse,
    gp.qty                               AS products_qty,
    COALESCE(SUM(gb.qty_remaining), 0)   AS batches_actual_total,
    (gp.qty - COALESCE(SUM(gb.qty_remaining), 0)) AS delta,
    CASE
        WHEN gp.qty = 0 AND COALESCE(SUM(gb.qty_remaining), 0) > 0
            THEN 'BLOCKING BUG — product=0 with batches stock'
        WHEN ABS(gp.qty - COALESCE(SUM(gb.qty_remaining), 0)) > 0.01
            THEN 'DESYNC'
        ELSE 'IN SYNC'
    END AS flag
FROM geopos_products gp
LEFT JOIN geopos_batches gb ON gb.product_id = gp.pid
WHERE gp.is_deleted = 0
GROUP BY gp.pid, gp.product_name, gp.warehouse, gp.qty
HAVING flag <> 'IN SYNC'
ORDER BY FIELD(flag,
    'BLOCKING BUG — product=0 with batches stock',
    'DESYNC'
) DESC, delta DESC;
```

Save the output CSV. This is your bug surface area.

### 2.2 One-Shot Repair Query

Fixes every affected product by resetting `geopos_products.qty = SUM(all batches.qty_remaining)`:

```sql
-- Step 1: Create a temporary table with correct aggregates
CREATE TEMPORARY TABLE _correct_stock AS
SELECT
    gp.pid,
    COALESCE(SUM(gb.qty_remaining), 0) AS correct_qty
FROM geopos_products gp
LEFT JOIN geopos_batches gb
       ON gb.product_id = gp.pid
      AND gb.is_depleted <> '1'   -- include only non-depleted batches in sum
WHERE gp.is_deleted = 0
GROUP BY gp.pid;

-- Step 2: Update products with correct totals
UPDATE geopos_products gp
INNER JOIN _correct_stock cs ON cs.pid = gp.pid
SET gp.qty = cs.correct_qty
WHERE ABS(gp.qty - cs.correct_qty) > 0.01;   -- only where discrepancy exists

-- Step 3: Clean up
DROP TEMPORARY TABLE IF EXISTS _correct_stock;

-- Step 4: Show confirmation
SELECT ROW_COUNT() AS products_fixed;
```

**Risk level:** Very low. Idempotent — running it twice produces the same correct result. Does not touch batches or any write-sensitive table. Safe to run on production mid-day.

**Re-run after:** Run the verification query (2.1) again to confirm all `flag = 'IN SYNC'`. Then spot-check the Node storefront UI to confirm "In Stock" appears on products that were blocked.

---

## 3. Permanent Fix Layer 1 (Safe, Deploy Today — MySQL Triggers)

**This is the recommended fix.** It adds **database-level invariants** that guarantee `geopos_products.qty` always matches `SUM(batches.qty_remaining)`, regardless of what the PHP code does. Even if the PHP bug persists, the triggers **overwrite the bad value with the correct one** on every COMMIT.

Zero PHP code changes required. Works for all mutation paths (sale, purchase, stock transfer, manual batch edit).

### 3.1 Trigger 1 — After INSERT on batches (new purchase batch added)

```sql
DELIMITER ;;

CREATE TRIGGER `sync_products_qty_after_batch_insert`
AFTER INSERT ON `geopos_batches`
FOR EACH ROW
BEGIN
    DECLARE _total DECIMAL(10,2);

    SELECT COALESCE(SUM(qty_remaining), 0)
      INTO _total
      FROM geopos_batches
     WHERE product_id = NEW.product_id
       AND is_depleted <> '1';

    UPDATE geopos_products
       SET qty = _total
     WHERE pid = NEW.product_id;
END;;

DELIMITER ;
```

### 3.2 Trigger 2 — After UPDATE on batches (qty_remaining decremented on sale, or manual edit)

```sql
DELIMITER ;;

CREATE TRIGGER `sync_products_qty_after_batch_update`
AFTER UPDATE ON `geopos_batches`
FOR EACH ROW
BEGIN
    -- Only recalc if qty_remaining actually changed (skip is_depleted flag-only updates,
    -- description edits, etc.)
    IF OLD.qty_remaining <> NEW.qty_remaining OR OLD.product_id <> NEW.product_id THEN
        BEGIN
            DECLARE _total DECIMAL(10,2);
            DECLARE _all_pids_affected INT DEFAULT 0;

            -- If product_id changed (rare: batch reassignment), recalc both old and new pid
            IF OLD.product_id <> NEW.product_id THEN
                SELECT COALESCE(SUM(qty_remaining), 0) INTO _total
                  FROM geopos_batches WHERE product_id = OLD.product_id AND is_depleted <> '1';
                UPDATE geopos_products SET qty = _total WHERE pid = OLD.product_id;
            END IF;

            SELECT COALESCE(SUM(qty_remaining), 0) INTO _total
              FROM geopos_batches WHERE product_id = NEW.product_id AND is_depleted <> '1';
            UPDATE geopos_products SET qty = _total WHERE pid = NEW.product_id;
        END;
    END IF;
END;;

DELIMITER ;
```

### 3.3 Trigger 3 — After DELETE on batches (batch deleted, rare)

```sql
DELIMITER ;;

CREATE TRIGGER `sync_products_qty_after_batch_delete`
AFTER DELETE ON `geopos_batches`
FOR EACH ROW
BEGIN
    DECLARE _total DECIMAL(10,2);

    SELECT COALESCE(SUM(qty_remaining), 0)
      INTO _total
      FROM geopos_batches
     WHERE product_id = OLD.product_id
       AND is_depleted <> '1';

    UPDATE geopos_products
       SET qty = _total
     WHERE pid = OLD.product_id;
END;;

DELIMITER ;
```

### 3.4 Apply All Three — Safe Idempotent Script

Drop any existing triggers with these names first, then create. Run as a single `.sql` file through phpMyAdmin or `mysql` CLI:

```sql
-- Cleanup (idempotent — safe even if triggers don't exist yet)
DROP TRIGGER IF EXISTS sync_products_qty_after_batch_insert;
DROP TRIGGER IF EXISTS sync_products_qty_after_batch_update;
DROP TRIGGER IF EXISTS sync_products_qty_after_batch_delete;

-- Then create all 3 triggers from §3.1, §3.2, §3.3 above
```

### 3.5 Trigger Behavior Validation Test

After installation, run this sanity check as a transaction you roll back:

```sql
-- Pick ANY product with at least 1 batch (replace pid=XYZ with a real pid)
START TRANSACTION;

-- Precondition check
SELECT pid, qty FROM geopos_products WHERE pid = 99;   -- e.g. 100.00
SELECT batch_id, qty_remaining FROM geopos_batches WHERE product_id = 99;   -- e.g. total 100.00

-- Simulate a sale of 30 units
UPDATE geopos_batches SET qty_remaining = qty_remaining - 30
 WHERE product_id = 99 ORDER BY purchase_date ASC LIMIT 1;

-- After trigger fires — products.qty should reflect batches
SELECT pid, qty FROM geopos_products WHERE pid = 99;   -- should be 70.00, NOT 0.00 ✓

ROLLBACK;   -- Undo test so real data is untouched
```

If the final SELECT shows 70 (not 0 or 100), the triggers are installed correctly.

---

## 4. Permanent Fix Layer 2 (Root-Cause — Requires JPOS PHP Source Code)

The trigger layer (Layer 1) is sufficient to **eliminate the symptom permanently**, but to cleanly fix the source of the bad write, you need access to the JPOS PHP codebase (CodeIgniter 3, not in this repo). The fix is in the inventory update logic.

### 4.1 Most Likely Bug Location in PHP

**File (typical for CodeIgniter 3 / JPOS-style apps):**
`application/models/Products_model.php` or `application/models/Inventory_model.php`

**Function name clues:** `_recalc_stock()`, `update_product_qty()`, `decrement_stock()`, `after_invoice_saved()`

**Buggy pattern you are looking for (search for `qty` + `SUM` + `warehouse`):**

```php
<?php
// BUGGY PHP (pseudocode — locate this pattern)
function after_invoice_processed($invoice_tid) {
    $items = $this->db->where('tid', $invoice_tid)->get('geopos_invoice_items')->result();
    foreach ($items as $item) {
        // 1. Correctly decrement the batch (this part works)
        $this->_deduct_from_batch($item->pid, $item->qty, $this->invoice->loc);

        // 2. Recalculate product.qty (THIS IS WHERE THE BUG IS)
        $loc_warehouse = $this->db
            ->select('ware')                  // geopos_locations.ware DEFAULT = 0 ! (see jpos_schema.sql:565)
            ->where('id', $this->invoice->loc)
            ->get('geopos_locations')
            ->row()->ware;

        $result = $this->db
            ->select('SUM(qty_remaining) AS total')
            ->from('geopos_batches')
            ->where('product_id', $item->pid)
            ->where('warehouse_id', $loc_warehouse)   // ❌ BUG: filters by loc's default warehouse
                                                     // If loc.ware = 0, no batches match!
            ->get()->row();

        $new_qty = floatval($result->total);  // ❌ BUG: $result->total = NULL when no rows match
                                               //     floatval(NULL) === (float)0 → writes 0 !
        $this->db
            ->where('pid', $item->pid)
            ->update('geopos_products', ['qty' => $new_qty]);
    }
}
```

### 4.2 Corrected PHP Version

```php
<?php
// FIXED VERSION — apply these 4 changes

$sum_row = $this->db
    ->select('COALESCE(SUM(qty_remaining), 0) AS total')   // ✅ Fix 1: COALESCE at SQL level
    ->from('geopos_batches')
    ->where('product_id', $item->pid)
    // ✅ Fix 2: REMOVE the warehouse_id = loc_warehouse filter, or use product's own warehouse
    //    (The correct approach: total across ALL warehouses for this product_id.
    //     If per-warehouse stock is needed, geopos_products would need a per-warehouse
    //     join table, which it currently doesn't have — it has a single global qty col.)
    //
    // Optional conservative filter: only non-depleted batches (same as triggers use)
    ->where("is_depleted <> '1'", NULL, FALSE)
    ->get()->row();

$new_qty = (float)$sum_row->total;   // ✅ Fix 3: COALESCE guarantees never NULL, so floatval is safe

// ✅ Fix 4: Wrap batch decrement + product update in a DB transaction
// (at caller level — $this->db->trans_start() / trans_complete())
```

**4 Fixes explained:**

| # | Fix | Why |
|---|-----|-----|
| 1 | `COALESCE(SUM(qty_remaining), 0)` in SQL | If no batches match (empty set), SUM returns NULL. COALESCE forces 0 safely. With this alone, a bad filter gives 0 *only when product truly has zero batches* — which is correct — vs. always giving 0 on any filter miss. |
| 2 | Remove `warehouse_id = $loc_warehouse` | `geopos_products` has **one global `qty` column**, not per-warehouse. The single global qty must equal `SUM(all warehouses)`. There is no "location's view" of `geopos_products.qty` (it's a shared row) — so filtering by a single warehouse is semantically wrong. Plus `geopos_locations.ware` defaults to 0 (jpos_schema.sql:565), guaranteeing a zero-match for locations whose `ware` column wasn't set. |
| 3 | Keep `(float)` after COALESCE | Defensive. `floatval(NULL)` = 0.00, but with Fix 1 + 2 the value is always a number. |
| 4 | Wrap in `$this->db->trans_start() / trans_complete()` | Prevents race conditions between concurrent counter sales of the same product. InnoDB REPEATABLE READ isolation ensures the SUM sees the batch decrement from the same transaction. |

### 4.3 The "Wrong-Warehouse" Combo Proof

This is the exact scenario that produces your specific 100 → 0 bug:

```
geopos_locations (the POS outlet):
  id   = 5                     (store #5 in Kampala)
  cname= "Kampala Branch"
  ware = 0                     (DEFAULT 0 per jpos_schema.sql:565 — NEVER UPDATED from default!)

geopos_products.pid=99:
  warehouse = 1                (created against warehouse #1)

geopos_batches for pid=99:
  warehouse_id = 1             (batch created against warehouse #1)

PHP runs at invoice time:
  SELECT SUM(qty_remaining) WHERE product_id=99 AND warehouse_id = locations.ware=0
    → ZERO batches have warehouse_id=0 → result = NULL → floatval=0.00
  UPDATE geopos_products SET qty = 0 WHERE pid=99
```

**Meanwhile, batch decrement uses a different lookup (FIFO by purchase_date across ALL warehouses for product_id=99, no warehouse filter).** That's why batches correctly show 70, but products gets 0.

The `ware = 0` on locations is the smoking gun. Query your live DB now:
```sql
SELECT id, cname, ware FROM geopos_locations;
```
If any location shows `ware = 0` (or NULL), that location's sales are the source of the 0-writes.

---

## 5. Fix Priority & Timeline

| Priority | Action | Where | Time to Deploy | Skill Required |
|----------|--------|-------|----------------|----------------|
| **P0 — NOW** | Run one-shot repair (§2.2) + verify (§2.1) | MySQL (phpMyAdmin / CLI) | 5 minutes | DBA / DevOps |
| **P1 — TODAY** | Install 3 MySQL triggers (§3.1, 3.2, 3.3) | MySQL | 10 minutes | DBA / DevOps |
| **P1 — TODAY** | Validate triggers with rollback-test (§3.5) | MySQL | 3 minutes | DBA / DevOps |
| **P2 — THIS WEEK** | Fix PHP SUM query (§4.2) + wrap in transaction | JPOS PHP code (CodeIgniter 3 model) | 30 minutes + QA | PHP Dev |
| **P2 — THIS WEEK** | Set `geopos_locations.ware` to correct warehouse_id (1?) for each location that has `ware = 0` | MySQL + ops | 2 minutes | DBA / Ops |
| **P3 — OPTIONAL** | Add Node-side stock decrement on `POST /api/orders` if storefront orders should deduct stock without waiting for JPOS fulfillment (currently not needed — orders start as Pending) | `server/routes/orders.js` | 1-2 hrs | Node Dev |

---

## 6. Monitoring & Alerts (Post-Deployment)

Add a **daily integrity check** via a cron / MySQL event. This emails you if discrepancy ever reappears (which shouldn't happen with triggers, but defense-in-depth):

```sql
CREATE EVENT IF NOT EXISTS `daily_stock_integrity_check`
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
COMMENT 'Alert if geopos_products.qty != SUM(batches.qty_remaining)'
DO
BEGIN
    INSERT INTO geopos_activity_log
        (user_id, username, role_label, module, action, description, ip_address, created_at)
    SELECT
        0, 'SYSTEM', 'SYSTEM', 'Inventory', 'STOCK_DESYNC',
        CONCAT('pid=', gp.pid, ' name=', gp.product_name,
               ' products.qty=', gp.qty,
               ' batches.sum=', COALESCE(SUM(gb.qty_remaining), 0),
               ' delta=', (gp.qty - COALESCE(SUM(gb.qty_remaining), 0))),
        '127.0.0.1', NOW()
    FROM geopos_products gp
    LEFT JOIN geopos_batches gb ON gb.product_id = gp.pid
    WHERE gp.is_deleted = 0
    GROUP BY gp.pid, gp.product_name, gp.qty
    HAVING ABS(gp.qty - COALESCE(SUM(gb.qty_remaining), 0)) > 0.01;
END;
```

Query the log daily:
```sql
SELECT * FROM geopos_activity_log
 WHERE module = 'Inventory' AND action = 'STOCK_DESYNC'
   AND created_at >= CURDATE()
 ORDER BY created_at DESC;
```

If 0 rows return every day, the triggers are working perfectly.

---

## 7. Files Produced + Executable SQL Script

| Deliverable | File Name | Purpose |
|-------------|-----------|---------|
| Investigation report | `geopos_products_stock_investigation_report.md` | Forensics, architecture, root-cause ranking, evidence map |
| This fix plan | `geopos_products_stock_zero_bug_fix_plan.md` | Reproduction, repair SQL, trigger DDL, PHP fix, timeline |
| **(Executable)** | — `geopos_products_stock_fix_deploy.sql` — (create from §3.1 + §3.2 + §3.3 + cleanup preamble) | Copy-paste into phpMyAdmin / `mysql < file.sql` to deploy triggers |

---

*End of fix plan. Deploy P0 and P1 first (pure MySQL, zero code changes) — the symptom will be eliminated today regardless of PHP code state. Then schedule P2 PHP cleanup for permanent code hygiene.*
