great but now when i ckick in the modal the + or - instead of increament or decreament i see a entire white screen returned with erroro CartContext.jsx:11 Uncaught TypeError: Cannot read properties of undefined (reading 'id')
    at cartReducer (CartContext.jsx:11:36)
    at CartProvider (CartContext.jsx:86:29)
cartReducer	@	CartContext.jsx:11
(anonymous)	@	CartContext.jsx:86
 and the items never adds to card. 

Challenge 2: Under product details when i adde quantity for an tiem that still already exist in the cart, another simiollar cart item is created with 2 rows for the same item.



errors also others:
HeroSlider.jsx:64 Encountered two children with the same key, `slide-2`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
(anonymous) @ react-dom_client.js?v=9e311d26:4923
runWithFiberInDEV @ react-dom_client.js?v=9e311d26:995
warnOnInvalidKey @ react-dom_client.js?v=9e311d26:4922
reconcileChildrenArray @ react-dom_client.js?v=9e311d26:4963
reconcileChildFibersImpl @ react-dom_client.js?v=9e311d26:5169
(anonymous) @ react-dom_client.js?v=9e311d26:5235
reconcileChildren @ react-dom_client.js?v=9e311d26:7180
beginWork @ react-dom_client.js?v=9e311d26:8699
runWithFiberInDEV @ react-dom_client.js?v=9e311d26:995
performUnitOfWork @ react-dom_client.js?v=9e311d26:12559
workLoopSync @ react-dom_client.js?v=9e311d26:12422
renderRootSync @ react-dom_client.js?v=9e311d26:12406
performWorkOnRoot @ react-dom_client.js?v=9e311d26:11764
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=9e311d26:13503
performWorkUntilDeadline @ react-dom_client.js?v=9e311d26:34
<div>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=9e311d26:245
(anonymous) @ main.jsx:18
6react-dom_client.js?v=9e311d26:4923 Encountered two children with the same key, `slide-2`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.

gere is the product sample INSERT INTO `geopos_products` (`pid`, `pcat`, `warehouse`, `product_name`, `product_code`, `product_price`, `retail_price`, `ecomm_price`, `fproduct_price`, `taxrate`, `disrate`, `qty`, `product_des`, `brand`, `shop_tag`, `sale_percent`, `rating`, `rating_count`, `images`, `colors`, `features`, `specifications`, `shipping_options`, `variants`, `shop_published`, `alert`, `unit`, `image`, `search_tags`, `barcode`, `merge`, `sub`, `vb`, `expiry`, `code_type`, `sub_id`, `b_id`, `is_deleted`, `created_at`, `updated_at`) VALUES
(310, 9, 1, 'BL-5C Floating Battery', 'BL-5C Floating Battery', 9800.00, 12000.00, 18000.00, 4000.00, 0.00, 0.00, 18271.00, 'Brand new for you to test our', NULL, 'new', 10, 4.5, 760, '[\"5b4aa79457f7e4afdf087c8d7a0669e8.webp\",\"5b4aa79457f7e4afdf087c8d7a0669e8.webp\"]', '[]', '[\"Fast Cahrging\",\"Wired\"]', '{}', '[]', '[]', 1, 100, NULL, '5b4aa79457f7e4afdf087c8d7a0669e8.webp', 'floating, battery', NULL, 0, 0, 0, NULL, NULL, 10, 0, 0, '2026-09-07 11:22:10', '2026-10-15 18:39:16');  `sub_id` int(11) DEFAULT 0,
  `b_id` int(11) DEFAULT 0,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) sugest whr the developer or application responsible for setting the product details eg price category etc needs to do to match the filters and also make it easy for users to who will be using the system to sabe product details so easy to use.ALos improve on the filters to match items please currently the =quesries are so misunderstangined look at the schemat for products_* in /home/derrick-ahaabwe/Desktop/e-commerce-app-kenvies/kenvmart_oxen/jpos_schema.sqlto understand the right search or filetrs for the filter nav bar.


