-- URGENT FIX: Stop car chargers from appearing in Bluetooth searches
-- Run this immediately to fix the issue you're experiencing

-- Fix the specific car charger (FA-CAR01)
UPDATE geopos_products 
SET search_tags = 'car charger, vehicle charger, automotive charger, cigarette lighter, dual usb, usb-a, fast charging, 2.4a, car adapter, type-c cable'
WHERE product_code = 'FA-CAR01';

-- Fix ALL car chargers (prevent bluetooth false positives)
UPDATE geopos_products 
SET search_tags = CASE
    WHEN search_tags IS NULL OR search_tags = '' 
    THEN 'car charger, vehicle charger, automotive charger, dual usb, fast charging'
    ELSE search_tags
END
WHERE LOWER(product_name) LIKE '%car charger%'
  AND (search_tags IS NULL OR search_tags = '');

-- Ensure bluetooth products have proper tags
UPDATE geopos_products 
SET search_tags = 'bluetooth, wireless, earphones, earbuds, tws, true wireless'
WHERE (
    LOWER(product_name) LIKE '%bluetooth%earphone%' 
    OR LOWER(product_name) LIKE '%bluetooth%earbud%'
    OR LOWER(product_name) LIKE '%wireless%earphone%'
    OR LOWER(product_name) LIKE '%tws%'
)
AND product_name NOT LIKE '%charger%'
AND product_name NOT LIKE '%cable%'
AND (search_tags IS NULL OR search_tags = '');

-- Bluetooth speakers
UPDATE geopos_products 
SET search_tags = 'bluetooth, wireless, speaker, bluetooth speaker, wireless speaker, portable speaker'
WHERE LOWER(product_name) LIKE '%bluetooth%speaker%'
  AND (search_tags IS NULL OR search_tags = '');

-- VERIFY THE FIX:
-- Run this query to see what will now appear in Bluetooth searches
SELECT product_code, product_name, search_tags 
FROM geopos_products 
WHERE LOWER(COALESCE(search_tags, '')) LIKE '%bluetooth%'
ORDER BY product_name;

-- Expected result: Only bluetooth earphones, headphones, and speakers
-- Should NOT include car chargers!
