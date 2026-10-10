-- Migration: Add search_tags column to geopos_products table
-- Run this SQL on your database to enable tag-based product filtering

ALTER TABLE `geopos_products` 
ADD COLUMN `search_tags` TEXT DEFAULT NULL COMMENT 'Comma-separated search keywords for filtering. E.g: usb-c, type-c, fast charging, 18w, pd, power delivery' 
AFTER `variants`;

-- Add an index for better search performance
ALTER TABLE `geopos_products` 
ADD FULLTEXT INDEX `idx_search_tags` (`search_tags`);

-- Example data for testing:
-- UPDATE geopos_products SET search_tags = 'usb-c, type-c, fast charging, 18w, pd, power delivery, cable' WHERE product_name LIKE '%USB%C%';
-- UPDATE geopos_products SET search_tags = 'wireless, bluetooth, tws, anc, noise cancelling, earphones, earbuds' WHERE pcat = 5; -- assuming 5 is earphones category
-- UPDATE geopos_products SET search_tags = 'micro usb, micro-usb, charging cable, data cable, android' WHERE product_name LIKE '%Micro%USB%';
-- UPDATE geopos_products SET search_tags = 'lightning, iphone, apple, charging cable, data cable, ios' WHERE product_name LIKE '%Lightning%';
