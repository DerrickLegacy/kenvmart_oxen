-- Example Search Tags Data
-- Use these as templates when adding tags to your products

-- ============================================
-- CABLES & CHARGING
-- ============================================

-- USB-C Cables
-- Tags: usb-c, type-c, usb c, fast charging, 18w, 20w, 25w, 33w, pd, power delivery, charging cable, data cable, android, samsung, quick charge, qc3.0, qc4.0

-- Micro USB Cables  
-- Tags: micro usb, micro-usb, charging cable, data cable, android, samsung, huawei, old android, legacy cable

-- Lightning Cables
-- Tags: lightning, iphone, apple, charging cable, data cable, ios, ipad, mfi, certified, original, authentic

-- USB-A Cables
-- Tags: usb-a, usb a, standard usb, regular usb, charging cable, data cable

-- ============================================
-- AUDIO PRODUCTS
-- ============================================

-- Wireless Earphones
-- Tags: wireless, bluetooth, tws, true wireless, earphones, earbuds, anc, noise cancelling, active noise cancellation, headphones, in-ear, gaming, sports

-- Wired Earphones
-- Tags: wired, earphones, earbuds, headphones, 3.5mm, aux, jack, cable, cord, in-ear, bass

-- Bluetooth Speakers
-- Tags: bluetooth speaker, wireless speaker, portable speaker, waterproof speaker, outdoor speaker, party speaker, bass, subwoofer

-- Over-Ear Headphones
-- Tags: headphones, over-ear, wireless headphones, bluetooth headphones, anc, noise cancelling, studio headphones, gaming headphones

-- ============================================
-- POWER PRODUCTS
-- ============================================

-- Power Banks
-- Tags: power bank, powerbank, portable charger, battery pack, external battery, 10000mah, 20000mah, 30000mah, fast charging, wireless charging, solar, compact

-- Wall Chargers
-- Tags: charger, wall charger, adapter, ac adapter, fast charger, quick charge, 18w, 20w, 33w, 65w, pd, power delivery, usb charger, dual port, multi port

-- Car Chargers
-- Tags: car charger, vehicle charger, automotive charger, cigarette lighter, fast charging, dual usb, quick charge

-- Wireless Chargers
-- Tags: wireless charger, qi charger, wireless charging pad, fast wireless charging, 10w, 15w, magsafe, magnetic charger, charging stand

-- ============================================
-- PHONE ACCESSORIES
-- ============================================

-- Phone Cases
-- Tags: case, cover, phone case, protective case, silicon, silicone, tpu, hard case, soft case, clear case, transparent, shockproof, rugged, slim, leather

-- Screen Protectors
-- Tags: screen protector, tempered glass, glass protector, 9h hardness, anti-scratch, oleophobic, privacy screen, matte, clear

-- Phone Holders
-- Tags: phone holder, car mount, dashboard mount, windshield mount, magnetic holder, vent mount, desk stand, cradle

-- Pop Sockets
-- Tags: pop socket, phone grip, finger holder, stand, ring holder, grip stand

-- ============================================
-- STORAGE & MEMORY
-- ============================================

-- Memory Cards
-- Tags: memory card, sd card, micro sd, microsd, flash card, storage card, 32gb, 64gb, 128gb, 256gb, class 10, uhs-i, uhs-ii

-- USB Flash Drives
-- Tags: flash drive, usb drive, pen drive, thumb drive, usb stick, 16gb, 32gb, 64gb, 128gb, usb 2.0, usb 3.0, usb-c

-- ============================================
-- SMART DEVICES
-- ============================================

-- Smart Watches
-- Tags: smart watch, smartwatch, fitness tracker, activity tracker, heart rate monitor, step counter, notifications, waterproof

-- Fitness Bands
-- Tags: fitness band, activity band, smart band, tracker, pedometer, heart rate, sleep tracker

-- ============================================
-- EXAMPLE SQL UPDATES
-- ============================================

-- Update USB-C products
UPDATE geopos_products 
SET search_tags = 'usb-c, type-c, usb c, fast charging, 18w, 20w, pd, power delivery, charging cable, data cable, android'
WHERE LOWER(product_name) LIKE '%usb%c%' 
  OR LOWER(product_name) LIKE '%type%c%';

-- Update wireless earphones
UPDATE geopos_products 
SET search_tags = 'wireless, bluetooth, tws, true wireless, earphones, earbuds, anc, noise cancelling, headphones'
WHERE LOWER(product_name) LIKE '%wireless%ear%' 
  OR LOWER(product_name) LIKE '%tws%'
  OR LOWER(product_name) LIKE '%bluetooth%ear%';

-- Update power banks
UPDATE geopos_products 
SET search_tags = 'power bank, powerbank, portable charger, battery pack, external battery, fast charging, wireless charging'
WHERE LOWER(product_name) LIKE '%power%bank%' 
  OR LOWER(product_name) LIKE '%powerbank%';

-- Update phone cases
UPDATE geopos_products 
SET search_tags = 'case, cover, phone case, protective case, silicon, silicone, tpu, clear case, transparent, shockproof'
WHERE LOWER(product_name) LIKE '%case%' 
  OR LOWER(product_name) LIKE '%cover%';

-- Update screen protectors
UPDATE geopos_products 
SET search_tags = 'screen protector, tempered glass, glass protector, 9h hardness, anti-scratch, oleophobic'
WHERE LOWER(product_name) LIKE '%screen%protect%' 
  OR LOWER(product_name) LIKE '%tempered%glass%';

-- ============================================
-- TIPS FOR CREATING TAGS:
-- ============================================
-- 1. Include product type (cable, earphones, charger, etc.)
-- 2. Include connectivity (usb-c, lightning, bluetooth, wired)
-- 3. Include specifications (18w, 20000mah, anc, waterproof)
-- 4. Include variations (usb-c, type-c, usb c)
-- 5. Include use cases (fast charging, gaming, sports)
-- 6. Include brands/compatibility (iphone, samsung, android)
-- 7. Use lowercase
-- 8. Separate with commas
-- 9. Think: "What would a customer type to find this?"
