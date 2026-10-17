import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../../context/WishlistContext';
import { useAuth } from '../../../context/AuthContext';
import CartDropdown from './CartDropdown';
import Dropdown from "../../reusables/Dropdown";
import { siteConfig } from '../../../data/siteConfig';
import { productsApi, imageUrl } from '../../../services/api';

/* ── styles for the suggestions dropdown ───────────────────────── */
const D = {
  wrap: {
    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
    zIndex: 1100, background: '#fff',
    border: '1.5px solid #e18f27', borderRadius: 10,
    boxShadow: '0 12px 32px rgba(10,22,50,0.14)',
    overflow: 'hidden',
    pointerEvents: 'auto', // Ensure dropdown is clickable
  },
  list: {
    maxHeight: 300, overflowY: 'auto',
    scrollbarWidth: 'none', msOverflowStyle: 'none',
  },
  item: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 14px', cursor: 'pointer',
    borderBottom: '1px solid #f2f3f5', transition: 'background 0.12s ease',
    pointerEvents: 'auto', // Ensure items are clickable
  },
  thumb: {
    width: 44, height: 44, borderRadius: 6,
    objectFit: 'cover', background: '#f6f7f9',
    flexShrink: 0, border: '1px solid #eef0f3',
  },
  name: { fontSize: 14, fontWeight: 600, color: '#0b1a33', margin: 0 },
  price: { fontSize: 13, fontWeight: 700, color: '#e18f27', marginTop: 2 },
  footer: {
    padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#183B9B',
    background: '#fafbfd', textAlign: 'center', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderTop: '1px solid #f0f2f5',
  },
  empty: { padding: '18px 14px', fontSize: 13, color: '#6c7380', textAlign: 'center' },
  loading: { padding: '14px', fontSize: 13, color: '#8b929f', textAlign: 'center' },
};

/* ── input + button shared styles ──────────────────────────────── */
const inputStyle = {
  border: '1.5px solid #e18f27',
  borderRight: 'none',
};
const btnStyle = {
  background: '#e18f27',
  borderColor: '#e18f27',
};
const iconStyle = { color: '#183B9B' };

