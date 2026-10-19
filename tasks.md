I have updateaed ny database with the new tables and command and sql queries in this file. NEW TABLES CREATED :


CREATE TABLE `shop_reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'FK → shop_users.id (authenticated only)',
  `product_id` int(11) NOT NULL COMMENT 'FK → geopos_products.pid',
  `rating` tinyint(1) NOT NULL COMMENT '1–5 stars',
  `title` varchar(150) DEFAULT NULL,
  `body` text DEFAULT NULL,
  `verified_purchase` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 if user has a completed/paid/shipped order containing this product',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'approved' COMMENT 'Moderation state; set to pending if you want pre-moderation',
  `helpful_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Denormalised counter',
  `report_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Times flagged by users',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'For abuse auditing',
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_product` (`user_id`,`product_id`), -- one vote per account
  KEY `idx_product_status` (`product_id`,`status`),
  KEY `idx_user` (`user_id`),
  KEY `idx_created` (`created_at`),
  KEY `idx_verified` (`product_id`,`verified_purchase`),
  CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `shop_users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_product` FOREIGN KEY (`product_id`) REFERENCES `geopos_products`(`pid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Authenticated user reviews; one per user per product';

Verified-purchase verification query
Run this before allowing the insert (or gate the submit button on this result via an endpoint like GET /api/products/{id}/can-review):

-- Has this user completed a purchase containing this product?
SELECT 1
FROM   shop_orders o
JOIN   shop_order_items oi ON oi.order_id = o.id
WHERE  o.user_id     = :user_id
  AND  oi.product_id = :product_id
  AND  o.status IN ('Paid','Shipped','Completed')
LIMIT 1;

Product rating aggregates
You already have geopos_products.rating and rating_count. Keep those as the denormalised storefront display values. Two ways to keep them in sync:

Option A – Triggers (recommended, zero app changes):
DELIMITER ;;
CREATE TRIGGER `trg_review_after_insert`
AFTER INSERT ON `shop_reviews`
FOR EACH ROW
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE `geopos_products`
    SET `rating_count` = `rating_count` + 1,
        `rating` = ROUND(
            ((`rating` * (`rating_count` - 1)) + NEW.rating) / `rating_count`
        , 1)
    WHERE `pid` = NEW.product_id;
  END IF;
END;;
DELIMITER ;

Anti-bot / rate-limiting schema
You already have shop_token_blacklist. Add a rolling-window rate-limit table keyed on IP and action:
CREATE TABLE `shop_rate_limits` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `bucket_key` varchar(120) NOT NULL COMMENT 'e.g. "review:203.0.113.4" or "review:user:12"',
  `action` varchar(40) NOT NULL COMMENT 'review, login, register, contact, cart, ...',
  `ip_address` varchar(45) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_bucket_time` (`bucket_key`,`created_at`),
  KEY `idx_action_time` (`action`,`created_at`),
  KEY `idx_ip_time` (`ip_address`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='Sliding-window rate limiter; purge rows older than 1h with cron';

  Application logic (pseudocode — works in PHP, Node, Python):

before accepting a review:
  count = SELECT COUNT(*) FROM shop_rate_limits
          WHERE bucket_key = "review:{ip}"
            AND created_at > NOW() - INTERVAL 1 MINUTE;
  if count >= 50 → reject with 429 Too Many Requests
  else INSERT INTO shop_rate_limits (bucket_key, action, ip_address, user_id)
       VALUES ("review:{ip}", "review", ip, uid);

Helper votes (optional, "was this helpful?")
CREATE TABLE `shop_review_votes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `review_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `vote` tinyint(1) NOT NULL COMMENT '1=helpful, -1=not helpful',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_review_user` (`review_id`,`user_id`),
  KEY `idx_review` (`review_id`),
  CONSTRAINT `fk_rv_review` FOREIGN KEY (`review_id`) REFERENCES `shop_reviews`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rv_user`   FOREIGN KEY (`user_id`)   REFERENCES `shop_users`(`id`)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

Visit Tracking (Unique Visitors per Day)
Goal: "In a day, how many unique people visited the storefront?" — this is classic daily unique-visitor analytics.
Raw visit log (optional but very useful for deeper analytics)
Only insert one row per user per day if you only need uniques, or one row per page-load if you also want page views. I recommend one row per session, capped per day:
CREATE TABLE `shop_visits` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `visitor_hash` char(64) NOT NULL COMMENT 'SHA-256 of (ip + user_agent + salt) — privacy-safe',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL COMMENT 'NULL = anonymous',
  `user_agent` varchar(255) DEFAULT NULL,
  `referrer` varchar(500) DEFAULT NULL,
  `landing_path` varchar(255) DEFAULT NULL,
  `country` char(2) DEFAULT NULL,
  `device_type` enum('desktop','mobile','tablet','bot','unknown') NOT NULL DEFAULT 'unknown',
  `is_bot` tinyint(1) NOT NULL DEFAULT 0,
  `visit_date` date NOT NULL COMMENT 'Denormalised UTC date for fast grouping',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_date_visitor` (`visit_date`,`visitor_hash`),
  KEY `idx_user` (`user_id`),
  KEY `idx_date` (`visit_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='Raw storefront visit log';

Session-level dedup (recommended)
To avoid one visitor hitting the site 40 times counting as 40 rows, only insert a shop_visits row once per visitor_hash per day (or per session). App logic:
hash = sha256(ip + "|" + user_agent + "|" + SECRET_SALT)
IF NOT EXISTS (SELECT 1 FROM shop_visits
               WHERE visitor_hash = hash AND visit_date = CURDATE()):
    INSERT ...

This gives you COUNT(*) = unique visitors/day, and you can still keep a separate shop_page_views table if you want pageview counts.
SELECT COUNT(DISTINCT visitor_hash)
FROM   shop_visits
WHERE  visit_date = CURDATE() AND is_bot = 0;
 Bot filtering
Maintain a small blocklist regex (bot|crawl|spider|headless|phantom|selenium|curl|wget|python-requests|go-http|uptime|pingdom) against user_agent.

Set is_bot = 1 (exclude from uniques) — don't delete, so you can audit.

Googlebot/Bingbot pass-through optional.

Privacy note
Storing raw IPs is PII in most jurisdictions. Two mitigations:

Store ip_address but truncate the last octet (203.0.113.0/24) for v4, and first 4 groups for v6.

Always store visitor_hash (salted) as the identity key; the raw IP is only for short-term fraud/rate-limit lookups and can be nulled after 30 days by cron.


Supporting Indexes You Should Add Now
Because reviews will be filtered by product + status constantly, and visit counts by date:
-- Speeds the storefront "reviews for product" query
ALTER TABLE shop_reviews
  ADD INDEX idx_product_approved_created (`product_id`,`status`,`created_at`);

-- Speeds "my reviews" page
ALTER TABLE shop_reviews
  ADD INDEX idx_user_created (`user_id`,`created_at`);

-- Speeds "is this user verified?" lookup
ALTER TABLE shop_order_items
  ADD INDEX idx_order_product (`order_id`,`product_id`);
