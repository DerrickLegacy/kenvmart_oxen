# JPOS Product Data Management Guide for Storefront Filters

This guide provides instructions for the JPOS developer/admin on how to save product details to ensure the storefront's search and filter systems return accurate results.

## 1. Category Management (`pcat` & `geopos_product_cat`)
The storefront relies heavily on the relationship between products and categories.
- **Strict Categorization**: Every product MUST have a valid `pcat` ID that exists in the `geopos_product_cat` table.
- **Descriptive Titles**: The `title` in `geopos_product_cat` should be clear (e.g., "Fast Chargers" instead of just "Chargers").
- **Slugs**: If the `shop_category_meta` table is used, ensure the `slug` matches the URL format (e.g., `fast-chargers`). If this table is empty, the system fallbacks to the category title.

## 2. Optimizing Search Tags (`search_tags`)
The `search_tags` column is a powerful way to improve search results without cluttering the product title.
- **Synonyms**: Add words that users might type but aren't in the name (e.g., for a "Lightning Cable", add tags like `iphone, apple, charger, cord`).
- **Formatting**: Save tags as a comma-separated list or a space-separated string (e.g., `powerbank, portable, high-capacity`).
- **Avoid Overloading**: Keep tags relevant. Irrelevant tags will cause "noise" in search results.

## 3. Product Naming & Description
- **Product Name**: Keep it concise but include the brand and main feature (e.g., "Oraimo FreePods 4 ANC Earbuds"). The search algorithm gives high priority to the name.
- **Product Description**: Use the `product_des` column for detailed text. The search engine scans this for keywords, so include secondary features here.

## 4. Standardizing Shop Tags (`shop_tag`)
The storefront filters (New, Trending, Sale, etc.) use the `shop_tag` column. To ensure they work, use these exact lowercase strings:
- `new` : Appears in "New Arrivals".
- `trending` : Appears in "Trending" (also triggered if rating is ≥ 4.0).
- `sale` : Appears in "Sale Items".
- `deals` : Appears in "Today's Deals".
- `hot` : Appears in "Hot Products".

## 5. Pricing & Discounts
To show a "Sale" price with a crossed-out original price:
- **`retail_price`**: Set this to the **Original Price**.
- **`ecomm_price`**: Set this to the **Final Selling Price** (the price the customer actually pays).
- **`sale_percent`**: (Optional) Set an integer (e.g., `10` for 10% off) to display a "10% OFF" badge.

## 6. JSON Data Fields
The storefront expects specific columns to be valid JSON strings. If these are not valid JSON, the features/specifications will not appear.
- **`features`**: A JSON array of strings. 
  - *Correct:* `["Fast Charging", "Durable", "1 Year Warranty"]`
- **`specifications`**: A JSON object of key-value pairs.
  - *Correct:* `{"Capacity": "20000mAh", "Ports": "2x USB, 1x Type-C"}`
- **`variants`**: A JSON array of strings.
  - *Correct:* `["Black", "White", "Blue"]`
- **`colors`**: A JSON array of Hex codes.
  - *Correct:* `["#000000", "#FFFFFF"]`

## 7. Search Logic Overview
The storefront search algorithm works as follows:
1. It splits the user's query into **tokens** (e.g., "Fast Charger" → "fast", "charger").
2. It looks for an **exact match** of the full phrase in the Product Name, Brand, Category, and Tags.
3. If no exact match is found, it looks for products that contain **all** the tokens across those same columns.
4. It ignores common "stop words" like "the", "and", "with" to focus on meaningful keywords.

**Recommendation:** If a product isn't showing up for a specific filter, first check if its `pcat` is correct and if its `shop_published` status is set to `1`.