export default function HeaderMiddle({ sticky = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null); // 'user', 'help', or null
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { state: wishlistItems } = useWishlist();
  const searchWrapRef = useRef(null);
  const debounceRef = useRef(null);

  const toggleMenu = (menu) => {
    setActiveMenu(prev => prev === menu ? null : menu);
  };

  // Close other menus when search dropdown opens
  useEffect(() => {
    if (dropdownOpen) setActiveMenu(null);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const accountItems = user
    ? [
      { label: "My Account", icon: "lni lni-user", to: "/account" },
      { label: "Orders", icon: "lni lni-cart", to: "/orders" },
      { label: "Wishlist", icon: "lni lni-heart", to: "/wishlist" },
      { label: "Settings", icon: "lni lni-cog", to: "/settings" },
      {
        label: "Logout",
        icon: "lni lni-exit",
        onClick: handleLogout,
      },
    ]
    : [
      { label: "My Account", icon: "lni lni-user", to: "/account" },
      { label: "Orders", icon: "lni lni-cart", to: "/orders" },
      { label: "Wishlist", icon: "lni lni-heart", to: "/wishlist" },
    ];

  const helpItems = [
    { label: "Help Center", icon: "lni lni-question-circle", to: "/help" },
    { label: "Contact Us", icon: "lni lni-envelope", to: "/contact" },
    { label: "FAQ", icon: "lni lni-help", to: "/faq" },
  ];

  const displayName = user
    ? (user.full_name?.split(" ")[0] ?? user.name ?? "Account")
    : null;

  /* close dropdown on outside click / Escape */
  useEffect(() => {
    const click = (e) => {
      // Don't close if clicking inside the dropdown
      if (!searchWrapRef.current?.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const key = (e) => { if (e.key === 'Escape') setDropdownOpen(false); };
    // Use 'click' instead of 'mousedown' to allow links to process first
    document.addEventListener('click', click);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('click', click);
      document.removeEventListener('keydown', key);
    };
  }, []);

  /* fetch suggestions — debounced */
  useEffect(() => {
    const q = searchTerm.trim();
    if (!q) {
      setSuggestions([]); setSuggestionsLoading(false); setDropdownOpen(false);
      clearTimeout(debounceRef.current); return;
    }
    setSuggestionsLoading(true); setDropdownOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await productsApi.list({ q, limit: 20 });
        setSuggestions(res?.products || []);
      } catch { setSuggestions([]); }
      finally { setSuggestionsLoading(false); }
    }, 280);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(searchTerm.trim() ? `/products?q=${encodeURIComponent(searchTerm.trim())}` : '/products');
    setDropdownOpen(false);
  };
  const seeAllUrl = useMemo(() => `/products?q=${encodeURIComponent(searchTerm.trim())}`, [searchTerm]);

  /* ── dropdown JSX — inline, NOT a sub-component, so focus is never stolen ── */
  const dropdown = dropdownOpen && searchTerm.trim() ? (
    <div style={D.wrap} role="listbox" onClick={(e) => console.log('Dropdown clicked', e.target)}>
      <style>{`.hm-drop-list::-webkit-scrollbar{display:none}`}</style>
      <div className="hm-drop-list" style={D.list}>
        {suggestionsLoading && <div style={D.loading}>Searching…</div>}
        {!suggestionsLoading && suggestions.length === 0 && (
          <div style={D.empty}>No products match <strong>"{searchTerm.trim()}"</strong></div>
        )}
        {!suggestionsLoading && suggestions.map((p) => (
          <Link
            key={p.id}
            to={`/product/${p.id}`}
            style={{ ...D.item, textDecoration: 'none' }}
            role="option"
            onClick={(e) => {
              console.log('Link clicked for product:', p.id, p.name);
              e.stopPropagation();
              setDropdownOpen(false);
              setSearchTerm('');
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f6f7f9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '')}
          >
            <img src={imageUrl(p.images?.[0] || p.image)} alt={p.name} style={D.thumb}
              onError={(e) => { e.currentTarget.src = imageUrl(''); }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={D.name} className="truncate">{p.name}</div>
              <div style={D.price}>{p.price_text || `Shs. ${(p.price ?? 0).toLocaleString()}`}</div>
            </div>
          </Link>
        ))}
      </div>
      {!suggestionsLoading && suggestions.length > 0 && (
        <Link to={seeAllUrl} onClick={() => setDropdownOpen(false)} style={{ ...D.footer, textDecoration: 'none' }}>
          See all results for "{searchTerm.trim()}"
        </Link>
      )}
    </div>
  ) : null;

  return (
    <div className={`header-middle${sticky ? ' header-middle--stuck' : ''}`} style={{ borderBottom: 'none' }}>
      <div className="container">

        {/* ── DESKTOP lg+ ── */}
        <div className="d-none d-lg-flex align-items-center justify-content-between" style={{ padding: '8px 0' }}>

          <div style={{ flex: '1 1 0', display: 'flex', alignItems: 'center' }}>
            <Link className="navbar-brand" to="/" style={{ flexShrink: 0, lineHeight: 1 }}>
              <img src="/assets/images/logo/logo.svg" alt={siteConfig.name} style={{ height: 36, display: 'block' }} />
            </Link>
          </div>

          {/* search wrapper — overflow visible so dropdown isn't clipped */}
          <div className="main-menu-search mx-2" ref={searchWrapRef}
            style={{ flex: '0 0 45%', position: 'relative', overflow: 'visible', zIndex: 1100 }}>
            <form className="navbar-search search-style-5" onSubmit={handleSubmit} style={{ position: 'relative' }}>
              <div className="search-input">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onFocus={() => searchTerm.trim() && setDropdownOpen(true)}
                  data-testid="search-input"
                  style={inputStyle}
                  autoComplete="off"
                />
              </div>
              <div className="search-btn">
                <button type="submit" aria-label="Search" style={btnStyle}>
                  <i className="lni lni-search-alt" style={iconStyle} />
                </button>
              </div>
            </form>
            {dropdown}
          </div>

          <div className="middle-right-area d-flex align-items-center justify-content-end" style={{ flex: '1 1 0', gap: '20px' }}>
            {/* User Dropdown */}
            <div className="user-nav-item">
              {user ? (
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e18f27', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
                    <i className="lni lni-user" />
                  </div>
                  <Dropdown
                    buttonLabel={displayName ?? "Account"}
                    buttonIcon=""
                    accountItems={accountItems}
                    className="account-dropdown-middle"
                    buttonStyle={{ color: '#0b1a33', fontWeight: 600, fontSize: '14px' }}
                    isOpen={activeMenu === 'user'}
                    onToggle={() => toggleMenu('user')}
                  />
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <i className="lni lni-user" />
                  </div>
                  <Link to="/login" style={{ color: '#0b1a33', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }} onClick={() => setActiveMenu(null)}>Sign In</Link>
                </div>
              )}
            </div>

            {/* Help Dropdown */}
            <div className="help-nav-item">
              <div className="d-flex align-items-center gap-1">
                <i className="lni lni-question-circle" style={{ fontSize: '20px', color: '#0b1a33' }} />
                <Dropdown
                  buttonLabel="Help"
                  buttonIcon=""
                  accountItems={helpItems}
                  className="help-dropdown-middle"
                  buttonStyle={{ color: '#0b1a33', fontWeight: 600, fontSize: '14px' }}
                  isOpen={activeMenu === 'help'}
                  onToggle={() => toggleMenu('help')}
                />
              </div>
            </div>

            <div className="navbar-cart d-flex align-items-center gap-3" style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '20px' }}>
              <div className="wishlist">
                <Link to="/wishlist" style={{ position: 'relative' }}>
                  <i className="lni lni-heart" style={{ fontSize: '24px', color: '#0b1a33' }} />
                  <span className="total-items" style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef2c4a', color: '#fff', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{wishlistItems.length}</span>
                </Link>
              </div>
              <CartDropdown />
            </div>
          </div>
        </div>

        {/* ── TABLET md–lg ── */}
        <div className="d-none d-md-flex d-lg-none align-items-center" style={{ gap: 12, padding: '8px 0' }}>
          <Link className="navbar-brand" to="/" style={{ flexShrink: 0, lineHeight: 1 }}>
            <img src="/assets/images/logo/logo.svg" alt={siteConfig.name} style={{ height: 32, display: 'block' }} />
          </Link>

          <div className="main-menu-search" ref={searchWrapRef}
            style={{ flex: 1, position: 'relative', overflow: 'visible', zIndex: 1100 }}>
            <form className="navbar-search search-style-5" onSubmit={handleSubmit} style={{ position: 'relative' }}>
              <div className="search-input">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onFocus={() => searchTerm.trim() && setDropdownOpen(true)}
                  data-testid="search-input-md"
                  style={inputStyle}
                  autoComplete="off"
                />
              </div>
              <div className="search-btn">
                <button type="submit" aria-label="Search" style={btnStyle}>
                  <i className="lni lni-search-alt" style={iconStyle} />
                </button>
              </div>
            </form>
            {dropdown}
          </div>

          <div className="navbar-cart" style={{ flexShrink: 0 }}>
            <div className="wishlist">
              <Link to="/wishlist">
                <i className="lni lni-heart" />
                <span className="total-items">{wishlistItems.length}</span>
              </Link>
            </div>
            <CartDropdown />
          </div>
        </div>

      </div>
    </div>
  );
}
