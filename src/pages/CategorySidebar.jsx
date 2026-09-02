import { useState } from "react";
import { useNavigate } from "react-router-dom";
import categories from "../data/categories";
import PriceFilter from "../components/shop/priceFilter";

/* ─── The sidebar menu markup (shared between desktop & drawer) ─────────── */
function SidebarMenu({ onClose }) {
  const [open, setOpen] = useState({
    Electronics: true,
  });
  const navigate = useNavigate();

  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleCategoryClick = (categoryTitle) => {
    navigate(`/products?category=${encodeURIComponent(categoryTitle)}`);
    if (onClose) onClose();
  };

  const handleItemClick = (itemName) => {
    navigate(`/products?category=${encodeURIComponent(itemName)}`);
    if (onClose) onClose();
  };

  return (
    <div className="mega-category-menu sidebar-variant mb-30">
      {/* header row – only visible inside the drawer on mobile */}
      {onClose && (
        <div className="sidebar-drawer-header">
          <span className="fw-bold">All Categories</span>
          <button
            className="sidebar-drawer-close"
            onClick={onClose}
            aria-label="Close categories"
          >
            <i className="lni lni-close"></i>
          </button>
        </div>
      )}

      {/* desktop "All Categories" button */}
      {!onClose && (
        <span className="cat-button">
          {/* <i className="lni lni-menu"></i> */}
          All Categories
        </span>
      )}

      <ul className="sub-category static">
        {categories.map((cat) => (
          <li key={cat.title} className="has-sub">
            <button
              className="sub-category-btn"
              onClick={() => toggle(cat.title)}
              aria-expanded={!!open[cat.title]}
            >
              {cat.title}
              <i
                className={`lni ${open[cat.title] ? "lni-chevron-down" : "lni-chevron-right"}`}
              ></i>
            </button>
            {open[cat.title] && (
              <ul className="inner-sub-category static">
                {/* Category title link */}
                <li>
                  <button
                    className="sub-category-link-btn"
                    onClick={() => handleCategoryClick(cat.title)}
                  >
                    All {cat.title}
                  </button>
                </li>
                {cat.items.map((item) => (
                  <li key={item}>
                    <button
                      className="sub-category-link-btn"
                      onClick={() => handleItemClick(item)}
                    >
                      {item}
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

  return (
    <>
      {/* ── Mobile: toggle button ── */}
      <button
        className="sidebar-drawer-toggle d-lg-none"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open categories"
        aria-expanded={drawerOpen}
      >
        <i className="lni lni-menu"></i> Categories
      </button>

      {/* ── Mobile: drawer overlay ── */}
      {drawerOpen && (
        <div
          className="sidebar-drawer-overlay"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile: sliding drawer ── */}
      <div
        className={`sidebar-drawer ${drawerOpen ? "sidebar-drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Product categories"
      >
        <SidebarMenu onClose={() => setDrawerOpen(false)} />
      </div>

      {/* ── Desktop: inline sidebar (hidden on < lg) ── */}
      <div className="d-none d-lg-block">
        <SidebarMenu onClose={null} />
      </div>
    </>
  );
}
