-- Fix: Bluetooth search returning non-bluetooth products
-- This updates products with proper search tags so filtering works correctly

-- First, ensure the search_tags column exists (safe to run even if already exists)
-- If you get an error "Duplicate column name", it means the column already exists - that's OK!
ALTER TABLE `geopos_products` 
ADD COLUMN IF NOT EXISTS `search_tags` TEXT DEFAULT NULL 
COMMENT 'Comma-separated search keywords for filtering' 
AFTER `variants`;

-- ============================================
-- FIX CAR CHARGERS
-- ============================================
-- Car chargers should NOT appear in Bluetooth searches
-- Remove any bluetooth mentions from tags, add proper car charger tags

UPDATE geopos_products 
SET search_tags = 'car charger, vehicle charger, automotive charger, cigarette lighter, dual usb, fast charging, 2.4a, usb-a, type-c cable, car adapter'
WHERE product_code = 'FA-CAR01' 
   OR product_name LIKE '%Car Charger%';

-- ============================================
-- ADD PROPER BLUETOOTH PRODUCT TAGS
-- ============================================

-- Bluetooth Earphones/Headphones
UPDATE geopos_products 
SET search_tags = 'bluetooth, wireless, earphones, earbuds, tws, true wireless, headphones, wireless earphones, bluetooth earphones'
WHERE (
    LOWER(product_name) LIKE '%bluetooth%ear%' 
    OR LOWER(product_name) LIKE '%wireless%ear%'
    OR LOWER(product_name) LIKE '%tws%'
)
AND product_name NOT LIKE '%charger%'
AND product_name NOT LIKE '%cable%'
AND search_tags IS NULL;

-- Bluetooth Speakers
UPDATE geopos_products 
SET search_tags = 'bluetooth, wireless, speaker, bluetooth speaker, wireless speaker, portable speaker, outdoor speaker'
WHERE (
    LOWER(product_name) LIKE '%bluetooth%speaker%' 
    OR LOWER(product_name) LIKE '%wireless%speaker%'
)
AND search_tags IS NULL;

-- Bluetooth Headphones (Over-ear)
UPDATE geopos_products 
SET search_tags = 'bluetooth, wireless, headphones, over-ear, wireless headphones, bluetooth headphones, anc, noise cancelling'
WHERE (
    LOWER(product_name) LIKE '%bluetooth%headphone%' 
    OR LOWER(product_name) LIKE '%wireless%headphone%'
)
AND product_name NOT LIKE '%ear%bud%'
AND product_name NOT LIKE '%in-ear%'
AND search_tags IS NULL;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify the fix worked:
-- SELECT product_name, search_tags 
-- FROM geopos_products 
-- WHERE search_tags LIKE '%bluetooth%' 
-- ORDER BY product_name;

-- Should only show actual bluetooth products (earphones, speakers, headphones)
-- Should NOT show car chargers, cables, or other non-bluetooth items
