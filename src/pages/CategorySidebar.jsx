import { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import categories from "../data/categories";
import PriceFilter from "../components/shop/priceFilter";

/* ─── Vertical Sidebar (Product Pages) ──────────────────────────────────── */
function VerticalSidebar({ onClose }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [clickedOpen, setClickedOpen] = useState({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selectedCategories = (searchParams.get("category") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const currentRating = searchParams.get("rating_min") || "";

  const handleCategoryClick = (categoryTitle, hasItems) => {
    // Skip "Brands" category - it's handled differently now
    if (categoryTitle === "Brands") return;

    if (!hasItems) {
      // Toggle category instead of just setting it
      const next = selectedCategories.includes(categoryTitle)
        ? selectedCategories.filter((c) => c !== categoryTitle)
        : [...selectedCategories, categoryTitle];

      const p = new URLSearchParams(searchParams);
      if (next.length) p.set("category", next.join(","));
      else p.delete("category");
      p.delete("page");

      navigate(`/products?${p.toString()}`);
      if (onClose) onClose();
    } else {
      setClickedOpen(prev => ({ ...prev, [categoryTitle]: !prev[categoryTitle] }));
    }
  };

  const handleItemClick = (itemName) => {
    const next = selectedCategories.includes(itemName)
      ? selectedCategories.filter((c) => c !== itemName)
      : [...selectedCategories, itemName];

    const p = new URLSearchParams(searchParams);
    if (next.length) p.set("category", next.join(","));
    else p.delete("category");
    p.delete("page");

    navigate(`/products?${p.toString()}`);
    if (onClose) onClose();
  };

  const handleBrandToggle = (brandName) => {
    const next = selectedCategories.includes(brandName)
      ? selectedCategories.filter((c) => c !== brandName)
      : [...selectedCategories, brandName];

    const p = new URLSearchParams(searchParams);
    if (next.length) p.set("category", next.join(","));
    else p.delete("category");
    p.delete("page");

    navigate(`/products?${p.toString()}`);
    if (onClose) onClose();
  };

  const handleRatingToggle = (rating) => {
    const p = new URLSearchParams(searchParams);
    if (currentRating === String(rating)) {
      p.delete("rating_min");
    } else {
      p.set("rating_min", rating);
    }
    p.delete("page");
    navigate(`/products?${p.toString()}`);
    if (onClose) onClose();
  };

  const isOpen = (categoryTitle) => {
    return hoveredCategory === categoryTitle || clickedOpen[categoryTitle];
  };

  return (
    <div className="mega-category-menu sidebar-variant mb-30">
      {onClose && (
        <div className="sidebar-drawer-header">
          <span className="fw-bold filter-title">Filter</span>
          <button
            className="sidebar-drawer-close"
            onClick={onClose}
            aria-label="Close filters"
          >
            <i className="lni lni-close"></i>
          </button>
        </div>
      )}

      {!onClose && (
        <>
          <span className="px-3 fw-bold">Filter</span>
          <hr />
        </>
      )}

      <ul className="sub-category static">
        {categories.map((cat) => {
          // Handle Brands category differently
          if (cat.title === "Brands") {
            return (
              <li key={cat.title} className="filter-section brands-section-main">
                <div className="filter-section-header">
                  <span className="filter-section-title">Brands</span>
                </div>
                <ul className="brands-filter-list">
                  {cat.items.map((item) => (
                    <li key={item.name}>
                      <label className="brand-filter-item">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(item.name)}
                          onChange={() => handleBrandToggle(item.name)}
                        />
                        <span>{item.name}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </li>
            );
          }

          // Regular categories
          return (
            <li
              key={cat.title}
              className="has-sub"
              onMouseEnter={() => !onClose && setHoveredCategory(cat.title)}
              onMouseLeave={() => !onClose && setHoveredCategory(null)}
            >
              <button
                className="sub-category-btn clean-filter-btn"
                onClick={() => handleCategoryClick(cat.title, cat.items.length > 0)}
                aria-expanded={isOpen(cat.title)}
              >
                <span className="filter-category-name">{cat.title}</span>
                {cat.items.length > 0 && (
                  <i className={`lni ${isOpen(cat.title) ? 'lni-chevron-up' : 'lni-chevron-down'} filter-chevron-icon`}></i>
                )}
              </button>

              {isOpen(cat.title) && cat.items.length > 0 && (
                <ul className="inner-sub-category clean-filter-sub static">
                  {cat.items.map((item) => (
                    <li key={item.name} className="clean-filter-subitem">
                      <button
                        className="sub-category-link-btn clean-filter-link"
                        onClick={() => handleItemClick(item.name)}
                      >
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}

        <PriceFilter />

        {/* Product Rating Filter */}
        <li className="filter-section">
          <div className="filter-section-header">
            <span className="filter-section-title">Product Rating</span>
          </div>
          <ul className="rating-filter-list">
            {[4, 3, 2, 1].map((num) => (
              <li key={num}>
                <label className="rating-filter-item">
                  <input
                    type="checkbox"
                    checked={currentRating === String(num)}
                    onChange={() => handleRatingToggle(num)}
                  />
                  <span className="rating-stars">
                    {"★".repeat(num)}
                    {"☆".repeat(5 - num)}
                  </span>
                  <span className="rating-text">{num} Stars & Up</span>
                </label>
              </li>
            ))}
          </ul>
        </li>
      </ul>

      <style>{`
        /* Remove top margin/padding from filter card */
        .mega-category-menu.sidebar-variant {
          margin-top: 0;
          padding-top: 0;
        }

        .mega-category-menu .cat-button {
          margin-top: 0;
          padding-top: 2px;
          padding-bottom: 2px;
        }

        /* Remove scrollbar from filter sidebar */
        .mega-category-menu.sidebar-variant,
        .sub-category.static {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .mega-category-menu.sidebar-variant::-webkit-scrollbar,
        .sub-category.static::-webkit-scrollbar {
          display: none;
        }

        /* Filter Section Styles */
        .filter-section {
          margin-top: 16px;
          padding: 10px 14px;
        }
        
        .filter-section-header {
          margin-bottom: 10px;
        }
        
        .filter-section-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #0b1a33;
          letter-spacing: 0.01em;
          text-transform: uppercase;
        }
        
        /* Rating Filter */
        .rating-filter-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .rating-filter-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 0;
          cursor: pointer;
          font-size: 0.75rem;
        }
        
        .rating-filter-item input[type="checkbox"] {
          width: 15px;
          height: 15px;
          cursor: pointer;
          accent-color: #183B9B;
        }
        
        .rating-stars {
          color: #f59e0b;
          font-size: 0.8rem;
          letter-spacing: 1px;
        }
        
        .rating-text {
          color: #3d414a;
          font-size: 0.75rem;
        }
        
        .rating-filter-item:hover .rating-text {
          color: #183B9B;
        }
        
        /* Brands Filter */
        .brands-section-main {
          margin-top: 16px;
          padding: 10px 14px;
          list-style: none;
        }
        
        .brands-filter-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .brand-filter-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 0;
          cursor: pointer;
          font-size: 0.75rem;
          color: #3d414a;
        }
        
        .brand-filter-item input[type="checkbox"] {
          width: 15px;
          height: 15px;
          cursor: pointer;
          accent-color: #183B9B;
        }
        
        .brand-filter-item:hover span {
          color: #183B9B;
        }

        /* Mobile responsive adjustments */
        @media (max-width: 991px) {
          .filter-section,
          .brands-section-main {
            padding: 10px 12px;
          }

          .filter-section-title {
            font-size: 0.85rem;
          }

          .rating-filter-item,
          .brand-filter-item {
            padding: 6px 0;
            font-size: 0.8rem;
          }

          .rating-filter-item input[type="checkbox"],
          .brand-filter-item input[type="checkbox"] {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>
    </div>
  );
}

/* ─── Public component ──────────────────────────────────────────────────── */
export default function CategorySidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Don't render anything on home page
  if (isHomePage) {
    return null;
  }

  return (
    <>
      {/* Mobile: toggle button */}
      <button
        className="sidebar-drawer-toggle d-lg-none"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open filters"
        aria-expanded={drawerOpen}
      >
        <i className="lni lni-menu"></i> Filters
      </button>

      {/* Mobile: drawer overlay */}
      {drawerOpen && (
        <div
          className="sidebar-drawer-overlay"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile: sliding drawer */}
      <div
        className={`sidebar-drawer ${drawerOpen ? "sidebar-drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Product filters"
      >
        <VerticalSidebar onClose={() => setDrawerOpen(false)} />
      </div>

      {/* Desktop: inline sidebar */}
      <div className="d-none d-lg-block">
        <VerticalSidebar onClose={null} />
      </div>
    </>
  );
}
