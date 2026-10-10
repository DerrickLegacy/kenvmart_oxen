import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import categories from "../data/categories";
import PriceFilter from "../components/shop/priceFilter";

/* ─── Horizontal Filter Bar (Home Page Only) ────────────────────────────── */
function HorizontalFilterBar() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryTitle) => {
    navigate(`/products?category=${encodeURIComponent(categoryTitle)}`);
  };

  const handleItemClick = (itemName) => {
    navigate(`/products?category=${encodeURIComponent(itemName)}`);
  };

  return (
    <div className="horizontal-filter-container mb-4">
      <div className="horizontal-filter-scroll">
        {categories.map((cat) => (
          <div key={cat.title} className="horizontal-filter-item">
            <button
              className="horizontal-filter-btn"
              onClick={() => {
                if (cat.items.length === 0) {
                  handleCategoryClick(cat.title);
                }
              }}
            >
              {cat.title}
            </button>
            
            {/* Dropdown on hover */}
            {cat.items.length > 0 && (
              <div className="horizontal-filter-dropdown">
                {cat.items.map((item) => (
                  <button
                    key={item.name}
                    className="horizontal-dropdown-item"
                    onClick={() => handleItemClick(item.name)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Vertical Sidebar (Product Pages) ──────────────────────────────────── */
function VerticalSidebar({ onClose }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [clickedOpen, setClickedOpen] = useState({});
  const navigate = useNavigate();

  const handleCategoryClick = (categoryTitle, hasItems) => {
    if (!hasItems) {
      navigate(`/products?category=${encodeURIComponent(categoryTitle)}`);
      if (onClose) onClose();
    } else {
      setClickedOpen(prev => ({ ...prev, [categoryTitle]: !prev[categoryTitle] }));
    }
  };

  const handleItemClick = (itemName) => {
    navigate(`/products?category=${encodeURIComponent(itemName)}`);
    if (onClose) onClose();
  };

  const isOpen = (categoryTitle) => {
    return hoveredCategory === categoryTitle || clickedOpen[categoryTitle];
  };

  return (
    <div className="mega-category-menu sidebar-variant mb-30">
      {onClose && (
        <div className="sidebar-drawer-header">
          <span className="fw-bold">Filters</span>
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
        <span className="cat-button">Filters</span>
      )}

      <ul className="sub-category static">
        {categories.map((cat) => (
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
        ))}

        <PriceFilter />
      </ul>
    </div>
  );
}

/* ─── Public component ──────────────────────────────────────────────────── */
export default function CategorySidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <>
      {/* Home page - horizontal filter */}
      {isHomePage ? (
        <HorizontalFilterBar />
      ) : (
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
      )}
    </>
  );
}
